
import socketio
import sys

sio = socketio.Client(reconnection_delay=100, reconnection_delay_max=10000)

@sio.event
def connect():
    print("Connected to server")
    sio.emit('message', {'message': 'Je veux perdre du poids.'})

@sio.event
def model_output(data):
    print(f"Received model output: {data}")

@sio.event
def tool_use(data):
    print(f"Received tool use: {data}")

@sio.event
def calendar_event(data):
    print(f"Received calendar event: {data}")

@sio.event
def create_specialized_agent(data):
    print(f"Received specialized agent job: {data}")

@sio.event
def response(data):
    print(f"Received response: {data}")
    sio.disconnect()

@sio.event
def connect_error(data):
    print(f"Connection failed: {data}")
    sys.exit(1)

@sio.event
def disconnect():
    print("Disconnected")

if __name__ == '__main__':
    try:
        sio.connect('http://127.0.0.1:3000')
        sio.wait()
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)
