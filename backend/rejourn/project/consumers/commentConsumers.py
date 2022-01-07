from channels.generic.websocket import AsyncWebsocketConsumer
import json


# /ws/comments/?parent_type=post&parent_id=1
class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.parent_type = self.scope['url_route']['kwargs']['parent_type']
        self.parent_id = self.scope['url_route']['kwargs']['parent_id']

        self.group_name = '%s_%d' % self.parent_type % self.parent_id

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        author_username = text_data_json['author_username']

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'new_comment',
                'author_username': author_username
            }
        )

    async def new_comment(self, event):
        author_username = event['author_username']

        # sends data only if the new comment was written by
        # another user, not by the current user oneself
        if self.scope['user'].username != author_username:
            await self.send(text_data='new_comment')
