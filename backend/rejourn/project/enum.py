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

class NoticeType(models.IntegerChoices):
    FRIEND_REQUEST = 0
    INVITATION = 1
    NEW_POST = 2
    NEW_DISCUSSION = 3
    LIKE = 4
    COMMENT = 5
    FORK = 6

class NoticeAnswerType(models.IntegerChoices):
    NO = 0
    YES = 1

class UserProfileType(models.IntegerChoices):
    NOT_LOGGED_IN = 0
    MYSELF = 1
    FRIEND = 2
    REQUEST_SENDED = 3
    REQUEST_PENDING = 4
    OTHER = 5
