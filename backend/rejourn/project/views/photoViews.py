import json
from json.decoder import JSONDecodeError
from datetime import datetime

from django.http.response import HttpResponseBadRequest
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import Repository, Photo, PhotoTag
from project.httpResponse import *
from project.utils import have_common_user
from project.enum import Scope


DATE_FORMAT = "%Y-%m-%d"
UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"


# /api/repositories/<int:repo_id>/photos/
@require_http_methods(['POST', 'GET', 'PUT', 'DELETE'])
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

        criteria = request.GET.get("criteria", None)
        raw_post_time = request.GET.get("post_time", None)
        if raw_post_time is not None:
            post_time = datetime.strptime(raw_post_time, DATE_FORMAT)
            post_time = timezone.make_aware(post_time)
        label = request.GET.get("label", None)
        place = request.GET.get("place", None)
        if criteria is not None and (raw_post_time and label and place) is not None:
            return HttpResponseInvalidInput()

        photo_list = []
        for photo in Photo.objects.filter(repository=repository):

            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""

            photo_list.insert(
                0,
                {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                },
            )

        if len(photo_list) == 0:
            response_list = []
        elif criteria is not None:
            response_list = []
            one_day = []
            current_day = photo_list[0].post_time.strftime(DATE_FORMAT)
            photo_count = 0
            while photo_count < len(photo_list):
                next_day = photo_list[photo_count].post_time.strftime(DATE_FORMAT)
                if current_day != next_day:
                    response_list.append(one_day)
                    one_day = [photo_list[photo_count]]
                    current_day = next_day
                else:
                    one_day.insert(0, photo_list[photo_count])
                photo_count += 1
            response_list.append(one_day)
        elif raw_post_time is not None:
            response_list = filter(
                lambda photo: photo.post_time.year == post_time.year
                and photo.post_time.month == post_time.month
                and photo.post_time.day == post_time.day,
                photo_list,
            )
        else:
            response_list = photo_list

        return HttpResponseSuccessGet(response_list)

    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()

        try:
            image_list = request.FILES.getlist("image")
        except KeyError:
            return HttpResponseBadRequest()

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

            photo_list.append(
                {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
                }
            )

        return HttpResponseSuccessUpdate(photo_list)

    if request.method == "PUT":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()

        edited_photo_list = []
        try:
            req_data = json.loads(request.body.decode())
            for photo_info in req_data:

                try:
                    photo = Photo.objects.get(photo_id=photo_info["photo_id"])
                except Photo.DoesNotExist:
                    return HttpResponseInvalidInput()

                edited_photo_list.append((photo, photo_info["tag"]))
        except (JSONDecodeError, KeyError):
            return HttpResponseBadRequest()

        for edited_photo in edited_photo_list:

            tag_count = PhotoTag.objects.filter(
                photo=edited_photo[0], user=request.user
            ).count()
            if edited_photo[1] == "" and tag_count == 1:
                photo_tag = PhotoTag.objects.get(
                    photo=edited_photo[0], user=request.user
                )
                photo_tag.delete()
            elif edited_photo[1] != "" and tag_count == 1:
                photo_tag = PhotoTag.objects.get(
                    photo=edited_photo[0], user=request.user
                )
                photo_tag.text = edited_photo[1]
                photo_tag.save()
            elif edited_photo[1] != "" and tag_count == 0:
                new_photo_tag = PhotoTag(
                    photo=edited_photo[0], user=request.user, text=edited_photo[1]
                )
                new_photo_tag.save()

        photo_list = []
        for photo in Photo.objects.filter(repository=repository):

            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except PhotoTag.DoesNotExist:
                photo_tag_text = ""

            photo_list.append(
                {
                    "photo_id": photo.photo_id,
                    "repo_id": photo.repository.repo_id,
                    "image": photo.image_file.url,
                    "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                    "tag": photo_tag_text,
                    "uploader": photo.uploader.username,
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

        photo_list.append(
            {
                "photo_id": photo.photo_id,
                "repo_id": photo.repository.repo_id,
                "image": photo.image_file.url,
                "post_time": photo.post_time.strftime(UPLOADED_TIME_FORMAT),
                "tag": photo_tag_text,
                "uploader": photo.uploader.username,
            }
        )

    return HttpResponseSuccessDelete(photo_list)
