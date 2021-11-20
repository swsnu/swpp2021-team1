import requests

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.db.models import Count

from project.models.models import User, Repository, Route, PlaceInRoute, Post
from project.httpResponse import *

from project.enum import Scope

@require_http_methods(["GET"])
@ensure_csrf_cookie
def exploreUsers(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    query_user = request.GET.get("query", None)
    if query_user is None:
        return HttpResponseBadRequest()
    
    friends = User.objects.filter(friends__user_id=request.user.user_id)

    response_list = []
    temp = []
    for user in friends.filter(username__icontains=query_user):
        if user.username__istartswith == query_user:
            response_list.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})
        else:
            temp.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})

    for user in temp:
        response_list.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})

    public_users = User.objects.filter(visibility=Scope.PUBLIC)
    temp = []
    for user in public_users.filter(username__icontains=query_user):
        if user.username__istartswith == query_user:
            response_list.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})
        else:
            temp.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})

    for user in temp:
        response_list.append({"username": user.username, "bio": user.bio, "profile_picture": user.profile_picture.url})    

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
    repositories_friends = Repository.objects.filter(collaborators__in=request.user.friends)
    public_repositories = Repository.objects.filter(visibility=Scope.PUBLIC)
    possible_repositories = repositories_mine.union(repositories_friends).union(public_repositories)

    response_list = []
    temp = []
    for repository in possible_repositories.filter(repo_name__icontains=query_repository):
        if repository.repo_name__istartswith == query_repository:
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
        else:
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
    url_for_geocoding = "https://maps.googleapis.com/maps/api/geocode/json?address="+query_place_formatted+"&key="+api_key
    geocoding_response = requests.get(url_for_geocoding)

    if geocoding_response.status_code in range(200, 299):
        place_id = geocoding_response.json()['results'][0]['place_id']
        place_id_0 = place_id
        place_id_list.append(place_id)

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query="+query_place_formatted+"&key="+api_key
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