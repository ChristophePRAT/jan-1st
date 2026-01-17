from gevent import monkey
monkey.patch_all()

from strands import Agent, tool
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from prompts import agent_specialise, orchestrateur,orchestrator_start 
from callback_handler import OrchestratorCallbackHandler, SpecializedAgentCallbackHandler

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent")

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
def specialized_agent(query: str, name: str) -> str:
    try:
        sub_agent = Agent(
            model=model, 
            system_prompt=agent_specialise,
            callback_handler=SpecializedAgentCallbackHandler(emit, name),
        )
        return sub_agent(query).message
    except Exception as e:
        return str(e)



@socketio.on("message")
def handle_message(data):
    print(f"Data: {data}")
    print("~"*50)
    orchestrator = Agent(
        model=model, 
        tools=[specialized_agent], 
        system_prompt=orchestrator_start,
        callback_handler=OrchestratorCallbackHandler(emit), 
    )
    user_message = data.get("message") if isinstance(data, dict) else data
    
    response = orchestrator(user_message)
    print("="*50)
    print(f"Response: {response.message}")
    print("="*50)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=3000)
