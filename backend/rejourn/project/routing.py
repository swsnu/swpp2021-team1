from django.urls import path

from project.consumers import notificationConsumers

websocket_urlpatterns = [
    path('ws/notifications/',
         notificationConsumers.NotificationConsumer.as_asgi(),
         name="notification"
         )
]
