import json
from json.decoder import JSONDecodeError
import random
from urllib.parse import urlencode

from django.utils import timezone
from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.conf import settings

import requests
from project.models.models import Repository, Route, PlaceInRoute, Photo, PhotoTag
from project.httpResponse import *
from project.utils import repo_visible

API_KEY = settings.GOOGLE_MAPS_API_KEY


DATE_FORMAT = "%Y-%m-%d"
UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

def get_place_list(route, user):
    place_list = []
    places_to_return = PlaceInRoute.objects.filter(route=route).order_by("order")
    for place in places_to_return:
        photos_to_return = Photo.objects.filter(place=place)
        photos = []
        for photo in photos_to_return:
            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""
            response_photo = {
                "photo_id": photo.photo_id,
                "repo_id": photo.repository.repo_id,
                "image": photo.image_file.url,
                "post_time": timezone.make_naive(photo.post_time).strftime(DATE_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
            photos.append(response_photo)

        response_place = {
            "place_in_route_id": place.place_in_route_id,
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
            response_place["time"] = timezone.make_naive(place.time).strftime(DATE_FORMAT)
        try:
            response_place["thumbnail"] = Photo.objects.get(thumbnail_of=place).image_file.url
        except Photo.DoesNotExist:
            pass
        place_list.append(response_place)
    return place_list

def get_not_assigned_photo_list(repository, user):
    not_assigned_photo_list = []
    repository_photos = Photo.objects.filter(repository=repository)
    for photo in repository_photos:
        if photo.place is None:
            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""
            response_photo = {
                "photo_id": photo.photo_id,
                "repo_id": photo.repository.repo_id,
                "image": photo.image_file.url,
                "post_time": timezone.make_naive(photo.post_time).strftime(DATE_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
            not_assigned_photo_list.append(response_photo)
    return not_assigned_photo_list

# /api/region-search/
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
    params = {"address": query_string_formatted, "key": API_KEY}
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


# /api/repositories/<int:repo_id>/route/
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

        if not repo_visible(request.user, repository):
            return HttpResponseNoPermission()

        route = Route.objects.get(repository=repository)
        places_response = get_place_list(route, request.user)
        not_assigned_photos = get_not_assigned_photo_list(repository, request.user)
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
        params = {"place_id": place_id, "key": API_KEY}
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
        new_route = Route(region_address=region_address, place_id=place_id,
                          latitude=latitude, longitude=longitude, east=east, west=west,
                          south=south, north=north, repository=repository)
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

    new_route = Route(region_address=region_address, place_id=place_id,
                      latitude=latitude, longitude=longitude, east=east, west=west,
                      south=south, north=north, repository=repository)
    new_route.save()

    fork_places = PlaceInRoute.objects.filter(route=fork_route)
    for place in fork_places:
        route = new_route
        order = place.order
        place_id = place.place_id
        place_name = place.place_name
        place_address = place.place_address
        latitude = place.latitude
        longitude = place.longitude
        new_place = PlaceInRoute(route=route, order=order, place_id=place_id, place_name=place_name,
                                 place_address=place_address, latitude=latitude, longitude=longitude)
        new_place.save()
    return HttpResponseSuccessUpdate()


# /api/repositories/<int:repo_id>/route/places-search/
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
    url_for_geocoding = ("https://maps.googleapis.com/maps/api/geocode/json?address="
                         +query_string_formatted+"&key="+API_KEY)
    geocoding_response = requests.get(url_for_geocoding)

    if geocoding_response.status_code in range(200, 299):
        place_id = geocoding_response.json()['results'][0]['place_id']
        formatted_address = geocoding_response.json()['results'][0]['formatted_address']
        response_dict = {
            "place_id": place_id,
            "formatted_address": formatted_address,
        }
        if ((-0.5 < (geocoding_response.json()['results'][0]['geometry']['location']['lat']
                     - float(route.latitude)) < 0.5)
                and (-0.5 < (geocoding_response.json()['results'][0]['geometry']['location']['lng']
                             - float(route.longitude))
                     < 0.5)):
            place_id_0 = place_id
            response.append(response_dict)

    url = ('https://maps.googleapis.com/maps/api/place/textsearch/json?location='
           +str(route.latitude)+"%2C"+str(route.longitude)+"&query="+query_string_formatted+"&key="+API_KEY)
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


# /api/repositories/<int:repo_id>/route/places/
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

    still_existing_place_in_route_id = []
    i = 1
    for place in req_data:
        try:
            place_id = place["place_id"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()
        still_existing_place_in_route_id.append(place_id)
        try:
            place_in_route_id = place["place_in_route_id"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()
        still_existing_place_in_route_id.append(place_in_route_id)
        try:
            place_to_edit = PlaceInRoute.objects.get(place_in_route_id=place_in_route_id)
        except PlaceInRoute.DoesNotExist:
            return HttpResponseNotExist()

        place_to_edit.order = i

        try:
            place_to_edit.text = place["text"]
        except (KeyError, JSONDecodeError):
            place_to_edit.text = None

        try:
            place_to_edit.time = place["time"]
        except (KeyError, JSONDecodeError):
            place_to_edit.time = None


        place_to_edit.save()

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
                    photo.thumbnail_of = place_to_edit
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
            photo_in_place.place = place_to_edit
            photo_in_place.save()
        i += 1

    for remove_place in PlaceInRoute.objects.filter(route=route):
        if not remove_place.place_in_route_id in still_existing_place_in_route_id:
            remove_place.delete()

    places_response = get_place_list(route, request.user)
    not_assigned_photos = get_not_assigned_photo_list(repository, request.user)
    response_dict = {
        "not_assigned": not_assigned_photos,
        "places": places_response,
    }

    return HttpResponseSuccessUpdate(response_dict)

# /api/repositories/<int:repo_id>/route/places/<str:place_id>/
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

    if not repo_visible(request.user, repository):
        return HttpResponseNoPermission()

    try:
        route = Route.objects.get(repository=repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist()

    url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id='+place_id+'&key='+API_KEY
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

    new_place = PlaceInRoute(route=route, order=order, place_id=place_id, place_name=place_name,
                             place_address=place_address, latitude=latitude, longitude=longitude)
    new_place.save()

    places_response = get_place_list(route, request.user)
    not_assigned_photos = get_not_assigned_photo_list(repository, request.user)
    response_dict = {
        "not_assigned": not_assigned_photos,
        "places": places_response,
    }

    return HttpResponseSuccessUpdate(response_dict)


# /api/repositories/<int:repo_id>/travel/
@require_http_methods(['GET'])
@ensure_csrf_cookie
def travel(request, repo_id):
    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if not repo_visible(request.user, repository):
        return HttpResponseNoPermission()

    try:
        route = Route.objects.get(repository=repository)
    except Route.DoesNotExist:
        return HttpResponseNotExist()

    if Photo.objects.filter(repository=repository).count() <= 5:
        return HttpResponseInvalidInput()

    place_in_route_set = PlaceInRoute.objects.filter(route=route)
    place_num = len(place_in_route_set)

    if place_num == 0:
        return HttpResponseInvalidInput()

    first_place = place_in_route_set.get(order=1)
    east_limit = first_place.longitude
    west_limit = first_place.longitude
    south_limit = first_place.latitude
    north_limit = first_place.latitude
    width_span = 0
    width_over_zero = False
    height_span = 0

    place_with_photo_num = 0
    place_list = []
    photo_list = []
    order_count = 1
    while order_count <= place_num:
        current_place = place_in_route_set.get(order=order_count)
        place_list.append(current_place)
        photo_set = Photo.objects.filter(place=current_place)

        temp_photo_list = []
        if photo_set.count() != 0:
            place_with_photo_num += 1
            temp_photo_list = list(photo_set)
            random.shuffle(temp_photo_list)
        photo_list.append(temp_photo_list)

        if (width_over_zero
                and current_place.longitude > east_limit
                and current_place.longitude < west_limit):
            if current_place.longitude - east_limit > west_limit - current_place.longitude:
                width_span += west_limit - current_place.longitude
                west_limit = current_place.longitude
            else:
                width_span += current_place.longitude - east_limit
                east_limit = current_place.longitude
        elif (not width_over_zero) and current_place.longitude > east_limit:
            if current_place.longitude - east_limit < 360 - (current_place.longitude - west_limit):
                width_span += current_place.longitude - east_limit
                east_limit = current_place.longitude
            else:
                width_over_zero = True
                width_span += 360 - (current_place.longitude - west_limit)
                west_limit = current_place.longitude
        elif (not width_over_zero) and current_place.longitude < west_limit:
            if west_limit - current_place.longitude < 360 - (east_limit - current_place.longitude):
                width_span += west_limit - current_place.longitude
                west_limit = current_place.longitude
            else:
                width_over_zero = True
                width_span += 360 - (east_limit - current_place.longitude)
                east_limit = current_place.longitude

        if current_place.latitude > north_limit:
            north_limit = current_place.latitude
        if current_place.latitude < south_limit:
            south_limit = current_place.latitude

        order_count += 1

    route_list = []
    for order_count in range(1, place_num+1):
        current_place = place_list[order_count-1]
        current_photo_list = photo_list[order_count-1]

        if len(current_photo_list) == 0:
            pass
        elif place_with_photo_num > 20 or len(current_photo_list) == 1:
            current_photo_list = current_photo_list[0:1]
        elif place_with_photo_num > 10 or len(current_photo_list) == 2:
            current_photo_list = current_photo_list[0:2]
        else:
            current_photo_list = current_photo_list[0:3]

        photo_dict_list = []
        for photo in current_photo_list:
            photo_dict = {
                'photo_id' : photo.photo_id,
                'image' : photo.image_file.url,
                'post_time' : timezone.make_naive(photo.post_time).strftime(UPLOADED_TIME_FORMAT),
                'uploader' : photo.uploader.username
            }
            if PhotoTag.objects.filter(user=request.user, photo=photo).exists():
                photo_dict['tag'] = PhotoTag.objects.get(user=request.user, photo=photo).text
            else:
                photo_dict['tag'] = ""
            photo_dict_list.append(photo_dict)

        place_dict = {
            "place_id" : current_place.place_id,
            "place_name" : current_place.place_name,
            "place_address" : current_place.place_address,
            "latitude" : float(current_place.latitude),
            "longitude" : float(current_place.longitude),
            'photos' : photo_dict_list,
        }
        route_list.append(place_dict)

    east_limit += width_span / 10
    if east_limit > 180:
        east_limit -= 360
    west_limit -= width_span / 10
    if west_limit < -180:
        west_limit += 360

    height_span = north_limit - south_limit
    north_limit += height_span / 10
    if north_limit > 90:
        north_limit = 90
    south_limit -= height_span / 10
    if south_limit < -90:
        south_limit = -90

    region_dict = {
        'region_address' : route.region_address,
        'place_id' : route.place_id,
        'latitude' : float(route.latitude),
        'longitude' : float(route.longitude),
        'east' : east_limit,
        'west' : west_limit,
        'south' : south_limit,
        'north' : north_limit,
    }

    response_dict = {
        'region' : region_dict,
        'route' : route_list,
    }

    return HttpResponseSuccessGet(response_dict)
