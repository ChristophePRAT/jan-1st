# from gevent import monkey
# monkey.patch_all()
from fastapi import FastAPI
import uvicorn
import socketio
from strands import Agent, tool
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os
import contextvars
from prompts import agent_specialise, orchestrateur, orchestrator_start 
from callback_handler import OrchestratorCallbackHandler, SpecializedAgentCallbackHandler
from typing import Literal
from dotenv import load_dotenv

load_dotenv()


app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Context variable to store the current session ID
sid_ctx = contextvars.ContextVar('sid', default=None)

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

async def context_aware_emit(event, data):
    sid = sid_ctx.get()
    if sid:
        await sio.emit(event, data, to=sid)
    else:
        # Fallback to broadcast if no context (shouldn't happen in normal flow)
        await sio.emit(event, data)

@tool 
async def specialized_agent(query: str, title: str) -> str:
    try:
        # Note: We need to pass the bound emit function. 
        # But Agent execution happens in the same task/context, so we can use global wrapper.
        
        # We need a new emit function for the sub-agent that captures the current context
        async def sub_agent_emit(event, data):
            await context_aware_emit(event, data)

        sub_agent = Agent(
            model=model, 
            system_prompt=agent_specialise,
            callback_handler=SpecializedAgentCallbackHandler(sub_agent_emit, title),
        )
        result = await sub_agent.invoke_async(query)
        return result.message
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
async def create_calendar_event(title: str, day: Literal["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], startHour: int, duration: int) -> str:
    try:
        event = {
            "title": title,
            "day": day,
            "startHour": startHour,
            "duration": duration
        }

        print("Event created:", event)
        await context_aware_emit("calendar_event", event)
        return f"Event {title} created"
    except Exception as e:
        print("Error creating event:", e)
        return str(e)

@sio.on("message")
async def handle_message(sid, data):
    print(f"Data: {data}, SID: {sid}")
    print("~"*50)
    
    # Set the context variable
    token = sid_ctx.set(sid)
    
    try:
        orchestrator = Agent(
            model=model, 
            tools=[specialized_agent, create_calendar_event], 
            system_prompt=orchestrator_start,
            callback_handler=OrchestratorCallbackHandler(context_aware_emit),
        )
        user_message = data.get("message") if isinstance(data, dict) else data
        
        response = await orchestrator.invoke_async(user_message)
        print("\n\n\n")
        print("="*50)
        print(f"Response: {response.message}")
        print("="*50)
    finally:
        sid_ctx.reset(token)

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=3000)
