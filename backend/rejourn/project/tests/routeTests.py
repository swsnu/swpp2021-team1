import json
import shutil
import tempfile

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.models.models import User, Repository, Route, PlaceInRoute, Photo
from project.enum import Scope


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

        photo_image_a = SimpleUploadedFile("photo_image_a.jpg", b"photo_image_a")
        photo_a = Photo(
            repository=repo_a,
            image_file=photo_image_a,
            uploader=user_a,
            place=place_a_1,
            thumbnail_of=place_a_1,
        )
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


    def test_routeID_get(self):
        pass

    def test_routeID_post(self):
        pass

    def test_placeSearch_get(self):
        pass
    
    def test_places_put(self):
        pass
    
    def test_placeID_post(self):
        pass
