import json
from json.decoder import JSONDecodeError

from django.utils import timezone
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
    Notification,
)
from project.httpResponse import *
from project.utils import repo_visible
from project.enum import PostType, RepoTravel, NoticeType


UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

def get_post_comment_list(post):
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
                "post_time": timezone.make_naive(comment.post_time).strftime(UPLOADED_TIME_FORMAT),
            }
        )
    return comment_list

def get_post_photo_list(post):
    photo_list = []
    for photo_order in PhotoInPost.objects.filter(post=post).order_by('order'):
        photo_list.append(
            {
                "photo_id": photo_order.photo.photo_id,
                "local_tag": photo_order.local_tag,
                "image": photo_order.photo.image_file.url,
            }
        )
    return photo_list

def get_post_dict(post, comment_blank=False, preview=False):

    post_dict = {
        "post_id": post.post_id,
        "repo_id": post.repository.repo_id,
        "post_time": timezone.make_naive(post.post_time).strftime(UPLOADED_TIME_FORMAT),
        "post_type": post.post_type,
    }

    if post.post_type == PostType.REPO:
        author_list = []
        for collaborator in post.repository.collaborators:
            author_info = {
                "username": collaborator.username,
                "bio": collaborator.bio,
            }
            if bool(collaborator.profile_picture):
                author_info["profile_picture"] = collaborator.profile_picture.url
            author_list.append(author_info)
        post_dict['author'] = author_list
        post_dict['photos'] = []
        post_dict['title'] = post.repository.repo_name
        post_text = ""
    else:
        author_info = {
            "username": post.author.username,
            "bio": post.author.bio,
        }
        if bool(post.author.profile_picture):
            author_info["profile_picture"] = post.author.profile_picture.url
        post_dict['author'] = [author_info]
        photo_list = get_post_photo_list(post)
        post_dict['photos'] = photo_list
        post_dict['title'] = post.title
        post_text = post.text

    if not preview:
        post_dict['text'] = post_text
        if comment_blank:
            comment_list = []
            post_dict['comments'] = comment_list
        else:
            comment_list = get_post_comment_list(post)
            post_dict['comments'] = comment_list

    return post_dict

def get_post_list(repository=None, author=None, user=None):
    post_list = []
    if repository is not None:
        filtered_set = Post.objects.filter(repository=repository)
    if author is not None:
        filtered_set = Post.objects.filter(author=author)
    for post in filtered_set.filter(post_type=PostType.PERSONAL):
        if (repository is not None) or (repo_visible(user, post.repository)):
            post_list.insert(
                0,
                get_post_dict(post, preview=True),
            )
    return post_list

# /api/users/<str:user_name>/posts/
@require_http_methods(["GET"])
@ensure_csrf_cookie
def userPosts(request, user_name):
    # request.method == "GET":
    try:
        user = User.objects.get(username=user_name)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    post_list = get_post_list(author=user, user=request.user)
    return HttpResponseSuccessGet(post_list)


# /api/repositories/<int:repo_id>/posts/
@require_http_methods(["POST", "PUT", "GET"])
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
            post_type = req_data["post_type"]
            if post_type == PostType.REPO:
                text = ""
                new_post = Post(
                    repository=repository,
                    author=request.user,
                    title=repository.repo_name,
                    text=text,
                    post_type=post_type
                )
                repository.travel = RepoTravel.TRAVEL_ON
                new_post.save()

                for collaborator in repository.collaborators.all():
                    if collaborator != request.user:
                        post_notice = Notification(
                            user=collaborator,
                            from_user=request.user,
                            classification=NoticeType.NEW_POST,
                            post=new_post,
                            repository=repository,
                        )
                        post_notice.save()

                response_dict = get_post_dict(new_post, comment_blank=True)
                return HttpResponseSuccessUpdate(response_dict)
        except (KeyError, JSONDecodeError):
            pass

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
            repository=repository,
            author=request.user,
            title=title,
            text=text,
            post_type=PostType.PERSONAL
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

        for collaborator in repository.collaborators.all():
            if collaborator != request.user:
                post_notice = Notification(
                    user=collaborator,
                    from_user=request.user,
                    classification=NoticeType.NEW_POST,
                    post=new_post,
                    repository=repository,
                )
                post_notice.save()

        response_dict = get_post_dict(new_post, comment_blank=True)
        return HttpResponseSuccessUpdate(response_dict)

    if request.method == "PUT":
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
            post_type = req_data["post_type"]
            travel = req_data["travel"]
            if post_type != PostType.REPO:
                return HttpResponseBadRequest()
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        if travel == RepoTravel.TRAVEL_OFF:
            repository.travel = RepoTravel.TRAVEL_OFF
            repository.save()
        elif travel == RepoTravel.TRAVEL_ON:
            repository.travel = RepoTravel.TRAVEL_ON
            repository.save()
            existing_post = Post.objects.filter(repository=repository, post_type=PostType.REPO_POST)
            if existing_post.count() == 1:
                text = ""
                new_post = Post(
                    repository=repository,
                    author=request.user,
                    title=repository.repo_name,
                    text=text,
                    post_type=post_type
                )
                for collaborator in repository.collaborators.all():
                    if collaborator != request.user:
                        post_notice = Notification(
                            user=collaborator,
                            from_user=request.user,
                            classification=NoticeType.NEW_POST,
                            post=new_post,
                            repository=repository,
                        )
                        post_notice.save()
        else: # travel has weird value
            return HttpResponseInvalidInput()

        return HttpResponseSuccessUpdate()

    # request.method == "GET":
    try:
        repository = Repository.objects.get(repo_id=repo_id)
    except Repository.DoesNotExist:
        return HttpResponseNotExist()

    if not repo_visible(request.user, repository):
        return HttpResponseNoPermission()

    post_list = get_post_list(repository=repository)
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

        if not repo_visible(request.user, repository):
            return HttpResponseNoPermission()

        response_dict = get_post_dict(post)
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

    response_dict = get_post_dict(post)
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

        if not repo_visible(request.user, repository):
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            text = req_data["text"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        new_comment = PostComment(author=request.user, text=text, post=post)
        new_comment.save()
        if post.author != request.user:
            comment_notice = Notification(
                user=post.author,
                classification=NoticeType.COMMENT,
                from_user=request.user,
                post=post
            )
            comment_notice.save()

        comment_list = get_post_comment_list(post)
        return HttpResponseSuccessUpdate(comment_list)

    # request.method == "GET":
    try:
        post = Post.objects.get(post_id=post_id)
    except Post.DoesNotExist:
        return HttpResponseNotExist()

    repository = post.repository

    if not repo_visible(request.user, repository):
        return HttpResponseNoPermission()

    comment_list = get_post_comment_list(post)
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

        if not repo_visible(request.user, repository):
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
            "post_time": timezone.make_naive(comment.post_time).strftime(UPLOADED_TIME_FORMAT),
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

        comment_list = get_post_comment_list(post)
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

    comment_list = get_post_comment_list(post)
    return HttpResponseSuccessUpdate(comment_list)
