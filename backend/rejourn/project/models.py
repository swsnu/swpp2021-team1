from django.db import models
from django.contrib.auth.models import AbstractUser
from .enum import Scope
<<<<<<< HEAD
from django.utils import timezone
=======
import datetime
>>>>>>> 2fa98f1b7269d6f77c05e3a217fccf06f8944907


class User(AbstractUser):
    
    # email
    # password
<<<<<<< HEAD
    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    profile_picture = models.ImageField(blank=True, null=True, upload_to="profiles")
=======
    username = models.CharField(max_length=150, primary_key=True)
##    image_file = models.ImageField(blank=True, null=True, upload_to="images")
>>>>>>> 2fa98f1b7269d6f77c05e3a217fccf06f8944907
    bio = models.CharField(max_length=500, blank=True, default="")
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    real_name = models.CharField(max_length=150, default="")
    friends = models.ManyToManyField("self", symmetrical=True)

<<<<<<< HEAD
    def __str__(self):
        return self.username


=======
>>>>>>> 2fa98f1b7269d6f77c05e3a217fccf06f8944907
class Repository(models.Model):

    repo_id = models.BigAutoField(primary_key=True)
    repo_name = models.CharField(max_length=120)
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    #route_id = models.ForeignKey(Route, on_delete=models.SET_DEFAULT)
<<<<<<< HEAD
    travel_start_date = models.DateField('travel_start_date', default=timezone.localtime(), null=True)
    travel_end_date = models.DateField('travel_end_date', default=timezone.localtime(), null=True)
    collaborators = models.ManyToManyField(
        User,
        related_name='repositories',
    )

    def __str__(self):
        return self.repo_name
=======
    travel_start_date = models.DateField(default=datetime.date.today())
    travel_end_date = models.DateField(default=datetime.date.today())
    collaborators = models.ManyToManyField(
        User,
        related_name='repositories',
    )
>>>>>>> 2fa98f1b7269d6f77c05e3a217fccf06f8944907
