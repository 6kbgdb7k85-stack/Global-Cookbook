from enum import StrEnum

from models import *

OPEN_ROUTES = ["login", "signup"]

USER_ENDPOINTS = [
    "recipe",
    "comment",
]

USER_RESOURCES = {"recipe": Recipe, "comment": Comment}

DEFAULT_PAGE = 1

DEFAULT_PER_PAGE = 5

# front-end will look for these error types to do specific actions (example 'alert_error' causes as alert banner to appear with the message)
class ERROR_TYPES(StrEnum):
    ALERT_ERROR = "alert_error"
    FIELD_ERROR = "field_error"
    ERROR = "error"
