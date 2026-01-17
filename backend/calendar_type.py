from typing import List, Literal
from pydantic import BaseModel, Field

class UserCalendarEvent(BaseModel):
    id: str = Field(description="Unique identifier for the event")
    title: str = Field(description="Title of the event")
    # French first 3 letters of the day
    day: Literal["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    startHour: int = Field(ge=0, le=24, description="Start hour of the event (0-24)")
    duration: int = Field(description="Duration of the event")

class CalendarType(BaseModel):
    name: str = Field(description="Name of the calendar")
    events: List[UserCalendarEvent] = Field(description="List of events in the calendar")
