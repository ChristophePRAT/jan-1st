# from gevent import monkey
# monkey.patch_all()

from strands import Agent, tool
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from prompts import agent_specialise, orchestrateur,orchestrator_start 
from callback_handler import OrchestratorCallbackHandler, SpecializedAgentCallbackHandler
from typing import Literal

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

model = OpenAIModel(
    client_args={
        "api_key": os.getenv("FEATHERLESS_API_KEY"),
        "base_url": "https://api.featherless.ai/v1"
    },
    model_id="moonshotai/Kimi-K2-Instruct",
    params={
        "max_tokens": 5000,
        "temperature": 0.2,
        }
)

@tool 
def specialized_agent(query: str, title: str) -> str:
    try:
        sub_agent = Agent(
            model=model, 
            system_prompt=agent_specialise,
            callback_handler=SpecializedAgentCallbackHandler(emit, title),
        )
        return sub_agent(query).message
    except Exception as e:
        return str(e)

@tool(
    inputSchema={
        "title": "Title of the event",
        "day": "Day of the event",
        "startHour": "Start hour of the event",
        "duration": "Duration of the event in minutes"
    }
)
def create_calendar_event(title: str, day: Literal["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], startHour: int, duration: int) -> str:
    try:
        event = {
            "title": title,
            "day": day,
            "startHour": startHour,
            "duration": duration
        }

        print("Event created:", event)
        emit("calendar_event", event)
        return f"Event {title} created"
    except Exception as e:
        print("Error creating event:", e)
        return str(e)

@socketio.on("message")
def handle_message(data):
    print(f"Data: {data}")
    print("~"*50)
    orchestrator = Agent(
        model=model, 
        tools=[specialized_agent, create_calendar_event], 
        system_prompt=orchestrator_start,
        callback_handler=OrchestratorCallbackHandler(emit),
    )
    user_message = data.get("message") if isinstance(data, dict) else data
    
    response = orchestrator(user_message)
    print("\n\n\n")
    print("="*50)
    print(f"Response: {response}")
    print("="*50)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=3000)
