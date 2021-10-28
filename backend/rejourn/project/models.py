from django.db import models
from django.contrib.auth.models import AbstractUser
from .enum import Scope


# Create your models here.
class User(AbstractUser):

    username = models.TextField(max_length=120, primary_key=True)
    #image_file_path = models.ImageField(upload_to='')
    bio = models.TextField(max_length=500, blank=True)
    user_setting = models.IntegerField(choices=Scope.choices, default=0)
    realname = models.TextField(max_length=129, default="")
    friends = models.ManyToManyField("self", symmetrical=True)

class Repository(models.Model):
    class Scope(models.IntegerChoices):
        PUBLIC = 0
        FRIENDS_ONLY = 1
        PRIVATE = 2

    repo_id = models.BigAutoField(primary_key=True)
    repo_name = models.CharField(max_length=120)
    repo_setting = models.IntegerField(choices=Scope.choices, default=0)
    #route_id = models.ForeignKey(Route, on_delete=SET_DEFAULT)

