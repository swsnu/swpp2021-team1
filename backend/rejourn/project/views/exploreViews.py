import json
from json.decoder import JSONDecodeError

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import User, Repository, Route, PlaceInRoute, Post
from project.httpResponse import *

@require_http_methods(["GET"])
def exploreUsers(request):
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    query_user = request.GET.get("query", None)
    if query_user is None:
        return HttpResponseBadRequest()
    
    #for user in User.objects.all():
    #    if user.
    
    return HttpResponseSuccessGet()

@require_http_methods(["GET"])
def exploreRepositories(request):
    return HttpResponseSuccessGet()

@require_http_methods(["GET"])
def feeds(request, username):
    return HttpResponseSuccessGet()