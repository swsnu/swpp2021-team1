import requests

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.db.models import Count, Q
from django.db import models
from django.conf import settings

from project.models.models import User, Repository, Route, PlaceInRoute, Post
from project.httpResponse import *

from project.enum import Scope

API_KEY = settings.GOOGLE_MAPS_API_KEY

@require_http_methods(["GET"])
@ensure_csrf_cookie
def exploreUsers(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    query_user = request.GET.get("query", None)
    if query_user is None:
        return HttpResponseBadRequest()
    
    friends = User.objects.filter(friends__user_id=request.user.user_id)
    friends_not_private = friends.filter(visibility=(Scope.PUBLIC or Scope.FRIENDS_ONLY))
    friends_matching = friends_not_private.filter(username__icontains=query_user).annotate(order=models.Value(0, models.IntegerField()))
    public_users = User.objects.filter(visibility=Scope.PUBLIC)
    public_users_matching = public_users.filter(username__icontains=query_user).annotate(order=models.Value(1, models.IntegerField()))
    possible_users_matching = friends_matching.union(public_users_matching).order_by('order')
    print(possible_users_matching)
    ###order 맞추기. https://stackoverflow.com/questions/18235419/how-to-chain-django-querysets-preserving-individual-order

    response_list = []
    temp = []
    for user in possible_users_matching:
        if user.username.startswith(query_user):
            if bool(user.profile_picture):
                response_list.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})
            else:
                response_list.append({"username": user.username, "bio": user.bio})
        else:
            temp.append(user)

    for user in temp:
        if bool(user.profile_picture):
            response_list.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})
        else:
            response_list.append({"username": user.username, "bio": user.bio})  

    return HttpResponseSuccessGet(response_list)

@require_http_methods(["GET"])
@ensure_csrf_cookie
def exploreRepositories(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    query_repository = request.GET.get("query", None)
    if query_repository is None:
        return HttpResponseBadRequest()
    
    repositories_mine = Repository.objects.filter(collaborators__user_id=request.user.user_id)
    repositories_mine_matching = repositories_mine.filter(repo_name__icontains=query_repository).annotate(order=models.Value(0, models.IntegerField()))
    repositories_friends = Repository.objects.filter(collaborators__in=User.objects.filter(username=request.user.username).values('friends'))
    repositories_friends_exclude_private = repositories_friends.filter(visibility=Scope.FRIENDS_ONLY)
    repositories_friends_matching = repositories_friends_exclude_private.filter(repo_name__icontains=query_repository).annotate(order=models.Value(0, models.IntegerField()))
    public_repositories = Repository.objects.filter(visibility=Scope.PUBLIC)
    public_repositories_matching = public_repositories.filter(repo_name__icontains=query_repository).annotate(order=models.Value(0, models.IntegerField()))
    possible_repositories = repositories_mine_matching.union(repositories_friends_matching).union(public_repositories_matching).order_by('order')

    response_list = []
    temp = []
    for repository in possible_repositories:
        if repository.repo_name.startswith(query_repository):
            places = PlaceInRoute.objects.filter(route__repository=repository).annotate(number_of_photos=Count("photo")).order_by('-number_of_photos')
            response_places = []
            count = 0
            for place in places:
                if count < 3:
                    response_places.append({"place_id": place.place_id, "place_name": place.place_name, "place_address": place.place_address})
                    count += 1
                else:
                    break
            response_dict = {"repo_id": repository.repo_id, "repo_name": repository.repo_name}
            try:
                response_dict["region_address"] = repository.route.region_address
                response_dict["places"] = response_places
            except:
                pass
            response_list.append(response_dict)
        else:
            places = PlaceInRoute.objects.filter(route__repository=repository).annotate(number_of_photos=Count("photo")).order_by('-number_of_photos')
            response_places = []
            count = 0
            for place in places:
                if count < 3:
                    response_places.append({"place_id": place.place_id, "place_name": place.place_name, "place_address": place.place_address})
                    count += 1
                else:
                    break
            response_dict = {"repo_id": repository.repo_id, "repo_name": repository.repo_name}
            try:
                response_dict["region_address"] = repository.route.region_address
                response_dict["places"] = response_places
            except:
                pass
            response_list.append(response_dict)
            temp.append(response_dict)

    for repository in temp:
        response_list.append(repository)

    return HttpResponseSuccessGet(response_list)

@require_http_methods(["GET"])
@ensure_csrf_cookie
def explorePlaces(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    query_place = request.GET.get("query", None)
    if query_place is None:
        return HttpResponseBadRequest()

    place_id_list = []
    place_id_0 = ""

    query_place_formatted = query_place.replace(" ", "%2C")
    url_for_geocoding = "https://maps.googleapis.com/maps/api/geocode/json?address="+query_place_formatted+"&key="+API_KEY
    geocoding_response = requests.get(url_for_geocoding)

    if geocoding_response.status_code in range(200, 299):
        place_id = geocoding_response.json()['results'][0]['place_id']
        place_id_0 = place_id
        place_id_list.append(place_id)

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query="+query_place_formatted+"&key="+API_KEY
    google_maps_response = requests.get(url)

    for place in google_maps_response.json()['results']:
        if google_maps_response.status_code in range(200, 299):
            place_id = place['place_id']
            if place_id != place_id_0:
                place_id_list.append(place_id)

    repositories_mine = Repository.objects.filter(collaborators__user_id=request.user.user_id)
    repositories_friends = Repository.objects.filter(collaborators__in=request.user.friends)
    public_repositories = Repository.objects.filter(visibility=Scope.PUBLIC)
    possible_repositories = repositories_mine.union(repositories_friends).union(public_repositories)

    for p in place_id_list:
        route_to_contain = Route.objects.filter(place_id=p)
        place_to_contain = PlaceInRoute.objects.filter(place_id=p)

    containing_repositories = []
    for route in route_to_contain:
        containing_repositories.append(route.repository)
    for place in place_to_contain:
        containing_repositories.append(place.route.repository)

    intersect_repositories = possible_repositories.intersection(containing_repositories)
    
    response_list = []
    for repository in intersect_repositories:
        places = PlaceInRoute.objects.filter(repository=repository).annotate(number_of_photos=Count("photo")).order_by('-number_of_photos')
        response_places = []
        count = 0
        for place in places:
            if count < 3:
                response_places.append({"place_id": place.place_id, "place_name": place.place_name, "place_address": place.place_address})
                count += 1
            else:
                break
        response_dict = {"repo_id": repository.repo_id, "repo_name": repository.repo_name, "region_address": repository.route.region_address, "places": response_places}
        response_list.append(response_dict)

    return HttpResponseSuccessGet(response_list)

@require_http_methods(["GET"])
@ensure_csrf_cookie
def feeds(request, username):
    return HttpResponseSuccessGet()
