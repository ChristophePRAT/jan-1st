from strands import Agent
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

@app.route("/", methods=["POST"])
def index():
    data = request.json
    print(f"Data: {data}")
    agent = Agent(
        model=model, 
        tools=[calculator], 
        callback_handler=None
    )
    response = agent(data["message"])
    print("="*50)
    print(f"Response: {response.message}")
    print("="*50)
    return jsonify({"response": response.message})

if __name__ == "__main__":
    app.run(debug=True)
