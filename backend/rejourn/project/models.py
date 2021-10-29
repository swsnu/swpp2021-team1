from django.db import models
from django.contrib.auth.models import AbstractUser
from .enum import Scope
import datetime


class User(AbstractUser):
    
    # email
    # password
    username = models.CharField(max_length=150, primary_key=True)
##    image_file = models.ImageField(blank=True, null=True, upload_to="images")
    bio = models.CharField(max_length=500, blank=True, default="")
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    real_name = models.CharField(max_length=150, default="")
    friends = models.ManyToManyField("self", symmetrical=True)

class Repository(models.Model):

    repo_id = models.BigAutoField(primary_key=True)
    repo_name = models.CharField(max_length=120)
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    #route_id = models.ForeignKey(Route, on_delete=models.SET_DEFAULT)
    travel_start_date = models.DateField(default=datetime.date.today())
    travel_end_date = models.DateField(default=datetime.date.today())
    collaborators = models.ManyToManyField(
        User,
        related_name='repositories',
    )