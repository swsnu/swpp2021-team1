from django.db import models

class Scope(models.IntegerChoices):
    PUBLIC = 0
    FRIENDS_ONLY = 1
    PRIVATE = 2

#class Classification(models.IntegerChoices):
