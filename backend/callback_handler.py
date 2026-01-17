
class OrchestratorCallbackHandler:
    def __init__(self, socketio):
        self.socketio = socketio
    
    def __call__(self, **kwargs):
        data = kwargs.get("data", "")
        complete = kwargs.get("complete", False)

        if "current_tool_use" in kwargs and kwargs["current_tool_use"].get("name"):
            tool_use = kwargs["current_tool_use"]
            tool_name = tool_use.get("name")
            if tool_name == "specialized_agent":
                arguments = tool_use.get("arguments", {})
                name = arguments.get("name")
                if name:
                    print(f"Specialized agent name: {name}")
                    self.socketio.emit("create_specialized_agent", {"name": name})
        if data:
            print(data, end="")
            self.socketio.emit("calendar", {"chunk": data})


class SpecializedAgentCallbackHandler:
    def __init__(self, socketio, name):
        self.socketio = socketio
        self.name = name
    
    def __call__(self, **kwargs):
        data = kwargs.get("data", "")

        if data:
            print(data, end="")
            self.socketio.emit("specialized_agent_response", {"chunk": data, "name": self.name} )