import json
from json.decoder import JSONDecodeError

from django.utils import timezone
from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import Repository, Photo, PhotoTag, Label
from project.httpResponse import (
    HttpResponseNotLoggedIn,
    HttpResponseNotExist,
    HttpResponseSuccessUpdate,
    HttpResponseNoPermission,
    HttpResponseSuccessGet,
    HttpResponseSuccessDelete,
    HttpResponseInvalidInput,
    HttpResponseAlreadyProcessed,
)


UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"


def get_label_list(repository, user):
    label_list = []
    for label in Label.objects.filter(repository=repository, user=user):
        label_list.append({
            "label_id" : label.label_id,
            "label_name" : label.label_name,
        })
    return label_list

def get_photo_list(query_label):
    repository = query_label.repository
    user = query_label.user
    photo_list = []
    for photo in query_label.photos.all():
        if PhotoTag.objects.filter(user=user, photo=photo).count() != 0:
            photo_tag = PhotoTag.objects.get(user=user, photo=photo).text
        else:
            photo_tag = ""

        label_list = []
        for label in photo.labels.all():
            label_list.append({
                'label_id' : label.label_id,
                'label_name' : label.label_name,
            })
        photo_list.insert(0, {
            "repo_id" : repository.repo_id,
            "photo_id" : photo.photo_id,
            "image" : photo.image_file.url,
            "post_time" : timezone.make_naive(photo.post_time).strftime(UPLOADED_TIME_FORMAT),
            "uploader" : photo.uploader.username,
            "tag" : photo_tag,
            "labels" : label_list,
        })
    return photo_list

# /api/repositories/<int:repo_id>/labels/
@require_http_methods(['GET', 'POST'])
@ensure_csrf_cookie
def labels(request, repo_id):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()

        label_list = get_label_list(repository, request.user)
        return HttpResponseSuccessGet(label_list)

    # request.method == 'POST'
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        req_data = json.loads(request.body.decode())
        label_name = req_data['label_name']
    except(KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if request.user not in repository.collaborators.all():
        return HttpResponseNoPermission()

    if Label.objects.filter(
            repository=repository,
            user=request.user,
            label_name=label_name
    ).count() != 0:
        return HttpResponseAlreadyProcessed()

    new_label = Label(
        label_name=label_name,
        repository=repository,
        user=request.user
    )
    new_label.save()

    label_list = get_label_list(repository, request.user)
    return HttpResponseSuccessUpdate(label_list)


# /api/repositories/<int:repo_id>/labels/<int:label_id>/
@require_http_methods(['PUT', 'DELETE'])
@ensure_csrf_cookie
def labelID(request, repo_id, label_id):
    if request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            req_data = json.loads(request.body.decode())
            new_label_name = req_data['label_name']
        except(KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
            label = Label.objects.get(label_id=label_id)
        except(Repository.DoesNotExist, Label.DoesNotExist):
            return HttpResponseNotExist()

        if label.repository != repository:
            return HttpResponseInvalidInput()

        if (request.user not in repository.collaborators.all()
                or request.user != label.user):
            return HttpResponseNoPermission()

        label.label_name = new_label_name
        label.save()

        label_list = get_label_list(repository, request.user)
        return HttpResponseSuccessUpdate(label_list)

    # request.method == 'DELETE'
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
        label = Label.objects.get(label_id=label_id)
    except(Repository.DoesNotExist, Label.DoesNotExist):
        return HttpResponseNotExist()

    if label.repository != repository:
        return HttpResponseInvalidInput()

    if (request.user not in repository.collaborators.all()
            or request.user != label.user):
        return HttpResponseNoPermission()

    label.delete()

    label_list = get_label_list(repository, request.user)
    return HttpResponseSuccessDelete(label_list)


# /api/repositories/<int:repo_id>/labels/<int:label_id>/photos/
@require_http_methods(['GET', 'PUT'])
@ensure_csrf_cookie
def labelPhotos(request, repo_id, label_id):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
            label = Label.objects.get(label_id=label_id)
        except(Repository.DoesNotExist, Label.DoesNotExist):
            return HttpResponseNotExist()

        if label.repository != repository:
            return HttpResponseInvalidInput()

        if (request.user not in repository.collaborators.all()
                or request.user != label.user):
            return HttpResponseNoPermission()

        photo_list = get_photo_list(label)
        return HttpResponseSuccessGet(photo_list)

    # request.method == 'PUT'
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        request_photo_list = json.loads(request.body.decode())
        photo_id_list = []
        for photo in request_photo_list:
            photo_id_list.append(photo['photo_id'])
    except(KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
        label = Label.objects.get(label_id=label_id)
    except(Repository.DoesNotExist, Label.DoesNotExist):
        return HttpResponseNotExist()

    if label.repository != repository:
        return HttpResponseInvalidInput()

    if (request.user not in repository.collaborators.all()
            or request.user != label.user):
        return HttpResponseNoPermission()

    try:
        photo_list = []
        for photo_id in photo_id_list:
            photo = Photo.objects.get(photo_id=photo_id)
            photo_list.append(photo)
    except Photo.DoesNotExist:
        return HttpResponseInvalidInput()

    for photo in photo_list:
        if photo.repository != repository:
            return HttpResponseNoPermission()

    label.photos.set(photo_list)
    label.save()

    photo_list = get_photo_list(label)
    return HttpResponseSuccessUpdate(photo_list)
