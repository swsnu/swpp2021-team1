import tempfile
import json
import shutil

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.enum import Scope, NoticeType
from project.models.models import User, Notification


MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class UserTestCase(TestCase):

    # user_a : PUBLIC
    # user_b : FRIENDS_ONLY
    # user_c : FRIENDS_ONLY
    # user_d : PRIVATE
    # anonymous_user : not logged_in
    # user_b & user C are friends

    stubuser_a = {
        "username": "TEST_USER_A",
        "real_name": "REAL_USER_A",
        "email": "TEST_USER_A@test.com",
        "password": "TEST_PASSWORD_A",
        "visibility": Scope.PUBLIC,
        "bio": "My name is REAL_USER_A!",
    }

    stubuser_b = {
        "username": "TEST_USER_B",
        "real_name": "REAL_USER_B",
        "email": "TEST_USER_B@test.com",
        "password": "TEST_PASSWORD_B",
        "visibility": Scope.FRIENDS_ONLY,
        "bio": "My name is REAL_USER_B!",
    }

    stubuser_c = {
        "username": "TEST_USER_C",
        "real_name": "REAL_USER_C",
        "email": "TEST_USER_C@test.com",
        "password": "TEST_PASSWORD_C",
        "visibility": Scope.FRIENDS_ONLY,
        "bio": "My name is REAL_USER_C!",
    }

    stubuser_d = {
        "username": "TEST_USER_D",
        "real_name": "REAL_USER_D",
        "email": "TEST_USER_D@test.com",
        "password": "TEST_PASSWORD_D",
        "visibility": Scope.PRIVATE,
        "bio": "My name is REAL_USER_D!",
    }

    def setUp(self):
        User.objects.create_user(
            username=self.stubuser_a["username"],
            real_name=self.stubuser_a["real_name"],
            email=self.stubuser_a["email"],
            password=self.stubuser_a["password"],
            visibility=self.stubuser_a["visibility"],
            bio=self.stubuser_a["bio"],
        )
        User.objects.create_user(
            username=self.stubuser_b["username"],
            real_name=self.stubuser_b["real_name"],
            email=self.stubuser_b["email"],
            password=self.stubuser_b["password"],
            visibility=self.stubuser_b["visibility"],
            bio=self.stubuser_b["bio"],
        )
        User.objects.create_user(
            username=self.stubuser_c["username"],
            real_name=self.stubuser_c["real_name"],
            email=self.stubuser_c["email"],
            password=self.stubuser_c["password"],
            visibility=self.stubuser_c["visibility"],
            bio=self.stubuser_c["bio"],
        )
        User.objects.create_user(
            username=self.stubuser_d["username"],
            real_name=self.stubuser_d["real_name"],
            email=self.stubuser_d["email"],
            password=self.stubuser_d["password"],
            visibility=self.stubuser_d["visibility"],
            bio=self.stubuser_d["bio"],
        )
        user_b = User.objects.get(username="TEST_USER_B")
        user_c = User.objects.get(username="TEST_USER_C")
        user_b.friends.add(user_c)
        user_b.save()

    def tearDown(self):
        User.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def test_token(self):
        client = Client(enforce_csrf_checks=True)
        response = client.post('/api/signin/', json.dumps({'username': 'TEST_USER_A', 'password': 'TEST_PASSWORD_A'}),
                               content_type='application/json')
        self.assertEqual(response.status_code, 403)

        response = client.get('/api/token/')
        self.assertEqual(response.status_code, 204)
        csrftoken = response.cookies['csrftoken'].value

        response = client.post('/api/signin/', json.dumps({'username': 'TEST_USER_A', 'password': 'TEST_PASSWORD_A'}),
                               content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken)
        self.assertEqual(response.status_code, 201)

        client.get('/api/token/')
        csrftoken = response.cookies['csrftoken'].value

        response = client.put('/api/token/', HTTP_X_CSRFTOKEN=csrftoken)
        self.assertEqual(response.status_code, 405)

    def test_signin_siginout_session_token(self):
        client_a = Client()

        response = client_a.delete("/api/token/")
        self.assertEqual(response.status_code, 405)

        response = client_a.get("/api/signout/")
        self.assertEqual(response.status_code, 401)

        response = client_a.delete("/api/signin/")
        self.assertEqual(response.status_code, 405)

        response = client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_A", response.content.decode())

        response = client_a.post("/api/signin/")
        self.assertEqual(response.status_code, 400)

        response = client_a.get("/api/session/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_A", response.content.decode())

        response = client_a.delete("/api/session/")
        self.assertEqual(response.status_code, 405)

        response = client_a.get("/api/signout/")
        self.assertEqual(response.status_code, 200)

        response = client_a.delete("/api/signout/")
        self.assertEqual(response.status_code, 405)

    def test_post_users(self):
        anonymous_user = Client()

        response = anonymous_user.delete("/api/users/")
        self.assertEqual(response.status_code, 405)

        response = anonymous_user.post("/api/users/")
        self.assertEqual(response.status_code, 400)
        response = anonymous_user.post(
            "/api/users/",
            json.dumps(
                {
                    "username": "TEST_USER_E",
                    "real_name": "REAL_USER_E",
                    "email": "TEST_USER_E@test.com",
                    "password": "TEST_PASSWORD_E",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_E!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_E", response.content.decode())

        response = anonymous_user.post(
            "/api/users/",
            json.dumps(
                {
                    "username": "TEST_USER_A",
                    "real_name": "REAL_USER_A",
                    "email": "TEST_USER_A@test.com",
                    "password": "TEST_PASSWORD_A",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_A!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

    def test_profilePicture(self):
        image_a = SimpleUploadedFile("test.jpg", b"imageA")
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        client_anonymous = Client()
        user_a = User.objects.get(username="TEST_USER_A")
        self.assertEqual(bool(user_a.profile_picture), False)

        response = client_anonymous.post("/api/users/TEST_USER_A/profile-picture/")
        self.assertEqual(response.status_code, 401)

        response = client_a.post("/api/users/NO_ONE/profile-picture/")
        self.assertEqual(response.status_code, 404)
        response = client_a.post("/api/users/TEST_USER_B/profile-picture/")
        self.assertEqual(response.status_code, 403)
        response = client_a.post("/api/users/TEST_USER_A/profile-picture/")
        self.assertEqual(response.status_code, 400)

        response = client_a.post(
            "/api/users/TEST_USER_A/profile-picture/",
            {'image' : image_a}
        )
        self.assertEqual(response.status_code, 201)
        user_a = User.objects.get(username="TEST_USER_A")
        self.assertEqual(bool(user_a.profile_picture), True)

        response = client_anonymous.delete("/api/users/TEST_USER_A/profile-picture/")
        self.assertEqual(response.status_code, 401)
        response = client_a.delete("/api/users/NO_ONE/profile-picture/")
        self.assertEqual(response.status_code, 404)
        response = client_a.delete("/api/users/TEST_USER_B/profile-picture/")
        self.assertEqual(response.status_code, 403)

        response = client_a.delete("/api/users/TEST_USER_A/profile-picture/")
        self.assertEqual(response.status_code, 202)
        user_a = User.objects.get(username="TEST_USER_A")
        self.assertEqual(bool(user_a.profile_picture), False)

    def test_delete_userID(self):
        client = Client()
        response = client.delete(
            "/api/users/TEST_USER_A/",
        )
        self.assertEqual(response.status_code, 401)
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        response = client.delete(
            "/api/users/TEST_USER_B/",
        )
        self.assertEqual(response.status_code, 403)
        response = client.delete(
            "/api/users/TEST_USER_A/",
        )
        self.assertEqual(response.status_code, 202)

    def test_put_userID(self):
        client = Client()
        response = client.post(
            "/api/users/TEST_USER_A/",
            json.dumps(
                {
                    "username": "TEST_USER_E",
                    "real_name": "REAL_USER_E",
                    "email": "TEST_USER_E@test.com",
                    "password": "TEST_PASSWORD_E",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_E!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 405)
        response = client.put(
            "/api/users/TEST_USER_A/",
            json.dumps(
                {
                    "username": "TEST_USER_E",
                    "real_name": "REAL_USER_E",
                    "email": "TEST_USER_E@test.com",
                    "password": "TEST_PASSWORD_E",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_E!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        response = client.put(
            "/api/users/TEST_USER_B/",
            json.dumps(
                {
                    "username": "TEST_USER_E",
                    "real_name": "REAL_USER_E",
                    "email": "TEST_USER_E@test.com",
                    "password": "TEST_PASSWORD_E",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_E!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        response = client.put(
            "/api/users/TEST_USER_A/", content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        response = client.put(
            "/api/users/TEST_USER_A/",
            json.dumps(
                {
                    "username": "TEST_USER_B",
                    "real_name": "REAL_USER_E",
                    "email": "TEST_USER_E@test.com",
                    "password": "TEST_PASSWORD_E",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_E!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)
        response = client.put(
            "/api/users/TEST_USER_A/",
            json.dumps(
                {
                    "username": "TEST_USER_E",
                    "real_name": "REAL_USER_E",
                    "email": "TEST_USER_E@test.com",
                    "password": "TEST_PASSWORD_E",
                    "visibility": Scope.PRIVATE,
                    "bio": "My name is REAL_USER_E!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_E", response.content.decode())

    def test_get_userID(self):
        client = Client()
        response = client.get(
            "/api/users/TEST_USER_Z/",
        )
        self.assertEqual(response.status_code, 404)
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        response = client.get(
            "/api/users/TEST_USER_A/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("REAL_USER_A", response.content.decode())
        response = client.get(
            "/api/users/TEST_USER_D/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("TEST_USER_D@test.com", response.content.decode())
        response = client.get(
            "/api/users/TEST_USER_B/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("TEST_USER_B@test.com", response.content.decode())

        client.get(
            "/api/signout/",
        )

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_C", "password": "TEST_PASSWORD_C"}),
            content_type="application/json",
        )
        response = client.get(
            "/api/users/TEST_USER_B/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_B@test.com", response.content.decode())
        response = client.get(
            "/api/users/TEST_USER_A/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_A@test.com", response.content.decode())


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class UserFriendTestCase(TestCase):
    def setUp(self):
        image_a = SimpleUploadedFile("test.jpg", b"imageA")
        User.objects.create_user(
            username="TEST_A_USER",
            real_name="TEST_A_REAL",
            email="TEST_A_EMAIL",
            password="TEST_A_PW",
            visibility=Scope.PUBLIC,
            bio="TEST_A_BIO",
            profile_picture=image_a,
        )
        image_b = SimpleUploadedFile("test.jpg", b"imageB")
        User.objects.create_user(
            username="TEST_B_USER",
            real_name="TEST_B_REAL",
            email="TEST_B_EMAIL",
            password="TEST_B_PW",
            visibility=Scope.FRIENDS_ONLY,
            bio="TEST_B_BIO",
            profile_picture=image_b,
        )
        User.objects.create_user(
            username="TEST_C_USER",
            real_name="TEST_C_REAL",
            email="TEST_C_EMAIL",
            password="TEST_C_PW",
            visibility=Scope.PRIVATE,
            bio="TEST_C_BIO",
        )
        User.objects.create_user(
            username="TEST_D_USER",
            real_name="TEST_D_REAL",
            email="TEST_D_EMAIL",
            password="TEST_D_PW",
            visibility=Scope.PRIVATE,
            bio="TEST_D_BIO",
        )

        u_1 = User.objects.get(username="TEST_A_USER")
        u_2 = User.objects.get(username="TEST_B_USER")
        u_3 = User.objects.get(username="TEST_C_USER")
        u_4 = User.objects.get(username="TEST_D_USER")

        u_1.friends.add(u_2)
        u_1.friends.add(u_3)
        u_1.friends.add(u_4)

    def tearDown(self):
        User.objects.all().delete()

    def test_userFriends_get(self):
        client = Client()
        response = client.delete("/api/users/TEST_A_USER/friends/")
        self.assertEqual(response.status_code, 405)

        response = client.get("/api/users/TEST_E_USER/friends/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/users/TEST_A_USER/friends/")
        self.assertEqual(response.status_code, 200)
        u_2 = User.objects.get(user_id=2)
        self.assertIn(u_2.profile_picture.url, response.content.decode())
        self.assertIn("TEST_C_USER", response.content.decode())

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/users/TEST_C_USER/friends/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_A_USER", response.content.decode())

        response = client.get("/api/users/TEST_B_USER/friends/")
        self.assertEqual(response.status_code, 403)

        client.get("/api/signout")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/users/TEST_B_USER/friends/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_A_USER", response.content.decode())

        response = client.get("/api/users/TEST_C_USER/friends/")
        self.assertEqual(response.status_code, 403)

    def test_userFriendID_post(self):
        client = Client()
        response = client.get("/api/users/TEST_A_USER/friends/TEST_B_USER/")
        self.assertEqual(response.status_code, 405)

        response = client.post("/api/users/TEST_A_USER/friends/TEST_B_USER/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.post("/api/users/TEST_A_USER/friends/TEST_B_USER/")
        self.assertEqual(response.status_code, 403)

        response = client.post("/api/users/TEST_C_USER/friends/TEST_E_USER/")
        self.assertEqual(response.status_code, 404)

        response = client.post("/api/users/TEST_C_USER/friends/TEST_B_USER/")
        self.assertEqual(response.status_code, 201)
        user_b = User.objects.get(username="TEST_B_USER")
        user_c = User.objects.get(username="TEST_C_USER")
        notice_set = Notification.objects.filter(
            classification=NoticeType.FRIEND_REQUEST,
            user=user_b,
            from_user=user_c,
        )
        self.assertEqual(notice_set.count(), 1)

        client.get("/api/signout")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_B_USER", "password": "TEST_B_PW"}),
            content_type="application/json",
        )
        response = client.post("/api/users/TEST_B_USER/friends/TEST_C_USER/")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(user_b in user_c.friends.all())
        self.assertTrue(user_c in user_b.friends.all())
        notice_set = Notification.objects.filter(
            classification=NoticeType.FRIEND_REQUEST,
            user=user_c,
            from_user=user_b,
        )
        self.assertEqual(notice_set.count(), 0)
        notice_set = Notification.objects.filter(
            classification=NoticeType.FRIEND_REQUEST,
            user=user_b,
            from_user=user_c,
        )
        self.assertEqual(notice_set.count(), 0)

    def test_userFriendID_delete(self):
        client = Client()

        response = client.delete("/api/users/TEST_A_USER/friends/TEST_B_USER/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.delete("/api/users/TEST_C_USER/friends/TEST_B_USER/")
        self.assertEqual(response.status_code, 403)

        response = client.delete("/api/users/TEST_A_USER/friends/TEST_E_USER/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/users/TEST_A_USER/friends/TEST_C_USER/")
        self.assertEqual(response.status_code, 202)
        u_2 = User.objects.get(user_id=2)
        self.assertIn(u_2.profile_picture.url, response.content.decode())
        self.assertNotIn("TEST_C_USER", response.content.decode())
        self.assertIn("TEST_D_USER", response.content.decode())
