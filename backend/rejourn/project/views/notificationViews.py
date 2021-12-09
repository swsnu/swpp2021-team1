import json
from json.decoder import JSONDecodeError
from datetime import timedelta

from django.http.response import HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from project.models.models import Notification
from project.httpResponse import *
from project.enum import NoticeType, NoticeAnswerType
from project.views.postViews import get_post_dict
from project.views.discussionViews import get_discussion_dict
from project.views.repositoryViews import get_repository_dict


UPLOADED_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"


def get_notification_dict(notification):
    from_user_info = {
        'username' : notification.user.username,
        'bio' : notification.user.bio,
    }
    if bool(notification.user.profile_picture):
        from_user_info['profile_picture'] = notification.user.profile_picture.url

    notification_dict = {
        'notification_id' : notification.notification_id,
        'time' : timezone.make_naive(notification.time).strftime(UPLOADED_TIME_FORMAT),
        'classification' : notification.classification,
        'from_user' : from_user_info,
        'new' : notification.new,
    }
    if notification.classification == NoticeType.FRIEND_REQUEST:
        pass
    elif notification.classification == NoticeType.INVITATION:
        notification_dict['repository'] = get_repository_dict(notification.repository)
    elif notification.classification == NoticeType.NEW_POST:
        notification_dict['repository'] = get_repository_dict(notification.repository)
        notification_dict['post'] = get_post_dict(notification.post, preview=True)
    elif notification.classification == NoticeType.NEW_DISCUSSION:
        notification_dict['repository'] = get_repository_dict(notification.repository)
        notification_dict['discussion'] = get_discussion_dict(notification.discussion, preview=True)
    elif notification.classification == NoticeType.LIKE:
        if notification.post is not None:
            notification_dict['post'] = get_post_dict(notification.post, preview=True)
        else:   # notification.discussion is not None
            notification_dict['discussion'] = get_discussion_dict(notification.discussion, preview=True)
    elif notification.classification == NoticeType.COMMENT:
        if notification.post is not None:
            notification_dict['post'] = get_post_dict(notification.post, preview=True)
        else:   # notification.discussion is not None
            notification_dict['discussion'] = get_discussion_dict(notification.discussion, preview=True)
    else:   # notification.classification == NoticeType.FORK
        notification_dict['repository'] = get_repository_dict(notification.repository)
    return notification_dict

def get_notification_list(user, notice_type=None):
    notification_set = Notification.objects.filter(user=user)
    if notice_type is not None:
        notification_set = notification_set.filter(classification=notice_type)
    notification_set = notification_set.order_by('-notification_id')

    delete_list = []
    friend_request_list = []
    invitaion_list = []
    others_list = []
    like_count_dict = {}
    comment_count_dict = {}
    fork_count_dict = {}
    for notification in notification_set:
        if notification.time + timedelta(days=14) >= timezone.now():
            notification_dict = get_notification_dict(notification)
            if notification.classification == NoticeType.FRIEND_REQUEST:
                friend_request_list.append(notification_dict)
            elif notification.classfication == NoticeType.INVITATION:
                invitaion_list.append(notification_dict)
            else:
                if notification.classification == NoticeType.COMMENT:
                    if comment_count_dict.get(notification.id) is None:
                        comment_count_dict[notification.id] = 1
                        others_list.append(notification_dict)
                    else:
                        comment_count_dict[notification.id] += 1
                elif notification.classification == NoticeType.LIKE:
                    if like_count_dict.get(notification.id) is None:
                        like_count_dict[notification.id] = 1
                        others_list.append(notification_dict)
                    else:
                        like_count_dict[notification.id] += 1
                elif notification.classification == NoticeType.FORK:
                    if fork_count_dict.get(notification.id) is None:
                        fork_count_dict[notification.id] = 1
                        others_list.append(notification_dict)
                    else:
                        fork_count_dict[notification.id] += 1
                else:
                    others_list.append(notification_dict)
        else:
            delete_list.append(notification)

        if notification.new == True:
            notification.new = False
            notification.save()

    left_size = len(delete_list)
    while(left_size != 0):
        notification = delete_list.pop()
        left_size -= 1
        if (notification.classification != NoticeType.FRIEND_REQUEST
            and notification.classification != NoticeType.INVITATION):
            notification.delete()

    for notification_dict in others_list:
        notification_id = notification_dict['notification_id']
        if comment_count_dict.get(notification.id) is not None:
            notification_dict['count'] = comment_count_dict[notification_id]
        elif like_count_dict.get(notification.id) is not None:
            notification_dict['count'] = like_count_dict[notification_id]
        elif fork_count_dict.get(notification.id) is not None:
            notification_dict['count'] = fork_count_dict[notification_id]
    notification_list = friend_request_list + invitaion_list + others_list

    return notification_list


# /api/notifications/
@require_http_methods(['GET', 'DELETE'])
@ensure_csrf_cookie
def notifications(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        notice_query = request.GET.get("notice_type", None)
        if notice_query == 'FRIEND_REQUEST':
            notice_type = NoticeType.FRIEND_REQUEST
        elif notice_query == 'INVITATION':
            notice_type = NoticeType.INVITATION
        else:
            notice_type = None

        notification_list = get_notification_list(request.user, notice_type=notice_type)
        return HttpResponseSuccessGet(notification_list)

    # request.method == 'DELETE'
    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()
    
    notification_list = list(Notification.objects.filter(user=request.user))
    left_size = len(notification_list)
    while(left_size != 0):
        notification = notification_list.pop()
        left_size -= 1
        if (notification.classification != NoticeType.FRIEND_REQUEST
            and notification.classification != NoticeType.INVITATION):
            notification.delete()

    notification_list = get_notification_list(request.user)
    return HttpResponseSuccessDelete(notification_list)


# /api/notifications/<int:notification_id>
@require_http_methods(['POST', 'DELETE'])
@ensure_csrf_cookie
def notificationID(request, notification_id):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

        try:
            notification = Notification.objects.get(notification_id=notification_id)
        except Notification.DoesNotExist:
            return HttpResponseNotExist()

        if notification.user != request.user:
            return HttpResponseNoPermission()

        try:
            req_data = json.loads(request.body.decode())
            answer = req_data['answer']
        except (KeyError, JSONDecodeError):
            return HttpResponseBadRequest()

        if (notification.classification != NoticeType.FRIEND_REQUEST
            and notification.classification != NoticeType.INVITATION):
            return HttpResponseInvalidInput()

        if answer == NoticeAnswerType.YES:
            if notification.classification == NoticeType.FRIEND_REQUEST:
                subject_user = notification.user
                object_user = notification.from_user
                subject_user.friends.add(object_user)
                subject_user.save()
            else: # notification.classification == NoticeType.INVITATION
                repository = notification.repository
                subject_user = notification.user
                repository.collaborators.add(subject_user)
                repository.save()
        elif answer == NoticeAnswerType.NO:
            pass
        else:
            return HttpResponseInvalidInput()
        notification.delete()

        notification_list = get_notification_list(request.user)
        return HttpResponseSuccessUpdate(notification_list)

    # request.method == 'DELETE'
    if not request.user.is_authenticated:
            return HttpResponseNotLoggedIn()

    try:
        notification = Notification.objects.get(notification_id=notification_id)
    except Notification.DoesNotExist:
        return HttpResponseNotExist()

    if notification.user != request.user:
        return HttpResponseNoPermission()
    
    notification.delete()

    notification_list = get_notification_list(request.user)
    return HttpResponseSuccessDelete(notification_list)


# /api/session/notifications/
@require_http_methods(['GET'])
@ensure_csrf_cookie
def sessionNotifications(request):

    if not request.user.is_authenticated:
        return HttpResponseNotLoggedIn()

    response_dict = {
        'count' : Notification.objects.filter(user=request.user, new=True).count()
    }

    return HttpResponseSuccessGet(response_dict)
