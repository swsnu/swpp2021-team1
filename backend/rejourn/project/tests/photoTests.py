import json
import tempfile
from PIL import Image

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.enum import Scope
from project.models.models import User, Repository, Photo, PhotoTag

# import shutil
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

    def test_photos_get(self):
        client = Client()
        response = client.get("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

    def test_photos_post(self):
        client = Client()
        response = client.post("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 401)

        response = client.post(
            "/api/signin/",
            json.dumps({"username": "u_3_USERNAME", "password": "u_3_PASSWORD"}),
            content_type="application/json",
        )
        response = client.post("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)

        response = client.post("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

        response = client.get("/api/signout/")
        response = client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )

        # image_a = SimpleUploadedFile('test.jpg', b'imageA')
        # file = BytesIO(image_a.tobytes())
        # file.name = 'test.png'
        # file.seek(0)

        image = Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
        file = tempfile.NamedTemporaryFile(suffix=".png")
        image.save(file)
        # print(image)

        # with open(file.name, 'rb') as data:
        # response = client.post('/api/repositories/1/photos/', {"FILES['image']": [image]})
        # format='multipart/form-data')
        # self.assertEqual(response.status_code, 201)

    def test_photos_put(self):
        client = Client()
        response = client.put("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 401)

        response = client.post(
            "/api/signin/",
            json.dumps({"username": "u_3_USERNAME", "password": "u_3_PASSWORD"}),
            content_type="application/json",
        )
        response = client.put("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)

        response = client.put("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

        response = client.get("/api/signout/")
        response = client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )

        response = client.put("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 400)

        response = client.put(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 5, "tag": "edit_text"}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        photo_1 = Photo.objects.get(photo_id=1)
        original_phototag1 = PhotoTag.objects.get(photo=photo_1)
        response = client.put(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 1, "tag": "edit_text"}]),
            content_type="application/json",
        )
        self.assertIn("edit_text", response.content.decode())

        response = client.put(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 1, "tag": ""}]),
            content_type="application/json",
        )
        self.assertNotIn(original_phototag1, PhotoTag.objects.all().values())

        response = client.put(
            "/api/repositories/1/photos/",
            json.dumps([{"photo_id": 1, "tag": "edit_again_text"}]),
            content_type="application/json",
        )
        self.assertIn("edit_again_text", response.content.decode())

    def test_photos_delete(self):
        client = Client()
        response = client.delete("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 401)

        response = client.post(
            "/api/signin/",
            json.dumps({"username": "u_3_USERNAME", "password": "u_3_PASSWORD"}),
            content_type="application/json",
        )
        response = client.delete("/api/repositories/5/photos/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/repositories/1/photos/")
        self.assertEqual(response.status_code, 403)

        response = client.get("/api/signout/")
        response = client.post(
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
