from django.test import TestCase, Client
import json

from project.enum import Scope
from project.models.models import User

import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class UserTestCase(TestCase):

    # UserA : PUBLIC
    # UserB : FRIENDS_ONLY
    # UserC : FRIENDS_ONLY
    # UserD : PRIVATE
    # AnonymousUser : not logged_in
    # UserB & user C are friends
    
    stubUserA = {
        'username' : 'TEST_USER_A',
        'real_name' : 'REAL_USER_A',
        'email' : 'TEST_USER_A@test.com',
        'password' : 'TEST_PASSWORD_A',
        'visibility' : Scope.PUBLIC,
        'bio' : 'My name is REAL_USER_A!',
    }

    stubUserB = {
        'username' : 'TEST_USER_B',
        'real_name' : 'REAL_USER_B',
        'email' : 'TEST_USER_B@test.com',
        'password' : 'TEST_PASSWORD_B',
        'visibility' : Scope.FRIENDS_ONLY,
        'bio' : 'My name is REAL_USER_B!',
    }

    stubUserC = {
        'username' : 'TEST_USER_C',
        'real_name' : 'REAL_USER_C',
        'email' : 'TEST_USER_C@test.com',
        'password' : 'TEST_PASSWORD_C',
        'visibility' : Scope.FRIENDS_ONLY,
        'bio' : 'My name is REAL_USER_C!',
    }

    stubUserD = {
        'username' : 'TEST_USER_D',
        'real_name' : 'REAL_USER_D',
        'email' : 'TEST_USER_D@test.com',
        'password' : 'TEST_PASSWORD_D',
        'visibility' : Scope.PRIVATE,
        'bio' : 'My name is REAL_USER_D!',
    }

    def setUp(self):
        User.objects.create_user(username=self.stubUserA['username'], real_name=self.stubUserA['real_name'], 
                                email=self.stubUserA['email'], password=self.stubUserA['password'], 
                                visibility=self.stubUserA['visibility'], bio=self.stubUserA['bio'])   
        User.objects.create_user(username=self.stubUserB['username'], real_name=self.stubUserB['real_name'], 
                                email=self.stubUserB['email'], password=self.stubUserB['password'], 
                                visibility=self.stubUserB['visibility'], bio=self.stubUserB['bio'])    
        User.objects.create_user(username=self.stubUserC['username'], real_name=self.stubUserC['real_name'], 
                                email=self.stubUserC['email'], password=self.stubUserC['password'], 
                                visibility=self.stubUserC['visibility'], bio=self.stubUserC['bio']) 
        User.objects.create_user(username=self.stubUserD['username'], real_name=self.stubUserD['real_name'], 
                                email=self.stubUserD['email'], password=self.stubUserD['password'], 
                                visibility=self.stubUserD['visibility'], bio=self.stubUserD['bio']) 
        userB = User.objects.get(username="TEST_USER_B")
        userC = User.objects.get(username="TEST_USER_C")
        userB.friends.add(userC)
        userB.save()

    def tearDown(self):
        User.objects.all().delete()

    def test_signin_siginout_session_token(self):
        clientA = Client()

        response = clientA.delete('/api/token/')
        self.assertEqual(response.status_code, 405)

        response = clientA.get('/api/signout/')
        self.assertEqual(response.status_code, 401)

        response = clientA.delete('/api/signin/')
        self.assertEqual(response.status_code, 405)

        response = clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_A", response.content.decode())

        response = clientA.post('/api/signin/')
        self.assertEqual(response.status_code, 400)
        
        response = clientA.get('/api/session/')
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_A", response.content.decode())

        response = clientA.delete('/api/session/')
        self.assertEqual(response.status_code, 405)

        response = clientA.get('/api/signout/')
        self.assertEqual(response.status_code, 200)

        response = clientA.delete('/api/signout/')
        self.assertEqual(response.status_code, 405)

    def test_post_users(self):
        anonymousUser = Client()

        response = anonymousUser.delete('/api/users/')
        self.assertEqual(response.status_code, 405)

        response = anonymousUser.post('/api/users/')
        self.assertEqual(response.status_code, 400)
        response = anonymousUser.post(
            '/api/users/',
            json.dumps({
                'username' : 'TEST_USER_E',
                'real_name' : 'REAL_USER_E',
                'email' : 'TEST_USER_E@test.com',
                'password' : 'TEST_PASSWORD_E',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_E!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_E", response.content.decode())

        response = anonymousUser.post(
            '/api/users/',
            json.dumps({
                'username' : 'TEST_USER_A',
                'real_name' : 'REAL_USER_A',
                'email' : 'TEST_USER_A@test.com',
                'password' : 'TEST_PASSWORD_A',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_A!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 410)


    def test_delete_userID(self):
        client = Client()
        response = client.delete(
            '/api/users/TEST_USER_A/',
        )
        self.assertEqual(response.status_code, 401)
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        response = client.delete(
            '/api/users/TEST_USER_B/',
        )
        self.assertEqual(response.status_code, 403)
        response = client.delete(
            '/api/users/TEST_USER_A/',
        )
        self.assertEqual(response.status_code, 202)

    def test_put_userID(self):
        client = Client()
        response = client.post(
            '/api/users/TEST_USER_A/',
            json.dumps({
                'username' : 'TEST_USER_E',
                'real_name' : 'REAL_USER_E',
                'email' : 'TEST_USER_E@test.com',
                'password' : 'TEST_PASSWORD_E',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_E!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 405)
        response = client.put(
            '/api/users/TEST_USER_A/',
            json.dumps({
                'username' : 'TEST_USER_E',
                'real_name' : 'REAL_USER_E',
                'email' : 'TEST_USER_E@test.com',
                'password' : 'TEST_PASSWORD_E',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_E!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        response = client.put(
            '/api/users/TEST_USER_B/',
            json.dumps({
                'username' : 'TEST_USER_E',
                'real_name' : 'REAL_USER_E',
                'email' : 'TEST_USER_E@test.com',
                'password' : 'TEST_PASSWORD_E',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_E!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)
        response = client.put(
            '/api/users/TEST_USER_A/',
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        response = client.put(
            '/api/users/TEST_USER_A/',
            json.dumps({
                'username' : 'TEST_USER_B',
                'real_name' : 'REAL_USER_E',
                'email' : 'TEST_USER_E@test.com',
                'password' : 'TEST_PASSWORD_E',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_E!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 410)
        response = client.put(
            '/api/users/TEST_USER_A/',
            json.dumps({
                'username' : 'TEST_USER_E',
                'real_name' : 'REAL_USER_E',
                'email' : 'TEST_USER_E@test.com',
                'password' : 'TEST_PASSWORD_E',
                'visibility' : Scope.PRIVATE,
                'bio' : 'My name is REAL_USER_E!',
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_E", response.content.decode())

    def test_get_userID(self):
        client = Client()
        response = client.get(
            '/api/users/TEST_USER_Z/',
        )
        self.assertEqual(response.status_code, 404)
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/users/TEST_USER_A/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("REAL_USER_A", response.content.decode())
        response = client.get(
            '/api/users/TEST_USER_D/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("TEST_USER_D@test.com", response.content.decode())
        response = client.get(
            '/api/users/TEST_USER_B/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("TEST_USER_B@test.com", response.content.decode())


        response = client.get(
            '/api/signout/',
        )

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_C", 'password' : "TEST_PASSWORD_C"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/users/TEST_USER_B/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_B@test.com", response.content.decode())
        response = client.get(
            '/api/users/TEST_USER_A/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_A@test.com", response.content.decode())

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class UserFriendTestCase(TestCase):
    def setUp(self):
        imageA = SimpleUploadedFile('test.jpg', b'imageA')
        User.objects.create_user(username='TEST_A_USER', real_name='TEST_A_REAL', 
                                email='TEST_A_EMAIL', password='TEST_A_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_A_BIO', profile_picture=imageA)
        imageB = SimpleUploadedFile('test.jpg', b'imageB')
        User.objects.create_user(username='TEST_B_USER', real_name='TEST_B_REAL', 
                                email='TEST_B_EMAIL', password='TEST_B_PW', 
                                visibility=Scope.FRIENDS_ONLY, bio='TEST_B_BIO',
                                profile_picture=imageB)
        User.objects.create_user(username='TEST_C_USER', real_name='TEST_C_REAL', 
                                email='TEST_C_EMAIL', password='TEST_C_PW', 
                                visibility=Scope.PRIVATE, bio='TEST_C_BIO')
        User.objects.create_user(username='TEST_D_USER', real_name='TEST_D_REAL', 
                                email='TEST_D_EMAIL', password='TEST_D_PW', 
                                visibility=Scope.PRIVATE, bio='TEST_D_BIO')

        u1 = User.objects.get(username='TEST_A_USER')
        u2 = User.objects.get(username='TEST_B_USER')
        u3 = User.objects.get(username='TEST_C_USER')
        u4 = User.objects.get(username='TEST_D_USER')

        u1.friends.add(u2)
        u1.friends.add(u3)
        u1.friends.add(u4)

    def tearDown(self):
        User.objects.all().delete()
    
    def test_userFriends_get(self):
        client = Client()
        response = client.delete('/api/users/TEST_A_USER/friends/')
        self.assertEqual(response.status_code, 405)

        response = client.get('/api/users/TEST_E_USER/friends/')
        self.assertEqual(response.status_code, 404)

        response = client.get('/api/users/TEST_A_USER/friends/')
        self.assertEqual(response.status_code, 200)
        u2 = User.objects.get(user_id=2)
        self.assertIn(u2.profile_picture.url, response.content.decode())
        self.assertIn('TEST_C_USER', response.content.decode())

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )
        response = client.get('/api/users/TEST_C_USER/friends/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('TEST_A_USER', response.content.decode())

        response = client.get('/api/users/TEST_B_USER/friends/')
        self.assertEqual(response.status_code, 403)

        response = client.get('/api/signout')
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )
        response = client.get('/api/users/TEST_B_USER/friends/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('TEST_A_USER', response.content.decode())

        response = client.get('/api/users/TEST_C_USER/friends/')
        self.assertEqual(response.status_code, 403)

    def test_userFriendID_post(self):
        client = Client()
        response = client.get('/api/users/TEST_A_USER/friends/TEST_B_USER/')
        self.assertEqual(response.status_code, 405)

        response = client.post('/api/users/TEST_A_USER/friends/TEST_B_USER/')
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.post('/api/users/TEST_A_USER/friends/TEST_B_USER/')
        self.assertEqual(response.status_code, 403)

        response = client.post('/api/users/TEST_C_USER/friends/TEST_E_USER/')
        self.assertEqual(response.status_code, 404)

        response = client.post('/api/users/TEST_C_USER/friends/TEST_B_USER/')
        self.assertEqual(response.status_code, 201)
        u2 = User.objects.get(user_id=2)
        self.assertIn(u2.profile_picture.url, response.content.decode())

        response = client.get('/api/signout')
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_B_USER", 'password' : "TEST_B_PW"}), 
            content_type='application/json'
        )
        response = client.post('/api/users/TEST_B_USER/friends/TEST_C_USER/')
        self.assertEqual(response.status_code, 201)

    def test_userFriendID_delete(self):
        client = Client()

        response = client.delete('/api/users/TEST_A_USER/friends/TEST_B_USER/')
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.delete('/api/users/TEST_C_USER/friends/TEST_B_USER/')
        self.assertEqual(response.status_code, 403)

        response = client.delete('/api/users/TEST_A_USER/friends/TEST_E_USER/')
        self.assertEqual(response.status_code, 404)

        response = client.delete('/api/users/TEST_A_USER/friends/TEST_C_USER/')
        self.assertEqual(response.status_code, 202)
        u2 = User.objects.get(user_id=2)
        self.assertIn(u2.profile_picture.url, response.content.decode())
        self.assertNotIn('TEST_C_USER', response.content.decode())
        self.assertIn('TEST_D_USER', response.content.decode())


