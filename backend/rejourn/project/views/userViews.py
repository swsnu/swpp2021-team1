import json
from json.decoder import JSONDecodeError

from django.http.response import HttpResponseBadRequest
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from project.models.models import User
from project.httpResponse import *
from project.enum import Scope


# /api/token/
@require_http_methods(['GET'])
@ensure_csrf_cookie
def token(request):
    # request.method == "GET":
    return HttpResponse(status=204)


# /api/session/
@require_http_methods(['GET'])
@ensure_csrf_cookie
def session(request):
    # request.method == "GET":
    session_user = request.user

    if not session_user.is_authenticated:
        return HttpResponseNotLoggedIn()

    friends = []
    for friend in session_user.friends.all():
        if not bool(friend.profile_picture):
            friends.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                }
            )
        else:
            friends.append(
                {
                    "username": friend.username,
                    "profile_picture": friend.profile_picture.url,
                    "bio": friend.bio,
                }
            )

    response_dict = {
        "username": session_user.username,
        "bio": session_user.bio,
        "visibility": session_user.visibility,
        "real_name": session_user.real_name,
        "email": session_user.email,
        "friends": friends,
    }
    if bool(session_user.profile_picture):
        response_dict["profile_picture"] = session_user.profile_picture.url

    return HttpResponseSuccessGet(response_dict)


# /api/signin/
@require_http_methods(['POST'])
def signin(request):
    # request.method == "POST":
    try:
        req_data = json.loads(request.body.decode())
        username = req_data["username"]
        password = req_data["password"]
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    user_signin = authenticate(username=username, password=password)
    if user_signin is None:
        return HttpResponseNotLoggedIn()
    login(request, user_signin)

    friends = []
    for friend in user_signin.friends.all():
        if not bool(friend.profile_picture):
            friends.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                }
            )
        else:
            friends.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                    "profile_picture": friend.profile_picture.url,
                }
            )

    response_dict = {
        "username": request.user.username,
        "bio": request.user.bio,
        "visibility": request.user.visibility,
        "real_name": request.user.real_name,
        "email": request.user.email,
        "friends": friends,
    }
    if bool(request.user.profile_picture):
        response_dict["profile_picture"] = request.user.profile_picture.url

    return HttpResponseSuccessUpdate(response_dict)

# /api/signout/
@require_http_methods(['GET'])
def signout(request):
    # request.method == "GET":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    logout(request)
    return HttpResponseSuccessGet()


# /api/users/
@require_http_methods(['POST'])
def users(request):
    # request.method == "POST":
    try:
        req_data = json.loads(request.body.decode())
        username = req_data["username"]
        bio = req_data["bio"]
        visibility = req_data["visibility"]
        real_name = req_data["real_name"]
        email = req_data["email"]
        password = req_data["password"]
    except (KeyError, JSONDecodeError):
        return HttpResponseBadRequest()

    if User.objects.filter(username=username).count() != 0:
        return HttpResponseInvalidInput()

    User.objects.create_user(
        username=username,
        real_name=real_name,
        email=email,
        password=password,
        visibility=visibility,
        bio=bio,
    )

    try:
        new_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    response_dict = {
        "username": new_user.username,
        "bio": new_user.bio,
        "visibility": new_user.visibility,
        "real_name": new_user.real_name,
        "email": new_user.email,
    }

    return HttpResponseSuccessUpdate(response_dict)


# /api/users/<str:user_name>/profile-picture/
@require_http_methods(['POST', 'DELETE'])
def profilePicture(request, user_name):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            user = User.objects.get(username=user_name)
        except User.DoesNotExist:
            return HttpResponseNotExist()

        if request.user != user:
            return HttpResponseNoPermission()

        try:
            image = request.FILES.get["image"]
        except KeyError:
            return HttpResponseBadRequest()

        user.profile_picture = image
        user.save()

        return HttpResponseSuccessUpdate()

    # request.method == "DELETE":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    try:
        user = User.objects.get(username=user_name)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    if request.user != user:
        return HttpResponseNoPermission()

    user.profile_picture = None
    user.save()

    return HttpResponseSuccessDelete()


# /api/users/<str:user_name>/
@require_http_methods(["DELETE", "PUT", "GET"])
@ensure_csrf_cookie
def userID(request, user_name):
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        if user_name != request.user.username:
            return HttpResponseNoPermission()

        try:
            user = User.objects.get(username=user_name)
        except User.DoesNotExist:
            return HttpResponseNotExist()

        logout(request)
        user.delete()
        return HttpResponseSuccessDelete()

    if request.method == "PUT":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        if user_name != request.user.username:
            return HttpResponseNoPermission()

        try:
            user = User.objects.get(username=user_name)
        except User.DoesNotExist:
            return HttpResponseNotExist()

        try:
            req_data = json.loads(request.body.decode())
            username = req_data["username"]
            real_name = req_data["real_name"]
            email = req_data["email"]
            password = req_data["password"]
            visibility = req_data["visibility"]
            bio = req_data["bio"]
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        if User.objects.filter(username=username).count() != 0:
            return HttpResponseInvalidInput()

        user.username = username
        user.real_name = real_name
        user.email = email
        user.password = password
        user.visibility = visibility
        user.bio = bio
        user.save()

        response_dict = {
            "username": user.username,
            "visibility": user.visibility,
            "real_name": user.real_name,
            "bio": user.bio,
            "email": user.email,
        }
        if bool(user.profile_picture):
            response_dict["profile_picture"] = user.profile_picture.url
        return HttpResponseSuccessUpdate(response_dict)

    # request.method == "GET":
    try:
        user = User.objects.get(username=user_name)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    friends_list = []
    for friend in user.friends.all():
        if not bool(friend.profile_picture):
            friends_list.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                }
            )
        else:
            friends_list.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                    "profile_picture": friend.profile_picture.url,
                }
            )

    response_dict_original = {
        "username": user.username,
        "bio": user.bio,
        "visibility": user.visibility,
        "real_name": user.real_name,
        "email": user.email,
        "friends": friends_list,
    }
    if bool(user.profile_picture):
        response_dict_original["profile_picture"] = user.profile_picture.url

    response_dict_censored = {
        "username": user.username,
        "bio": user.bio,
        "visibility": user.visibility,
    }
    if bool(user.profile_picture):
        response_dict_censored["profile_picture"] = user.profile_picture.url

    if request.user.is_authenticated and user_name == request.user.username:
        return HttpResponseSuccessGet(response_dict_original)
    if user.visibility == Scope.PUBLIC:
        return HttpResponseSuccessGet(response_dict_original)
    if user.visibility == Scope.FRIENDS_ONLY:
        if request.user in user.friends.all():
            return HttpResponseSuccessGet(response_dict_original)
        return HttpResponseSuccessGet(response_dict_censored)
    # user.visibility == Scope.PRIVATE
    return HttpResponseSuccessGet(response_dict_censored)


# /api/users/<str:user_name>/friends/
@require_http_methods(['GET'])
@ensure_csrf_cookie
def userFriends(request, user_name):
    # request.method == "GET":
    try:
        user = User.objects.get(username=user_name)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    friends_list = []
    for friend in user.friends.all():
        if not bool(friend.profile_picture):
            friends_list.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                }
            )
        else:
            friends_list.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                    "profile_picture": friend.profile_picture.url,
                }
            )

    if request.user.is_authenticated and user_name == request.user.username:
        return HttpResponseSuccessGet(friends_list)
    if user.visibility == Scope.PUBLIC:
        return HttpResponseSuccessGet(friends_list)
    if user.visibility == Scope.FRIENDS_ONLY:
        if request.user in user.friends.all():
            return HttpResponseSuccessGet(friends_list)
        return HttpResponseNoPermission()
    # user.visibility == Scope.PRIVATE
    return HttpResponseNoPermission()


# /api/users/<str:user_name>/friends/<str:friend_name>/
@require_http_methods(["POST", "DELETE"])
def userFriendID(request, user_name, friend_name):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        if user_name != request.user.username:
            return HttpResponseNoPermission()

        try:
            from_user = User.objects.get(username=user_name)
            to_user = User.objects.get(username=friend_name)
        except User.DoesNotExist:
            return HttpResponseNotExist()

        from_user.friends.add(to_user)
        from_user.save()

        friends_list = []
        for friend in from_user.friends.all():
            if not bool(friend.profile_picture):
                friends_list.append(
                    {
                        "username": friend.username,
                        "bio": friend.bio,
                    }
                )
            else:
                friends_list.append(
                    {
                        "username": friend.username,
                        "bio": friend.bio,
                        "profile_picture": friend.profile_picture.url,
                    }
                )

        return HttpResponseSuccessUpdate(friends_list)

    # request.method == "DELETE":
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    if user_name != request.user.username:
        return HttpResponseNoPermission()

    try:
        from_user = User.objects.get(username=user_name)
        to_user = User.objects.get(username=friend_name)
    except User.DoesNotExist:
        return HttpResponseNotExist()

    from_user.friends.remove(to_user)
    from_user.save()

    friends_list = []
    for friend in from_user.friends.all():
        if not bool(friend.profile_picture):
            friends_list.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                }
            )
        else:
            friends_list.append(
                {
                    "username": friend.username,
                    "bio": friend.bio,
                    "profile_picture": friend.profile_picture.url,
                }
            )

    return HttpResponseSuccessDelete(friends_list)
