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

@require_http_methods(["POST", "GET"])
@ensure_csrf_cookie
def routeSearch(request, repo_id):
    if request.method == "GET":
        return HttpResponseSuccessGet()

@require_http_methods(["PUT", "DELETE", "GET"])
@ensure_csrf_cookie
def route(reques)