from datetime import timedelta
from django.utils import timezone

import json
from project.enum import NoticeType
from channels.generic.websocket import JsonWebsocketConsumer
from project.views.notificationViews import get_notification_dict
from project.models import Notification
from django.db.models.signals import post_save
from django.dispatch import receiver

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()

def update_count(user):
    new_notification_set = Notification.objects.filter(user=user, new=True)
    not_old_notification_set = new_notification_set.filter(time__gte=timezone.now()-timedelta(days=14))
    request_notification_set_1 = new_notification_set.filter(classification=NoticeType.FRIEND_REQUEST)
    request_notification_set_2 = new_notification_set.filter(classification=NoticeType.INVITATION)
    request_notification_set = request_notification_set_1.union(request_notification_set_2)
    notification_set = not_old_notification_set.union(request_notification_set)

    response_dict = {
        'count' : notification_set.count()
    }
    async_to_sync(channel_layer.group_send)(
        "notifications_%s" % user.username,
        {
            'type': 'notification_count_update',
            'text': json.dumps(response_dict)
        }
    )

@receiver(post_save, sender=Notification)
def notification_handler(sender, instance, created, **kwargs):
    receiver = instance.user
    # new notification
    if created:
        async_to_sync(channel_layer.group_send)(
            "notifications_%s" % receiver.username,
            {
                'type': 'notification_new',
                'text': json.dumps(get_notification_dict(instance))
            }
        )
    # update number of notifications
    update_count(receiver)


class NotificationConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.username = self.scope['user'].username
        async_to_sync(self.channel_layer.group_add)(
            'notifications_%s' % self.username, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            'notifications_%s' % self.username, self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # Mark single notification as 'read'
        if text_data_json['type'] == 'notification_read':
            notification_id = text_data_json['notification_id']
            notification = Notification.objects.get(notification_id=notification_id)
            if notification.new:
                notification.new = False
                notification.save()
        elif text_data_json['type'] == 'notification_get_count':
            update_count(self.scope['user'])

    def notification_new(self, event):
        self.send(text_data=event['text'])

    def notification_count_update(self, event):
        self.send(text_data=event['text'])
