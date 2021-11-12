from django.test import TestCase, Client
import json

from project.enum import Scope
from project.models.models import User

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

    def test_signin_siginout_session(self):
        clientA = Client()
        response = clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_USER_A", response.content.decode())
        
        response = clientA.get('/api/session/')
        self.assertEqual(response.status_code, 200)
        self.assertIn("TEST_USER_A", response.content.decode())

        response = clientA.get('/api/signout/')
        self.assertEqual(response.status_code, 200)

    def test_post_users(self):
        anonymousUser = Client()
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

        anonymousUser.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_E", 'password' : "TEST_PASSWORD_E"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)

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