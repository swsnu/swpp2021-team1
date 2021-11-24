import json
import tempfile
import shutil
from PIL import Image

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.models.models import Repository, User, Photo, Label
from project.enum import Scope


MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class LabelTestCase(TestCase):
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
        user_a = User.objects.get(user_id=1)
        user_b = User.objects.get(user_id=2)

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
            owner=user_a,
        )
        repo_b.save()
        repo_b.collaborators.add(user_a)
        repo_b.save()

        image_a = SimpleUploadedFile("test.jpg", b"imageA")
        image_b = SimpleUploadedFile("test.jpg", b"imageB")
        image_c = SimpleUploadedFile("test.jpg", b"imageB")

        photo_a = Photo(repository=repo_a, image_file=image_a, uploader=user_a)
        photo_a.save()
        photo_b = Photo(repository=repo_a, image_file=image_b, uploader=user_a)
        photo_b.save()
        photo_c = Photo(repository=repo_b, image_file=image_c, uploader=user_a)
        photo_c.save()

        label_a = Label(
            label_name="TEST_LABEL_A",
            repository=repo_a,
            user=user_a,    
        )
        label_a.save()
        label_b = Label(
            label_name="TEST_LABEL_B",
            repository=repo_b,
            user=user_a,    
        )
        label_b.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Photo.objects.all().delete()
        Label.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def test_labels(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json"
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json"
        )
        client_anonymous = Client()

        response = client_a.put("/api/repositories/1/labels/")
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.get("/api/repositories/1/labels/")
        self.assertEqual(response.status_code, 401)
        response = client_a.get("/api/repositories/100/labels/")
        self.assertEqual(response.status_code, 404)
        response = client_b.get("/api/repositories/2/labels/")
        self.assertEqual(response.status_code, 403)
        
        response = client_a.get("/api/repositories/1/labels/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_LABEL_A", response.content.decode())
        response = client_b.get("/api/repositories/1/labels/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("TEST_LABEL_A", response.content.decode())
        
        response = client_anonymous.post("/api/repositories/1/labels/")
        self.assertEqual(response.status_code, 401)
        response = client_b.post("/api/repositories/1/labels/")
        self.assertEqual(response.status_code, 400)
        response = client_a.post(
            "/api/repositories/100/labels/",
            json.dumps({'label_name' : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        response = client_b.post(
            "/api/repositories/2/labels/",
            json.dumps({'label_name' : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        
        response = client_a.post(
            "/api/repositories/1/labels/",
            json.dumps({'label_name' : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("NEW_LABEL", response.content.decode())
        self.assertIn("TEST_LABEL_A", response.content.decode())

        response = client_a.post(
            "/api/repositories/1/labels/",
            json.dumps({'label_name' : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 411)

    def test_labelID(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json"
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json"
        )
        client_anonymous = Client()

        response = client_a.post("/api/repositories/1/labels/1/")
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.put("/api/repositories/1/labels/1/")
        self.assertEqual(response.status_code, 401)
        response = client_a.put("/api/repositories/1/labels/1/")
        self.assertEqual(response.status_code, 400)
        response = client_a.put(
            "/api/repositories/100/labels/1/",
            json.dumps({"label_name" : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        response = client_a.put(
            "/api/repositories/1/labels/100/",
            json.dumps({"label_name" : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        response = client_a.put(
            "/api/repositories/1/labels/2/",
            json.dumps({"label_name" : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 410)
        response = client_b.put(
            "/api/repositories/2/labels/2/",
            json.dumps({"label_name" : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        response = client_b.put(
            "/api/repositories/1/labels/1/",
            json.dumps({"label_name" : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)

        response = client_a.put(
            "/api/repositories/1/labels/1/",
            json.dumps({"label_name" : "NEW_LABEL"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("NEW_LABEL", response.content.decode())

        response = client_anonymous.delete("/api/repositories/1/labels/1/")
        self.assertEqual(response.status_code, 401)
        response = client_a.delete("/api/repositories/100/labels/1/")
        self.assertEqual(response.status_code, 404)
        response = client_a.delete("/api/repositories/1/labels/100/")
        self.assertEqual(response.status_code, 404)
        response = client_a.delete("/api/repositories/1/labels/2/")
        self.assertEqual(response.status_code, 410)
        response = client_b.delete("/api/repositories/2/labels/2/")
        self.assertEqual(response.status_code, 403)
        response = client_b.delete("/api/repositories/1/labels/1/")
        self.assertEqual(response.status_code, 403)

        response = client_a.delete("/api/repositories/1/labels/1/")
        self.assertEqual(response.status_code, 202)
        self.assertNotIn("NEW_LABEL", response.content.decode())

    def test_labelPhotos(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json"
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json"
        )
        client_anonymous = Client()

        response = client_a.post("/api/repositories/1/labels/1/photos/")
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.put("/api/repositories/1/labels/1/photos/")
        self.assertEqual(response.status_code, 401)
        response = client_a.put(
            "/api/repositories/1/labels/1/photos/",
            json.dumps([{}]),
            content_type="application/json"   
        )
        self.assertEqual(response.status_code, 400)
        response = client_a.put(
            "/api/repositories/100/labels/1/photos/",
            json.dumps([{"photo_id" : 1}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        response = client_a.put(
            "/api/repositories/1/labels/100/photos/",
            json.dumps([{"photo_id" : 1}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        response = client_a.put(
            "/api/repositories/1/labels/2/photos/",
            json.dumps([{"photo_id" : 1}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 410)
        response = client_b.put(
            "/api/repositories/2/labels/2/photos/",
            json.dumps([{"photo_id" : 1}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        response = client_b.put(
            "/api/repositories/1/labels/1/photos/",
            json.dumps([{"photo_id" : 1}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        response = client_a.put(
            "/api/repositories/1/labels/1/photos/",
            json.dumps([{"photo_id" : 100}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 410)
        response = client_a.put(
            "/api/repositories/1/labels/1/photos/",
            json.dumps([{"photo_id" : 3}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        response = client_a.put(
            "/api/repositories/1/labels/1/photos/",
            json.dumps([{"photo_id" : 1}, {"photo_id" : 2}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('"photo_id": 1', response.content.decode())
        self.assertIn('"photo_id": 2', response.content.decode())

        response = client_a.put(
            "/api/repositories/1/labels/1/photos/",
            json.dumps([{"photo_id" : 2}]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('"photo_id": 1', response.content.decode())
        self.assertIn('"photo_id": 2', response.content.decode())

        response = client_anonymous.get("/api/repositories/1/labels/1/photos/")
        self.assertEqual(response.status_code, 401)
        response = client_a.get("/api/repositories/1/labels/2/photos/")
        self.assertEqual(response.status_code, 410)
        response = client_a.get("/api/repositories/100/labels/1/photos/")
        self.assertEqual(response.status_code, 404)
        response = client_a.get("/api/repositories/1/labels/100/photos/")
        self.assertEqual(response.status_code, 404)
        response = client_b.get("/api/repositories/2/labels/2/photos/")
        self.assertEqual(response.status_code, 403)
        response = client_b.get("/api/repositories/1/labels/1/photos/")
        self.assertEqual(response.status_code, 403)
        response = client_a.get("/api/repositories/1/labels/1/photos/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('"photo_id": 1', response.content.decode())
        self.assertIn('"photo_id": 2', response.content.decode())      
