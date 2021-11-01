from django.db.models.fields import NullBooleanField
from django.http.response import HttpResponseNotAllowed, JsonResponse
from django.shortcuts import render
from django.http import HttpResponse
from .models import User
from django.contrib.auth import authenticate, login, logout
import json
from .httpresponse import HttpResponseInvalidInput, HttpResponseNotLoggedIn, HttpResponseNoPermission, HttpResponseNotExist


def token(request):
    pass

def session(request):
    pass

def signin(request):
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        user_signin = authenticate(username=username, password=password)
        login(request, user_signin)        

    else:
        return HttpResponseNotAllowed(['POST'])

def signout(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            logout(request)
    else:
        return HttpResponseNotAllowed(['GET'])

def users(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            req_data = json.loads(request.body.decode())
            username = req_data['username']
            if User.objects.filter(username=username).count() != 0:
                return HttpResponseInvalidInput()
            real_name = req_data['real_name']
            email = req_data['email']
            password = req_data['password']
            user_setting = req_data['user_setting']
            # image_file_path = req_data[]
            bio = req_data['bio']
            User.objects.create_user(username=username, real_name=real_name, email=email, password=password, user_setting=user_setting, bio=bio)
        else:
            return HttpResponseNotLoggedIn()
            
        
    else:
        return HttpResponseNotAllowed(['POST'])

def userID(request, user_name):
    if request.method == 'DELETE':
        if request.user.is_authenticated:
            if User.objects.filter(username=user_name).count() != 0:
                user = User.objects.filter(username=user_name)
                if user_name == request.user:
                    user.delete()
                else:
                    return HttpResponseNoPermission()
                
            else:
                return HttpResponseNotExist()
        else:
            return HttpResponseNotLoggedIn()
    elif request.method == 'PUT':
        if request.user.is_authenticated:
            if User.objects.filter(username=user_name).count() != 0:
                user = User.objects.filter(username=user_name)
                if user_name == request.user:
                    body = request.body.decode()
                    real_name = json.loads(body)['real_name']
                    username = json.loads(body)['username']
                    email = json.loads(body)['email']
                    password = json.loads(body)['password']
                    user_setting = json.loads(body)['user_setting']
                    bio = json.loads(body)['bio']
                    user = User(username=username, real_name=real_name, email=email, password=password, user_setting=user_setting, bio=bio)
                    user.save()
                    return JsonResponse(user, status=200)
                else:
                    return HttpResponseNoPermission()
                
            else:
                return HttpResponseNotExist()
        else:
            return HttpResponseNotLoggedIn()
    elif request.method == 'GET':
        if request.user.is_authenticated:
            if User.objects.filter(username=user_name).count() != 0:
                user = User.objects.filter(username=user_name)
                if user_name == request.user:
                    return JsonResponse(user, status=200)
                elif user['user_setting'] == 0:
                    user_public = User(username=user['username'], real_name=user['real_name'], email=user['email'], bio=user['bio'])
                    return JsonResponse(user_public, status=200)
                elif user['user_setting'] == 1:
                    for us in user.friends.all():
                        if us['user'] == request.user:
                            user_friends = User(username=user['username'], real_name=user['real_name'], email=user['email'], bio=user['bio'])
                            return JsonResponse(user_friends, status=200)
                    else:
                        user_friends = User(username=user['username'])
                        return JsonResponse(user_friends, status=200)
                elif user['user_setting'] == 2:
                    user_private = User(username=user['username'])
                    return JsonResponse(user_private, status=200)
                        
            else:
                return HttpResponseNotExist()
        else:
            return HttpResponseNotLoggedIn()
    else:
        return HttpResponseNotAllowed(['DELETE', 'PUT', 'GET'])


def userFriends(request, user_name):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if User.objects.filter(username=user_name).count() != 0:
                user = User.objects.filter(username=user_name)
                friends = []
                for friend in user.friends.all():
                    friends.append(friend)

                if user_name == request.user:
                    return JsonResponse(friends, status=200)
                elif user['user_setting'] == 0:
                    return JsonResponse(friends, status=200)
                elif user['user_setting'] == 1:
                    for us in user.friends.all():
                        if us['user'] == request.user:
                            return JsonResponse(friends, status=200)
                    else:
                        return JsonResponse([], status=200)
                elif user['user_setting'] == 2:
                    return JsonResponse([], status=200)
                        
            else:
                return HttpResponseNotExist()
        else:
            return HttpResponseNotLoggedIn()
    else:
        return HttpResponseNotAllowed(['GET'])


def userFriendID(request):
    pass

def repositories(request):
    pass

def repositoryID(request):
    pass

def repositoryCollaborators(request):
    pass

def repositoryCollaboratorID(request):
    pass
