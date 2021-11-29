import json
from json.decoder import JSONDecodeError
from datetime import datetime

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from project.models.models import User, Repository
from project.httpResponse import *
from project.utils import have_common_user
from project.enum import Scope


DATE_FORMAT = "%Y-%m-%d"


# /api/repositories/
@require_http_methods(["POST", "GET"])
@ensure_csrf_cookie
def repositories(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            req_data = json.loads(request.body.decode())
            repo_name = req_data["repo_name"]
            owner_name = req_data["owner"]

            if owner_name != request.user.username:
                return HttpResponseNoPermission()

            raw_travel_start_date = req_data["travel_start_date"]
            raw_travel_end_date = req_data["travel_end_date"]
            visibility = req_data["visibility"]
            collaborators_list = req_data["collaborators"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        if visibility < 0 or visibility > 2:
            return HttpResponseInvalidInput()

        try:
            owner = User.objects.get(username=owner_name)
            collaborators = []
            for collaborator_dict in collaborators_list:
                user = User.objects.get(username=collaborator_dict["username"])
                collaborators.append(user)
            if owner not in collaborators:
                collaborators.append(owner)
        except User.DoesNotExist:
            return HttpResponseInvalidInput()

        try:
            travel_start_date = datetime.strptime(raw_travel_start_date, DATE_FORMAT)
            travel_end_date = datetime.strptime(raw_travel_end_date, DATE_FORMAT)
        except ValueError:
            return HttpResponseInvalidInput()

        new_repo = Repository(
            repo_name=repo_name,
            owner=owner,
            travel_start_date=travel_start_date,
            travel_end_date=travel_end_date,
            visibility=visibility,
        )
        new_repo.save()
        for user in collaborators:
            new_repo.collaborators.add(user)
        new_repo.save()

        collaborators_censored = []
        for user in new_repo.collaborators.all():
            if not bool(user.profile_picture):
                collaborators_censored.append(
                    {
                        "username": user.username,
                        "bio": user.bio,
                    }
                )
            else:
                collaborators_censored.append(
                    {
                        "username": user.username,
                        "profile_picture": user.profile_picture.url,
                        "bio": user.bio,
                    }
                )

        response_dict = {
            "repo_id": new_repo.repo_id,
            "repo_name": new_repo.repo_name,
            "owner": new_repo.owner.username,
            "travel_start_date": new_repo.travel_start_date.strftime(DATE_FORMAT),
            "travel_end_date": new_repo.travel_end_date.strftime(DATE_FORMAT),
            "visibility": new_repo.visibility,
            "collaborators": collaborators_censored,
        }
        return HttpResponseSuccessUpdate(response_dict)

    # request.method == "GET":
    collaborator_name = request.GET.get("username", None)
    owner_name = request.GET.get("owner", None)
    current_user = request.user

    if collaborator_name is None and owner_name is None:
        return HttpResponseBadRequest()

    if collaborator_name is not None and owner_name is None:
        try:
            collaborator = User.objects.get(username=collaborator_name)
        except User.DoesNotExist:
            return HttpResponseInvalidInput()

        repository_list = []

        for repository in collaborator.repositories.all():
            if (
                    (current_user in repository.collaborators.all())
                    or (repository.visibility == Scope.PUBLIC)
                    or (
                        repository.visibility == Scope.FRIENDS_ONLY
                        and have_common_user(
                            current_user.friends.all(), repository.collaborators.all()
                        )
                    )
                ):
                collaborator_list = []
                for user in repository.collaborators.all():
                    if not bool(user.profile_picture):
                        collaborator_list.append(
                            {
                                "username": user.username,
                                "bio": user.bio,
                            }
                        )
                    else:
                        collaborator_list.append(
                            {
                                "username": user.username,
                                "profile_picture": user.profile_picture.url,
                                "bio": user.bio,
                            }
                        )
                repository_list.insert(
                    0,
                    {
                        "repo_id": repository.repo_id,
                        "repo_name": repository.repo_name,
                        "owner": repository.owner.username,
                        "travel_start_date": repository.travel_start_date.strftime(
                            DATE_FORMAT
                        ),
                        "travel_end_date": repository.travel_end_date.strftime(
                            DATE_FORMAT
                        ),
                        "visibility": repository.visibility,
                        "collaborators": collaborator_list,
                    },
                )

        return HttpResponseSuccessGet(repository_list)

    if collaborator_name is None and owner_name is not None:
        try:
            owner = User.objects.get(username=owner_name)
        except User.DoesNotExist:
            return HttpResponseInvalidInput()

        repository_list = []

        for repository in owner.repositories.all():
            if repository.owner != owner:
                continue
            if (
                    (current_user in repository.collaborators.all())
                    or (repository.visibility == Scope.PUBLIC)
                    or (
                        repository.visibility == Scope.FRIENDS_ONLY
                        and have_common_user(
                            current_user.friends.all(), repository.collaborators.all()
                        )
                    )
                ):
                collaborator_list = []
                for user in repository.collaborators.all():
                    if not bool(user.profile_picture):
                        collaborator_list.append(
                            {
                                "username": user.username,
                                "bio": user.bio,
                            }
                        )
                    else:
                        collaborator_list.append(
                            {
                                "username": user.username,
                                "profile_picture": user.profile_picture.url,
                                "bio": user.bio,
                            }
                        )
                repository_list.insert(
                    0,
                    {
                        "repo_id": repository.repo_id,
                        "repo_name": repository.repo_name,
                        "owner": repository.owner.username,
                        "travel_start_date": repository.travel_start_date.strftime(
                            DATE_FORMAT
                        ),
                        "travel_end_date": repository.travel_end_date.strftime(
                            DATE_FORMAT
                        ),
                        "visibility": repository.visibility,
                        "collaborators": collaborator_list,
                    },
                )

        return HttpResponseSuccessGet(repository_list)

    # collaborator_name is not None and owner_name is not None
    return HttpResponseBadRequest()


# /api/repositories/<int:repo_id>/
@require_http_methods(["GET", "DELETE", "PUT"])
@ensure_csrf_cookie
def repositoryID(request, repo_id):
    if request.method == "GET":
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if (not request.user.is_authenticated) and (
                repository.visibility != Scope.PUBLIC
        ):
            return HttpResponseNoPermission()

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

        collaborator_list = []
        for user in repository.collaborators.all():
            if not bool(user.profile_picture):
                collaborator_list.append(
                    {
                        "username": user.username,
                        "bio": user.bio,
                    }
                )
            else:
                collaborator_list.append(
                    {
                        "username": user.username,
                        "profile_picture": user.profile_picture.url,
                        "bio": user.bio,
                    }
                )

        response_dict = {
            "repo_id": repository.repo_id,
            "repo_name": repository.repo_name,
            "owner": repository.owner.username,
            "travel_start_date": repository.travel_start_date.strftime(DATE_FORMAT),
            "travel_end_date": repository.travel_end_date.strftime(DATE_FORMAT),
            "visibility": repository.visibility,
            "collaborators": collaborator_list,
        }
        return HttpResponseSuccessGet(response_dict)

    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if repository.owner != request.user:
            return HttpResponseNoPermission()

        repository.delete()
        return HttpResponseSuccessDelete()

    # request.method == "PUT":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        req_data = json.loads(request.body.decode())
        repo_name = req_data["repo_name"]
        owner_name = req_data["owner"]

        try:
            new_owner = User.objects.get(username=owner_name)
        except User.DoesNotExist:
            return HttpResponseInvalidInput()

        raw_travel_start_date = req_data["travel_start_date"]
        raw_travel_end_date = req_data["travel_end_date"]
        visibility = req_data["visibility"]
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    if visibility < 0 or visibility > 2:
        return HttpResponseInvalidInput()

    try:
        travel_start_date = datetime.strptime(raw_travel_start_date, DATE_FORMAT)
        travel_end_date = datetime.strptime(raw_travel_end_date, DATE_FORMAT)
    except ValueError:
        return HttpResponseInvalidInput()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if repository.owner != request.user:
        return HttpResponseNoPermission()

    repository.repo_name = repo_name
    repository.owner = new_owner
    if new_owner not in repository.collaborators.all():
        repository.collaborators.add(new_owner)
    repository.travel_start_date = travel_start_date
    repository.travel_end_date = travel_end_date
    repository.visibility = visibility
    repository.save()

    collaborators = []
    for user in repository.collaborators.all():
        if not bool(user.profile_picture):
            collaborators.append(
                {
                    "username": user.username,
                    "bio": user.bio,
                }
            )
        else:
            collaborators.append(
                {
                    "username": user.username,
                    "profile_picture": user.profile_picture.url,
                    "bio": user.bio,
                }
            )
    response_dict = {
        "repo_id": repository.repo_id,
        "repo_name": repository.repo_name,
        "owner": repository.owner.username,
        "travel_start_date": repository.travel_start_date.strftime(DATE_FORMAT),
        "travel_end_date": repository.travel_end_date.strftime(DATE_FORMAT),
        "visibility": repository.visibility,
        "collaborators": collaborators,
    }
    return HttpResponseSuccessUpdate(response_dict)


# /api/repositories/<int:repo_id>/collaborators/
@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
def repositoryCollaborators(request, repo_id):
    if request.method == "GET":

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if (not request.user.is_authenticated) and (
                repository.visibility != Scope.PUBLIC
        ):
            return HttpResponseNoPermission()

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

        collaborator_list = []
        for user in repository.collaborators.all():
            if not bool(user.profile_picture):
                collaborator_list.append(
                    {
                        "username": user.username,
                        "bio": user.bio,
                    }
                )
            else:
                collaborator_list.append(
                    {
                        "username": user.username,
                        "profile_picture": user.profile_picture.url,
                        "bio": user.bio,
                    }
                )
        return HttpResponseSuccessGet(collaborator_list)

    # request.method == "POST":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if request.user not in repository.collaborators.all():
        return HttpResponseNoPermission()

    try:
        req_data = json.loads(request.body.decode())
        new_collaborators = []
        for invited in req_data:
            invited_name = invited["username"]
            user = User.objects.get(username=invited_name)
            new_collaborators.append(user)
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()
    except User.DoesNotExist:
        return HttpResponseInvalidInput()

    for user in new_collaborators:
        repository.collaborators.add(user)
    repository.save()

    collaborator_list = []
    for user in repository.collaborators.all():
        if not bool(user.profile_picture):
            collaborator_list.append(
                {
                    "username": user.username,
                    "bio": user.bio,
                }
            )
        else:
            collaborator_list.append(
                {
                    "username": user.username,
                    "profile_picture": user.profile_picture.url,
                    "bio": user.bio,
                }
            )

    return HttpResponseSuccessUpdate(collaborator_list)


# /api/repositories/<int:repo_id>/collaborators/<str:collaborator_name>/
@require_http_methods(["DELETE"])
def repositoryCollaboratorID(request, repo_id, collaborator_name):
    # request.method == "DELETE":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
        deleted = User.objects.get(username=collaborator_name)
    except (Repository.DoesNotExist, User.DoesNotExist):
        return HttpResponseNotExist()

    if deleted != request.user:
        return HttpResponseNoPermission()

    if deleted == repository.owner:
        return HttpResponseInvalidInput()

    repository.collaborators.remove(deleted)

    collaborator_list = []
    for user in repository.collaborators.all():
        if not bool(user.profile_picture):
            collaborator_list.append(
                {
                    "username": user.username,
                    "bio": user.bio,
                }
            )
        else:
            collaborator_list.append(
                {
                    "username": user.username,
                    "profile_picture": user.profile_picture.url,
                    "bio": user.bio,
                }
            )

    return HttpResponseSuccessDelete(collaborator_list)
