from datetime import timedelta

import requests

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.db.models import Count
from django.db import models
from django.conf import settings
from django.utils import timezone

from project.models.models import User, Repository, PlaceInRoute, Post, PhotoInPost
from project.httpResponse import *

from project.enum import Scope, PostType, RepoTravel


API_KEY = settings.GOOGLE_MAPS_API_KEY
UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

API_KEY = settings.GOOGLE_MAPS_API_KEY

# /api/explore/users/
@require_http_methods(["GET"])
@ensure_csrf_cookie
def exploreUsers(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    query_user = request.GET.get("query", None)
    if query_user is None:
        return HttpResponseBadRequest()

    friends = User.objects.filter(friends__user_id=request.user.user_id)
    friends_not_private = friends.exclude(visibility=Scope.PRIVATE)

    friends_matching = friends_not_private.filter(username__icontains=query_user)
    friends_matching = friends_matching.annotate(order=models.Value(0, models.IntegerField()))

    public_users = User.objects.filter(visibility=Scope.PUBLIC)
    public_users = public_users.exclude(friends__user_id=request.user.user_id)

    public_users_matching = public_users.filter(username__icontains=query_user)
    public_users_matching = public_users_matching.annotate(order=models.Value(1, models.IntegerField()))

    possible_users_matching = friends_matching.union(public_users_matching).order_by('order')

    response_list = []
    temp = []
    for user in possible_users_matching:
        if user.username.startswith(query_user):
            if bool(user.profile_picture):
                response_list.append({
                    "username": user.username,
                    "bio": user.bio,
                    "profile_picture": user.profile_picture.url
                })
            else:
                response_list.append({"username": user.username, "bio": user.bio})
        else:
            temp.append(user)

    for user in temp:
        if bool(user.profile_picture):
            response_list.append({
                "username": user.username,
                "bio": user.bio,
                "profile_picture": user.profile_picture.url
            })
        else:
            response_list.append({"username": user.username, "bio": user.bio})

    return HttpResponseSuccessGet(response_list)

# /api/explore/repositories/
@require_http_methods(["GET"])
@ensure_csrf_cookie
def exploreRepositories(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    query_repository = request.GET.get("query", None)
    if query_repository is None:
        return HttpResponseBadRequest()

    repositories_mine = Repository.objects.filter(collaborators__user_id=request.user.user_id)

    repositories_mine_matching = repositories_mine.filter(repo_name__icontains=query_repository)
    repositories_mine_matching = repositories_mine_matching.annotate(order=models.Value(0, models.IntegerField()))

    repositories_friends = Repository.objects.filter(
        collaborators__in=User.objects.filter(username=request.user.username).values('friends')
    )
    repositories_friends_exclude_private = repositories_friends.filter(visibility=Scope.FRIENDS_ONLY)

    repositories_friends_matching = repositories_friends_exclude_private.filter(repo_name__icontains=query_repository)
    repositories_friends_matching = repositories_friends_matching.annotate(order=models.Value(0, models.IntegerField()))

    public_repositories = Repository.objects.filter(visibility=Scope.PUBLIC)
    public_repositories = public_repositories.exclude(collaborators__user_id=request.user.user_id)
    public_repositories = public_repositories.exclude(
        collaborators__in=User.objects.filter(username=request.user.username).values('friends')
    )

    public_repositories_matching = public_repositories.filter(repo_name__icontains=query_repository)
    public_repositories_matching = public_repositories_matching.annotate(order=models.Value(0, models.IntegerField()))

    possible_repositories = repositories_mine_matching.union(repositories_friends_matching)
    possible_repositories = possible_repositories.union(public_repositories_matching)
    possible_repositories = possible_repositories.order_by('order')

    response_list = []
    temp = []
    for repository in possible_repositories:
        places = PlaceInRoute.objects.filter(route__repository=repository)
        places = places.annotate(number_of_photos=Count("photo"))
        places = places.order_by('-number_of_photos')

        response_places = []
        count = 0
        for place in places:
            if count < 3:
                response_places.append({
                    "place_id": place.place_id,
                    "place_name": place.place_name,
                    "place_address": place.place_address
                })
                count += 1
            else:
                break
        response_dict = {"repo_id": repository.repo_id, "repo_name": repository.repo_name}
        response_dict["region_address"] = repository.route.region_address
        response_dict["places"] = response_places

        if repository.repo_name.startswith(query_repository):
            response_list.append(response_dict)
        else:
            temp.append(response_dict)

    for repository in temp:
        response_list.append(repository)

    return HttpResponseSuccessGet(response_list)

# /api/explore/regions/
@require_http_methods(["GET"])
@ensure_csrf_cookie
def exploreRegions(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    query_region = request.GET.get("query", None)
    if query_region is None:
        return HttpResponseBadRequest()

    query_region_formatted = query_region.replace(" ", "%2C")

    url_header_for_geocoding_header = "https://maps.googleapis.com/maps/api/geocode/json?address="
    url_for_geocoding = url_header_for_geocoding_header + query_region_formatted + "&key=" + API_KEY
    geocoding_response = requests.get(url_for_geocoding)

    if geocoding_response.status_code in range(200, 299):
        return HttpResponseBadRequest()

    place_id = geocoding_response.json()['results'][0]['place_id']

    #route_to_contain = Route.objects.filter(place_id=place_id)

    repositories_mine = Repository.objects.filter(collaborators__user_id=request.user.user_id)

    repositories_mine_matching = repositories_mine.filter(route__place_id=place_id)
    repositories_mine_matching = repositories_mine_matching.annotate(order=models.Value(0, models.IntegerField()))

    repositories_friends = Repository.objects.filter(
        collaborators__in=User.objects.filter(username=request.user.username).values('friends')
    )
    repositories_friends_exclude_private = repositories_friends.filter(visibility=Scope.FRIENDS_ONLY)

    repositories_friends_matching = repositories_friends_exclude_private.filter(route__place_id=place_id)
    repositories_friends_matching = repositories_friends_matching.annotate(order=models.Value(0, models.IntegerField()))

    public_repositories = Repository.objects.filter(visibility=Scope.PUBLIC)
    public_repositories = public_repositories.exclude(collaborators__user_id=request.user.user_id)
    public_repositories = public_repositories.exclude(
        collaborators__in=User.objects.filter(username=request.user.username).values('friends')
    )

    public_repositories_matching = public_repositories.filter(route__place_id=place_id)
    public_repositories_matching = public_repositories_matching.annotate(order=models.Value(0, models.IntegerField()))

    possible_repositories = repositories_mine_matching.union(repositories_friends_matching)
    possible_repositories = possible_repositories.union(public_repositories_matching)
    possible_repositories = possible_repositories.order_by('order')

    response_list = []
    for repository in possible_repositories:
        places = PlaceInRoute.objects.filter(route__repository=repository)
        places = places.annotate(number_of_photos=Count("photo"))
        places = places.order_by('-number_of_photos')

        response_places = []
        count = 0
        for place in places:
            if count < 3:
                response_places.append({
                    "place_id": place.place_id,
                    "place_name": place.place_name,
                    "place_address": place.place_address
                })
                count += 1
            else:
                break
        response_dict = {
            "repo_id": repository.repo_id,
            "repo_name": repository.repo_name,
            "region_address": repository.route.region_address,
            "places": response_places
        }
        response_list.append(response_dict)


    return HttpResponseSuccessGet(response_list)

# /api/feeds/
@require_http_methods(["GET"])
@ensure_csrf_cookie
def feeds(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    user = request.user

    request_date = timezone.now()
    before_two_week = request_date - timedelta(weeks=2)

    personal_feed_list = Post.objects.filter(
        author__in=User.objects.filter(username=request.user.username).values('friends'),
        post_type=PostType.PERSONAL,
        post_time__range=[before_two_week, request_date]
    )
    repo_feed_list = Post.objects.filter(
        repository__collaborators__in=User.objects.filter(username=request.user.username).values('friends'),
        post_type=PostType.REPO,
        post_time__range=[before_two_week, request_date]
    )

    feed_list = personal_feed_list.union(repo_feed_list).order_by('-post_time')

    response_list = []
    for post in feed_list:
        if ((post.post_type == PostType.REPO and post.repository.travel == RepoTravel.TRAVEL_ON)
                or post.post_type == PostType.PERSONAL):
            author_list = []
            temp = []
            if post.post_type == PostType.REPO:
                for collaborator in post.repository.collaborators.all():
                    author_info = {
                        "username": collaborator.username,
                        "bio": collaborator.bio,
                    }
                    if bool(collaborator.profile_picture):
                        author_info["profile_picture"] = collaborator.profile_picture.url

                    if collaborator in request.user.friends.all():
                        author_list.append(author_info)
                    else:
                        temp.append(author_info)

                for collaborator in temp:
                    author_list.append(collaborator)
            else:
                author_info = {
                    "username": post.author.username,
                    "bio": post.author.bio,
                }
                if bool(post.author.profile_picture):
                    author_info["profile_picture"] = post.author.profile_picture.url
                author_list.append(author_info)

            photo_list = []
            for photo_order in PhotoInPost.objects.filter(post=post):
                photo_list.append(
                    {
                        "photo_id": photo_order.photo.photo_id,
                        "local_tag": photo_order.local_tag,
                        "image": photo_order.photo.image_file.url,
                    }
                )

            response_dict = {
                "post_id": post.post_id,
                "repo_id": post.repository.repo_id,
                "author": author_list,
                "title": post.title,
                "text": post.text,
                "photos": photo_list,
                "region": post.repository.route.region_address,
                "post_type": post.post_type,
                "post_time": timezone.make_naive(post.post_time).strftime(UPLOADED_TIME_FORMAT),
            }

            response_list.append(response_dict)

    return HttpResponseSuccessGet(response_list)
