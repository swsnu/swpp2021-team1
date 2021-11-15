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
api_key = settings.GOOGLE_MAPS_API_KEY
@require_http_methods(["GET"])
@ensure_csrf_cookie
def routeSearch(request):
    # if request.method == "GET":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    query_string = str(request.GET.get("query", None))
    if query_string is None:
        return HttpResponseInvalidInput()

    url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + query_string + '&key=' + api_key
    google_maps_response = requests.get(url)
    if google_maps_response.status_code not in range(200, 299):
        return HttpResponseInvalidInput()
    place_id = google_maps_response.json()['results'][0]['place_id']
    formatted_address = google_maps_response.json()['results'][0]['formatted_address']
    response_dict = {
        "place_id": place_id,
        "formatted_address": formatted_address,
    }
    return HttpResponseSuccessGet(response_dict)

@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
def routeID(request, repo_id):
    if request.method == "GET":
        return HttpResponseSuccessGet()
    # if request.method == "POST":
    return HttpResponseSuccessUpdate()

@require_http_methods(["GET"])
@ensure_csrf_cookie
def placeSearch(request):
    # if request.method == "GET":
    return HttpResponseSuccessGet()

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
