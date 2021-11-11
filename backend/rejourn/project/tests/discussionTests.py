
from django.test import TestCase, Client
import json

from project.models.models import Discussion, DiscussionComment, Repository, User

from project.enum import Scope

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
        comA = DiscussionComment(author=userA, text='COM_A_TEXT', discussion=dissB)
        comA.save()
        
    
    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Discussion.objects.all().delete()

    def test_post_discussions(self):
        client = Client()
        response = client.delete(
            '/api/repositories/1/discussions/'
        )
        self.assertEqual(response.status_code, 405)

        response = client.post(
            '/api/repositories/1/discussions/',
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
            '/api/repositories/5/discussions/',
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
            '/api/repositories/1/discussions/',
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
            '/api/repositories/1/discussions/',
            json.dumps({'title' : "DISS_A_TITLE", 'text': "DISS_A_TEXT"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("DISS_A_TITLE", response.content.decode())

        response = client.post(
            '/api/repositories/1/discussions/',
            json.dumps({'title' : "DISS_A_TITLE"}), 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_get_discussions(self):
        client = Client()
        response = client.get(
            '/api/repositories/1/discussions/',
        )
        self.assertEqual(response.status_code, 401)


        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_B_USER", 'password' : "TEST_B_PW"}), 
            content_type='application/json'
        )

        response = client.get(
            '/api/repositories/5/discussions/',
        )
        self.assertEqual(response.status_code, 404)

        response = client.get(
            '/api/repositories/1/discussions/',
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
            '/api/repositories/1/discussions/',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('DISS_B_TITLE', response.content.decode())

    def test_discussionID_get(self):
        client = Client()
        response = client.post(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 405)
        response = client.get(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 401)
        

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )
        response = client.get(
            '/api/discussions/10/'
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
        self.assertIn('COM_A_TEXT', response.content.decode())

    def test_discussionID_delete(self):
        client = Client()
        response = client.delete(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 401)
        

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )
        response = client.delete(
            '/api/discussions/10/'
        )
        self.assertEqual(response.status_code, 404)

        response = client.delete(
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
        response = client.delete(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 202)

    def test_discussionID_put(self):
        client = Client()
        response = client.put(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 401)
        

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )
        response = client.put(
            '/api/discussions/10/'
        )
        self.assertEqual(response.status_code, 404)

        response = client.put(
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
        response = client.put(
            '/api/discussions/1/'
        )
        self.assertEqual(response.status_code, 400)
        response = client.put(
            '/api/discussions/1/',
            json.dumps({'title': "EDIT_TITLE", 'text': "EDIT_TEXT"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('DISS_B_TITLE', response.content.decode())
        self.assertIn('COM_A_TEXT', response.content.decode())
        self.assertIn('EDIT_TITLE', response.content.decode())

        response = client.put(
            '/api/discussions/1/',
            json.dumps({'title': "", 'text': "EDIT_TEXT"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 410)

class DiscussionCommentTestCase(TestCase):
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
        dissA = Discussion(repository=repoA, author=userA, title='DISS_B_TITLE', text='DISS_B_TEXT')
        dissA.save()
        comA = DiscussionComment(author=userA, text='COM_A_TEXT', discussion=dissA)
        comA.save()

    def test_discussionComments_post(self):
        client = Client()
        response = client.delete('/api/discussions/1/comments/')
        self.assertEqual(response.status_code, 405)

        response = client.post('/api/discussions/1/comments/')
        self.assertEqual(response.status_code, 401)

        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_C_USER", 'password' : "TEST_C_PW"}), 
            content_type='application/json'
        )

        response = client.post('/api/discussions/10/comments')
        self.assertEqual(response.status_code, 404)

        response = client.post('/api/discussions/1/comment')
        self.assertEqual(response.status_code, 403)

        response = client.get(
            '/api/signout/',
        )
        response = client.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_A_USER", 'password' : "TEST_A_PW"}), 
            content_type='application/json'
        )

        response = client.post('/api/discussions/1/comment')
        self.assertEqual(response.status_code, 400)

        response = client.post('/api/discussions/1/comment', json.dumps({'text': "COM_B_TEXT"}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        




