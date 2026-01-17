from strands import Agent
from strands.models.openai import OpenAIModel
from strands_tools import calculator
import os

def main():
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

    agent = Agent(model=model, tools=[calculator])
    response = agent("What is exp(-8) * log_10(13298)?")
    print(response)

if __name__ == "__main__":
    main()
