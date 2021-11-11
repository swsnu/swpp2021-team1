from django.test import TestCase, Client
import json

from project.models.models import User, Repository

from project.enum import Scope

class RepositoryTestCase(TestCase):

    # UserA, UserB, UserC, UserD, UserE : PUBLIC
    # UserC & UserD are friends
    # RepoA : { PUBLIC / owner : UserA / collaborators : UserA /
    #           travel_start_date : 2021-11-09 / travel_end_date : 2021-11-10}
    # RepoB : { FRIENDS_ONLY / owner : UserB / collaborators : UserB, UserC /
    #           travel_start_date : 2021-11-11 / travel_end_date : 2021-11-12 }
    # RepoC : { PRIVATE / owner : UserC / collaborators : UserC, UserD / 
    #           travel_start_date : 2021-11-13 / travel_end_date : 2021-11-14}

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
        'visibility' : Scope.PUBLIC,
        'bio' : 'My name is REAL_USER_B!',
    }

    stubUserC = {
        'username' : 'TEST_USER_C',
        'real_name' : 'REAL_USER_C',
        'email' : 'TEST_USER_C@test.com',
        'password' : 'TEST_PASSWORD_C',
        'visibility' : Scope.PUBLIC,
        'bio' : 'My name is REAL_USER_C!',
    }

    stubUserD = {
        'username' : 'TEST_USER_D',
        'real_name' : 'REAL_USER_D',
        'email' : 'TEST_USER_D@test.com',
        'password' : 'TEST_PASSWORD_D',
        'visibility' : Scope.PUBLIC,
        'bio' : 'My name is REAL_USER_D!',
    }

    stubUserE = {
        'username' : 'TEST_USER_E',
        'real_name' : 'REAL_USER_E',
        'email' : 'TEST_USER_E@test.com',
        'password' : 'TEST_PASSWORD_E',
        'visibility' : Scope.PUBLIC,
        'bio' : 'My name is REAL_USER_E!',
    }
    
    stubRepoA = {
        'repo_name' : 'TEST_REPO_A',
        'visibility' : Scope.PUBLIC,
        'owner' : 'TEST_USER_A',
        'travel_start_date' : '2021-11-09',
        'travel_end_date' : '2021-11-10',
        'collaborators' : ['TEST_USER_A'],
    }

    stubRepoB = {
        'repo_name' : 'TEST_REPO_B',
        'visibility' : Scope.FRIENDS_ONLY,
        'owner' : 'TEST_USER_B',
        'travel_start_date' : '2021-11-11',
        'travel_end_date' : '2021-11-12',
        'collaborators' : ['TEST_USER_B', 'TEST_USER_C'],
    }

    stubRepoC = {
        'repo_name' : 'TEST_REPO_C',
        'visibility' : Scope.PRIVATE,
        'owner' : 'TEST_USER_C',
        'travel_start_date' : '2021-11-13',
        'travel_end_date' : '2021-11-14',
        'collaborators' : ['TEST_USER_C', 'TEST_USER_D'],
    }


    def setUp(self):
        userA = User(
            username=self.stubUserA['username'],
            real_name=self.stubUserA['real_name'],
            email=self.stubUserA['email'],
            password=self.stubUserA['password'],
            visibility=self.stubUserA['visibility'],
            bio=self.stubUserA['bio']
        )
        userA.save()
        userB = User(
            username=self.stubUserB['username'],
            real_name=self.stubUserB['real_name'],
            email=self.stubUserB['email'],
            password=self.stubUserB['password'],
            visibility=self.stubUserB['visibility'],
            bio=self.stubUserB['bio']
        )
        userB.save()
        userC = User(
            username=self.stubUserC['username'],
            real_name=self.stubUserC['real_name'],
            email=self.stubUserC['email'],
            password=self.stubUserC['password'],
            visibility=self.stubUserC['visibility'],
            bio=self.stubUserC['bio']
        )
        userC.save()
        userD = User(
            username=self.stubUserD['username'],
            real_name=self.stubUserD['real_name'],
            email=self.stubUserD['email'],
            password=self.stubUserD['password'],
            visibility=self.stubUserD['visibility'],
            bio=self.stubUserD['bio']
        )
        userD.save()
        userE = User(
            username=self.stubUserE['username'],
            real_name=self.stubUserE['real_name'],
            email=self.stubUserE['email'],
            password=self.stubUserE['password'],
            visibility=self.stubUserE['visibility'],
            bio=self.stubUserE['bio']
        )
        userE.save()

        repoA = Repository(
            repo_name=self.stubRepoA['repo_name'],
            visibility=self.stubRepoA['visibility'],
            owner=userA,
            travel_start_date=self.stubRepoA['travel_start_date'],
            travel_end_date=self.stubRepoA['travel_end_date']
        )
        repoA.save()
        repoA.collaborators.add(userA)
        repoA.save()

        repoB = Repository(
            repo_name=self.stubRepoB['repo_name'],
            visibility=self.stubRepoB['visibility'],
            owner=userB,
            travel_start_date=self.stubRepoB['travel_start_date'],
            travel_end_date=self.stubRepoB['travel_end_date']
        )
        repoB.save()
        repoB.collaborators.add(userB)
        repoB.collaborators.add(userC)
        repoB.save()

        repoC = Repository(
            repo_name=self.stubRepoC['repo_name'],
            visibility=self.stubRepoC['visibility'],
            owner=userC,
            travel_start_date=self.stubRepoC['travel_start_date'],
            travel_end_date=self.stubRepoC['travel_end_date']
        )
        repoC.save()
        repoC.collaborators.add(userC)
        repoC.collaborators.add(userD)
        repoC.save()
        

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
    

    def test_repositories(self):
        clientA = Client()
        response = clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        print(User.objects.get(username="TEST_USER_A"))
        self.assertEqual(response.status_code, 201)
        
        clientB = Client()
        clientB.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_B", 'password' : "TEST_PASSWORD_B"}), 
            content_type='application/json'
        )
        clientAnonymous = Client()
        response = clientAnonymous.delete(
            '/api/repositories/'
        )
        self.assertEqual(response.status_code, 405)

        response = clientAnonymous.post(
            '/api/repositories/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_A',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : Scope.PRIVATE,
            'owner' : 'TEST_USER_B',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "2021-12-02",
        }),
        content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)

        response = clientA.post(
            '/api/repositories/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
            }))
        self.assertEqual(response.status_code, 400)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : 3,
            'owner' : 'TEST_USER_B',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "2021-12-02",
        }), content_type='application/json')
        self.assertEqual(response.status_code, 403)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : Scope.PRIVATE,
            'owner' : 'TEST_USER_B',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "2021-12-02",
            'collaborators' : ['unknown'],
        }), content_type='application/json')
        self.assertEqual(response.status_code, 403)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : Scope.PRIVATE,
            'owner' : 'TEST_USER_B',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "20211202",
        }), content_type='application/json')
        self.assertEqual(response.status_code, 403)
        
        response = clientAnonymous.post(
            '/api/repositories/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_A',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("TEST_REPO", response.content.decode())

        

    def test_repositoryID(self):
        pass

    def test_repositoryCollaborators(self):
        pass

