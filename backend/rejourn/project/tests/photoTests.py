import json
import tempfile
import shutil
from datetime import datetime
from PIL import Image

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from project.enum import Scope
from project.models.models import User, Repository, Photo, PhotoTag, Label, Route, PlaceInRoute

# from io import BytesIO


MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PhotoTestCase(TestCase):
    def setUp(self):
        image_a = SimpleUploadedFile("test.jpg", b"imageA")
        image_b = SimpleUploadedFile("test.jpg", b"imageB")
        User.objects.create_user(
            username="u_1_USERNAME",
            real_name="u_1_REALNAME",
            email="u_1_EMAIL",
            password="u_1_PASSWORD",
            visibility=Scope.PUBLIC,
            bio="u_1_BIO",
        )
        User.objects.create_user(
            username="u_2_USERNAME",
            real_name="u_2_REALNAME",
            email="u_2_EMAIL",
            password="u_2_PASSWORD",
            visibility=Scope.PUBLIC,
            bio="u_2_BIO",
        )
        User.objects.create_user(
            username="u_3_USERNAME",
            real_name="u_3_REALNAME",
            email="u_3_EMAIL",
            password="u_3_PASSWORD",
            visibility=Scope.PUBLIC,
            bio="u_3_BIO",
        )
        User.objects.create_user(
            username="U4_USERNAME",
            real_name="U4_REALNAME",
            email="U4_EMAIL",
            password="U4_PASSWORD",
            visibility=Scope.PUBLIC,
            bio="U4_BIO",
        )
        u_1 = User.objects.get(user_id=1)
        u_2 = User.objects.get(user_id=2)
        u_3 = User.objects.get(user_id=3)

        u_3.friends.add(u_1)

        r_1 = Repository(repo_name="r_1_REPONAME", visibility=Scope.PRIVATE, owner=u_1)
        r_1.save()
        r_1.collaborators.add(u_1)
        r_1.collaborators.add(u_2)
        r_2 = Repository(repo_name="r_2_REPONAME", visibility=Scope.PUBLIC, owner=u_1)
        r_2.save()
        r_2.collaborators.add(u_1)
        r_3 = Repository(
            repo_name="r_3_REPONAME", visibility=Scope.FRIENDS_ONLY, owner=u_1
        )
        r_3.save()
        r_3.collaborators.add(u_1)
        photo_1 = Photo(repository=r_1, image_file=image_a, uploader=u_1)
        photo_1.save()
        p_1 = Photo.objects.get(photo_id=1)
        phototag1 = PhotoTag(user=u_1, photo=p_1, text="text_tag")
        phototag1.save()
        photo_2 = Photo(repository=r_1, image_file=image_b, uploader=u_1)
        photo_2.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Photo.objects.all().delete()
        PhotoTag.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)  # delete the temp dir

    def test_photos_get(self):
        Photo.objects.all().delete()
        image_a = SimpleUploadedFile("test.jpg", b"imageA")
        repo_1 = Repository.objects.get(repo_name="r_1_REPONAME")
        user_1 = User.objects.get(username="u_1_USERNAME")
        label_1 = Label(
            label_name="HELLO",
            repository=repo_1,
            user=user_1
        )
        label_1.save()
        label_2 = Label(
            label_name="hello world",
            repository=repo_1,
            user=user_1
        )
        label_2.save()
        label_3 = Label(
            label_name="BYE BYE",
            repository=repo_1,
            user=user_1
        )
        label_3.save()
        route = Route(
            region_address="REGION_ADDRESS",
            place_id="PLACE_ID",
            latitude=25,
            longitude=25,
            east=25,
            west=25,
            south=25,
            north=25,
            repository=repo_1
        )
        route.save()
        place_1 = PlaceInRoute(
            route=route,
            order=1,
            place_id="PLACE_ID",
            place_name="우리집",
            place_address="능동로 16길",
            latitude=25,
            longitude=25
        )
        place_1.save()
        place_2 = PlaceInRoute(
            route=route,
            order=2,
            place_id="PLACE_ID",
            place_name="개미집",
            place_address="한우리 3번지",
            latitude=25,
            longitude=25
        )
        place_2.save()
        place_3 = PlaceInRoute(
            route=route,
            order=3,
            place_id="PLACE_ID",
            place_name="서울대학교",
            place_address="관악로 1",
            latitude=25,
            longitude=25
        )
        place_3.save()
        date = datetime(2021, 1, 1)
        for i in range(15):
            photo = Photo(
                repository=repo_1,
                image_file=image_a,
                uploader=user_1,
            )
            photo.save()
            photo.post_time = timezone.make_aware(date)
            if i%4 == 0:
                photo.labels.add(label_1)
            elif i%4 == 3:
                photo.labels.add(label_3)
            else:
                photo.labels.add(label_2)
            if i < 4:
                photo.place = place_1
            elif i < 8:
                photo.place = place_2
            elif i < 12:
                photo.place = place_3
            photo.save()
            date = date.replace(day=date.day+1)

        client_anonymous = Client()
        client_1 = Client()
        client_1.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )

        response = client_anonymous.get("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)

        response = client_anonymous.get("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

        response = client_1.get("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 17', response.content.decode())
        self.assertIn('"photo_id": 3', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?label=e")
        self.assertEqual(response.status_code, 200)
        self.assertIn('HELLO', response.content.decode())
        self.assertIn('hello world', response.content.decode())
        self.assertIn('BYE BYE', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?label=Hello")
        self.assertEqual(response.status_code, 200)
        self.assertIn('HELLO', response.content.decode())
        self.assertIn('hello world', response.content.decode())
        self.assertNotIn('BYE BYE', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?label=Hello World")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('HELLO', response.content.decode())
        self.assertIn('hello world', response.content.decode())
        self.assertNotIn('BYE BYE', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?start_date=2021+1+8")
        self.assertEqual(response.status_code, 410)
        response = client_1.get("/api/repositories/1/photos/?end_date=2021+1+8")
        self.assertEqual(response.status_code, 410)

        response = client_1.get("/api/repositories/1/photos/?start_date=2021-1-8")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 10', response.content.decode())
        self.assertIn('"photo_id": 17', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?end_date=2021-1-12")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 3', response.content.decode())
        self.assertIn('"photo_id": 14', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?start_date=2021-1-8&end_date=2021-1-12")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 10', response.content.decode())
        self.assertIn('"photo_id": 14', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?place=서울대")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 11', response.content.decode())
        self.assertIn('"photo_id": 14', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?place=집")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 3', response.content.decode())
        self.assertIn('"photo_id": 10', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?place=리")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 3', response.content.decode())
        self.assertIn('"photo_id": 10', response.content.decode())

        response = client_1.get("/api/repositories/1/photos/?place=리&label=hello&start_date=2021-1-4&end_date=2021-1-5")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"photo_id": 7', response.content.decode())

    def test_photos_post(self):
        client_anonymous = Client()
        client_1 = Client()
        client_1.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        client_3 = Client()
        client_3.post(
            "/api/signin/",
            json.dumps({"username": "u_3_USERNAME", "password": "u_3_PASSWORD"}),
            content_type="application/json",
        )

        response = client_anonymous.post("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 401)

        response = client_3.post("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)
        response = client_3.post("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

        image = Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
        file_1 = tempfile.NamedTemporaryFile(suffix=".png")
        image.save(file_1)
        image = Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
        file_2 = tempfile.NamedTemporaryFile(suffix=".png")
        image.save(file_2)
        image = Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
        file_3 = tempfile.NamedTemporaryFile(suffix=".png")
        image.save(file_3)

        response = client_1.post('/api/repositories/1/photos/', {"image": [file_1, file_2, file_3]},
                                 format='multipart/form-data')
        self.assertEqual(response.status_code, 201)

        repo_1 = Repository.objects.get(repo_id=1)
        self.assertEqual(Photo.objects.filter(repository=repo_1).count(), 5)

    def test_photos_put(self):
        client = Client()
        response = client.put("/api/repositories/1/photos/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "u_3_USERNAME", "password": "u_3_PASSWORD"}),
            content_type="application/json",
        )
        response = client.put("/api/repositories/100/photos/1/")
        self.assertEqual(response.status_code, 404)

        response = client.put("/api/repositories/1/photos/100/")
        self.assertEqual(response.status_code, 404)

        response = client.put("/api/repositories/1/photos/1/")
        self.assertEqual(response.status_code, 403)

        client.get("/api/signout/")
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )

        response = client.put("/api/repositories/1/photos/1/")
        self.assertEqual(response.status_code, 400)

        response = client.put(
            "/api/repositories/1/photos/1/",
            json.dumps({"tag": "edit_text"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("edit_text", response.content.decode())
        self.assertNotIn("text_tag", response.content.decode())

        response = client.put(
            "/api/repositories/1/photos/1/",
            json.dumps({"tag": ""}),
            content_type="application/json",
        )
        self.assertNotIn("edit_text", response.content.decode())

        response = client.put(
            "/api/repositories/1/photos/2/",
            json.dumps({"tag": "edit_text"}),
            content_type="application/json",
        )
        self.assertIn("edit_text", response.content.decode())

    def test_photos_delete(self):
        client = Client()
        response = client.delete("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "u_3_USERNAME", "password": "u_3_PASSWORD"}),
            content_type="application/json",
        )
        response = client.delete("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

        client.get("/api/signout/")
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )

        response = client.delete("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 400)

        response = client.delete(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 5}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client.delete(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 1}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 202)
        self.assertNotIn("text_tag", response.content.decode())

        response = client.delete(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 2}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 202)
