from project.httpResponse import *
from json.decoder import JSONDecodeError
from django.http.response import HttpResponseBadRequest, HttpResponseNotAllowed
import json

from django.contrib.auth import authenticate, login, logout
from project.models.models import User

from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from project.enum import Scope

@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])


@ensure_csrf_cookie
def session(request):
    if request.method == 'GET':
        
        session_user = request.user

        if not session_user.is_authenticated:
            return HttpResponseNotLoggedIn()

        friends = []
        for friend in session_user.friends.all():
            if not bool(friend.profile_picture):
                friends.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                })
            else:
                friends.append({
                    'username' : friend.username,
                    'profile_picture' : friend.profile_picture.url,
                    'bio' : friend.bio,
                })
            

        response_dict = {
            'username': session_user.username,
            'bio' : session_user.bio,
            'visibility' : session_user.visibility,
            'real_name' : session_user.real_name,
            'email' : session_user.email,
            'friends' : friends,
        }
        if bool(session_user.profile_picture):
            response_dict['profile_picture'] = session_user.profile_picture.url

        return HttpResponseSuccessGet(response_dict)

    else:
        return HttpResponseNotAllowed(['GET'])


@ensure_csrf_cookie
def signin(request):
    if request.method == 'POST':
        
        try:
            req_data = json.loads(request.body.decode())
            username = req_data['username']
            password = req_data['password']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        user_signin = authenticate(username=username, password=password)
        if user_signin is None:
            return HttpResponseNotLoggedIn()
        login(request, user_signin)

        friends = []
        for friend in user_signin.friends.all():
            if not bool(friend.profile_picture):
                friends.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                })
            else:
                friends.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                    'profile_picture' : friend.profile_picture.url,
                })
            

        response_dict = {
            'username': request.user.username,
            'bio' : request.user.bio,
            'visibility' : request.user.visibility,
            'real_name' : request.user.real_name,
            'email' : request.user.email,
            'friends' : friends,
        }
        if bool(request.user.profile_picture):
            response_dict['profile_picture'] = request.user.profile_picture.url

        return HttpResponseSuccessUpdate(response_dict)

    else:
        return HttpResponseNotAllowed(['POST'])


@ensure_csrf_cookie
def signout(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        logout(request)
        return HttpResponseSuccessGet()

    else:
        return HttpResponseNotAllowed(['GET'])


@csrf_exempt
def users(request):
    if request.method == 'POST':
        
        try:
            req_data = json.loads(request.body.decode())
            username = req_data['username']
            bio = req_data['bio']
            visibility = req_data['visibility']
            real_name = req_data['real_name']
            email = req_data['email']
            password = req_data['password']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        if User.objects.filter(username=username).count() != 0:
            return HttpResponseInvalidInput()
            
        User.objects.create_user(username=username, real_name=real_name, email=email,
                                 password=password, visibility=visibility, bio=bio)

        try:
            new_user = User.objects.get(username=username)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()

        response_dict = {
            'username' : new_user.username,
            'bio' : new_user.bio,
            'visibility' : new_user.visibility,
            'real_name' : new_user.real_name,
            'email' : new_user.email,
        }

        return HttpResponseSuccessUpdate(response_dict)

    else:
        return HttpResponseNotAllowed(['POST'])


def profilePicture(request, user_name):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if request.user != user:
            return HttpResponseNoPermission()
        
        try:
            image = request.FILES.get['image']
        except(KeyError) as e:
            return HttpResponseBadRequest()
        
        user.profile_picture = image
        user.save()

        return HttpResponseSuccessUpdate()

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if request.user != user:
            return HttpResponseNoPermission()
        
        user.profile_picture = None
        user.save()

        return HttpResponseSuccessDelete()

    else:
        return HttpResponseNotAllowed(['POST', 'DELETE'])
    

@ensure_csrf_cookie
def userID(request, user_name):
    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        if user_name != request.user.username:
            return HttpResponseNoPermission()

        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        logout(request)
        user.delete()
        return HttpResponseSuccessDelete()

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        if user_name != request.user.username:
            return HttpResponseNoPermission()

        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        try:
            req_data = json.loads(request.body.decode())
            username = req_data['username']
            real_name = req_data['real_name']
            email = req_data['email']
            password = req_data['password']
            visibility = req_data['visibility']
            bio = req_data['bio']
        except(KeyError, JSONDecodeError) as e:
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
            'username' : user.username,
            'visibility' : user.visibility,
            'real_name' : user.real_name,
            'bio' : user.bio,
            'email' : user.email,
        }
        if bool(user.profile_picture):
            response_dict['profile_picture'] = user.profile_picture.url
        return HttpResponseSuccessUpdate(response_dict)
            
    elif request.method == 'GET':
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        friends_list = []
        for friend in user.friends.all():
            if not bool(friend.profile_picture):
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                })
            else:
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                    'profile_picture' : friend.profile_picture.url,
                })

        response_dict_original = {
            'username' : user.username,
            'bio' : user.bio,
            'visibility' : user.visibility,
            'real_name' : user.real_name,
            'email' : user.email,
            'friends' : friends_list,
        }
        if bool(user.profile_picture):
            response_dict_original['profile_picture'] = user.profile_picture.url

        response_dict_censored = {
            'username' : user.username,
            'bio' : user.bio,
            'visibility' : user.visibility,
        }
        if bool(user.profile_picture):
            response_dict_censored['profile_picture'] = user.profile_picture.url

        if request.user.is_authenticated and user_name == request.user.username:
            return HttpResponseSuccessGet(response_dict_original)
        if user.visibility == Scope.PUBLIC:
            return HttpResponseSuccessGet(response_dict_original)
        elif user.visibility == Scope.FRIENDS_ONLY:
            if request.user in user.friends.all():
                return HttpResponseSuccessGet(response_dict_original)
            else:
                return HttpResponseSuccessGet(response_dict_censored)
        else:   # user.visibility == Scope.PRIVATE
            return HttpResponseSuccessGet(response_dict_censored)
        
    else:
        return HttpResponseNotAllowed(['DELETE', 'PUT', 'GET'])


@ensure_csrf_cookie
def userFriends(request, user_name):
    if request.method == 'GET':
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        friends_list = []
        for friend in user.friends.all():
            if not bool(friend.profile_picture):
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                })
            else:
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                    'profile_picture' : friend.profile_picture.url,
                })

        if request.user.is_authenticated and user_name == request.user.username:
            return HttpResponseSuccessGet(friends_list)
        if user.visibility == Scope.PUBLIC:
            return HttpResponseSuccessGet(friends_list)
        elif user.visibility == Scope.FRIENDS_ONLY:
            if request.user in user.friends.all():
                return HttpResponseSuccessGet(friends_list)
            else:
                return HttpResponseNoPermission()
        else:    # user.visibility == Scope.PRIVATE
            return HttpResponseNoPermission()
        
    else:
        return HttpResponseNotAllowed(['GET'])


@ensure_csrf_cookie
def userFriendID(request, user_name, friend_name):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        if user_name!=request.user.username:
            return HttpResponseNoPermission()

        try:
            from_user = User.objects.get(username=user_name)
            to_user = User.objects.get(username=friend_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        from_user.friends.add(to_user)
        from_user.save()

        friends_list = []
        for friend in from_user.friends.all():
            if not bool(friend.profile_picture):
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                })
            else:
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                    'profile_picture' : friend.profile_picture.url,
                })

        return HttpResponseSuccessUpdate(friends_list)

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        if user_name!=request.user.username:
            return HttpResponseNoPermission()

        try:
            from_user = User.objects.get(username=user_name)
            to_user = User.objects.get(username=friend_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        from_user.friends.remove(to_user)
        from_user.save()

        friends_list = []
        for friend in from_user.friends.all():
            if not bool(friend.profile_picture):
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                })
            else:
                friends_list.append({
                    'username' : friend.username,
                    'bio' : friend.bio,
                    'profile_picture' : friend.profile_picture.url,
                })

        return HttpResponseSuccessDelete()

    else:
        return HttpResponseNotAllowed(['POST', 'DELETE'])
