import json
from json.decoder import JSONDecodeError

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import User, Repository, Photo
from project.httpResponse import *


# /api/repositories/<int:repo_id>/labels/
@require_http_methods(['GET', 'POST'])
@ensure_csrf_cookie
def labels(request, repo_id):
    if request.method == 'GET':
    
    # request.method == 'POST'


@require_http_methods(['PUT', 'DELETE'])
@ensure_csrf_cookie
def labelID(request, repo_id, label_id):
    if request.method == 'PUT':

    # request.method == 'DELETE'

@require_http_methods(['GET', 'PUT'])
@ensure_csrf_cookie
def labelPhotos(request, repo_id, label_id):
    if request.method == 'GET':

    # request.method == 'PUT'
