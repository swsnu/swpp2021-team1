import json
from json.decoder import JSONDecodeError

from django.utils import timezone
from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import Discussion, DiscussionComment, Repository
from project.httpResponse import *

UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

def get_discussion_comment_list(discussion):
    comment_list = []
    for comment in DiscussionComment.objects.filter(discussion=discussion):
        author_info = {
            "username": comment.author.username,
            "bio": comment.author.bio,
        }
        if bool(comment.author.profile_picture):
            author_info["profile_picture"] = comment.author.profile_picture.url
        comment_list.append(
            {
                "comment_id": comment.discussion_comment_id,
                "author": author_info,
                "text": comment.text,
                "parent_id": comment.discussion.discussion_id,
                "post_time": timezone.make_naive(comment.post_time).strftime(UPLOADED_TIME_FORMAT),
            }
        )
    return comment_list

def get_discussion_dict(discussion, comment_blank=False):
    author_info = {
        "username": discussion.author.username,
        "bio": discussion.author.bio,
    }
    if bool(discussion.author.profile_picture):
        author_info["profile_picture"] = discussion.author.profile_picture.url

    if comment_blank:
        comment_list = []
    else:
        comment_list = get_discussion_comment_list(discussion)

    discussion_dict = {
        "discussion_id": discussion.discussion_id,
        "repo_id": discussion.repository.repo_id,
        "author": author_info,
        "title": discussion.title,
        "text": discussion.text,
        "post_time": timezone.make_naive(discussion.post_time).strftime(UPLOADED_TIME_FORMAT),
        "comments": comment_list,
    }
    return discussion_dict

# /api/repositories/<int:repo_id>/discussions/
@require_http_methods(["POST", "GET"])
@ensure_csrf_cookie
def discussions(request, repo_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return HttpResponseNotExist()

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            title = req_data["title"]
            text = req_data["text"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        new_discussion = Discussion(
            repository=repository, author=request.user, title=title, text=text
        )
        new_discussion.save()

        response_dict = get_discussion_dict(new_discussion, comment_blank=True)
        return HttpResponseSuccessUpdate(response_dict)

    # request.method == "GET":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if request.user not in repository.collaborators.all():
        return HttpResponseNoPermission()

    discussion_list = []

    for discussion in Discussion.objects.filter(repository=repository):
        author_info = {
            "username": discussion.author.username,
            "bio": discussion.author.bio,
        }
        if bool(discussion.author.profile_picture):
            author_info["profile_picture"] = discussion.author.profile_picture.url
        discussion_list.insert(
            0,
            {
                "discussion_id": discussion.discussion_id,
                "repo_id": discussion.repository.repo_id,
                "author": author_info,
                "title": discussion.title,
                "post_time": timezone.make_naive(discussion.post_time).strftime(UPLOADED_TIME_FORMAT),
            },
        )
    return HttpResponseSuccessGet(discussion_list)


# /api/discussions/<int:discussion_id>/
@require_http_methods(["PUT", "DELETE", "GET"])
@ensure_csrf_cookie
def discussionID(request, discussion_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except Discussion.DoesNotExist:
            return HttpResponseNotExist()

        repository = discussion.repository

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        response_dict = get_discussion_dict(discussion)
        return HttpResponseSuccessGet(response_dict)

    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except Discussion.DoesNotExist:
            return HttpResponseNotExist()

        if not request.user == discussion.author:
            return HttpResponseNoPermission()

        discussion.delete()

        return HttpResponseSuccessDelete()

    # request.method == "PUT":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        discussion = Discussion.objects.get(discussion_id=discussion_id)
    except Discussion.DoesNotExist:
        return HttpResponseNotExist()

    if not request.user == discussion.author:
        return HttpResponseNoPermission()

    try:
        req_data = json.loads(request.body.decode())
        title = req_data["title"]
        text = req_data["text"]
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    if title == "" or text == "":
        return HttpResponseInvalidInput()

    discussion.title = title
    discussion.text = text
    discussion.save()

    response_dict = get_discussion_dict(discussion)
    return HttpResponseSuccessUpdate(response_dict)


# /api/discussions/<int:discussion_id>/comments/
@require_http_methods(["POST", "GET"])
@ensure_csrf_cookie
def discussionComments(request, discussion_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except Discussion.DoesNotExist:
            return HttpResponseNotExist()

        repository = discussion.repository

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            text = req_data["text"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        new_comment = DiscussionComment(
            author=request.user, text=text, discussion=discussion
        )
        new_comment.save()

        comment_list = get_discussion_comment_list(discussion)
        return HttpResponseSuccessUpdate(comment_list)

    # request.method == "GET":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    try:
        discussion = Discussion.objects.get(discussion_id=discussion_id)
    except Discussion.DoesNotExist:
        return HttpResponseNotExist()

    repository = discussion.repository
    if not request.user in repository.collaborators.all():
        return HttpResponseNoPermission()

    comment_list = get_discussion_comment_list(discussion)
    return HttpResponseSuccessGet(comment_list)


# /api/discussions/<int:discussion_id>/comments/<int:discussion_comment_id>/
@require_http_methods(["PUT", "DELETE", "GET"])
@ensure_csrf_cookie
def discussionCommentID(request, discussion_id, discussion_comment_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            comment = DiscussionComment.objects.get(
                discussion_comment_id=discussion_comment_id
            )
        except DiscussionComment.DoesNotExist:
            return HttpResponseNotExist()

        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except Discussion.DoesNotExist:
            return HttpResponseNotExist()

        if discussion != comment.discussion:
            return HttpResponseInvalidInput()

        repository = discussion.repository

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        author_info = {
            "username": comment.author.username,
            "bio": comment.author.bio,
        }
        if bool(comment.author.profile_picture):
            author_info["profile_picture"] = comment.author.profile_picture.url
        response_dict = {
            "comment_id": comment.discussion_comment_id,
            "author": author_info,
            "text": comment.text,
            "parent_id": comment.discussion.discussion_id,
            "post_time": timezone.make_naive(comment.post_time).strftime(UPLOADED_TIME_FORMAT),
        }
        return HttpResponseSuccessGet(response_dict)

    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            comment = DiscussionComment.objects.get(
                discussion_comment_id=discussion_comment_id
            )
        except DiscussionComment.DoesNotExist:
            return HttpResponseNotExist()

        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except Discussion.DoesNotExist:
            return HttpResponseNotExist()

        if discussion != comment.discussion:
            return HttpResponseInvalidInput()

        if not request.user == comment.author:
            return HttpResponseNoPermission()

        comment.delete()

        comment_list = get_discussion_comment_list(discussion)
        return HttpResponseSuccessDelete(comment_list)

    # request.method == "PUT":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        comment = DiscussionComment.objects.get(
            discussion_comment_id=discussion_comment_id
        )
    except DiscussionComment.DoesNotExist:
        return HttpResponseNotExist()

    try:
        discussion = Discussion.objects.get(discussion_id=discussion_id)
    except Discussion.DoesNotExist:
        return HttpResponseNotExist()

    if discussion != comment.discussion:
        return HttpResponseInvalidInput()

    if not request.user == comment.author:
        return HttpResponseNoPermission()

    try:
        req_data = json.loads(request.body.decode())
        text = req_data["text"]
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()
    if text == "":
        return HttpResponseInvalidInput()

    comment.text = text
    comment.save()

    comment_list = get_discussion_comment_list(discussion)
    return HttpResponseSuccessUpdate(comment_list)
