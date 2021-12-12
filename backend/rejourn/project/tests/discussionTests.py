import json
import shutil
import tempfile

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.models.models import Discussion, DiscussionComment, Repository, User, Notification
from project.enum import Scope, NoticeType


MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class DiscussionTestCase(TestCase):
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
        User.objects.create_user(
            username="TEST_B_USER",
            real_name="TEST_B_REAL",
            email="TEST_B_EMAIL",
            password="TEST_B_PW",
            visibility=Scope.PUBLIC,
            bio="TEST_B_BIO",
        )
        User.objects.create_user(
            username="TEST_C_USER",
            real_name="TEST_C_REAL",
            email="TEST_C_EMAIL",
            password="TEST_C_PW",
            visibility=Scope.PUBLIC,
            bio="TEST_C_BIO",
        )
        User.objects.create_user(
            username="TEST_D_USER",
            real_name="TEST_D_REAL",
            email="TEST_D_EMAIL",
            password="TEST_D_PW",
            visibility=Scope.PUBLIC,
            bio="TEST_D_BIO",
        )
        user_a = User.objects.get(user_id=1)
        user_d = User.objects.get(user_id=4)
        repo_a = Repository(
            repo_name="REPO_A_NAME", visibility=Scope.PUBLIC, owner=user_a
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.collaborators.add(user_d)
        diss_b = Discussion(
            repository=repo_a, author=user_a, title="DISS_B_TITLE", text="DISS_B_TEXT"
        )
        diss_b.save()
        com_a = DiscussionComment(author=user_a, text="COM_A_TEXT", discussion=diss_b)
        com_a.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Discussion.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)  # delete the temp dir

    def test_post_discussions(self):
        client = Client()
        response = client.delete("/api/repositories/1/discussions/")
        self.assertEqual(response.status_code, 405)

        response = client.post(
            "/api/repositories/1/discussions/",
            json.dumps({"title": "DISS_A_TITLE", "text": "DISS_A_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.post(
            "/api/repositories/5/discussions/",
            json.dumps({"title": "DISS_A_TITLE", "text": "DISS_A_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

        client.get("/api/signout/")

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.post(
            "/api/repositories/1/discussions/",
            json.dumps({"title": "DISS_A_TITLE", "text": "DISS_A_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        client.get("/api/signout/")

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.post(
            "/api/repositories/1/discussions/",
            json.dumps({"title": "DISS_A_TITLE", "text": "DISS_A_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("DISS_A_TITLE", response.content.decode())
        user_a = User.objects.get(user_id=1)
        user_a_profile_picture = user_a.profile_picture.url
        self.assertIn(user_a.profile_picture.url, response.content.decode())

        discussion_a = Discussion.objects.get(title="DISS_A_TITLE")
        user_d = User.objects.get(user_id=4)
        notice_set = Notification.objects.filter(
            classification=NoticeType.NEW_DISCUSSION,
            user=user_d,
            from_user=user_a,
            discussion=discussion_a
        )
        self.assertEqual(notice_set.count(), 1)

        user_a.profile_picture = []
        user_a.save()
        response = client.post(
            "/api/repositories/1/discussions/",
            json.dumps({"title": "DISS_C_TITLE", "text": "DISS_C_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("DISS_C_TITLE", response.content.decode())
        self.assertNotIn(user_a_profile_picture, response.content.decode())

        response = client.post(
            "/api/repositories/1/discussions/",
            json.dumps({"title": "DISS_A_TITLE"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_get_discussions(self):
        client = Client()
        response = client.get(
            "/api/repositories/1/discussions/",
        )
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_B_USER", "password": "TEST_B_PW"}),
            content_type="application/json",
        )

        response = client.get(
            "/api/repositories/5/discussions/",
        )
        self.assertEqual(response.status_code, 404)

        response = client.get(
            "/api/repositories/1/discussions/",
        )
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get(
            "/api/repositories/1/discussions/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("DISS_B_TITLE", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

    def test_discussionID_get(self):
        client = Client()
        response = client.post("/api/discussions/1/")
        self.assertEqual(response.status_code, 405)
        response = client.get("/api/discussions/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.get("/api/discussions/10/")
        self.assertEqual(response.status_code, 404)

        response = client.get(
            "/api/discussions/1/",
        )
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get(
            "/api/discussions/1/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("DISS_B_TITLE", response.content.decode())
        self.assertIn("COM_A_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

    def test_discussionID_delete(self):
        client = Client()
        response = client.delete("/api/discussions/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.delete("/api/discussions/10/")
        self.assertEqual(response.status_code, 404)

        response = client.delete(
            "/api/discussions/1/",
        )
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.delete("/api/discussions/1/")
        self.assertEqual(response.status_code, 202)

    def test_discussionID_put(self):
        client = Client()
        response = client.put("/api/discussions/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )
        response = client.put("/api/discussions/10/")
        self.assertEqual(response.status_code, 404)

        response = client.put(
            "/api/discussions/1/",
        )
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )
        response = client.put("/api/discussions/1/")
        self.assertEqual(response.status_code, 400)
        response = client.put(
            "/api/discussions/1/",
            json.dumps({"title": "EDIT_TITLE", "text": "EDIT_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("DISS_B_TITLE", response.content.decode())
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertIn("EDIT_TITLE", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

        response = client.put(
            "/api/discussions/1/",
            json.dumps({"title": "", "text": "EDIT_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class DiscussionCommentTestCase(TestCase):
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
        User.objects.create_user(
            username="TEST_B_USER",
            real_name="TEST_B_REAL",
            email="TEST_B_EMAIL",
            password="TEST_B_PW",
            visibility=Scope.PUBLIC,
            bio="TEST_B_BIO",
        )
        User.objects.create_user(
            username="TEST_C_USER",
            real_name="TEST_C_REAL",
            email="TEST_C_EMAIL",
            password="TEST_C_PW",
            visibility=Scope.PUBLIC,
            bio="TEST_C_BIO",
        )
        user_a = User.objects.get(user_id=1)
        user_b = User.objects.get(user_id=2)
        repo_a = Repository(
            repo_name="REPO_A_NAME", visibility=Scope.PUBLIC, owner=user_a
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.collaborators.add(user_b)
        diss_a = Discussion(
            repository=repo_a, author=user_a, title="DISS_A_TITLE", text="DISS_A_TEXT"
        )
        diss_a.save()
        diss_b = Discussion(
            repository=repo_a, author=user_b, title="DISS_B_TITLE", text="DISS_B_TEXT"
        )
        diss_b.save()
        com_a = DiscussionComment(author=user_a, text="COM_A_TEXT", discussion=diss_a)
        com_a.save()
        com_b = DiscussionComment(author=user_a, text="COM_B_TEXT", discussion=diss_b)
        com_b.save()
        com_d = DiscussionComment(author=user_a, text="COM_D_TEXT", discussion=diss_a)
        com_d.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Discussion.objects.all().delete()
        DiscussionComment.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def test_discussionComments_post(self):
        client = Client()
        response = client.delete("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 405)

        response = client.post("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.post("/api/discussions/10/comments/")
        self.assertEqual(response.status_code, 404)

        response = client.post("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.post("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 400)

        response = client.post(
            "/api/discussions/1/comments/",
            json.dumps({"text": "COM_C_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        self.assertIn("COM_C_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

        response = client.post(
            "/api/discussions/2/comments/",
            json.dumps({"text": "COM_D_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("COM_D_TEXT", response.content.decode())
        discussion_b = Discussion.objects.get(discussion_id=2)
        user_b = User.objects.get(user_id=2)
        notice_set = Notification.objects.filter(
            classification=NoticeType.COMMENT,
            discussion=discussion_b,
            user=user_b,
            from_user=user_a
        )
        self.assertEqual(notice_set.count(), 1)


    def test_discussionComments_get(self):
        client = Client()

        response = client.get("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/discussions/10/comments/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/discussions/1/comments/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

    def test_discussionCommentsID_get(self):
        client = Client()

        response = client.post("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 405)

        response = client.get("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/discussions/1/comments/10/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/discussions/10/comments/1/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/discussions/2/comments/1/")
        self.assertEqual(response.status_code, 410)

        response = client.get("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

    def test_discussionCommentsID_delete(self):
        client = Client()

        response = client.delete("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.delete("/api/discussions/1/comments/10/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/discussions/10/comments/1/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/discussions/2/comments/1/")
        self.assertEqual(response.status_code, 410)

        response = client.delete("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.delete("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 202)
        self.assertNotIn("COM_A_TEXT", response.content.decode())
        self.assertIn("COM_D_TEXT", response.content.decode())

    def test_discussionCommentsID_put(self):
        client = Client()

        response = client.put("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.put("/api/discussions/1/comments/10/")
        self.assertEqual(response.status_code, 404)

        response = client.put("/api/discussions/10/comments/1/")
        self.assertEqual(response.status_code, 404)

        response = client.put("/api/discussions/2/comments/1/")
        self.assertEqual(response.status_code, 410)

        response = client.put("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.put("/api/discussions/1/comments/1/")
        self.assertEqual(response.status_code, 400)

        response = client.put(
            "/api/discussions/1/comments/1/",
            json.dumps({"text": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client.put(
            "/api/discussions/1/comments/1/",
            json.dumps({"text": "EDIT_TEXT"}),
            content_type="application/json",
        )

        self.assertNotIn("COM_A_TEXT", response.content.decode())
        self.assertIn("EDIT_TEXT", response.content.decode())
        self.assertIn("COM_D_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())
