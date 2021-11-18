import json
import shutil
import tempfile

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.models.models import User, Repository, Route, PlaceInRoute, Photo, PhotoTag
from project.enum import Scope

import datetime
from django.utils import timezone



MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class RouteTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(
            username="TEST_A_USER",
            email="TEST_A_EMAIL",
            password="TEST_A_PW",
            visibility=Scope.PUBLIC,
        )
        user_a = User.objects.get(username="TEST_A_USER")
        User.objects.create_user(
            username="TEST_B_USER",
            email="TEST_B_EMAIL",
            password="TEST_B_PW",
            visibility=Scope.PUBLIC,
        )
        user_b = User.objects.get(username="TEST_B_USER")
        User.objects.create_user(
            username="TEST_C_USER",
            email="TEST_C_EMAIL",
            password="TEST_C_PW",
            visibility=Scope.PUBLIC,
        )
        user_c = User.objects.get(username="TEST_C_USER")
        User.objects.create_user(
            username="TEST_D_USER",
            email="TEST_D_EMAIL",
            password="TEST_D_PW",
            visibility=Scope.PUBLIC,
        )
        user_d = User.objects.get(username="TEST_D_USER")
        user_a.friends.add(user_c)

        repo_a = Repository(
            repo_name="REPO_A_NAME",
            visibility=Scope.PRIVATE,
            owner=user_a,
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.collaborators.add(user_b)
        repo_b = Repository(
            repo_name="REPO_B_NAME",
            visibility=Scope.FRIENDS_ONLY,
            owner=user_a,
        )
        repo_b.save()
        repo_b.collaborators.add(user_a)
        repo_b.collaborators.add(user_d)
        repo_c = Repository(
            repo_name="REPO_C_NAME",
            visibility=Scope.FRIENDS_ONLY,
            owner=user_a,
        )
        repo_c.save()
        repo_c.collaborators.add(user_a)

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

        photo_image_a = SimpleUploadedFile("photo_image_a.jpg", b"photo_image_a")
        photo_a = Photo(
            repository=repo_a,
            image_file=photo_image_a,
            uploader=user_a,
            place=place_a_1,
            thumbnail_of=place_a_1,
        )
        photo_a.save()
        photo_a.thumbnail_of = place_a_1
        photo_a.save()
        photo_image_b = SimpleUploadedFile("photo_image_b.jpg", b"photo_image_b")
        photo_b = Photo(
            repository=repo_a,
            image_file=photo_image_b,
            uploader=user_a,
            place=place_a_1,
        )
        photo_b.save()
        photo_image_c = SimpleUploadedFile("photo_image_c.jpg", b"photo_image_c")
        photo_c = Photo(
            repository=repo_a,
            image_file=photo_image_c,
            uploader=user_a,
            place=place_a_2,
        )
        photo_c.save()
        photo_image_1 = SimpleUploadedFile("photo_image_1.jpg", b"photo_image_1")
        photo_1 = Photo(
            repository=repo_a,
            image_file=photo_image_1,
            uploader=user_a,
        )
        photo_1.save()
        photo_image_2 = SimpleUploadedFile("photo_image_2.jpg", b"photo_image_2")
        photo_image_3 = SimpleUploadedFile("photo_image_3.jpg", b"photo_image_3")

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Route.objects.all().delete()
        PlaceInRoute.objects.all().delete()
        Photo.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
    
    def test_regionSearch_get(self):
        client = Client()
        response = client.delete("/api/region-search/")
        self.assertEqual(response.status_code, 405)
        response = client.get("/api/region-search/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/region-search/")
        self.assertEqual(response.status_code, 400)
        response = client.get("/api/region-search/?query=jeju 애월")
        self.assertEqual(response.status_code, 200)
        self.assertIn('Aewol-eup, Jeju-si, Jeju-do, South Korea', response.content.decode())
        
    def test_routeID_get(self):
        client = Client()
        response = client.delete("/api/repositories/1/route/")
        self.assertEqual(response.status_code, 405)
        response = client.get("/api/repositories/1/route/")
        self.assertEqual(response.status_code, 401)
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/repositories/5/route/")
        self.assertEqual(response.status_code, 404)
        response = client.get("/api/repositories/1/route/")
        self.assertEqual(response.status_code, 403)
        client.get("/api/signout")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/repositories/1/route/")
        self.assertEqual(response.status_code, 200)
        photo_1 = Photo.objects.get(photo_id=4)
        self.assertIn(photo_1.image_file.url, response.content.decode())

    def test_routeID_post(self):
        client = Client()
        response = client.post("/api/repositories/1/route/")
        self.assertEqual(response.status_code, 401)
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.post("/api/repositories/5/route/")
        self.assertEqual(response.status_code, 404)
        response = client.post("/api/repositories/1/route/")
        self.assertEqual(response.status_code, 403)
        client.get("/api/signout")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.post("/api/repositories/2/route/")
        self.assertEqual(response.status_code, 400)

        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"place_id": "ChIJXSModoWLGGARILWiCfeu2M0", "repo_id": 1}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"place_id": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"place_id": "ChIJXSModoWLGGARILWiCfeu2M0"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)

        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"place_id": "ChIJXSModoWLGGARILWiCfeu2M0"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)

        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"repo_id": 5}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"repo_id": 3}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        response = client.post(
            "/api/repositories/2/route/",
            json.dumps({"repo_id": 1}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)

        response = client.post(
            "/api/repositories/3/route/",
            json.dumps({"repo_id": 1}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        response = client.post(
            "/api/repositories/3/route/",
            json.dumps({"place_id": "ChIJXSModoWLGGARILWiCfeu2M0"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        response = client.post(
            "/api/repositories/3/route/",
            json.dumps({"repo_id": 1}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)

    def test_placeSearch_get(self):
        client = Client()
        response = client.delete("/api/repositories/1/route/places-search/")
        self.assertEqual(response.status_code, 405)

        response = client.get("/api/repositories/1/route/places-search/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/repositories/5/route/places-search/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/repositories/1/route/places-search/")
        self.assertEqual(response.status_code, 403)

        client.get("/api/signout/")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/repositories/2/route/places-search/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/repositories/1/route/places-search/")
        self.assertEqual(response.status_code, 400)

        response = client.get("/api/repositories/1/route/places-search/?query=맛집")
        self.assertEqual(response.status_code, 200)

        response = client.get("/api/repositories/1/route/places-search/?query=애월읍 애월리 1716-4")
        self.assertEqual(response.status_code, 200)

    def test_places_put(self):
        client = Client()
        response = client.delete("/api/repositories/1/route/places/")
        self.assertEqual(response.status_code, 405)
        response = client.put("/api/repositories/1/route/places/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.put("/api/repositories/5/route/places/")
        self.assertEqual(response.status_code, 404)
        response = client.put("/api/repositories/1/route/places/")
        self.assertEqual(response.status_code, 403)

        client.get("/api/signout/")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.put("/api/repositories/2/route/places/")
        self.assertEqual(response.status_code, 404)
        response = client.put("/api/repositories/1/route/places/")
        self.assertEqual(response.status_code, 400)
        response = client.put(
            "/api/repositories/1/route/places/",
            json.dumps([{
                "text": "EDIT_1_TEXT",
                "photos":[]
            }]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        response = client.put(
            "/api/repositories/1/route/places/",
            json.dumps([{
                "place_id": "wrong-id",
            }]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        response = client.put(
            "/api/repositories/1/route/places/",
            json.dumps([{
                "place_id": "ChIJwxapcG71DDURGdhIIeiFBcI",
                "text": "EDIT_1_TEXT",
                "time": "2021-11-18",
                "photos": [{"photo_id": 2}],
            },
            {
                "place_id": "ChIJYeRTsDD0DDURrIR1mJ_N5r8",
                "text": "EDIT_2_TEXT",
                "time": "2021-11-19",
                "photos": [{"photo_id": 4}],
            }]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
    
    def test_placeID_post(self):
        client = Client()
        response = client.delete("/api/repositories/1/route/places/ChIJ66OlkbP1DDURa0xq5SHaKHg/")
        self.assertEqual(response.status_code, 405)

        response = client.post("/api/repositories/1/route/places/ChIJ66OlkbP1DDURa0xq5SHaKHg/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.post("/api/repositories/5/route/places/ChIJ66OlkbP1DDURa0xq5SHaKHg/")
        self.assertEqual(response.status_code, 404)
        response = client.post("/api/repositories/1/route/places/ChIJ66OlkbP1DDURa0xq5SHaKHg/")
        self.assertEqual(response.status_code, 403)
        client.get("/api/signout/")
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.post("/api/repositories/2/route/places/ChIJ66OlkbP1DDURa0xq5SHaKHg/")
        self.assertEqual(response.status_code, 404)
        response = client.post("/api/repositories/1/route/places/ChIJ66OlkbP1DDURa0xq5SHaKHg/")
        self.assertEqual(response.status_code, 201)
