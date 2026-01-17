from strands import Agent, tool
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit

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
            system_prompt="""
            You are a specialized assistant on a task the user has given you. Your goal is to help them achieve their task. 
            You need to give them a detailed yet simple and concise step by step plan to achieve their task, using subtasks to break them down. The final goal will be to merge all of the specialized agents so that the orchestrator can come up with a final plan.
            """
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
        socketio.emit("tool_use", {"tool": kwargs["current_tool_use"]})



@socketio.on("message")
def handle_message(data):
    print(f"Data: {data}")
    print("~"*50)
    orchestrator = Agent(
        model=model, 
        tools=[specialized_agent], 
        system_prompt="""
        You are an orchestrator of specialized agents. Your goal is to help the user achieve their tasks. 
        You need to understand the user's objectives and summon the right specialized agents to help them achieve their tasks. You will tell the specialized agents their tasks.
        """,
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
