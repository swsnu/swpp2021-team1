import json
from datetime import timedelta

from django.test import TestCase, Client
from django.utils import timezone

from project.models.models import Repository, User, Post, Discussion, Notification
from project.enum import Scope, NoticeType, NoticeAnswerType


class NotificationTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(
            username="TEST_USER_A",
            real_name="REAL_USER_A",
            password="TEST_PASSWORD_A"
        )
        User.objects.create_user(
            username="TEST_USER_B",
            real_name="REAL_USER_B",
            password="TEST_PASSWORD_B"
        )
        User.objects.create_user(
            username="TEST_USER_C",
            real_name="REAL_USER_C",
            password="TEST_PASSWORD_C"
        )
        User.objects.create_user(
            username="TEST_USER_D",
            real_name="REAL_USER_D",
            password="TEST_PASSWORD_D"
        )
        user_a = User.objects.get(user_id=1)
        user_b = User.objects.get(user_id=2)
        user_c = User.objects.get(user_id=3)
        user_d = User.objects.get(user_id=4)

        repo_a = Repository(
            repo_name="TEST_REPO_A",
            visibility=Scope.PUBLIC,
            owner=user_a,
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.collaborators.add(user_b)
        repo_a.save()

        repo_b = Repository(
            repo_name="TEST_REPO_B",
            visibility=Scope.PUBLIC,
            owner=user_c,
        )
        repo_b.save()
        repo_b.collaborators.add(user_c)
        repo_a.save()
        repo_c = Repository(
            repo_name="TEST_REPO_C",
            visibility=Scope.PUBLIC,
            owner=user_d,
        )
        repo_c.save()
        repo_c.collaborators.add(user_d)
        repo_a.save()

        post_a = Post(
            repository=repo_a,
            author=user_a,
            title="POST_A_TITLE",
            text="POST_A_TEXT"
        )
        post_a.save()
        post_b = Post(
            repository=repo_a,
            author=user_b,
            title="POST_B_TITLE",
            text="POST_B_TEXT"
        )
        post_b.save()
        post_c = Post(
            repository=repo_a,
            author=user_b,
            title="POST_C_TITLE",
            text="POST_C_TEXT"
        )
        post_c.save()
        post_d = Post(
            repository=repo_a,
            author=user_b,
            title="POST_D_TITLE",
            text="POST_D_TEXT"
        )
        post_d.save()
        discussion_a = Discussion(
            repository=repo_a,
            author=user_a,
            title="DISCUSSION_A_TITLE",
            text="DISCUSSION_A_TEXT"
        )
        discussion_a.save()
        discussion_b = Discussion(
            repository=repo_a,
            author=user_b,
            title="DISCUSSION_B_TITLE",
            text="DISCUSSION_B_TEXT"
        )
        discussion_b.save()
        discussion_c = Discussion(
            repository=repo_a,
            author=user_b,
            title="DISCUSSION_C_TITLE",
            text="DISCUSSION_C_TEXT"
        )
        discussion_c.save()
        discussion_d = Discussion(
            repository=repo_a,
            author=user_b,
            title="DISCUSSION_D_TITLE",
            text="DISCUSSION_D_TEXT"
        )
        discussion_d.save()

        today = timezone.now()

        friend_request_notice_1 = Notification(
            user=user_a,
            from_user=user_c,
            classification=NoticeType.FRIEND_REQUEST
        )
        friend_request_notice_1.save()
        friend_request_notice_1.time = today - timedelta(weeks=5)
        friend_request_notice_1.save()
        friend_request_notice_2 = Notification(
            user=user_a,
            from_user=user_d,
            classification=NoticeType.FRIEND_REQUEST
        )
        friend_request_notice_2.save()
        friend_request_notice_2.time = today - timedelta(days=1)
        friend_request_notice_2.save()

        invitation_notice_1 = Notification(
            user=user_a,
            from_user=user_c,
            classification=NoticeType.INVITATION,
            repository=repo_b
        )
        invitation_notice_1.save()
        invitation_notice_1.time = today - timedelta(weeks=5)
        invitation_notice_1.save()
        invitation_notice_2 = Notification(
            user=user_a,
            from_user=user_d,
            classification=NoticeType.INVITATION,
            repository=repo_c
        )
        invitation_notice_2.save()
        invitation_notice_2.time = today - timedelta(days=1)
        invitation_notice_2.save()

        post_notice_1 = Notification(
            user=user_a,
            from_user=user_b,
            post=post_b,
            repository=repo_a,
            classification=NoticeType.NEW_POST
        )
        post_notice_1.save()
        post_notice_1.time = today - timedelta(weeks=5)
        post_notice_1.save()
        post_notice_2 = Notification(
            user=user_a,
            from_user=user_b,
            post=post_c,
            repository=repo_a,
            classification=NoticeType.NEW_POST
        )
        post_notice_2.save()
        post_notice_2.time = today - timedelta(days=7)
        post_notice_2.save()
        post_notice_3 = Notification(
            user=user_a,
            from_user=user_b,
            post=post_d,
            repository=repo_a,
            classification=NoticeType.NEW_POST
        )
        post_notice_3.save()
        post_notice_3.time = today - timedelta(days=3)
        post_notice_3.save()
        discussion_notice_1 = Notification(
            user=user_a,
            from_user=user_b,
            discussion=discussion_b,
            repository=repo_a,
            classification=NoticeType.NEW_DISCUSSION
        )
        discussion_notice_1.save()
        discussion_notice_1.time = today - timedelta(days=11)
        discussion_notice_1.save()
        discussion_notice_2 = Notification(
            user=user_a,
            from_user=user_b,
            discussion=discussion_c,
            repository=repo_a,
            classification=NoticeType.NEW_DISCUSSION
        )
        discussion_notice_2.save()
        discussion_notice_2.time = today - timedelta(days=5)
        discussion_notice_2.save()
        discussion_notice_3 = Notification(
            user=user_a,
            from_user=user_b,
            discussion=discussion_d,
            repository=repo_a,
            classification=NoticeType.NEW_DISCUSSION
        )
        discussion_notice_3.save()
        discussion_notice_3.time = today - timedelta(days=1)
        discussion_notice_3.save()
        comment_notice_1 = Notification(
            user=user_a,
            from_user=user_b,
            post=post_a,
            repository=repo_a,
            classification=NoticeType.COMMENT
        )
        comment_notice_1.save()
        comment_notice_1.time = today - timedelta(days=6)
        comment_notice_1.save()
        comment_notice_2 = Notification(
            user=user_a,
            from_user=user_b,
            post=post_a,
            repository=repo_a,
            classification=NoticeType.COMMENT
        )
        comment_notice_2.save()
        comment_notice_2.time = today - timedelta(days=5)
        comment_notice_2.save()
        comment_notice_3 = Notification(
            user=user_a,
            from_user=user_b,
            post=post_a,
            repository=repo_a,
            classification=NoticeType.COMMENT
        )
        comment_notice_3.save()
        comment_notice_3.time = today - timedelta(days=4)
        comment_notice_3.save()
        comment_notice_4 = Notification(
            user=user_a,
            from_user=user_b,
            discussion=discussion_a,
            repository=repo_a,
            classification=NoticeType.COMMENT
        )
        comment_notice_4.save()
        comment_notice_4.time = today - timedelta(days=4)
        comment_notice_4.save()
        comment_notice_5 = Notification(
            user=user_a,
            from_user=user_b,
            discussion=discussion_a,
            repository=repo_a,
            classification=NoticeType.COMMENT
        )
        comment_notice_5.save()
        comment_notice_5.time = today - timedelta(days=3)
        comment_notice_5.save()
        comment_notice_6 = Notification(
            user=user_a,
            from_user=user_b,
            discussion=discussion_a,
            repository=repo_a,
            classification=NoticeType.COMMENT
        )
        comment_notice_6.save()
        comment_notice_6.time = today - timedelta(days=2)
        comment_notice_6.save()
        like_notice_1 = Notification(
            user=user_a,
            from_user=user_c,
            post=post_a,
            classification=NoticeType.LIKE,
        )
        like_notice_1.save()
        like_notice_1.time = today - timedelta(days=12)
        like_notice_1.save()
        like_notice_2 = Notification(
            user=user_a,
            from_user=user_d,
            post=post_a,
            classification=NoticeType.LIKE,
        )
        like_notice_2.save()
        like_notice_2.time = today - timedelta(days=10)
        like_notice_2.save()
        fork_notice_1 = Notification(
            user=user_a,
            from_user=user_c,
            repository=repo_a,
            classification=NoticeType.FORK
        )
        fork_notice_1.save()
        fork_notice_1.time = today - timedelta(days=9)
        fork_notice_1.save()
        fork_notice_2 = Notification(
            user=user_a,
            from_user=user_d,
            repository=repo_a,
            classification=NoticeType.FORK
        )
        fork_notice_2.save()
        fork_notice_2.time = today - timedelta(days=8)
        fork_notice_2.save()


    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Post.objects.all().delete()
        Discussion.objects.all().delete()
        Notification.objects.all().delete()

    def test_notifications(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        client_anonymous = Client()

        response = client_a.put("/api/notifications/")
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.get("/api/notifications/")
        self.assertEqual(response.status_code, 401)
        response = client_a.get("/api/notifications/")
        self.assertEqual(response.status_code, 200)
        response = client_a.get("/api/notifications/?notice_type=FRIEND_REQUEST")
        self.assertEqual(response.status_code, 200)
        response = client_a.get("/api/notifications/?notice_type=INVITATION")
        self.assertEqual(response.status_code, 200)

        response = client_anonymous.delete("/api/notifications/")
        self.assertEqual(response.status_code, 401)
        response = client_a.delete("/api/notifications/")
        self.assertEqual(response.status_code, 202)
        self.assertEqual(Notification.objects.all().count(), 4)

    def test_notificationID(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json",
        )
        client_anonymous = Client()

        response = client_a.put('/api/notifications/1/')
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.post('/api/notifications/1/')
        self.assertEqual(response.status_code, 401)
        response = client_b.post('/api/notifications/1/')
        self.assertEqual(response.status_code, 403)
        response = client_a.post('/api/notifications/100/')
        self.assertEqual(response.status_code, 404)
        response = client_a.post('/api/notifications/1/')
        self.assertEqual(response.status_code, 400)
        response = client_a.post(
            '/api/notifications/1/',
            json.dumps({'answer': 3}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)
        response = client_a.post(
            '/api/notifications/1/',
            json.dumps({'answer': NoticeAnswerType.YES}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        user_a = User.objects.get(user_id=1)
        user_c = User.objects.get(user_id=3)
        self.assertTrue(user_a in user_c.friends.all())
        response = client_a.post(
            '/api/notifications/2/',
            json.dumps({'answer': NoticeAnswerType.NO}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        user_d = User.objects.get(user_id=4)
        self.assertFalse(user_a in user_d.friends.all())

        response = client_a.post(
            '/api/notifications/3/',
            json.dumps({'answer': NoticeAnswerType.YES}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        repo_b = Repository.objects.get(repo_id=2)
        self.assertTrue(user_a in repo_b.collaborators.all())
        response = client_a.post(
            '/api/notifications/4/',
            json.dumps({'answer': NoticeAnswerType.NO}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        repo_c = Repository.objects.get(repo_id=3)
        self.assertFalse(user_a in repo_c.collaborators.all())

        response = client_anonymous.delete('/api/notifications/6/')
        self.assertEqual(response.status_code, 401)
        response = client_a.delete('/api/notifications/100/')
        self.assertEqual(response.status_code, 404)
        response = client_b.delete('/api/notifications/6/')
        self.assertEqual(response.status_code, 403)

        self.assertEqual(Notification.objects.all().count(), 15)
        response = client_a.delete('/api/notifications/6/')
        self.assertEqual(response.status_code, 202)
        self.assertEqual(Notification.objects.all().count(), 14)

    # def test_sessionNotfications(self):
    #     client_a = Client()
    #     client_a.post(
    #         "/api/signin/",
    #         json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
    #         content_type="application/json",
    #     )
    #     client_anonymous = Client()

    #     response = client_a.post('/api/session/notifications/')
    #     self.assertEqual(response.status_code, 405)
    #     response = client_anonymous.get('/api/session/notifications/')
    #     self.assertEqual(response.status_code, 401)

    #     response = client_a.get('/api/session/notifications/')
    #     self.assertEqual(response.status_code, 200)
    #     self.assertIn('19', response.content.decode())
    #     client_a.get('/api/notifications/')
    #     response = client_a.get('/api/session/notifications/')
    #     self.assertEqual(response.status_code, 200)
    #     self.assertIn('0', response.content.decode())

    #     user_a = User.objects.get(user_id=1)
    #     new_notice = Notification(
    #         user=user_a,
    #         classification=100,
    #         from_user=user_a
    #     )
    #     new_notice.save()

    #     response = client_a.get('/api/session/notifications/')
    #     self.assertEqual(response.status_code, 200)
    #     self.assertIn('1', response.content.decode())
