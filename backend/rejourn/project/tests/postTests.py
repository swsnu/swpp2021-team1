import json
import shutil
import tempfile

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from project.models.models import Post, PostComment, Repository, User, Notification
from project.enum import Scope, NoticeType


MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PostTestCase(TestCase):
    def setUp(self):
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

        p_1 = Post(repository=r_1, author=u_1, title="p_1_TITLE", text="p_1_TEXT")
        p_1.save()
        p_2 = Post(repository=r_1, author=u_2, title="p_2_TITLE", text="p_2_TEXT")
        p_2.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Post.objects.all().delete()

    def test_userPosts_get(self):
        client = Client()
        response = client.post(
            "/api/users/u_1_USERNAME/posts/",
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            "/api/users/u_1_USERNAME/posts/",
        )
        self.assertEqual(response.status_code, 200)

        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        response = client.get(
            "/api/users/u_10_USERNAME/posts/",
        )
        self.assertEqual(response.status_code, 404)

        response = client.get(
            "/api/users/u_1_USERNAME/posts/",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("p_1_TITLE", response.content.decode())
        self.assertIn("u_1_USERNAME", response.content.decode())

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "U4_USERNAME", "password": "U4_PASSWORD"}),
            content_type="application/json",
        )
        response = client.get(
            "/api/users/u_2_USERNAME/posts/",
        )
        self.assertEqual(response.status_code, 200)

    def test_repoPosts_post(self):
        client = Client()
        response = client.delete(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 405)
        response = client.post(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "U4_USERNAME", "password": "U4_PASSWORD"}),
            content_type="application/json",
        )
        response = client.post(
            "/api/repositories/10/posts/",
        )
        self.assertEqual(response.status_code, 404)
        response = client.post(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        response = client.post(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 400)
        response = client.post(
            "/api/repositories/1/posts/",
            json.dumps({"title": "P3_TITLE", "text": "P3_TEXT", "photos": []}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("P3_TITLE", response.content.decode())

        user_1 = User.objects.get(username="u_1_USERNAME")
        user_2 = User.objects.get(username='u_2_USERNAME')
        post_3 = Post.objects.get(title='P3_TITLE')
        notice_set = Notification.objects.filter(
            classification=NoticeType.NEW_POST,
            user=user_2,
            from_user=user_1,
            post=post_3,
        )
        self.assertEqual(notice_set.count(), 1)

    def test_repoPosts_get(self):
        client = Client()
        response = client.delete(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 403)

        client.post(
            "/api/signin/",
            json.dumps({"username": "U4_USERNAME", "password": "U4_PASSWORD"}),
            content_type="application/json",
        )
        response = client.get(
            "/api/repositories/10/posts/",
        )
        self.assertEqual(response.status_code, 404)
        response = client.get(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 403)
        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        client.get(
            "/api/repositories/1/posts/",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("p_2_TITLE", response.content.decode())
        self.assertIn("u_1_USERNAME", response.content.decode())

    def test_postID_get(self):
        client = Client()
        response = client.post(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 403)

        client.post(
            "/api/signin/",
            json.dumps({"username": "U4_USERNAME", "password": "U4_PASSWORD"}),
            content_type="application/json",
        )
        response = client.get(
            "/api/posts/10/",
        )
        self.assertEqual(response.status_code, 404)
        response = client.get(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 403)
        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        response = client.get("/api/posts/1/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("p_1_TITLE", response.content.decode())
        self.assertIn("u_1_USERNAME", response.content.decode())

    def test_postID_delete(self):
        p_1 = Post.objects.get(post_id=1)
        client = Client()
        response = client.delete(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "U4_USERNAME", "password": "U4_PASSWORD"}),
            content_type="application/json",
        )
        response = client.delete(
            "/api/posts/10/",
        )
        self.assertEqual(response.status_code, 404)
        response = client.delete(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 403)
        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        response = client.delete("/api/posts/1/")
        self.assertEqual(response.status_code, 202)
        self.assertNotIn(p_1, Post.objects.all())

    def test_postID_put(self):
        client = Client()
        response = client.put(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "U4_USERNAME", "password": "U4_PASSWORD"}),
            content_type="application/json",
        )
        response = client.put(
            "/api/posts/10/",
        )
        self.assertEqual(response.status_code, 404)
        response = client.put(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 403)
        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "u_1_USERNAME", "password": "u_1_PASSWORD"}),
            content_type="application/json",
        )
        response = client.put(
            "/api/posts/1/",
        )
        self.assertEqual(response.status_code, 400)

        response = client.put(
            "/api/posts/1/",
            json.dumps({"title": "EDIT_TITLE", "text": "EDIT_TEXT", "photos": []}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("EDIT_TITLE", response.content.decode())


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PostCommentTestCase(TestCase):
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
            repo_name="REPO_A_NAME", visibility=Scope.PRIVATE, owner=user_a
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.collaborators.add(user_b)
        post_a = Post(
            repository=repo_a, author=user_a, title="DISS_A_TITLE", text="DISS_A_TEXT"
        )
        post_a.save()
        post_b = Post(
            repository=repo_a, author=user_b, title="DISS_B_TITLE", text="DISS_B_TEXT"
        )
        post_b.save()
        com_a = PostComment(author=user_a, text="COM_A_TEXT", post=post_a)
        com_a.save()
        com_b = PostComment(author=user_a, text="COM_B_TEXT", post=post_b)
        com_b.save()
        com_d = PostComment(author=user_a, text="COM_D_TEXT", post=post_a)
        com_d.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Post.objects.all().delete()
        PostComment.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def test_postComments_post(self):
        client = Client()
        response = client.delete("/api/posts/1/comments/")
        self.assertEqual(response.status_code, 405)

        response = client.post("/api/posts/1/comments/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.post("/api/posts/10/comments/")
        self.assertEqual(response.status_code, 404)

        response = client.post("/api/posts/1/comments/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.post("/api/posts/1/comments/")
        self.assertEqual(response.status_code, 400)

        response = client.post(
            "/api/posts/1/comments/",
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
            "/api/posts/2/comments/",
            json.dumps({"text": "COM_D_TEXT"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("COM_D_TEXT", response.content.decode())

        user_b = User.objects.get(username="TEST_B_USER")
        post_2 = Post.objects.get(post_id=2)
        notice_set = Notification.objects.filter(
            classification=NoticeType.COMMENT,
            user=user_b,
            from_user=user_a,
            post=post_2
        )
        self.assertEqual(notice_set.count(), 1)


    def test_postComments_get(self):
        client = Client()

        response = client.get("/api/posts/10/comments/")
        self.assertEqual(response.status_code, 404)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/posts/10/comments/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/posts/1/comments/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/posts/1/comments/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

    def test_postCommentsID_get(self):
        client = Client()

        response = client.post("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 405)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/posts/1/comments/10/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/posts/10/comments/1/")
        self.assertEqual(response.status_code, 404)

        response = client.get("/api/posts/2/comments/1/")
        self.assertEqual(response.status_code, 410)

        response = client.get("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.get("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())

    def test_postCommentsID_delete(self):
        client = Client()

        response = client.delete("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.delete("/api/posts/1/comments/10/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/posts/10/comments/1/")
        self.assertEqual(response.status_code, 404)

        response = client.delete("/api/posts/2/comments/1/")
        self.assertEqual(response.status_code, 410)

        response = client.delete("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 403)

        client.get(
            "/api/signout/",
        )
        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_A_USER", "password": "TEST_A_PW"}),
            content_type="application/json",
        )

        response = client.delete("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 202)
        self.assertNotIn("COM_A_TEXT", response.content.decode())
        self.assertIn("COM_D_TEXT", response.content.decode())

    def test_postCommentsID_put(self):
        client = Client()

        response = client.put("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 401)

        client.post(
            "/api/signin/",
            json.dumps({"username": "TEST_C_USER", "password": "TEST_C_PW"}),
            content_type="application/json",
        )

        response = client.put("/api/posts/1/comments/10/")
        self.assertEqual(response.status_code, 404)

        response = client.put(
            "/api/posts/1/comments/1/",
            json.dumps({"text": "EDIT_TEXT"}),
            content_type="application/json",
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

        response = client.put("/api/posts/1/comments/1/")
        self.assertEqual(response.status_code, 400)

        response = client.put(
            "/api/posts/2/comments/1/",
            json.dumps({"text": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client.put(
            "/api/posts/1/comments/1/",
            json.dumps({"text": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client.put(
            "/api/posts/1/comments/1/",
            json.dumps({"text": "EDIT_TEXT"}),
            content_type="application/json",
        )

        self.assertNotIn("COM_A_TEXT", response.content.decode())
        self.assertIn("EDIT_TEXT", response.content.decode())
        self.assertIn("COM_D_TEXT", response.content.decode())
        user_a = User.objects.get(user_id=1)
        self.assertIn(user_a.profile_picture.url, response.content.decode())
