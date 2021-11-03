from django.test import TestCase, Client
import json

from django.utils import timezone
from datetime import datetime

from .enum import Scope
from .models import *



class ModelsTestCase(TestCase):
    
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
        'visibility' : Scope.PRIVATE,
        'bio' : 'My name is REAL_USER_C!',
    }

    stubRepositoryA = {
        'repo_name' : 'TEST_REPOSITORY_A',
        'visibility' : Scope.PUBLIC,
        # owner,
        # route_id,
        # 'travel_start_date' 
        # 'travel_end_date'
        # collaborators,
    }

    def makeUsers(self):
        User.objects.create_user(username=self.stubUserA['username'], real_name=self.stubUserA['real_name'], 
                                email=self.stubUserA['email'], password=self.stubUserA['password'], 
                                visibility=self.stubUserA['visibility'], bio=self.stubUserA['bio'])   
        User.objects.create_user(username=self.stubUserB['username'], real_name=self.stubUserB['real_name'], 
                                email=self.stubUserB['email'], password=self.stubUserB['password'], 
                                visibility=self.stubUserB['visibility'], bio=self.stubUserB['bio'])    
        User.objects.create_user(username=self.stubUserC['username'], real_name=self.stubUserC['real_name'], 
                                email=self.stubUserC['email'], password=self.stubUserC['password'], 
                                visibility=self.stubUserC['visibility'], bio=self.stubUserC['bio']) 

    def makeRepositories(self):
        repoA = Repository(
            repo_name=self.stubRepositoryA['repo_name'], 
            visibility=self.stubRepositoryA['visibility'],    
        )
        repoA.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()

    def test_user_model(self):
        self.makeUsers()
        self.assertEqual(User.objects.all().count(), 3)

        userA = User.objects.get(user_id=1)
        self.assertEqual(userA.username, "TEST_USER_A")

        userB = User.objects.get(username="TEST_USER_B")
        self.assertEqual(userB.email, "TEST_USER_B@test.com")

        userC = User.objects.get(user_id=3)
        self.assertEqual(userC.visibility, Scope.PRIVATE)

        userA.friends.add(userB)
        userA.friends.add(userC)
        userA.save()
        self.assertEqual(userA.friends.all().count(), 2)
        self.assertEqual(userB.friends.all().count(), 1)
        self.assertEqual(userC.friends.all().count(), 1)
        
        userC.friends.remove(userA)
        userC.save()
        self.assertEqual(userA.friends.all().count(), 1)
        self.assertEqual(userC.friends.all().count(), 0)
        self.assertIn(userB, userA.friends.all())

        userA.visibility = Scope.PRIVATE
        userA.save()
        self.assertEqual(userA.visibility, 2)

    def test_repository_model(self):
        self.makeUsers()
        self.makeRepositories()
        self.assertEqual(Repository.objects.all().count(), 1)

        repoA = Repository.objects.get(repo_id=1)
        self.assertEqual(repoA.repo_name, "TEST_REPOSITORY_A")
        self.assertEqual(repoA.owner, None)
        self.assertEqual(repoA.visibility, Scope.PUBLIC)
        
        self.assertEqual(repoA.travel_start_date, timezone.localtime().date())
        self.assertEqual(repoA.travel_end_date, timezone.localtime().date())
        
        userA = User.objects.get(user_id=1)
        userB = User.objects.get(user_id=2)
        userC = User.objects.get(user_id=3)
        repoA.owner = userA
        repoA.collaborators.add(userA, userB, userC)
        repoA.save()
        self.assertEqual(repoA.owner.username, "TEST_USER_A")
        self.assertEqual(repoA.collaborators.all().count(), 3)
        self.assertIn(userC, repoA.collaborators.all())

        date_string_A = '2023-05-28'
        date_string_B = '2024-5-28'
        new_start_date = timezone.make_aware(
            datetime.strptime(date_string_A, '%Y-%m-%d')
        )
        new_end_date = timezone.make_aware(
            datetime.strptime(date_string_B, '%Y-%m-%d')
        )
        repoA.travel_start_date = new_start_date
        repoA.travel_end_date = new_end_date
        repoA.save()
        self.assertEqual(repoA.travel_start_date.year, 2023)
        self.assertEqual(repoA.travel_start_date.month, 5)
        self.assertEqual(repoA.travel_end_date.month, 5)


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
        


class RepositoryTestCase(TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
    
    def test_post_repositories(self):
        pass

class DiscussionTestCase(TestCase):

    
    def setUp(self):
        User.objects.create_user(username='TEST_A_USER', real_name='TEST_A_REAL', 
                                email='TEST_A_EMAIL', password='TEST_A_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_A_BIO')
        User.objects.create_user(username='TEST_B_USER', real_name='TEST_B_REAL', 
                                email='TEST_B_EMAIL', password='TEST_B_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_B_BIO')
        User.objects.create_user(username='TEST_C_USER', real_name='TEST_C_REAL', 
                                email='TEST_C_EMAIL', password='TEST_C_PW', 
                                visibility=Scope.PUBLIC, bio='TEST_C_BIO')
        userA = User.objects.get(user_id=1)
        repoA = Repository(repo_name='REPO_A_NAME', visibility=Scope.PUBLIC, owner=userA)   
        repoA.save()
        repoA.collaborators.add(userA)
        dissB = Discussion(repository=repoA, author=userA, title='DISS_B_TITLE', text='DISS_B_TEXT')
        dissB.save()
        
    
    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Discussion.objects.all().delete()

    def test_post_discussions(self):
        client = Client()
        response = client.delete(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 405)

        response = client.post(
            '/api/discussions/1/',
            json.dumps({'title' : "DISS_A_TITLE", 'text': "DISS_A_TEXT"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.post(
            '/api/discussions/5/',
            json.dumps({'title' : "DISS_A_TITLE", 'text': "DISS_A_TEXT"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)

        response = client.get(
            '/api/signout/',
        )

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.post(
            '/api/discussions/1/',
            json.dumps({'title' : "DISS_A_TITLE", 'text': "DISS_A_TEXT"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.post(
            '/api/discussions/1/',
            json.dumps({'title' : "DISS_A_TITLE", 'text': "DISS_A_TEXT"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("DISS_A_TITLE", response.content.decode())

        response = client.post(
            '/api/discussions/1/',
            json.dumps({'title' : "DISS_A_TITLE"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_get_discussions(self):
        client = Client()
        response = client.get(
            '/api/discussions/1/',
        )
        self.assertEqual(response.status_code, 401)


        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_B_USER", 'password' : "TEST_B_PW"}), 
            content_type='application/json'
        )

        response = client.get(
            '/api/discussions/5/',
        )
        self.assertEqual(response.status_code, 404)

        response = client.get(
            '/api/discussions/1/',
        )
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.get(
            '/api/discussions/1/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('DISS_B_TITLE', response.content.decode())





