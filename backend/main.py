from strands import Agent, tool
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from prompts import recup_job_agent,agent_specialise,orchestrateur

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

model = OpenAIModel(
    client_args={
        "api_key": os.getenv("FEATHERLESS_API_KEY"),
        "base_url": "https://api.featherless.ai/v1"
    },
    model_id="moonshotai/Kimi-K2-Thinking",
    params={
        "max_tokens": 1000,
        "temperature": 0.2,
        }
)


@tool 
def specialized_agent(query: str) -> str:
    try:
        sub_agent = Agent(
            model=model, 
            system_prompt=agent_specialise
        )
        return sub_agent(query).message
    except Exception as e:
        return str(e)

@app.route("/test", methods=["GET"])
def test():
    test_agent = Agent(
        model=model, 
    )
    response = test_agent("Hello, World! Can you say hi to Clement?")
    return jsonify({"response": response.message})

def custom_callback_handler(**kwargs):
    # Process stream data
    if "current_tool_use" in kwargs and kwargs["current_tool_use"].get("name"):
        tool_use = kwargs["current_tool_use"]
        tool_name = tool_use.get("name")
        #socketio.emit("tool_use", {"tool": tool_use})
        
        # Si de l'outil est l'agent spécialisé, on extrait le métier et on l'envoie
        if tool_name == "specialized_agent":
            # Arguments est souvent une chaîne JSON ou un dict selon l'implémentation Strands
            # Supposons ici que tool_use['arguments'] contient les arguments
            # Mais kwargs["current_tool_use"] est ce qui nous intéresse.
            # Vérifions comment récupérer les arguments.
            # Généralement Strands renvoie les arguments dans current_tool_use.
            # Si tool_use est {'name': 'specialized_agent', 'arguments': {...}}
            arguments = tool_use.get("arguments", {})
            query = arguments.get("query")
            if query:
                job = recup_job_agent(query)
                socketio.emit("create_specialized_agent", {"agent_job": job})
    
    # Process message delta from orchestrator
    # if "delta" in kwargs and kwargs.get("delta"):
    #    socketio.emit("model_output", {"data": kwargs["delta"]})



@socketio.on("message")
def handle_message(data):
    print(f"Data: {data}")
    print("~"*50)
    orchestrator = Agent(
        model=model, 
        tools=[specialized_agent], 
        system_prompt=orchestrateur,
        callback_handler=custom_callback_handler, 
    )
    # Assuming data is a dict `{"message": "user query"}` or just the string. 
    # Based on previous code `data["message"]`, it expects a dict.
    user_message = data.get("message") if isinstance(data, dict) else data
    
    response = orchestrator(user_message)
    print("="*50)
    print(f"Response: {response.message}")
    print("="*50)
    emit("response", {"response": response.message})

if __name__ == "__main__":
    socketio.run(app, debug=True)
