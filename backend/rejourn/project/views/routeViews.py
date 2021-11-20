import json
from json.decoder import JSONDecodeError

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import Repository, Route, PlaceInRoute, Photo, PhotoTag
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
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    query_string = request.GET.get("query", None)

    if query_string is None:
        return HttpResponseBadRequest()
    endpoint = 'https://maps.googleapis.com/maps/api/geocode/json'
    query_string_formatted = query_string.replace(" ", "-")
    params = {"address": query_string_formatted, "key": api_key}
    params_encoded = urlencode(params)
    url = f"{endpoint}?{params_encoded}"
    google_maps_response = requests.get(url)

    if google_maps_response.status_code != 200:
        return HttpResponseInvalidInput()
    place_id = google_maps_response.json()['results'][0]['place_id']
    formatted_address = google_maps_response.json()['results'][0]['formatted_address']
    response_dict = {
        "place_id": place_id,
        "formatted_address": formatted_address,
    }

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

        if not ((request.user in repository.collaborators.all()) or (repository.visibility == Scope.PUBLIC) or (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()))):
            return HttpResponseNoPermission()

        route = Route.objects.get(repository=repository)
        places_to_return = PlaceInRoute.objects.filter(route=route).order_by("order")
        places_response = []
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
                    "post_time": photo.post_time.strftime(DATE_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                }
                photos.append(response_photo)

            response_place = {
                "place_id": place.place_id,
                "place_name": place.place_name,
                "place_address": place.place_address,
                "latitude": float(place.latitude),
                "longitude": float(place.longitude),
                "photos": photos
            }
            if place.text is not None:
                response_place["text"] = place.text
            if place.time is not None:
                response_place["time"] = place.time.strftime(DATE_FORMAT)
            try:
                response_place["thumbnail"] = Photo.objects.get(thumbnail_of=place).image_file.url
            except Photo.DoesNotExist:
                pass
            places_response.append(response_place)

        not_assigned_photos = []
        repository_photos = Photo.objects.filter(repository=repository)
        for photo in repository_photos:
            if photo.place == None:
                try:
                    photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                    photo_tag_text = photo_tag.text
                except PhotoTag.DoesNotExist:
                    photo_tag_text = ""
                response_photo = {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(DATE_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                }
                not_assigned_photos.append(response_photo)
        response_region = {
            "region_address": route.region_address,
            "place_id": route.place_id,
            "latitude": float(route.latitude),
            "longitude": float(route.longitude),
            "north": float(route.north),
            "south": float(route.south),
            "west": float(route.west),
            "east": float(route.east),
        }
        response_dict = {
            "repo_id": repository.repo_id,
            "not_assigned": not_assigned_photos,
            "places": places_response,
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
    # both containing request is returned with HttpResponseBadRequest()
    try:
        req_data = json.loads(request.body.decode())
        place_id = req_data["place_id"]
        try:
            fork_repo_id = req_data["repo_id"]
            return HttpResponseBadRequest()
        except (KeyError, JSONDecodeError):
            request_type = 0
    except (KeyError, JSONDecodeError):
        try:
            req_data = json.loads(request.body.decode())
            fork_repo_id = req_data["repo_id"]
            request_type = 1
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

    if request_type == 0:
        endpoint = 'https://maps.googleapis.com/maps/api/geocode/json'
        params = {"place_id": place_id, "key": api_key}
        params_encoded = urlencode(params)
        url = f"{endpoint}?{params_encoded}"
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

        try:
            ori_route = Route.objects.get(repository=repository)
            ori_route.delete()
        except Route.DoesNotExist:
            pass
        new_route = Route(region_address=region_address, place_id=place_id, latitude=latitude, longitude=longitude, east=east, west=west, south=south, north=north, repository=repository)
        new_route.save()
        return HttpResponseSuccessUpdate()
    # request_type == 1

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

    try:
        ori_route = Route.objects.get(repository=repository)
        ori_route.delete()
    except Route.DoesNotExist:
        pass

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
        return HttpResponseNotExist()

    if not request.user in repository.collaborators.all():
        return HttpResponseNoPermission()

    try:
        route = Route.objects.get(repository=repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist()

    query_string = request.GET.get("query", None)
    if query_string is None:
        return HttpResponseBadRequest()

    response = []
    place_id_0 = ""

    query_string_formatted = query_string.replace(" ", "%2C")
    url_for_geocoding = "https://maps.googleapis.com/maps/api/geocode/json?address="+query_string_formatted+"&key="+api_key
    geocoding_response = requests.get(url_for_geocoding)

    if geocoding_response.status_code in range(200, 299):
        place_id = geocoding_response.json()['results'][0]['place_id']
        formatted_address = geocoding_response.json()['results'][0]['formatted_address']
        response_dict = {
            "place_id": place_id,
            "formatted_address": formatted_address,
        }
        if (-0.5<(geocoding_response.json()['results'][0]['geometry']['location']['lat']-float(route.latitude)) < 0.5) and (-0.5<(geocoding_response.json()['results'][0]['geometry']['location']['lng']-float(route.longitude)) < 0.5):
            place_id_0 = place_id
            response.append(response_dict)

    url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?location='+str(route.latitude)+"%2C"+str(route.longitude)+"&query="+query_string_formatted+"&key="+api_key
    google_maps_response = requests.get(url)

    for place in google_maps_response.json()['results']:
        if google_maps_response.status_code in range(200, 299):
            place_id = place['place_id']
            formatted_address = place['formatted_address']
            name = place['name']
            response_dict = {
                "place_id": place_id,
                "formatted_address": formatted_address,
                "name": name,
            }
            if place_id != place_id_0:
                response.append(response_dict)

    return HttpResponseSuccessGet(response)

@require_http_methods(["PUT"])
@ensure_csrf_cookie
def places(request, repo_id):
    # if request.method == "PUT":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()
    if not request.user in repository.collaborators.all():
        return HttpResponseNoPermission()

    try:
        route = Route.objects.get(repository=repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist()

    try:
        req_data = json.loads(request.body.decode())

    except JSONDecodeError:
        return HttpResponseBadRequest()

    still_existing_place_id = []
    i = 1
    for place in req_data:
        try:
            place_id = place["place_id"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()
        still_existing_place_id.append(place_id)
        try:
            place_to_edit = PlaceInRoute.objects.get(place_id=place_id)

        except PlaceInRoute.DoesNotExist:
            return HttpResponseNotExist()
        place_to_edit_order = i

        try:
            edit_text = place["text"]
        except (KeyError, JSONDecodeError):
            edit_text = None

        try:
            edit_time = place["time"]
        except (KeyError, JSONDecodeError):
            edit_time = None

        edited_place = PlaceInRoute(route=route, order=place_to_edit_order, text=edit_text, time=edit_time, place_id=place_id, place_name=place_to_edit.place_name, place_address=place_to_edit.place_address, latitude=place_to_edit.latitude, longitude=place_to_edit.longitude)

        edited_place.save()

        try:
            edit_thumbnail = place["thumbnail"]
            try:
                photo_to_remove_thumbnail_of = Photo.objects.get(thumbnail_of=place_to_edit)
                photo_to_remove_thumbnail_of.thumbnail_of = None
                photo_to_remove_thumbnail_of.save()
            except Photo.DoesNotExist:
                pass

            flag = 0
            for photo in Photo.objects.all():
                if photo.image_file.url == edit_thumbnail:
                    photo.thumbnail_of = edited_place
                    photo.save()
                    flag = 1
                    break
            if flag == 0:
                return HttpResponseNotExist()

        except (KeyError, JSONDecodeError):
            try:
                photo_to_remove_thumbnail_of = Photo.objects.get(thumbnail_of_id=place_to_edit.place_in_route_id)
                photo_to_remove_thumbnail_of.thumbnail_of = None
                photo_to_remove_thumbnail_of.save()
            except Photo.DoesNotExist:
                pass

        try:
            edit_photos_in_place = place["photos"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        ori_photos_in_place = Photo.objects.filter(place=place_to_edit)
        for photo in ori_photos_in_place:
            photo.place = None
            photo.save()
        for photo in edit_photos_in_place:
            try:
                try:
                    photo_in_place = Photo.objects.get(photo_id=photo["photo_id"])
                except (KeyError, JSONDecodeError):
                    return HttpResponseBadRequest()
            except Photo.DoesNotExist:
                return HttpResponseNotExist()
            photo_in_place.place = edited_place
            photo_in_place.save()
        place_to_edit.delete()
        i += 1

    for remove_place in PlaceInRoute.objects.filter(route=route):
        if not remove_place.place_id in still_existing_place_id:
            remove_place.delete()

    places_to_return = PlaceInRoute.objects.filter(route=route).order_by("order")
    places_response = []
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
                "post_time": photo.post_time.strftime(DATE_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
            photos.append(response_photo)


        response_place = {
            "place_id": place.place_id,
            "place_name": place.place_name,
            "place_address": place.place_address,
            "latitude": float(place.latitude),
            "longitude": float(place.longitude),
            "photos": photos
        }
        if place.text is not None:
            response_place["text"] = place.text
        if place.time is not None:
            response_place["time"] = place.time.strftime(DATE_FORMAT)
        try:
            response_place["thumbnail"] = Photo.objects.get(thumbnail_of=place).image_file.url
        except Photo.DoesNotExist:
            pass
        places_response.append(response_place)

    not_assigned_photos = []
    repository_photos = Photo.objects.filter(repository=repository)
    for photo in repository_photos:
        if photo.place is None:
            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""
            response_photo = {
                "photo_id": photo.photo_id,
                "repo_id": photo.repository.repo_id,
                "image": photo.image_file.url,
                "post_time": photo.post_time.strftime(DATE_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
            not_assigned_photos.append(response_photo)

    response_dict = {
        "not_assigned": not_assigned_photos,
        "places": places_response,
    }

    return HttpResponseSuccessUpdate(response_dict)

@require_http_methods(["POST"])
@ensure_csrf_cookie
def placeID(request, repo_id, place_id):
    # if request.method == "POST":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if not ((request.user in repository.collaborators.all()) or (repository.visibility == Scope.PUBLIC) or (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.a(), repository.collaborators.all()))):
        return HttpResponseNoPermission()

    try:
        route = Route.objects.get(repository=repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist()

    url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + place_id + '&key=' + api_key
    google_maps_response = requests.get(url)
    if google_maps_response.status_code not in range(200, 299):
        return HttpResponseBadRequest()

    existing_max = PlaceInRoute.objects.filter(route=route).count()
    order = existing_max+1
    try:
        place_name = google_maps_response.json()['result']['name']
        place_address = google_maps_response.json()['result']['formatted_address']
        latitude = google_maps_response.json()['result']['geometry']['location']['lat']
        longitude = google_maps_response.json()['result']['geometry']['location']['lng']
    except (KeyError, JSONDecodeError):
        return HttpResponseNotExist()

    new_place = PlaceInRoute(route=route, order=order, place_id=place_id, place_name=place_name, place_address=place_address, latitude=latitude, longitude=longitude)
    new_place.save()

    places_to_return = PlaceInRoute.objects.filter(route=route).order_by("order")
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
                "post_time": photo.post_time.strftime(DATE_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
            photos.append(response_photo)

        response_place = {
            "place_id": place.place_id,
            "place_name": place.place_name,
            "place_address": place.place_address,
            "latitude": float(place.latitude),
            "longitude": float(place.longitude),
            "photos": photos
        }
        if place.text is not None:
            response_place["text"] = place.text
        if place.time is not None:
            response_place["time"] = place.time.strftime(DATE_FORMAT)
        try:
            response_place["thumbnail"] = Photo.objects.get(thumbnail_of=place).image_file.url
        except Photo.DoesNotExist:
            pass
        places.append(response_place)

    not_assigned_photos = []
    repository_photos = Photo.objects.filter(repository=repository)
    for photo in repository_photos:
        if photo.place is None:
            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""
            response_photo = {
                "photo_id": photo.photo_id,
                "repo_id": photo.repository.repo_id,
                "image": photo.image_file.url,
                "post_time": photo.post_time.strftime(DATE_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
            not_assigned_photos.append(response_photo)

    response_dict = {
        "not_assigned": not_assigned_photos,
        "places": places,
    }

    return HttpResponseSuccessUpdate(response_dict)
