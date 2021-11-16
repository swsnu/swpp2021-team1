import json
from json.decoder import JSONDecodeError
from datetime import datetime

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from project.models.models import User, Repository, Route
from project.httpResponse import *
from project.utils import have_common_user
from project.enum import Scope
from django.conf import settings

import requests
from urllib.parse import urlencode
api_key = settings.GOOGLE_MAPS_API_KEY

DATE_FORMAT = "%Y-%m-%d"
UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

@require_http_methods(["GET"])
@ensure_csrf_cookie
def regionSearch(request):
    # if request.method == "GET":
    #if not request.user.is_authenticated:
    #    return HttpResponseNotLoggedIn()

    query_string = str(request.GET.get("query", None))
    if query_string is None:
        return HttpResponseInvalidInput()
    endpoint = 'https://maps.googleapis.com/maps/api/geocode/json'
    query_string_formatted = query_string.replace(" ", "-")
    params = {"address": query_string_formatted, "key": api_key}
    params_encoded = urlencode(params)
    url = f"{endpoint}?{params_encoded}"
    google_maps_response = requests.get(url)

    if google_maps_response.status_code not in range(200, 299):
        return HttpResponseInvalidInput()
    place_id = google_maps_response.json()['results'][0]['place_id']
    formatted_address = google_maps_response.json()['results'][0]['formatted_address']
    response_dict = {
        "place_id": place_id,
        "name": formatted_address,
    }
    print(response_dict)
    return HttpResponseSuccessGet([response_dict])

@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
def routeID(request, repo_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if not ((request.user in repository.collaborators.all()) or (repository.visibility == PUBLIC) or (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.a(), repository.collaborators.all()))):
            return HttpResponseNoPermission()
        
        route = Route.objects.get(repository=repository)

        places_to_return = Place.objects.filter(route=route).order_by("order")
        places = []
        for place in places_to_return:
            photos_to_return = Photo.objects.filter(place=place)
            photos = []
            for photo in photos_to_return:
                try:
                    photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                    photo_tag_text = photo_tag.text
                except PhotoTag.DoesNotExist:
                    photo_tag_text = ""
                response_photo = {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                }
                photos.append(response_photo)
                

            response_place = {
                "place_id": place.place_id,
                "place_name": place.place_name,
                "place_address": place.place_address,
                "place_address": place.place_address,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "photos": photos
            }
            if place.text != None:
                response_place["text"] = place.text
            if place.time != None:
                response_place["time"] = place.time.strftime(UPLOADED_TIME_FORMAT)
            if bool(place.thumbnail):
                response_place["thumbnail"] = Photo.objects.get(thumbnail_of=place).image_file.url
            places.append(response_place)

        response_region = {
            "region_address": route.region_address,
            "place_id": route.place_id,
            "latitude": route.latitude,
            "longitude": route.longitude,
            "north": route.north,
            "south": route.south,
            "west": route.west,
            "east": route.east,
        }
        response_dict = {
            "repo_id": repository.repo_id,
            "places": places,
            "region": response_region,
        }

        return HttpResponseSuccessGet(response_dict)
    # if request.method == "POST":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()
    if not request.user in repository.collaborators.all():
        return HttpResponseNoPermission()
    
    request_type = 0 # 0: request by place_id / 1: request by repo_id
    # both containing request is returned with HttpResponseBadReqeust()

    try:
        req_data = json.loads(request.body.decode())
        place_id = req_data["place_id"]
    except (KeyError, JSONDecodeError):
        try:
            fork_repo_id = req_data["repo_id"]
        except:
            return HttpResponseBadRequest()
        request_type = 1
    try:
        fork_repo_id = req_data["repo_id"]
        return HttpResponseBadRequest()
    except (KeyError):
        request_type = 0

    if request_type == 0:
        url = urlencode('https://maps.googleapis.com/maps/api/geocode/json?place_id=' + place_id + '&key=' + api_key)
        google_maps_response = requests.get(url)
        if google_maps_response.status_code not in range(200, 299):
            return HttpResponseBadRequest()

        region_address = google_maps_response.json()['results'][0]['formatted_address']
        latitude = google_maps_response.json()['results'][0]['geometry']['location']['lat']
        longitude = google_maps_response.json()['results'][0]['geometry']['location']['lng']
        east = google_maps_response.json()['results'][0]['geometry']['bounds']['northeast']['lng']
        west = google_maps_response.json()['results'][0]['geometry']['bounds']['southwest']['lng']
        south = google_maps_response.json()['results'][0]['geometry']['bounds']['southwest']['lat']
        north = google_maps_response.json()['results'][0]['geometry']['bounds']['northeast']['lat']

        new_route = Route(region_address=region_address, place_id=place_id, latitude=latitude, longitude=longitude, east=east, west=west, south=south, north=north, repository=repository)
        new_route.save()
        return HttpResponseSuccessUpdate()
    
    # if request_type == 1:
    try:
        fork_repository = Repository.objects.get(repo_id=fork_repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()
    try:
        fork_route = Route.objects.get(repository=fork_repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist()
    region_address = fork_route.region_address
    place_id = fork_route.place_id
    latitude = fork_route.latitude
    longitude = fork_route.longitude
    east = fork_route.east
    west = fork_route.west
    south = fork_route.south
    north = fork_route.north

    new_route = Route(region_address=region_address, place_id=place_id, latitude=latitude, longitude=longitude, east=east, west=west, south=south, north=north, repository=repository)
    new_route.save()

    places = PlaceInRoute.objects.filter(route=fork_route)
    for place in places:
        route = new_route
        order = place.order
        place_id = place.place_id
        place_name = place.place_name
        place_address = place.place_address
        latitude = place.latitude
        longitude = place.longitude
        new_place = PlaceInRoute(route=route, order=order, place_id=place_id, place_name=place_name, place_address=place_address, latitude=latitude, longitude=longitude)
        new_place.save()
    return HttpResponseSuccessUpdate()

@require_http_methods(["GET"])
@ensure_csrf_cookie
def placeSearch(request, repo_id):
    # if request.method == "GET":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist

    try:
        route = Route.objects.get(repository=repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist

    query_string = str(request.GET.get("query", None))
    if query_string is None:
        return HttpResponseInvalidInput()
    
    latitude = str(route.latitude)
    longitude = str(route.longitude)

    endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    query_string_formatted = query_string.replace(" ", "-")
    params = {"query": query_string_formatted, "location": {"lat": latitude, "lng": longitude}, "key": api_key}
    params_encoded = urlencode(params)
    url = f"{endpoint}?{params_encoded}"
    google_maps_response = requests.get(url)

    if google_maps_response.status_code not in range(200, 299):
        return HttpResponseInvalidInput()
    place_id = google_maps_response.json()['results'][0]['place_id']
    formatted_address = google_maps_response.json()['results'][0]['formatted_address']
    name = google_maps_response.json()['results'][0]['name']

    response = []


    response_dict = {
        "place_id": place_id,
        "formatted_address": formatted_address,
        "name": name,
    }
    return HttpResponseSuccessGet([response_dict])

@require_http_methods(["PUT"])
@ensure_csrf_cookie
def places(request, repo_id):
    # if request.method == "PUT":
    return HttpResponseSuccessUpdate()

@require_http_methods(["POST"])
@ensure_csrf_cookie
def placeID(request, repo_id, place_id):
    # if request.method == "POST":
    return HttpResponseSuccessUpdate()
