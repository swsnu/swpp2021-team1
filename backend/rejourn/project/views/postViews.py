import json
from json.decoder import JSONDecodeError

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import (
    Post,
    PostComment,
    User,
    PhotoInPost,
    Repository,
    Photo,
)
from project.httpResponse import *
from project.enum import Scope
from project.utils import have_common_user


# /api/users/<str:user_name>/posts/
@require_http_methods(["GET"])
@ensure_csrf_cookie
def userPosts(request, user_name):
    # request.method == "GET":
    try:
        user = User.objects.get(username=user_name)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    post_list = []
    for post in Post.objects.filter(author=user):
        repository = post.repository
        if (
                (repository.visibility == Scope.PUBLIC)
                or (request.user in repository.collaborators.all())
                or (
                    repository.visibility == Scope.FRIENDS_ONLY
                    and have_common_user(
                        request.user.friends.all(), repository.collaborators.all()
                    )
                )
            ):

            photo_list = []
            for photo_order in PhotoInPost.objects.filter(post=post):
                photo_list.append(
                    {
                        "photo_id": photo_order.photo.photo_id,
                        "local_tag": photo_order.local_tag,
                        "image": photo_order.photo.image_file.url,
                    }
                )

            author_info = {
                "username": post.author.username,
                "bio": post.author.bio,
            }
            if bool(post.author.profile_picture):
                author_info["profile_picture"] = post.author.profile_picture.url

            post_list.insert(
                0,
                {
                    "post_id": post.post_id,
                    "repo_id": post.repository.repo_id,
                    "author": author_info,
                    "title": post.title,
                    "post_time": post.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "photos": photo_list,
                },
            )

    return HttpResponseSuccessGet(post_list)


# /api/repositories/<int:repo_id>/posts/
@require_http_methods(["POST", "GET"])
@ensure_csrf_cookie
def repoPosts(request, repo_id):
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
            req_data = json.loads(request.body.decode())
            title = req_data["title"]
            text = req_data["text"]
            photos = req_data["photos"]
            photo_id_list = []
            for photo in photos:
                photo_id_list.append(
                    {
                        "photo_id": photo["photo_id"],
                        "local_tag": photo["local_tag"],
                    }
                )
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        if title == "" or text == "":
            return HttpResponseInvalidInput()

        photo_list = []
        for photo_id in photo_id_list:
            try:
                photo = Photo.objects.get(photo_id=photo_id["photo_id"])
            except Photo.DoesNotExist:
                return HttpResponseInvalidInput()
            if photo.repository != repository:
                return HttpResponseInvalidInput()
            photo_list.append(
                {
                    "photo": photo,
                    "local_tag": photo_id["local_tag"],
                }
            )

        new_post = Post(
            repository=repository, author=request.user, title=title, text=text
        )
        new_post.save()

        for photo in photo_list:
            order_count = 0
            new_photo_in_post = PhotoInPost(
                post=new_post,
                photo=photo["photo"],
                order=order_count,
                local_tag=photo["local_tag"],
            )
            new_photo_in_post.save()
            order_count += 1

        photos = []
        for photo_order in PhotoInPost.objects.filter(post=new_post):
            photos.append(
                {
                    "photo_id": photo_order.photo.photo_id,
                    "local_tag": photo_order.local_tag,
                    "image": photo_order.photo.image_file.url,
                }
            )
        author_info = {
            "username": new_post.author.username,
            "bio": new_post.author.bio,
        }
        if bool(new_post.author.profile_picture):
            author_info["profile_picture"] = new_post.author.profile_picture.url
        response_dict = {
            "post_id": new_post.post_id,
            "repo_id": new_post.repository.repo_id,
            "author": author_info,
            "title": new_post.title,
            "text": new_post.text,
            "post_time": new_post.post_time.strftime("%Y-%m-%d %H:%M:%S"),
            "photos": photos,
            "comments": [],
        }
        return HttpResponseSuccessUpdate(response_dict)

    # request.method == "GET":
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

    post_list = []

    for post in Post.objects.filter(repository=repository):

        photo_list = []
        for photo_order in PhotoInPost.objects.filter(post=post):
            photo_list.append(
                {
                    "photo_id": photo_order.photo.photo_id,
                    "local_tag": photo_order.local_tag,
                    "image": photo_order.photo.image_file.url,
                }
            )

        author_info = {
            "username": post.author.username,
            "bio": post.author.bio,
        }
        if bool(post.author.profile_picture):
            author_info["profile_picture"] = post.author.profile_picture.url

        post_list.insert(
            0,
            {
                "post_id": post.post_id,
                "repo_id": post.repository.repo_id,
                "author": author_info,
                "title": post.title,
                "post_time": post.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                "photos": photo_list,
            },
        )
    return HttpResponseSuccessGet(post_list)


# /api/posts/<int:post_id>/
@require_http_methods(["PUT", "DELETE", "GET"])
@ensure_csrf_cookie
def postID(request, post_id):
    if request.method == "GET":
        try:
            post = Post.objects.get(post_id=post_id)
        except Post.DoesNotExist:
            return HttpResponseNotExist()

        repository = post.repository

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

        photo_list = []
        for photo_order in PhotoInPost.objects.filter(post=post):
            photo_list.append(
                {
                    "photo_id": photo_order.photo.photo_id,
                    "local_tag": photo_order.local_tag,
                    "image": photo_order.photo.image_file.url,
                }
            )

        author_info = {
            "username": post.author.username,
            "bio": post.author.bio,
        }
        if bool(post.author.profile_picture):
            author_info["profile_picture"] = post.author.profile_picture.url

        comment_list = []
        for comment in PostComment.objects.filter(post=post):
            author_info = {
                "username": comment.author.username,
                "bio": comment.author.bio,
            }
            if bool(comment.author.profile_picture):
                author_info["profile_picture"] = comment.author.profile_picture.url
            comment_list.append(
                {
                    "comment_id": comment.post_comment_id,
                    "author": author_info,
                    "text": comment.text,
                    "parent_id": comment.post.post_id,
                    "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

        response_dict = {
            "post_id": post.post_id,
            "repo_id": post.repository.repo_id,
            "author": author_info,
            "title": post.title,
            "text": post.text,
            "post_time": post.post_time.strftime("%Y-%m-%d %H:%M:%S"),
            "photos": photo_list,
            "comments": comment_list,
        }
        return HttpResponseSuccessGet(response_dict)

    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            post = Post.objects.get(post_id=post_id)
        except Post.DoesNotExist:
            return HttpResponseNotExist()

        if not request.user == post.author:
            return HttpResponseNoPermission()

        post.delete()

        return HttpResponseSuccessDelete()

    # request.method == "PUT":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        post = Post.objects.get(post_id=post_id)
    except Post.DoesNotExist:
        return HttpResponseNotExist()

    if not request.user == post.author:
        return HttpResponseNoPermission()

    try:
        req_data = json.loads(request.body.decode())
        title = req_data["title"]
        text = req_data["text"]
        photos = req_data["photos"]
        photo_id_list = []
        for photo in photos:
            photo_id_list.append(
                {
                    "photo_id": photo["photo_id"],
                    "local_tag": photo["local_tag"],
                }
            )
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    repository = post.repository

    if title == "" or text == "":
        return HttpResponseInvalidInput()

    photo_list = []
    for photo_id in photo_id_list:
        try:
            photo = Photo.objects.get(photo_id=photo_id)
        except Photo.DoesNotExist:
            return HttpResponseInvalidInput()
        if photo.repository != repository:
            return HttpResponseInvalidInput()
        photo_list.append(
            {
                "photo": photo,
                "local_tag": photo_id["local_tag"],
            }
        )

    post.title = title
    post.text = text
    post.save()

    for photo_order in PhotoInPost.objects.filter(post=post):
        photo_order.delete()

    order_count = 0
    for photo in photo_list:
        photo_in_post = PhotoInPost(
            photo=photo["photo"],
            post=post,
            order=order_count,
            local_tag=photo["local_tag"],
        )
        photo_in_post.save()
        order_count += 1

    photo_list = []
    for photo_order in PhotoInPost.objects.filter(post=post):
        photo_list.append(
            {
                "photo_id": photo_order.photo.photo_id,
                "local_tag": photo_order.local_tag,
                "image": photo_order.photo.image_file.url,
            }
        )

    author_info = {
        "username": post.author.username,
        "bio": post.author.bio,
    }
    if bool(post.author.profile_picture):
        author_info["profile_picture"] = post.author.profile_picture.url

    comment_list = []
    for comment in PostComment.objects.filter(post=post):
        author_info = {
            "username": comment.author.username,
            "bio": comment.author.bio,
        }
        if bool(comment.author.profile_picture):
            author_info["profile_picture"] = comment.author.profile_picture.url
        comment_list.append(
            {
                "comment_id": comment.post_comment_id,
                "author": author_info,
                "text": comment.text,
                "parent_id": comment.post.post_id,
                "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

    response_dict = {
        "post_id": post.post_id,
        "repo_id": post.repository.repo_id,
        "author": author_info,
        "title": post.title,
        "text": post.text,
        "post_time": post.post_time.strftime("%Y-%m-%d %H:%M:%S"),
        "photos": photo_list,
        "comments": comment_list,
    }
    return HttpResponseSuccessUpdate(response_dict)


# /api/posts/<int:post_id>/comments/
@require_http_methods(["POST", "GET"])
@ensure_csrf_cookie
def postComments(request, post_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            post = Post.objects.get(post_id=post_id)
        except Post.DoesNotExist:
            return HttpResponseNotExist()

        repository = post.repository

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

        try:
            req_data = json.loads(request.body.decode())
            text = req_data["text"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        new_comment = PostComment(author=request.user, text=text, post=post)
        new_comment.save()

        comment_list = []
        for comment in PostComment.objects.filter(post=post):
            author_info = {
                "username": comment.author.username,
                "bio": comment.author.bio,
            }
            if bool(comment.author.profile_picture):
                author_info["profile_picture"] = comment.author.profile_picture.url
            comment_list.append(
                {
                    "comment_id": comment.post_comment_id,
                    "author": author_info,
                    "text": comment.text,
                    "parent_id": comment.post.post_id,
                    "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        return HttpResponseSuccessUpdate(comment_list)

    # request.method == "GET":
    try:
        post = Post.objects.get(post_id=post_id)
    except Post.DoesNotExist:
        return HttpResponseNotExist()

    repository = post.repository

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

    comment_list = []
    for comment in PostComment.objects.filter(post=post):
        author_info = {
            "username": comment.author.username,
            "bio": comment.author.bio,
        }
        if bool(comment.author.profile_picture):
            author_info["profile_picture"] = comment.author.profile_picture.url
        comment_list.append(
            {
                "comment_id": comment.post_comment_id,
                "author": author_info,
                "text": comment.text,
                "parent_id": comment.post.post_id,
                "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
    return HttpResponseSuccessGet(comment_list)


# /api/posts/<int:post_id>/comments/<int:post_comment_id>/
@require_http_methods(['GET', 'PUT', 'DELETE'])
@ensure_csrf_cookie
def postCommentID(request, post_id, post_comment_id):
    if request.method == "GET":
        try:
            comment = PostComment.objects.get(post_comment_id=post_comment_id)
        except PostComment.DoesNotExist:
            return HttpResponseNotExist()

        try:
            post = Post.objects.get(post_id=post_id)
        except Post.DoesNotExist:
            return HttpResponseNotExist()

        if comment.post != post:
            return HttpResponseInvalidInput()

        repository = post.repository

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

        author_info = {
            "username": comment.author.username,
            "bio": comment.author.bio,
        }
        if bool(comment.author.profile_picture):
            author_info["profile_picture"] = comment.author.profile_picture.url
        response_dict = {
            "comment_id": comment.post_comment_id,
            "author": author_info,
            "text": comment.text,
            "parent_id": comment.post.post_id,
            "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        return HttpResponseSuccessGet(response_dict)

    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            comment = PostComment.objects.get(post_comment_id=post_comment_id)
        except PostComment.DoesNotExist:
            return HttpResponseNotExist()

        try:
            post = Post.objects.get(post_id=post_id)
        except Post.DoesNotExist:
            return HttpResponseNotExist()

        if post != comment.post:
            return HttpResponseInvalidInput()

        if request.user != comment.author:
            return HttpResponseNoPermission()

        comment.delete()

        comment_list = []
        for comment in PostComment.objects.filter(post=post):
            author_info = {
                "username": comment.author.username,
                "bio": comment.author.bio,
            }
            if bool(comment.author.profile_picture):
                author_info["profile_picture"] = comment.author.profile_picture.url
            comment_list.append(
                {
                    "comment_id": comment.post_comment_id,
                    "author": author_info,
                    "text": comment.text,
                    "parent_id": comment.post.post_id,
                    "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        return HttpResponseSuccessDelete(comment_list)

    # request.method == "PUT":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        comment = PostComment.objects.get(post_comment_id=post_comment_id)
    except PostComment.DoesNotExist:
        return HttpResponseNotExist()

    try:
        post = Post.objects.get(post_id=comment.post_id)
    except Post.DoesNotExist:
        return HttpResponseNotExist()

    try:
        req_data = json.loads(request.body.decode())
        text = req_data["text"]
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    if comment.post != post:
        return HttpResponseInvalidInput()
    if text == "":
        return HttpResponseInvalidInput()

    if not request.user == comment.author:
        return HttpResponseNoPermission()

    comment.text = text
    comment.save()

    comment_list = []
    for comment in PostComment.objects.filter(post=post):
        author_info = {
            "username": comment.author.username,
            "bio": comment.author.bio,
        }
        if bool(comment.author.profile_picture):
            author_info["profile_picture"] = comment.author.profile_picture.url
        comment_list.append(
            {
                "comment_id": comment.post_comment_id,
                "author": author_info,
                "text": comment.text,
                "parent_id": comment.post.post_id,
                "post_time": comment.post_time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
    return HttpResponseSuccessUpdate(comment_list)
