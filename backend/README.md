## Setup

```bash
uv sync
```

Rename the `.env.example` file to `.env` and add your Featherless API key. You can find it [here](https://featherless.ai/account/api-keys).

## Run

```bash
uv run main.py
```

## Test sample request

```bash
curl --data '{ "message": "Hello! What is 23409 * 0942374?" }' -H "Content-Type: application/json" -X POST "http://127.0.0.1:5000"
```