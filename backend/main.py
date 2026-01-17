from strands import Agent, tool
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

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
            # callback_handler=None,
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
        # callback_handler=None,
    )
    response = test_agent("Hello, World! Can you say hi to Clement?")
    return jsonify({"response": response.message})

@app.route("/", methods=["POST"])
def index():
    data = request.json
    print(f"Data: {data}")
    orchestrator = Agent(
        model=model, 
        tools=[specialized_agent], 
        # callback_handler=None, 
        system_prompt="""
        You are an orchestrator of specialized agents. Your goal is to help the user achieve their tasks. 
        You need to understand the user's objectives and summon the right specialized agents to help them achieve their tasks. You will tell the specialized agents their tasks.
        """
    )
    response = orchestrator(data["message"])
    print("="*50)
    print(f"Response: {response.message}")
    print("="*50)
    return jsonify({"response": response.message})

if __name__ == "__main__":
    app.run(debug=True)
