from django.db import models
from django.contrib.auth.models import AbstractUser
from .enum import Scope
from django.utils import timezone


class User(AbstractUser):
    
    # email
    # password
    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    profile_picture = models.ImageField(blank=True, null=True, upload_to="profiles")
    bio = models.CharField(max_length=500, blank=True, default="")
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    real_name = models.CharField(max_length=150, default="")
    friends = models.ManyToManyField("self", symmetrical=True)

    def __str__(self):
        return self.username


class Repository(models.Model):

    repo_id = models.BigAutoField(primary_key=True)
    repo_name = models.CharField(max_length=120)
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    #route_id = models.ForeignKey(Route, on_delete=models.SET_DEFAULT)
    travel_start_date = models.DateField('travel_start_date', default=timezone.localtime(), null=True)
    travel_end_date = models.DateField('travel_end_date', default=timezone.localtime(), null=True)
    collaborators = models.ManyToManyField(
        User,
        related_name='repositories',
    )

    def __str__(self):
        return self.repo_name