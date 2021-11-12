from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import CharField, DateTimeField
from project.enum import Scope
from django.utils import timezone
from project.utils import profile_upload_to_func, photo_upload_to_func


class User(AbstractUser):
    
    # email
    # password
    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    profile_picture = models.ImageField(blank=True, null=True, upload_to=profile_upload_to_func)
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
    travel_start_date = models.DateField('travel_start_date', default=timezone.localtime, null=True)
    travel_end_date = models.DateField('travel_end_date', default=timezone.localtime, null=True)
    collaborators = models.ManyToManyField(
        User,
        related_name='repositories',
    )

    def __str__(self):
        return self.repo_name


class Photo(models.Model):
    photo_id = models.BigAutoField(primary_key=True)
    repository = models.ForeignKey(
        Repository, 
        on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to = photo_upload_to_func)
    uploader = models.ForeignKey(
        User,
        on_delete=models.CASCADE)
    # place = models.ForeignKey(Place, on_delete=models.SET_NULL)
    post_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return str(self.photo_id)


class PhotoTag(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    photo = models.ForeignKey(
        Photo,
        on_delete=models.CASCADE
    )
    text = CharField(max_length=500)
    edit_time = DateTimeField(auto_now=True)

    def __str__(self):
        return self.text


class Discussion(models.Model):
    discussion_id = models.BigAutoField(primary_key=True)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    text = models.CharField(max_length=1000)
    post_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class DiscussionComment(models.Model):
    discussion_comment_id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE)
    post_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


class Post(models.Model):
    post_id = models.BigAutoField(primary_key=True)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    text = models.CharField(max_length=1000)
    post_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class PhotoInPost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE)
    order = models.IntegerField()
    local_tag = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.post.post_id}, {self.order}"


class PostComment(models.Model):
    post_comment_id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    post_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text
