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

        repo_a = Repository(
            repo_name="travel fun!",
            visibility=Scope.PUBLIC,
            owner=user_0,
        )
        repo_a.save()
        repo_a.collaborators.add(user_0)
        repo_b = Repository(
            repo_name="fun traveling",
            visibility=Scope.FRIENDS_ONLY,
            owner=user_a,
        )
        repo_b.save()
        repo_b.collaborators.add(user_a)
        repo_c = Repository(
            repo_name="We love travel",
            visibility=Scope.FRIENDS_ONLY,
            owner=user_b,
        )
        repo_c.save()
        repo_c.collaborators.add(user_b)
        repo_d = Repository(
            repo_name="travel enjoy",
            visibility=Scope.PRIVATE,
            owner=user_d,
        )
        repo_d.save()
        repo_d.collaborators.add(user_d)

        route_a = Route(
            region_address="대한민국 제주특별자치도 제주시 애월읍",
            place_id="ChIJb5-d7KL3DDURuO6p2BOUdOw",
            latitude=33.4619478,
            longitude=126.3295244,
            east=126.518352,
            west=126.2953071,
            south=33.341656,
            north=33.5032356,
            repository=repo_a,
        )
        route_a.save()

        route_b = Route(
            region_address="대한민국 제주특별자치도 제주시 애월읍",
            place_id="ChIJb5-d7KL3DDURuO6p2BOUdOw",
            latitude=33.4619478,
            longitude=126.3295244,
            east=126.518352,
            west=126.2953071,
            south=33.341656,
            north=33.5032356,
            repository=repo_b,
        )
        route_b.save()
        
        place_a_1 = PlaceInRoute(
            route=route_a,
            order=1,
            time=datetime.datetime.now(tz=timezone.utc),
            text="바다에서 단체사진찍기",
            place_id="ChIJwxapcG71DDURGdhIIeiFBcI",
            place_name="곽지해수욕장",
            place_address="대한민국 제주특별자치도 제주시 애월읍 곽지리 곽지해수욕장",
            latitude=33.450902,
            longitude=126.3057298,
        )
        place_a_1.save()
        place_a_2 = PlaceInRoute(
            route=route_a,
            order=2,
            place_id="ChIJxZHZGcX1DDURkgoYNph7RNk",
            place_name="제주샘주",
            place_address="대한민국 제주특별자치도 제주시 애월읍 애원로 283",
            latitude=33.4446362,
            longitude=126.3375372,
        )
        place_a_2.save()
        place_a_3 = PlaceInRoute(
            route=route_a,
            order=3,
            place_id="ChIJYeRTsDD0DDURrIR1mJ_N5r8",
            place_name="카페인디고",
            place_address="대한민국 제주특별자치도 제주시 애월읍 고내리 1218-1",
            latitude=33.4663593,
            longitude=126.3340838,
        )
        place_a_3.save()

        place_b_1 = PlaceInRoute(
            route=route_b,
            order=1,
            time=datetime.datetime.now(tz=timezone.utc),
            text="바다에서 단체사진찍기",
            place_id="ChIJwxapcG71DDURGdhIIeiFBcI",
            place_name="곽지해수욕장",
            place_address="대한민국 제주특별자치도 제주시 애월읍 곽지리 곽지해수욕장",
            latitude=33.450902,
            longitude=126.3057298,
        )
        place_b_1.save()
        place_b_2 = PlaceInRoute(
            route=route_b,
            order=2,
            place_id="ChIJxZHZGcX1DDURkgoYNph7RNk",
            place_name="제주샘주",
            place_address="대한민국 제주특별자치도 제주시 애월읍 애원로 283",
            latitude=33.4446362,
            longitude=126.3375372,
        )
        place_b_2.save()
        place_b_3 = PlaceInRoute(
            route=route_b,
            order=3,
            place_id="ChIJYeRTsDD0DDURrIR1mJ_N5r8",
            place_name="카페인디고",
            place_address="대한민국 제주특별자치도 제주시 애월읍 고내리 1218-1",
            latitude=33.4663593,
            longitude=126.3340838,
        )
        place_b_3.save()



    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Route.objects.all().delete()
        PlaceInRoute.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
    
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
        client = Client()
        response = client.delete("/api/explore/repositories/")
        self.assertEqual(response.status_code, 405)

        response = client.get("/api/explore/repositories/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "MAIN_USER", "password": "MAIN_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/explore/repositories/")
        self.assertEqual(response.status_code, 400)
        response = client.get("/api/explore/repositories/?query=travel")
        self.assertEqual(response.status_code, 200)
        self.assertIn("travel fun", response.content.decode())
        self.assertIn("fun traveling", response.content.decode())
        self.assertNotIn("We love travel", response.content.decode())
        self.assertNotIn("travel enjoy", response.content.decode())

    def test_explorePlaces(self):
        pass
    def test_feeds(self):
        pass