from django.test import TestCase, Client
import json

from project.models.models import Post, PostComment, PhotoInPost, Repository, User

from project.enum import Scope

import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PostTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(username='U1_USERNAME', real_name='U1_REALNAME', 
                                email='U1_EMAIL', password='U1_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U1_BIO')
        User.objects.create_user(username='U2_USERNAME', real_name='U2_REALNAME', 
                                email='U2_EMAIL', password='U2_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U2_BIO')
        User.objects.create_user(username='U3_USERNAME', real_name='U3_REALNAME', 
                                email='U3_EMAIL', password='U3_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U3_BIO')
        User.objects.create_user(username='U4_USERNAME', real_name='U4_REALNAME', 
                                email='U4_EMAIL', password='U4_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U4_BIO')
        u1 = User.objects.get(user_id=1)
        u2 = User.objects.get(user_id=2)
        u3 = User.objects.get(user_id=3)
        
        u3.friends.add(u1)

        r1 = Repository(repo_name='R1_REPONAME', visibility=Scope.PRIVATE, owner=u1) 
        r1.save()
        r1.collaborators.add(u1)
        r1.collaborators.add(u2)
        r2 = Repository(repo_name='R2_REPONAME', visibility=Scope.PUBLIC, owner=u1)
        r2.save()
        r2.collaborators.add(u1)
        r3 = Repository(repo_name='R3_REPONAME', visibility=Scope.FRIENDS_ONLY, owner=u1)  
        r3.save()
        r3.collaborators.add(u1)

        p1 = Post(repository=r1, author=u1, title='P1_TITLE', text='P1_TEXT')
        p1.save()
        p2 = Post(repository=r1, author=u2, title='P2_TITLE', text='P2_TEXT')
        p2.save()

        
        
    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Post.objects.all().delete()

    def test_userPosts_get(self):
        client = Client()
        response = client.post(
            '/api/users/U1_USERNAME/posts/',
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            '/api/users/U1_USERNAME/posts/',
        )
        self.assertEqual(response.status_code, 200)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/users/U10_USERNAME/posts/',
        )
        self.assertEqual(response.status_code, 404)

        response = client.get(
            '/api/users/U1_USERNAME/posts/',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('P1_TITLE', response.content.decode())
        self.assertIn('U1_USERNAME', response.content.decode())

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U4_USERNAME", 'password' : "U4_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/users/U2_USERNAME/posts/',
        )
        self.assertEqual(response.status_code, 200)

    def test_repoPosts_post(self):
        client = Client()
        response = client.delete(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 405)
        response = client.post(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U4_USERNAME", 'password' : "U4_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.post(
            '/api/repositories/10/posts/',
        )
        self.assertEqual(response.status_code, 404)
        response = client.post(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.post(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 400)
        response = client.post(
            '/api/repositories/1/posts/',
            json.dumps({'title' : "P3_TITLE", 'text' : "P3_TEXT", 'photos': []}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('P3_TITLE', response.content.decode())

    def test_repoPosts_get(self):
        client = Client()
        response = client.delete(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 403)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U4_USERNAME", 'password' : "U4_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/repositories/10/posts/',
        )
        self.assertEqual(response.status_code, 404)
        response = client.get(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 403)
        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/repositories/1/posts/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('P2_TITLE', response.content.decode())
        self.assertIn('U1_USERNAME', response.content.decode())

    def test_postID_get(self):
        client = Client()
        response = client.post(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 403)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U4_USERNAME", 'password' : "U4_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/posts/10/',
        )
        self.assertEqual(response.status_code, 404)
        response = client.get(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 403)
        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/posts/1/'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('P1_TITLE', response.content.decode())
        self.assertIn('U1_USERNAME', response.content.decode())

    def test_postID_delete(self):
        p1 = Post.objects.get(post_id=1)
        client = Client()
        response = client.delete(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U4_USERNAME", 'password' : "U4_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.delete(
            '/api/posts/10/',
        )
        self.assertEqual(response.status_code, 404)
        response = client.delete(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 403)
        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.delete(
            '/api/posts/1/'
        )
        self.assertEqual(response.status_code, 202)
        self.assertNotIn(p1, Post.objects.all())

    def test_postID_put(self):
        p1 = Post.objects.get(post_id=1)
        client = Client()
        response = client.put(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U4_USERNAME", 'password' : "U4_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.put(
            '/api/posts/10/',
        )
        self.assertEqual(response.status_code, 404)
        response = client.put(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 403)
        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), 
            content_type='application/json'
        )
        response = client.put(
            '/api/posts/1/',
        )
        self.assertEqual(response.status_code, 400)

        response = client.put(
            '/api/posts/1/',
            json.dumps({'title' : "EDIT_TITLE", 'text' : "EDIT_TEXT", 'photos': []}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('EDIT_TITLE', response.content.decode())

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PostCommentTestCase(TestCase):
    def setUp(self):
        imageA = SimpleUploadedFile('test.jpg', b'imageA')
        User.objects.create_user(username='TEST_A_USER', real_name='TEST_A_REAL', 
                                email='TEST_A_EMAIL', password='TEST_A_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_A_BIO', profile_picture=imageA)
        User.objects.create_user(username='TEST_B_USER', real_name='TEST_B_REAL', 
                                email='TEST_B_EMAIL', password='TEST_B_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_B_BIO')
        User.objects.create_user(username='TEST_C_USER', real_name='TEST_C_REAL', 
                                email='TEST_C_EMAIL', password='TEST_C_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_C_BIO')
        userA = User.objects.get(user_id=1)
        userB = User.objects.get(user_id=2)
        repoA = Repository(repo_name='REPO_A_NAME', visibility=Scope.PRIVATE, owner=userA)   
        repoA.save()
        repoA.collaborators.add(userA)
        postA = Post(repository=repoA, author=userA, title='DISS_A_TITLE', text='DISS_A_TEXT')
        postA.save()
        postB = Post(repository=repoA, author=userB, title='DISS_B_TITLE', text='DISS_B_TEXT')
        postB.save()
        comA = PostComment(author=userA, text='COM_A_TEXT', post=postA)
        comA.save()
        comB = PostComment(author=userA, text='COM_B_TEXT', post=postB)
        comB.save()
        comD = PostComment(author=userA, text='COM_D_TEXT', post=postA)
        comD.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Post.objects.all().delete()
        PostComment.objects.all().delete()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)


    def test_postComments_post(self):
        client = Client()
        response = client.delete('/api/posts/1/comments/')
        self.assertEqual(response.status_code, 405)

        response = client.post('/api/posts/1/comments/')
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.post('/api/posts/10/comments/')
        self.assertEqual(response.status_code, 404)

        response = client.post('/api/posts/1/comments/')
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.post('/api/posts/1/comments/')
        self.assertEqual(response.status_code, 400)

        response = client.post('/api/posts/1/comments/', json.dumps({'text': "COM_C_TEXT"}), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        self.assertIn("COM_C_TEXT", response.content.decode())
        userA = User.objects.get(user_id=1)
        self.assertIn(userA.profile_picture.url, response.content.decode())

    def test_postComments_get(self):
        client = Client()

        response = client.get('/api/posts/10/comments/')
        self.assertEqual(response.status_code, 404)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.get('/api/posts/10/comments/')
        self.assertEqual(response.status_code, 404)

        response = client.get('/api/posts/1/comments/')
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.get('/api/posts/1/comments/')
        self.assertEqual(response.status_code, 200)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        userA = User.objects.get(user_id=1)
        self.assertIn(userA.profile_picture.url, response.content.decode())

    def test_postCommentsID_get(self):
        client = Client()

        response = client.post('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 405)


        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.get('/api/posts/1/comments/10/')
        self.assertEqual(response.status_code, 404)

        response = client.get('/api/posts/10/comments/1/')
        self.assertEqual(response.status_code, 404)

        response = client.get('/api/posts/2/comments/1/')
        self.assertEqual(response.status_code, 410)

        response = client.get('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.get('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 200)
        self.assertIn("COM_A_TEXT", response.content.decode())
        self.assertNotIn("COM_B_TEXT", response.content.decode())
        userA = User.objects.get(user_id=1)
        self.assertIn(userA.profile_picture.url, response.content.decode())

    def test_postCommentsID_delete(self):
        client = Client()

        response = client.delete('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.delete('/api/posts/1/comments/10/')
        self.assertEqual(response.status_code, 404)

        response = client.delete('/api/posts/10/comments/1/')
        self.assertEqual(response.status_code, 404)

        response = client.delete('/api/posts/2/comments/1/')
        self.assertEqual(response.status_code, 410)

        response = client.delete('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.delete('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 202)
        self.assertNotIn("COM_A_TEXT", response.content.decode())
        self.assertIn("COM_D_TEXT", response.content.decode())

    def test_postCommentsID_put(self):
        client = Client()

        response = client.put('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.put('/api/posts/1/comments/10/')
        self.assertEqual(response.status_code, 404)

        response = client.put('/api/posts/1/comments/1/', json.dumps({'text' : "EDIT_TEXT"}), content_type='application/json')
        self.assertEqual(response.status_code, 403)


        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.put('/api/posts/1/comments/1/')
        self.assertEqual(response.status_code, 400)

        response = client.put('/api/posts/2/comments/1/', json.dumps({'text' : ""}), content_type='application/json')
        self.assertEqual(response.status_code, 410)

        response = client.put('/api/posts/1/comments/1/', json.dumps({'text' : ""}), content_type='application/json')
        self.assertEqual(response.status_code, 410)

        response = client.put('/api/posts/1/comments/1/', json.dumps({'text' : "EDIT_TEXT"}), content_type='application/json')


        self.assertNotIn("COM_A_TEXT", response.content.decode())
        self.assertIn("EDIT_TEXT", response.content.decode())
        self.assertIn("COM_D_TEXT", response.content.decode())
        userA = User.objects.get(user_id=1)
        self.assertIn(userA.profile_picture.url, response.content.decode())



