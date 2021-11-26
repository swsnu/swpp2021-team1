from django.db import models


class Scope(models.IntegerChoices):
    PUBLIC = 0
    FRIENDS_ONLY = 1
    PRIVATE = 2

class PostType(models.IntegerChoices):
    PERSONAL = 0
    REPO = 1

class RepoTravel(models.IntegerChoices):
    TRAVEL_OFF = 0
    TRAVEL_ON = 1

## class Classification(models.IntegerChoices):
