from json.decoder import JSONDecodeError
from django.http.response import HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from .httpResponse import *
from .enum import Scope
from django.http import HttpResponse
from .models import User, Repository
from django.contrib.auth import authenticate, login, logout
import json
from datetime import datetime
from django.utils import timezone

from django.views.decorators.csrf import ensure_csrf_cookie

# util function
def have_common_user( groupA, groupB ):
            for user in groupA:
                if user in groupB:
                    return True
            return False

@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])

def session(request):
    if request.method == 'GET':
        
        session_user = request.user

        if not session_user.is_authenticated:
            return HttpResponseNotLoggedIn()

        response_dict = {
            'username': session_user.username,
            'bio' : session_user.bio,
 ##         'profile_picture',
            'visibility' : session_user.visibility,
            'real_name' : session_user.real_name,
            'email' : session_user.email,
        }
        return HttpResponseSuccessGet(response_dict)

    else:
        return HttpResponseNotAllowed(['GET'])


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
        return HttpResponseSuccessUpdate()

    else:
        return HttpResponseNotAllowed(['POST'])


def signout(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        logout(request)
        return HttpResponseSuccessGet()

    else:
        return HttpResponseNotAllowed(['GET'])


def users(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            req_data = json.loads(request.body.decode())
            username = req_data['username']
            bio = req_data['bio']
            visibility = req_data['visibility']
            real_name = req_data['real_name']
            email = req_data['email']
            password = req_data['password']
            # profile_picture
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        if User.objects.filter(username=username).count() != 0:
            return HttpResponseInvalidInput()
            
        User.objects.create_user(username=username, real_name=real_name, email=email,
                                 password=password, visibility=visibility, bio=bio)    
        
    else:
        return HttpResponseNotAllowed(['POST'])


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
            # profile_picture
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
            # profile_picture,
            'real_name' : user.real_name,
            'bio' : user.bio,
            'email' : user.email,
        }
        return HttpResponseSuccessUpdate(response_dict)
            
    elif request.method == 'GET':
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        friends_list = []
        for friend in user.friends:
            friends_list.append({
                'username': friend.username,
                # 'profile_image'
                'bio': friend.bio
            })

        response_dict_original = {
            'username' : user.username,
            'bio' : user.bio,
            # 'profile_image'
            'visibility' : user.visibility,
            'real_name' : user.real_name,
            'email' : user.email,
            'friends' : friends_list,
        }

        response_dict_censored = {
            'username' : user.username,
            'bio' : user.bio,
            # 'profile_image'
            'visibility' : user.visibility,
        }

        if request.user.is_authenticated() and user_name == request.user.username:
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


def userFriends(request, user_name):
    if request.method == 'GET':
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        friends_list = []
        for friend in user.friends:
            friends_list.append({
                'username': friend.username,
                # 'profile_image'
                'bio': friend.bio
            })

        if request.user.is_authenticated() and user_name == request.user.username:
            return HttpResponseSuccessGet(friends_list)
        if user.visibility == Scope.PUBLIC:
            return HttpResponseSuccessGet(friends_list)
        elif user.visibility == Scope.FRIENDS_ONLY:
            if request.user in user.friends.all():
                return HttpResponseSuccessGet(friends_list)
            else:
                return HttpResponseNoPermission()
        else:   # user.visibility == Scope.PRIVATE
            return HttpResponseNoPermission()
        
    else:
        return HttpResponseNotAllowed(['GET'])


def userFriendID(request, user_name, friend_name):
    if request.method == 'POST':
        if not request.user.is_authenticated():
            return HttpResponseNotLoggedIn()
        
        if user_name!=request.user.username:
            return HttpResponseNoPermission()

        try:
            from_user = User.objects.get(username=user_name)
            to_user = User.objects.get(username=friend_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if to_user in from_user.friends.all():
            return HttpResponseAlreadyProcessed()
        
        from_user.friends.add(to_user)
        from_user.save()
        return HttpResponseSuccessUpdate()
    
    elif request.method == 'DELETE':
        if not request.user.is_authenticated():
            return HttpResponseNotLoggedIn()
        
        if user_name!=request.user.username:
            return HttpResponseNoPermission()

        try:
            from_user = User.objects.get(username=user_name)
            to_user = User.objects.get(username=friend_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if to_user not in from_user.friends.all():
            return HttpResponseAlreadyProcessed()
        
        from_user.friends.remove(to_user)
        from_user.save()
        return HttpResponseSuccessDelete()

    else:
        return HttpResponseNotAllowed(['POST', 'DELETE'])


def repositories(request):
    if request.method == 'POST':
        if not request.user.is_authenticated():
            return HttpResponseNotLoggedIn()
        
        try:
            req_data = json.loads(request.body.decode())
            repo_name = req_data['repo_name']
            owner_name = req_data['owner']

            if owner_name != request.user.username:
                return HttpResponseNoPermission()

            raw_travel_start_date = req_data['travel_start_date']
            raw_travel_end_date = req_data['trave_end_date']
            visibility = req_data['visibility']
            collaborators_name = req_data['collaborators']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        if visibility<0 or visibility>2:
            return HttpResponseInvalidInput()

        try:
            owner = User.objects.get(username=owner_name)
            collaborators = []
            for name in collaborators_name:
                user = User.objects.get(username=name)
                collaborators.append(user)
            if owner_name not in collaborators_name:
                collaborators.append(owner)
        except(User.DoesNotExist) as e:
            return HttpResponseInvalidInput()
        
        try:
            travel_start_date = datetime.strptime(raw_travel_start_date, '%Y-%m-%d')
            travel_start_date = timezone.make_aware(travel_start_date)
            travel_end_date = datetime.strptime(raw_travel_end_date, '%Y-%m-%d')
            travel_end_date = timezone.make_aware(travel_end_date)
        except(ValueError) as e:
            return HttpResponseInvalidInput()

        new_repo = Repository(repo_name=repo_name, owner=owner, travel_start_date=travel_start_date,
                                 travel_end_date=travel_end_date, visibility=visibility)
        new_repo.save()
        for user in collaborators:
            new_repo.collaborators.add(user)
        new_repo.save()

        collaborators_censored = []
        for user in new_repo.collaborators.all():
            collaborators_censored.append({
                'username' : user.username,
                # profile_picture
                'bio' : user.bio,
            })
        response_dict = {
            'repo_id' : new_repo.repo_id,
            'repo_name' : new_repo.repo_name,
            'owner' : new_repo.owner.username,
            'travel_start_date' : new_repo.travel_start_date.strftime('%Y-%m-%d'),
            'travel_end_date' : new_repo.travel_end_date.strftime('%Y-%m-%d'),
            'visibility' : new_repo.visibility,
            'collaborators' : collaborators_censored,
        }
        return HttpResponseSuccessUpdate(response_dict)

    elif request.method == 'GET':
        collaborator_name = request.GET.get('username', None)
        owner_name = request.GET.get('owner', None)
        current_user = request.user

        if collaborator_name == None and owner_name == None:
            return HttpResponseBadRequest()
            
        elif collaborator_name != None and owner_name == None:
            try:
                collaborator = User.objects.get(username=collaborator_name)
            except(User.DoesNotExist) as e:
                return HttpResponseInvalidInput()
            
            repository_list = []

            for repository in collaborator.repositories.all():
                if ( (current_user in repository.collaborators) or (repository.visibility == Scope.PUBLIC) or
                            (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(current_user.friends.all(), repository.collaborators.all()) ) ):
                    collaborator_list = []
                    for user in repository.collaborators:
                        collaborator_list.append({
                            'username' : user.username,
                            # profile_picture
                            'bio': user.bio,
                        })
                    repository_list.append({
                        'repo_id' : repository.repo_id,
                        'repo_name' : repository.repo_name,
                        'owner' : repository.owner.username,
                        'travel_start_date' : repository.travel_start_date.strftime('%Y-%m-%d'),
                        'travel_end_date' : repository.travel_end_date.strftime('%Y-%m-%d'),
                        'visibility' : repository.visibility,
                        'collaborators' : collaborator_list,
                    })

            return HttpResponseSuccessGet(repository_list)
                

        
        elif collaborator_name == None and owner_name != None:
            try:
                owner = User.objects.get(username=owner_name)
            except(User.DoesNotExist) as e:
                return HttpResponseInvalidInput()

            repository_list = []
            
            for repository in owner.repositories.all():
                if repository.owner != owner:
                    continue
                if ( (current_user in repository.collaborators) or (repository.visibility == Scope.PUBLIC) or
                            (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(current_user.friends.all(), repository.collaborators.all()) ) ):
                    collaborator_list = []
                    for user in repository.collaborators:
                        collaborator_list.append({
                            'username' : user.username,
                            # profile_picture
                            'bio': user.bio,
                        })
                    repository_list.append({
                        'repo_id' : repository.repo_id,
                        'repo_name' : repository.repo_name,
                        'owner' : repository.owner.username,
                        'travel_start_date' : repository.travel_start_date.strftime('%Y-%m-%d'),
                        'travel_end_date' : repository.travel_end_date.strftime('%Y-%m-%d'),
                        'visibility' : repository.visibility,
                        'collaborators' : collaborator_list,
                    })

            return HttpResponseSuccessGet(repository_list)

        else:   # collaborator_name != None and owner_name != None
            return HttpResponseBadRequest()

    else:
        return HttpResponseNotAllowed(['POST', 'GET'])


def repositoryID(request, repo_id):
    if request.method == 'GET':
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if ( not request.user.is_authenticated ) and ( repository.visibility != Scope.PUBLIC ):
            return HttpResponseNoPermission()

        if ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends, repository.collaborators) ) ):
            
            collaborator_list = []
            for user in repository.collaborators:
                collaborator_list.append({
                    'username' : user.username,
                    # profile_picture
                    'bio': user.bio,
                })
            
            response_dict = {
                'repo_id' : repository.repo_id,
                'repo_name' : repository.repo_name,
                'owner' : repository.owner.username,
                'travel_start_date' : repository.travel_start_date.strftime('%Y-%m-%d'),
                'travel_end_date' : repository.travel_end_date.strftime('%Y-%m-%d'),
                'visibility' : repository.visibility,
                'collaborators' : collaborator_list,
            }
            return HttpResponseSuccessGet(response_dict)
        
        else:
            return HttpResponseNoPermission()
    
    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if repository.owner != request.user:
            return HttpResponseNoPermission()
        
        repository.delete()
        return HttpResponseSuccessDelete()
    
    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            req_data = json.loads(request.body.decode())
            repo_name = req_data['repo_name']
            owner_name = req_data['owner']

            try:
                new_owner = User.objects.get(username=owner_name)
            except(User.DoesNotExist) as e:
                return HttpResponseInvalidInput()

            raw_travel_start_date = req_data['travel_start_date']
            raw_travel_end_date = req_data['trave_end_date']
            visibility = req_data['visibility']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        if visibility<0 or visibility>2:
            return HttpResponseInvalidInput()
        
        try:
            travel_start_date = datetime.strptime(raw_travel_start_date, '%Y-%m-%d')
            travel_start_date = timezone.make_aware(travel_start_date)
            travel_end_date = datetime.strptime(raw_travel_end_date, '%Y-%m-%d')
            travel_end_date = timezone.make_aware(travel_end_date)
        except(ValueError) as e:
            return HttpResponseInvalidInput()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if repository.owner != request.user:
            return HttpResponseNoPermission()
        
        repository.repo_name = repo_name
        repository.owner = new_owner
        repository.travel_start_date = travel_start_date
        repository.travel_end_date = travel_end_date
        repository.visibility = visibility
        repository.save()

        collaborators = []
        for user in repository.collaborators.all():
            collaborators.append({
                'username' : user.username,
                # profile_picture
                'bio' : user.bio,
            })
        response_dict = {
            'repo_id' : repository.repo_id,
            'repo_name' : repository.repo_name,
            'owner' : repository.owner.username,
            'travel_start_date' : repository.travel_start_date.strftime('%Y-%m-%d'),
            'travel_end_date' : repository.travel_end_date.strftime('%Y-%m-%d'),
            'visibility' : repository.visibility,
            'collaborators' : collaborators,
        }
        return HttpResponseSuccessUpdate(response_dict)
    
    else:
        return HttpResponseNotAllowed(['GET', 'DELETE','PUT'])
        

def repositoryCollaborators(request, repo_id):
    if request.method == 'GET':
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if ( not request.user.is_authenticated ) and ( repository.visibility != Scope.PUBLIC ):
            return HttpResponseNoPermission()

        if ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends, repository.collaborators) ) ):
            
            collaborator_list = []
            for user in repository.collaborators:
                collaborator_list.append({
                    'username' : user.username,
                    # profile_picture
                    'bio': user.bio,
                })
            return HttpResponseSuccessGet(collaborator_list)
        
        else:
            return HttpResponseNoPermission()

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if request.user not in repository.collaborators:
            return HttpResponseNoPermission()
        
        try:
            req_data = json.loads(request.body.decode())
            new_collaborators = []
            for invited in req_data:
                invited_name = invited['username']
                user = User.objects.get(username=invited_name)
                new_collaborators.append(user)
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()
        except(User.DoesNotExist) as e:
            return HttpResponseInvalidInput()

        for user in new_collaborators:
            if user in repository.collaborators:
                return HttpResponseAlreadyProcessed()
        
        for user in new_collaborators:
            repository.collaborators.add(user)

        return HttpResponseSuccessUpdate()            

    else:
        return HttpResponseNotAllowed(['GET', 'POST'])

def repositoryCollaboratorID(request, repo_id, collaborator_name):
    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            repository = Repository.objects.get(repo_id=repo_id)
            deleted = User.objects.get(username=collaborator_name)
        except(Repository.DoesNotExist, User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if deleted != request.user:
            return HttpResponseNoPermission()
        
        if deleted not in repository:
            return HttpResponseAlreadyProcessed()
        
        repository.collaborator.remove(deleted)
        return HttpResponseSuccessDelete()

    else:
        return HttpResponseNotAllowed(['DELETE'])
