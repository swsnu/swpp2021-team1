import json
import shutil
import tempfile
import datetime

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from project.models.models import User, Repository, Route, PlaceInRoute, Photo
from project.enum import Scope

MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ExploreTestCase(TestCase):
    def setUp(self):
        
        User.objects.create_user(
            username="MAIN_USER",
            email="MAIN_EMAIL",
            password="MAIN_PW",
            visibility=Scope.PUBLIC,
        )
        user_0 = User.objects.get(username="MAIN_USER")
        profile_image_a = SimpleUploadedFile("profile_image_a.jpg", b"profile_image_a")
        User.objects.create_user(
            username="abcdef",
            email="TEST_A_EMAIL",
            password="TEST_A_PW",
            visibility=Scope.PUBLIC,
            profile_picture=profile_image_a,
        )
        user_a = User.objects.get(username="abcdef")
        profile_image_b = SimpleUploadedFile("profile_image_b.jpg", b"profile_image_b")
        User.objects.create_user(
            username="defabc",
            email="TEST_B_EMAIL",
            password="TEST_B_PW",
            visibility=Scope.PUBLIC,
            profile_picture=profile_image_b,
        )
        user_b = User.objects.get(username="defabc")
        User.objects.create_user(
            username="abcghi",
            email="TEST_C_EMAIL",
            password="TEST_C_PW",
            visibility=Scope.FRIENDS_ONLY,
        )
        user_c = User.objects.get(username="abcghi")
        User.objects.create_user(
            username="ghiabc",
            email="TEST_D_EMAIL",
            password="TEST_D_PW",
            visibility=Scope.FRIENDS_ONLY,
        )
        user_d = User.objects.get(username="ghiabc")
        User.objects.create_user(
            username="abcjkl",
            email="TEST_E_EMAIL",
            password="TEST_E_PW",
            visibility=Scope.PRIVATE,
        )
        user_e = User.objects.get(username="abcjkl")
        User.objects.create_user(
            username="jklabc",
            email="TEST_F_EMAIL",
            password="TEST_F_PW",
            visibility=Scope.PRIVATE,
        )
        user_f = User.objects.get(username="jklabc")
        user_0.friends.add(user_a)
        user_0.friends.add(user_c)
        user_0.friends.add(user_e)
        user_0.friends.add(user_d)

    def tearDown(self):
        User.objects.all().delete()
    
    def test_exploreUsers(self):
        client = Client()
        response = client.delete("/api/explore/users/")
        self.assertEqual(response.status_code, 405)

        response = client.get("/api/explore/users/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "MAIN_USER", "password": "MAIN_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/explore/users/")
        self.assertEqual(response.status_code, 400)
        response = client.get("/api/explore/users/?query=abc")
        self.assertEqual(response.status_code, 200)
        self.assertIn("abcdef", response.content.decode())
        self.assertIn("defabc", response.content.decode())
        self.assertIn("abcghi", response.content.decode())
        self.assertIn("ghiabc", response.content.decode())
        self.assertNotIn("abcjkl", response.content.decode())
        self.assertNotIn("jklabc", response.content.decode())
        print(response.content.decode())

    def test_exploreRepositories(self):
        pass
    def test_explorePlaces(self):
        pass
    def test_feeds(self):
        pass