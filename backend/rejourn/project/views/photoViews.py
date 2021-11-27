import json
from json.decoder import JSONDecodeError
from datetime import datetime

from django.http.response import HttpResponseBadRequest
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import Repository, Photo, Label, PhotoTag
from project.httpResponse import *
from project.utils import have_common_user
from project.enum import Scope


DATE_FORMAT = "%Y-%m-%d"
UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"


# /api/repositories/<int:repo_id>/photos/
@require_http_methods(['POST', 'GET', 'DELETE'])
@ensure_csrf_cookie
def photos(request, repo_id):
    if request.method == "GET":
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if not (
                (repository.visibility == Scope.PUBLIC)
                or (request.user in repository.collaborators.all())
                or (
                    repository.visibility == Scope.FRIENDS_ONLY
                    and have_common_user(
                        request.user.friends.all(), repository.collaborators.all()
                    )
                )
            ):
            return HttpResponseNoPermission()

        raw_start_date = request.GET.get("start_date", None)
        raw_end_date = request.GET.get("end_date", None)
        if raw_start_date is not None:
            try:
                start_date = datetime.strptime(raw_start_date, DATE_FORMAT)
                start_date = timezone.make_aware(start_date)
            except ValueError:
                return HttpResponseInvalidInput()
        if raw_end_date is not None:
            try:
                end_date = datetime.strptime(raw_end_date, DATE_FORMAT)
                end_date = timezone.make_aware(end_date)
            except ValueError:
                return HttpResponseInvalidInput()
        label_query = request.GET.get("label", None)
        place_query = request.GET.get("place", None)

        photo_set = Photo.objects.filter(repository=repository)

        if label_query is not None:
            label_set = Label.objects.filter(label_name__icontains=label_query)
            photo_set = photo_set.filter(labels__in=label_set)

        if raw_start_date is not None:
            photo_set = photo_set.filter(post_time__gte=start_date)

        if raw_end_date is not None:
            photo_set = photo_set.filter(post_time__lte=end_date)

        if place_query is not None:
            temp1_photo_set = photo_set.filter(place_name__icontains=place_query)
            temp2_photo_set = photo_set.filter(place_address__icontains=place_query)
            photo_set = temp1_photo_set.union(temp2_photo_set)

        photo_set = photo_set.order_by('-photo_id')

        photo_list = []
        for photo in photo_set:
            if PhotoTag.objects.filter(photo=photo, user=request.user).exists():
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            else:
                photo_tag_text = ""

            label_list = []
            for label in photo.labels.all():
                label_list.append({
                    'label_id' : label.label_id,
                    'label_name' : label.label_name,
                })

            photo_list.append(
                {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                    "labels" : label_list,
                },
            )
        return HttpResponseSuccessGet(photo_list)

    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()

        image_list = request.FILES.getlist("image")

        for image in image_list:
            new_photo = Photo(
                repository=repository, image_file=image, uploader=request.user
            )
            new_photo.save()

        photo_list = []
        for photo in Photo.objects.filter(repository=repository):

            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""

            label_list = []
            for label in photo.labels.all():
                label_list.append({
                    'label_id' : label.label_id,
                    'label_name' : label.label_name,
                })

            photo_list.append(
                {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                    "labels" : label_list,
                }
            )

        return HttpResponseSuccessUpdate(photo_list)

    # request.method == 'DELETE':
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if request.user not in repository.collaborators.all():
        return HttpResponseNoPermission()

    deleted_photo_id_list = []
    try:
        req_data = json.loads(request.body.decode())
        for photo in req_data:
            deleted_photo_id_list.append(photo["photo_id"])
    except (JSONDecodeError, KeyError):
        return HttpResponseBadRequest()

    deleted_photo_list = []
    for photo_id in deleted_photo_id_list:
        try:
            deleted_photo = Photo.objects.get(photo_id=photo_id)
            deleted_photo_list.append(deleted_photo)
        except Photo.DoesNotExist:
            return HttpResponseInvalidInput()

    for photo in deleted_photo_list:
        photo.delete()

    photo_list = []
    for photo in Photo.objects.filter(repository=repository):

        try:
            photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
            photo_tag_text = photo_tag.text
        except PhotoTag.DoesNotExist:
            photo_tag_text = ""

        label_list = []
        for label in photo.labels.all():
            label_list.append({
                'label_id' : label.label_id,
                'label_name' : label.label_name,
            })

        photo_list.append(
            {
                "photo_id": photo.photo_id,
                "repo_id": photo.repository.repo_id,
                "image": photo.image_file.url,
                "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
                "labels" : label_list,
            }
        )

    return HttpResponseSuccessDelete(photo_list)


# /api/repositories/<int:repo_id>/photos/<int:photo_id>/
@require_http_methods(['PUT'])
@ensure_csrf_cookie
def photoID(request, repo_id, photo_id):
    # request.method == put
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
        photo = Photo.objects.get(photo_id=photo_id)
    except (Repository.DoesNotExist, Photo.DoesNotExist):
        return HttpResponseNotExist()

    if request.user not in repository.collaborators.all():
        return HttpResponseNoPermission()

    if photo.repository != repository:
        return HttpResponseInvalidInput()

    try:
        req_data = json.loads(request.body.decode())
        new_tag = req_data['tag']
    except (JSONDecodeError, KeyError):
        return HttpResponseBadRequest()

    tag_count = PhotoTag.objects.filter(
        photo=photo, user=request.user
    ).count()
    if new_tag == "" and tag_count == 1:
        photo_tag = PhotoTag.objects.get(
            photo=photo, user=request.user
        )
        photo_tag.delete()
    elif new_tag != "" and tag_count == 1:
        photo_tag = PhotoTag.objects.get(
            photo=photo, user=request.user
        )
        photo_tag.text = new_tag
        photo_tag.save()
    elif new_tag != "" and tag_count == 0:
        new_photo_tag = PhotoTag(
            photo=photo, user=request.user, text=new_tag
        )
        new_photo_tag.save()

    return_dict = {
        "photo_id": photo.photo_id,
        "repo_id": photo.repository.repo_id,
        "image": photo.image_file.url,
        "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
        "tag": new_tag,
        "uploader": photo.uploader.username,
    }

    return HttpResponseSuccessUpdate(return_dict)
