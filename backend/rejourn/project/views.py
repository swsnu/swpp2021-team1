from json.decoder import JSONDecodeError
from django.http.response import HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from .httpResponse import *
from .enum import Scope
from django.http import HttpResponse
from .models import User, Repository, Discussion, DiscussionComment, Post, PostComment, PhotoInPost, Photo, PhotoTag
from django.contrib.auth import authenticate, login, logout
import json
from datetime import datetime
from django.utils import timezone

from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

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


@ensure_csrf_cookie
def session(request):
    if request.method == 'GET':
        
        session_user = request.user

        if not session_user.is_authenticated:
            return HttpResponseNotLoggedIn()

        friends = []
        for friend in session_user.friends.all():
            if friend.profile_picture == None:
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
        if session_user.profile_picture != None:
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
            if friend.profile_picture == None:
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
        if request.user.profile_picture != None:
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
        if user.profile_picture != None:
            response_dict['profile_picture'] = user.profile_picture.url
        return HttpResponseSuccessUpdate(response_dict)
            
    elif request.method == 'GET':
        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        friends_list = []
        for friend in user.friends.all():
            if friend.profile_picture == None:
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
        if user.profile_picture != None:
            response_dict_original['profile_picture'] = user.profile_picture.url

        response_dict_censored = {
            'username' : user.username,
            'bio' : user.bio,
            'visibility' : user.visibility,
        }
        if user.profile_picture != None:
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
            if friend.profile_picture == None:
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
            if friend.profile_picture == None:
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
            if friend.profile_picture == None:
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


@ensure_csrf_cookie
def repositories(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            req_data = json.loads(request.body.decode())
            repo_name = req_data['repo_name']
            owner_name = req_data['owner']

            if owner_name != request.user.username:
                return HttpResponseNoPermission()

            raw_travel_start_date = req_data['travel_start_date']
            raw_travel_end_date = req_data['travel_end_date']
            visibility = req_data['visibility']
            collaborators_list = req_data['collaborators']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        if visibility<0 or visibility>2:
            return HttpResponseInvalidInput()

        try:
            owner = User.objects.get(username=owner_name)
            collaborators = []
            for collaborator_dict in collaborators_list:
                user = User.objects.get(username=collaborator_dict['username'])
                collaborators.append(user)
            if owner not in collaborators:
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
            if user.profile_picture == None:
                collaborators_censored.append({
                    'username' : user.username,
                    'bio' : user.bio,
                })
            else:
                collaborators_censored.append({
                    'username' : user.username,
                    'profile_picture' : user.profile_picture.url,
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
                if ( (current_user in repository.collaborators.all()) or (repository.visibility == Scope.PUBLIC) or
                            (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(current_user.friends.all(), repository.collaborators.all()) ) ):
                    collaborator_list = []
                    for user in repository.collaborators.all():
                        if user.profile_picture == None:
                            collaborator_list.append({
                                'username' : user.username,
                                'bio' : user.bio,
                            })
                        else:
                            collaborator_list.append({
                                'username' : user.username,
                                'profile_picture' : user.profile_picture.url,
                                'bio' : user.bio,
                            })
                    repository_list.insert(0, {
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
                if ( (current_user in repository.collaborators.all()) or (repository.visibility == Scope.PUBLIC) or
                            (repository.visibility == Scope.FRIENDS_ONLY and
                            have_common_user(current_user.friends.all(), repository.collaborators.all()) ) ):
                    collaborator_list = []
                    for user in repository.collaborators.all():
                        if user.profile_picture == None:
                            collaborator_list.append({
                                'username' : user.username,
                                'bio' : user.bio,
                            })
                        else:
                            collaborator_list.append({
                                'username' : user.username,
                                'profile_picture' : user.profile_picture.url,
                                'bio' : user.bio,
                            })
                    repository_list.insert(0, {
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


@ensure_csrf_cookie
def repositoryID(request, repo_id):
    if request.method == 'GET':
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if ( not request.user.is_authenticated ) and ( repository.visibility != Scope.PUBLIC ):
            return HttpResponseNoPermission()

        if ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
            
            collaborator_list = []
            for user in repository.collaborators.all():
                if user.profile_picture == None:
                    collaborator_list.append({
                        'username' : user.username,
                        'bio' : user.bio,
                    })
                else:
                    collaborator_list.append({
                        'username' : user.username,
                        'profile_picture' : user.profile_picture.url,
                        'bio' : user.bio,
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
            raw_travel_end_date = req_data['travel_end_date']
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
            if user.profile_picture == None:
                collaborators.append({
                    'username' : user.username,
                    'bio' : user.bio,
                })
            else:
                collaborators.append({
                    'username' : user.username,
                    'profile_picture' : user.profile_picture.url,
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
        return HttpResponseNotAllowed(['GET', 'DELETE', 'PUT'])
        

@ensure_csrf_cookie
def repositoryCollaborators(request, repo_id):
    if request.method == 'GET':
        
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if ( not request.user.is_authenticated ) and ( repository.visibility != Scope.PUBLIC ):
            return HttpResponseNoPermission()

        if ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and 
                have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
            
            collaborator_list = []
            for user in repository.collaborators.all():
                if user.profile_picture == None:
                    collaborator_list.append({
                        'username' : user.username,
                        'bio' : user.bio,
                    })
                else:
                    collaborator_list.append({
                        'username' : user.username,
                        'profile_picture' : user.profile_picture.url,
                        'bio' : user.bio,
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
        
        if request.user not in repository.collaborators.all():
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

        for user in new_collaborators.all():
            repository.collaborators.add(user)
        repository.save()

        return HttpResponseSuccessUpdate()            

    else:
        return HttpResponseNotAllowed(['GET', 'POST'])

@ensure_csrf_cookie
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
        
        repository.collaborator.remove(deleted)
        return HttpResponseSuccessDelete()

    else:
        return HttpResponseNotAllowed(['DELETE'])

@ensure_csrf_cookie
def discussions(request, repo_id):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            title = req_data['title']
            text = req_data['text']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        new_discussion = Discussion(repository=repository, author=request.user, title=title, text=text)
        new_discussion.save()


        response_dict = {
            'discussion_id' : new_discussion.discussion_id,
            'repo_id' : new_discussion.repository.repo_id,
            'author' : new_discussion.author.username,
            'title' : new_discussion.title,
            'text' : new_discussion.text,
            'post_time' : new_discussion.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessUpdate(response_dict)
    elif request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        discussion_list = []
            
        discussion_filtered = Discussion.objects.filter(repository=repository)
        for discussion in discussion_filtered:
            discussion_list.append({
                'discussion_id': discussion.discussion_id,
                'repo_id': discussion.repository.repo_id,
                'author': discussion.author.username,
                'title': discussion.title,
                'text': discussion.text,
                'post_time': discussion.post_time.strftime('%Y-%m-%d %H:%M:%S')
            })
        return HttpResponseSuccessGet(discussion_list)
    else:
        return HttpResponseNotAllowed(['POST', 'GET'])

def discussionID(request, discussion_id):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()
        repository = Repository.objects.get(repo_id=discussion.repository.repo_id)

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()
        comment_list = []
        for comment in DiscussionComment.objects.filter(discussion_id=discussion_id):
            comment_list.append({
                'comment_id' : comment.discussion_comment_id,
                'author' : comment.author.username,
                'text' : comment.text,
                'parent_id' : comment.discussion.discussion_id,
                'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            })
        response_dict = {
            'discussion_id' : discussion.discussion_id,
            'repo_id' : discussion.repository.repo_id,
            'author' : discussion.author.username,
            'title' : discussion.title,
            'text' : discussion.text,
            'post_time' : discussion.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            'comments' : comment_list,
        }
        return HttpResponseSuccessGet(response_dict)
        

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        repository = Repository.objects.get(repo_id=discussion.repository.repo_id)

        if not request.user == discussion.author:
            return HttpResponseNoPermission()
        discussion.delete()
        return HttpResponseSuccessDelete()

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()
        if not request.user == discussion.author:
            return HttpResponseNoPermission()
        try:
            req_data = json.loads(request.body.decode())
            title = req_data['title']
            text = req_data['text']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()
        if title == "" or text == "":
            return HttpResponseInvalidInput()

        repository = Repository.objects.get(repo_id=discussion.repository.repo_id)


        
        discussion.title = title
        discussion.text = text
        discussion.save()

        comment_list = []
        for comment in DiscussionComment.objects.filter(discussion_id=discussion_id):
            comment_list.append({
                'comment_id' : comment.discussion_comment_id,
                'author' : comment.author.username,
                'text' : comment.text,
                'parent_id' : comment.discussion.discussion_id,
                'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            })
        response_dict = {
            'discussion_id' : discussion.discussion_id,
            'repo_id' : discussion.repository.repo_id,
            'author' : discussion.author.username,
            'title' : discussion.title,
            'text' : discussion.text,
            'post_time' : discussion.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            'comments' : comment_list,
        }
        return HttpResponseSuccessUpdate(response_dict)
    else:
        return HttpResponseNotAllowed(['PUT','DELETE', 'GET'])


def discussionComments(request, discussion_id):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()
        try:
            repository = Repository.objects.get(repo_id=discussion.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            text = req_data['text']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        new_comment = DiscussionComment(author=request.user, text=text, discussion=discussion)
        new_comment.save()


        response_dict = {
            'comment_id' : new_comment.discussion_comment_id,
            'author' : new_comment.author.username,
            'text' : new_comment.text,
            'parent_id' : new_comment.discussion.discussion_id,
            'post_time' : new_comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessUpdate(response_dict)
        
    elif request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()
        try:
            repository = Repository.objects.get(repo_id=discussion.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        comment_list = []
            
        comment_filtered = DiscussionComment.objects.filter(discussion=discussion)
        for comment in comment_filtered:
            comment_list.append({
                'comment_id' : comment.discussion_comment_id,
                'author' : comment.author.username,
                'text' : comment.text,
                'parent_id' : comment.discussion.discussion_id,
                'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            })
        return HttpResponseSuccessGet(comment_list)
    else:
        return HttpResponseNotAllowed(['POST', 'GET'])


def discussionCommentID(request, discussion_id, discussion_comment_id):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            comment = DiscussionComment.objects.get(discussion_comment_id=discussion_comment_id)
        except(DiscussionComment.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            discussion = Discussion.objects.get(discussion_id=comment.discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            repository = Repository.objects.get(repo_id=discussion.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

    
        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()
        response_dict = {
            'comment_id' : comment.discussion_comment_id,
            'author' : comment.author.username,
            'text' : comment.text,
            'parent_id' : comment.discussion.discussion_id,
            'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessGet(response_dict)
        

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            comment = DiscussionComment.objects.get(discussion_comment_id=discussion_comment_id)
        except(DiscussionComment.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            discussion = Discussion.objects.get(discussion_id=comment.discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            repository = Repository.objects.get(repo_id=discussion.repo_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user == comment.author:
            return HttpResponseNoPermission()
        comment.delete()
        return HttpResponseSuccessDelete()

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            req_data = json.loads(request.body.decode())
            text = req_data['text']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()
        if text == "":
            return HttpResponseInvalidInput()
            
        try:
            comment = DiscussionComment.objects.get(discussion_comment_id=discussion_comment_id)
        except(DiscussionComment.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            discussion = Discussion.objects.get(discussion_id=comment.discussion_id)
        except(Discussion.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            repository = Repository.objects.get(repo_id=discussion.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user == comment.author:
            return HttpResponseNoPermission()
        

        comment.text = text
        comment.save()

        response_dict = {
            'comment_id' : comment.discussion_comment_id,
            'author' : comment.author.username,
            'text' : comment.text,
            'parent_id' : comment.discussion.discussion_id,
            'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessUpdate(response_dict)
    else:
        return HttpResponseNotAllowed(['PUT','DELETE', 'GET'])


def userPosts(request, user_name):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            user = User.objects.get(username=user_name)
        except(User.DoesNotExist) as e:
            return HttpResponseNotExist()

        post_filtered = Post.objects.filter(author=user)
        post_list = []
        for post in post_filtered:
            repository = Repository.objects.get(repo_id=post.repository.repo_id)

            if ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                    or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):

                photo_list = []
                for photo in PhotoInPost.objects.filter(post_id=post.post_id):
                    photo_list.append({'photo_id': photo.photo_id, 'local_tag': photo.local_tag, 'image':"image.photo_link"})

                post_list.append({
                    'post_id': post.post_id,
                    'repo_id': post.repository.repo_id,
                    'author': post.author.username,
                    'title': post.title,
                    'text': post.text,
                    'post_time': post.post_time.strftime('%Y-%m-%d %H:%M:%S'),
                    'photos': photo_list
                })
            else:
                return HttpResponseNoPermission()

        return HttpResponseSuccessGet(post_list)
    else:
        return HttpResponseNotAllowed(['GET'])

def repoPosts(request, repo_id):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            title = req_data['title']
            text = req_data['text']
            photos = req_data['photos']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        new_post = Post(repository=repository, author=request.user, title=title, text=text)
        new_post.save()

        for ph in photos:
            i = 0
            try:
                photo = Photo.objects.get(photo_id=ph.get('photo_id'))
            except(Photo.DoesNotExist) as e:
                return HttpResponseNotExist()
            new_photoinpost = PhotoInPost(post=new_post, photo=photo, order=i, local_tag=ph.get('local_tag'))
            i += 1
            new_photoinpost.save()



        response_dict = {
            'post_id' : new_post.post_id,
            'repo_id' : new_post.repository.repo_id,
            'author' : new_post.author.username,
            'title' : new_post.title,
            'text' : new_post.text,
            'post_time' : new_post.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            'photos' : photos
        }
        return HttpResponseSuccessUpdate(response_dict)

    elif request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
                return HttpResponseNoPermission()

        post_list = []
            
        post_filtered = Post.objects.filter(repository=repository)
        for post in post_filtered:


            photo_list = []
            for photo in PhotoInPost.objects.filter(post_id=post.post_id):
                photo_list.append({'photo_id': photo.photo_id, 'local_tag': photo.local_tag, 'image':"image.photo_link"})

            post_list.append({
                'post_id': post.post_id,
                'repo_id': post.repository.repo_id,
                'author': post.author.username,
                'title': post.title,
                'text': post.text,
                'post_time': post.post_time.strftime('%Y-%m-%d %H:%M:%S'),
                'photos': photo_list
            })
        return HttpResponseSuccessGet(post_list)
    else:
        return HttpResponseNotAllowed(['POST', 'GET'])

def postID(request, post_id):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            post = Post.objects.get(post_id=post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()
        repository = Repository.objects.get(repo_id=post.repository_id)
        if not ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
            return HttpResponseNoPermission()

        photo_list = []
        for photo in PhotoInPost.objects.filter(post_id=post.post_id):
            photo_list.append({'photo_id': photo.photo_id, 'local_tag': photo.local_tag, 'image':"image.photo_link"})

        response_dict = {
            'post_id': post.post_id,
            'repo_id': post.repository.repo_id,
            'author': post.author.username,
            'title': post.title,
            'text': post.text,
            'post_time': post.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            'photos': photo_list
        }
        return HttpResponseSuccessGet(response_dict)
        

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            post = Post.objects.get(post_id=post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()
        repository = Repository.objects.get(repo_id=post.repository.repo_id)

        if not request.user == post.author:
            return HttpResponseNoPermission()
        post.delete()
        return HttpResponseSuccessDelete()

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            post = Post.objects.get(post_id=post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()
        if not request.user == post.author:
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            title = req_data['title']
            text = req_data['text']
            photos = req_data['photos']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()
        if title == "" or text == "":
            return HttpResponseInvalidInput()
            
        repository = Repository.objects.get(repo_id=post.repository.repo_id)
        
        
        post.title = title
        post.text = text
        post.save()

        for ph in photos:
            try:
                photo = Photo.objects.get(photo_id=ph.get('photo_id'))
            except(Photo.DoesNotExist) as e:
                return HttpResponseNotExist()

            try:
                photoinpost = PhotoInPost.objects.get(photo=photo)
            except(PhotoInPost.DoesNotExist) as e:
                return HttpResponseNotExist() 
            photoinpost.local_tag = ph.get('local_tag')
            photoinpost.save()



        response_dict = {
            'post_id' : post.post_id,
            'repo_id' : post.repository.repo_id,
            'author' : post.author.username,
            'title' : post.title,
            'text' : post.text,
            'post_time' : post.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            'photos' : photos
        }
        return HttpResponseSuccessUpdate(response_dict)
    else:
        return HttpResponseNotAllowed(['PUT','DELETE', 'GET'])

def postComments(request, post_id):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            post = Post.objects.get(post_id=post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()
        try:
            repository = Repository.objects.get(repo_id=post.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
                return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            text = req_data['text']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()

        new_comment = PostComment(author=request.user, text=text, post=post)
        new_comment.save()


        response_dict = {
            'comment_id' : new_comment.post_comment_id,
            'author' : new_comment.author.username,
            'text' : new_comment.text,
            'parent_id' : new_comment.post.post_id,
            'post_time' : new_comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessUpdate(response_dict)
        
    elif request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            post = Post.objects.get(post_id=post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()
        try:
            repository = Repository.objects.get(repo_id=post.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if not ( ( repository.visibility == Scope.PUBLIC ) or ( request.user in repository.collaborators.all() ) 
                or ( repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
                return HttpResponseNoPermission()

        comment_list = []
            
        comment_filtered = PostComment.objects.filter(post=post)
        for comment in comment_filtered:
            comment_list.append({
                'comment_id' : comment.post_comment_id,
                'author' : comment.author.username,
                'text' : comment.text,
                'parent_id' : comment.post.post_id,
                'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
            })
        return HttpResponseSuccessGet(comment_list)
    else:
        return HttpResponseNotAllowed(['POST', 'GET'])


def postCommentID(request, post_id, post_comment_id):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        
        try:
            comment = PostComment.objects.get(post_comment_id=post_comment_id)
        except(PostComment.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            post = Post.objects.get(post_id=comment.post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            repository = Repository.objects.get(repo_id=post.repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

    
        if not request.user in repository.collaborators.all():
            return HttpResponseNoPermission()
        response_dict = {
            'comment_id' : comment.post_comment_id,
            'author' : comment.author.username,
            'text' : comment.text,
            'parent_id' : comment.post.post_id,
            'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessGet(response_dict)
        

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            comment = PostComment.objects.get(post_comment_id=post_comment_id)
        except(PostComment.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            post = Post.objects.get(post_id=comment.post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()


        if not request.user == comment.author:
            return HttpResponseNoPermission()
        comment.delete()
        return HttpResponseSuccessDelete()

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()
        try:
            req_data = json.loads(request.body.decode())
            text = req_data['text']
        except(KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()
        if text == "":
            return HttpResponseInvalidInput()
            
        try:
            comment = PostComment.objects.get(post_comment_id=post_comment_id)
        except(PostComment.DoesNotExist) as e:
            return HttpResponseNotExist()

        try:
            post = Post.objects.get(post_id=comment.post_id)
        except(Post.DoesNotExist) as e:
            return HttpResponseNotExist()


        if not request.user == comment.author:
            return HttpResponseNoPermission()
        

        comment.text = text
        comment.save()

        response_dict = {
            'comment_id' : comment.post_comment_id,
            'author' : comment.author.username,
            'text' : comment.text,
            'parent_id' : comment.post.post_id,
            'post_time' : comment.post_time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        return HttpResponseSuccessUpdate(response_dict)
    else:
        return HttpResponseNotAllowed(['PUT', 'DELETE', 'GET'])


def photos(request, repo_id):
    if request.method == 'GET':
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()
        
        if ( (repository.visibility == Scope.PUBLIC) or (request.user in repository.collaborators.all())
                    or (repository.visibility == Scope.FRIENDS_ONLY and have_common_user(request.user.friends.all(), repository.collaborators.all()) ) ):
            
            photo_list = []
            for photo in Photo.objects.filter(repository=repository):

                try:
                    photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                    photo_tag_text = photo_tag.text
                except(PhotoTag.DoesNotExist) as e:
                    photo_tag_text = ""

                photo_list.append({
                    'photo_id' : photo.photo_id,
                    'repo_id' : photo.repository.repo_id,
                    'image' : photo.image_file.url,
                    'post_time' : photo.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                    'tag' : photo_tag_text,
                    'uploader' : photo.uploader.username,
                })

            return HttpResponseSuccessGet(photo_list)
        else:
            return HttpResponseNoPermission()

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()
        
        try:
            image_list = request.FILES.getlist('image')
        except(KeyError) as e:
            return HttpResponseBadRequest()

        for image in image_list:
            new_photo = Photo(repository=repository, image_file=image, 
                            uploader=request.user)
            new_photo.save()

        photo_list = []
        for photo in Photo.objects.filter(repository=repository):

            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except(PhotoTag.DoesNotExist) as e:
                photo_tag_text = ""

            photo_list.append({
                'photo_id' : photo.photo_id,
                'repo_id' : photo.repository.repo_id,
                'image' : photo.image_file.url,
                'post_time' : photo.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                'tag' : photo_tag_text,
                'uploader' : photo.uploader.username,
            })

        return HttpResponseSuccessUpdate(photo_list)

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()
        
        edited_photo_list = []
        try:
            req_data = json.loads(request.body.decode())
            for photo_info in req_data:

                try:
                    photo = Photo.objects.get(photo_id=photo_info['photo_id'])
                except(Photo.DoesNotExist) as e:
                    return HttpResponseInvalidInput()
                
                edited_photo_list.append( ( photo, photo_info['tag'] ) )
        except(JSONDecodeError, KeyError) as e:
            return HttpResponseBadRequest()

        for edited_photo in edited_photo_list:
            
            tag_count =  PhotoTag.objects.filter(photo=edited_photo[0], user=request.user).count()
            if edited_photo[1] == "" and tag_count == 1:
                photo_tag = PhotoTag.objects.get(photo=edited_photo[0], user=request.user)
                photo_tag.delete()
            elif edited_photo[1] != "" and tag_count == 1:
                photo_tag = PhotoTag.objects.get(photo=edited_photo[0], user=request.user)
                photo_tag.text = edited_photo[1]
                photo_tag.save()
            elif edited_photo[1] != "" and tag_count == 0:
                new_photo_tag = PhotoTag(photo=edited_photo[0], user=request.user, text=edited_photo[1] )
                new_photo_tag.save()

        photo_list = []
        for photo in Photo.objects.filter(repository=repository):

            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except(PhotoTag.DoesNotExist) as e:
                photo_tag_text = ""

            photo_list.append({
                'photo_id' : photo.photo_id,
                'repo_id' : photo.repository.repo_id,
                'image' : photo.image_file.url,
                'post_time' : photo.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                'tag' : photo_tag_text,
                'uploader' : photo.uploader.username,
            })

        return HttpResponseSuccessUpdate(photo_list)

    else: # request.method == DELETE
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except(Repository.DoesNotExist) as e:
            return HttpResponseNotExist()

        if request.user not in repository.collaborators.all():
            return HttpResponseNoPermission()
        
        deleted_photo_id_list = []
        try:
            req_data = json.loads(request.body.decode())
            for photo in req_data:
                deleted_photo_id_list.append(photo['photo_id'])
        except(JSONDecodeError, KeyError) as e:
            return HttpResponseBadRequest()

        deleted_photo_list = []
        for photo_id in deleted_photo_id_list:
            try:
                deleted_photo = Photo.objects.get(photo_id=photo_id)
                deleted_photo_list.append(deleted_photo)
            except(Photo.DoesNotExist) as e:
                return HttpResponseInvalidInput()

        for photo in deleted_photo_list:
            photo.delete()

        photo_list = []
        for photo in Photo.objects.filter(repository=repository):

            try:
                photo_tag = PhotoTag.objects.get(photo=photo, user=request.user)
                photo_tag_text = photo_tag.text
            except(PhotoTag.DoesNotExist) as e:
                photo_tag_text = ""

            photo_list.append({
                'photo_id' : photo.photo_id,
                'repo_id' : photo.repository.repo_id,
                'image' : photo.image_file.url,
                'post_time' : photo.post_time.strftime("%Y-%m-%d %H:%M:%S"),
                'tag' : photo_tag_text,
                'uploader' : photo.uploader.username,
            })

        return HttpResponseSuccessDelete(photo_list)

