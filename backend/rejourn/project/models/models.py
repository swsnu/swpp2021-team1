from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import CharField, DateTimeField
from django.utils import timezone

from project.utils import profile_upload_to_func, photo_upload_to_func
from project.enum import Scope, PostType, RepoTravel


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
    # repositories : many to many field (Repository)

    def __str__(self):
        return self.username


class Repository(models.Model):
    repo_id = models.BigAutoField(primary_key=True)
    repo_name = models.CharField(max_length=120)
    visibility = models.IntegerField(choices=Scope.choices, default=0)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    travel_start_date = models.DateField('travel_start_date', default=timezone.localtime, null=True)
    travel_end_date = models.DateField('travel_end_date', default=timezone.localtime, null=True)
    collaborators = models.ManyToManyField(
        User,
        related_name='repositories',
    )
    travel = models.IntegerField(choices=RepoTravel.choices, default=0)
    # route : one to one field(Route)

    def __str__(self):
        return self.repo_name


class Route(models.Model):
    route_id = models.BigAutoField(primary_key=True)
    region_address = models.CharField(max_length=200)
    place_id = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)
    east = models.DecimalField(max_digits=18, decimal_places=15)
    west = models.DecimalField(max_digits=18, decimal_places=15)
    south = models.DecimalField(max_digits=18, decimal_places=15)
    north = models.DecimalField(max_digits=18, decimal_places=15)
    repository = models.OneToOneField(
        Repository,
        on_delete=models.SET_NULL,
        null=True,
        related_name='route'
    )

    def __str__(self):
        return self.region_address


class PlaceInRoute(models.Model):
    place_in_route_id = models.BigAutoField(primary_key=True)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    order = models.IntegerField()
    time = models.DateTimeField(blank=True, null=True)
    text = models.CharField(max_length=500, blank=True, null=True)
    place_id = models.CharField(max_length=100)
    place_name = models.CharField(max_length=200, blank=True, null=True)
    place_address = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)
    # thumbnail : one to one field(Photo)

    def __str__(self):
        return f"{self.route.route_id}, {self.order}, {self.place_name}"


class Photo(models.Model):
    photo_id = models.BigAutoField(primary_key=True)
    repository = models.ForeignKey(
        Repository,
        on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to=photo_upload_to_func)
    uploader = models.ForeignKey(
        User,
        on_delete=models.CASCADE)
    place = models.ForeignKey(
        PlaceInRoute,
        on_delete=models.SET_NULL,
        null=True)
    post_time = models.DateTimeField(auto_now_add=True)
    thumbnail_of = models.OneToOneField(
        PlaceInRoute,
        on_delete=models.SET_NULL,
        related_name='thumbnail',
        default=None,
        blank=True,
        null=True
    )
    # labels : many to many field (Label)

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
    post_type = models.IntegerField(choices=PostType.choices, default=0)

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


class Label(models.Model):
    label_id = models.BigAutoField(primary_key=True)
    label_name = models.CharField(max_length=200)
    repository = models.ForeignKey(
        Repository,
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    photos = models.ManyToManyField(
        Photo,
        related_name='labels'
    )

    def __str__(self):
        return self.label_name
