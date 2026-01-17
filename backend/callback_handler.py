import json

class OrchestratorCallbackHandler:
    def __init__(self, emit):
        self.emit = emit
        self.current_agent_title = ""
    
    def __call__(self, **kwargs):
        data = kwargs.get("data", "")
        complete = kwargs.get("complete", False)

        if "current_tool_use" in kwargs and kwargs["current_tool_use"].get("name"):
            tool_use = kwargs["current_tool_use"]
            tool_name = tool_use.get("name")
            if tool_name == "specialized_agent":
                try: 
                    agent_input = tool_use.get("input", "")
                    arguments = json.loads(agent_input)
                    title = arguments.get("title", "")
                    if title != "" and title != self.current_agent_title:
                        print("Creating specialized agent", title)
                        self.emit("create_specialized_agent", {"name": title})
                        self.current_agent_title = title
                except Exception:
                    pass
        elif data:
            if complete:
                self.current_agent_title = ""

            if self.current_agent_title != "":
                self.emit("specialized_agent_response", {"chunk": data, "name": self.current_agent_title})
            print(data, end="")

class SpecializedAgentCallbackHandler:
    def __init__(self, emit, title):
        self.emit = emit
        self.title = title
    
    def __call__(self, **kwargs):
        data = kwargs.get("data", "")

        if data:
            print(data, end="")
            self.emit("specialized_agent_response", {"chunk": data, "name": self.title})