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
        User.objects.create_user(
            username=self.stubUserA['username'],
            real_name=self.stubUserA['real_name'],
            email=self.stubUserA['email'],
            password=self.stubUserA['password'],
            visibility=self.stubUserA['visibility'],
            bio=self.stubUserA['bio']
        )
        userA = User.objects.get(username='TEST_USER_A')
        User.objects.create_user(
            username=self.stubUserB['username'],
            real_name=self.stubUserB['real_name'],
            email=self.stubUserB['email'],
            password=self.stubUserB['password'],
            visibility=self.stubUserB['visibility'],
            bio=self.stubUserB['bio']
        )
        userB = User.objects.get(username='TEST_USER_B')
        User.objects.create_user(
            username=self.stubUserC['username'],
            real_name=self.stubUserC['real_name'],
            email=self.stubUserC['email'],
            password=self.stubUserC['password'],
            visibility=self.stubUserC['visibility'],
            bio=self.stubUserC['bio']
        )
        userC = User.objects.get(username='TEST_USER_C')
        User.objects.create_user(
            username=self.stubUserD['username'],
            real_name=self.stubUserD['real_name'],
            email=self.stubUserD['email'],
            password=self.stubUserD['password'],
            visibility=self.stubUserD['visibility'],
            bio=self.stubUserD['bio']
        )
        userD = User.objects.get(username='TEST_USER_D')
        User.objects.create_user(
            username=self.stubUserE['username'],
            real_name=self.stubUserE['real_name'],
            email=self.stubUserE['email'],
            password=self.stubUserE['password'],
            visibility=self.stubUserE['visibility'],
            bio=self.stubUserE['bio']
        )
        userE = User.objects.get(username='TEST_USER_E')
        userC.friends.add(userD)
        userC.save()

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
        clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        
        clientB = Client()
        clientB.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_B", 'password' : "TEST_PASSWORD_B"}), 
            content_type='application/json'
        )

        clientD = Client()
        clientD.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_D", 'password' : "TEST_PASSWORD_D"}), 
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
                'collaborators' : []
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
            'collaborators' : [],
        }),
        content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)

        response = clientA.post(
            '/api/repositories/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
            }), content_type='application/json')
        self.assertEqual(response.status_code, 400)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : 3,
            'owner' : 'TEST_USER_A',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "2021-12-02",
            'collaborators' : [],
        }), content_type='application/json')
        self.assertEqual(response.status_code, 410)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : Scope.PRIVATE,
            'owner' : 'TEST_USER_A',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "2021-12-02",
            'collaborators' : [{'username': 'unknown'}],
        }), content_type='application/json')
        self.assertEqual(response.status_code, 410)

        response = clientA.post('/api/repositories/', json.dumps({
            'repo_name' : 'TEST_REPO',
            'visibility' : Scope.PRIVATE,
            'owner' : 'TEST_USER_A',
            'travel_start_date' : "2021-12-01",
            'travel_end_date' : "20211202",
            'collaborators' : [],
        }), content_type='application/json')
        self.assertEqual(response.status_code, 410)
        
        response = clientA.post(
            '/api/repositories/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_A',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
                'collaborators' : []
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('"TEST_REPO"', response.content.decode())

        response = clientA.get('/api/repositories/')
        self.assertEqual(response.status_code, 400)
        response = clientA.get('/api/repositories/?owner=TEST_USER_A&username=TEST_USER_A')
        self.assertEqual(response.status_code, 400)
        response = clientA.get('/api/repositories/?owner=unknown')
        self.assertEqual(response.status_code, 410)
        response = clientA.get('/api/repositories/?username=unknown')
        self.assertEqual(response.status_code, 410)

        response = clientA.get('/api/repositories/?owner=TEST_USER_A')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_A"', response.content.decode())
        self.assertIn('"TEST_REPO"', response.content.decode())
        response = clientB.get('/api/repositories/?owner=TEST_USER_A')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_A"', response.content.decode())
        self.assertNotIn('"TEST_REPO"', response.content.decode())

        response = clientD.get('/api/repositories/?owner=TEST_USER_B')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_B"', response.content.decode())
        response = clientD.get('/api/repositories/?username=TEST_USER_B')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_B"', response.content.decode())
        response = clientD.get('/api/repositories/?owner=TEST_USER_C')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_C"', response.content.decode())
        response = clientD.get('/api/repositories/?username=TEST_USER_A')
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('"TEST_REPO"', response.content.decode())


    def test_repositoryID(self):
        clientA = Client()
        clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        clientB = Client()
        clientB.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_B", 'password' : "TEST_PASSWORD_B"}), 
            content_type='application/json'
        )
        clientC = Client()
        clientC.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_C", 'password' : "TEST_PASSWORD_C"}), 
            content_type='application/json'
        )
        clientD = Client()
        clientD.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_D", 'password' : "TEST_PASSWORD_D"}), 
            content_type='application/json'
        )
        clientAnonymous = Client()

        response = clientA.post('/api/repositories/1/')
        self.assertEqual(response.status_code, 405)

        response = clientA.get('/api/repositories/100/')
        self.assertEqual(response.status_code, 404)

        response = clientAnonymous.get('/api/repositories/1/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_A"', response.content.decode())
        self.assertIn('"TEST_USER_A"', response.content.decode())
        response = clientAnonymous.get('/api/repositories/2/')
        self.assertEqual(response.status_code, 403)

        response = clientA.get('/api/repositories/3/')
        self.assertEqual(response.status_code, 403)
        response = clientD.get('/api/repositories/2/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_USER_C"', response.content.decode())
        response = clientD.get('/api/repositories/3/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_USER_C"', response.content.decode())

        response = clientAnonymous.put('/api/repositories/1/')
        self.assertEqual(response.status_code, 401)

        response = clientA.put('/api/repositories/1/',
            json.dumps({'repo_name' : "TEST_REPO_A",
            'owner' : "TEST_USER_A",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        response = clientA.put(
            '/api/repositories/1/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'unknown',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 410)
        response = clientA.put(
            '/api/repositories/1/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : 3,
                'owner' : 'TEST_USER_A',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 410)
        response = clientA.put(
            '/api/repositories/1/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_A',
                'travel_start_date' : "20211201",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        response = clientA.put(
            '/api/repositories/100/',
            json.dumps({
                'repo_name' : 'TEST_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_A',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)
        response = clientB.put(
            '/api/repositories/1/',
            json.dumps({
                'repo_name' : 'CHANGED_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_B',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)

        response = clientA.put(
            '/api/repositories/1/',
            json.dumps({
                'repo_name' : 'CHANGED_REPO',
                'visibility' : Scope.PRIVATE,
                'owner' : 'TEST_USER_B',
                'travel_start_date' : "2021-12-01",
                'travel_end_date' : "2021-12-02",
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('"CHANGED_REPO"', response.content.decode())
        self.assertIn('"TEST_USER_B"', response.content.decode())
        
        response = clientAnonymous.delete('/api/repositories/3/')
        self.assertEqual(response.status_code, 401)
        response = clientA.delete('/api/repositories/100/')
        self.assertEqual(response.status_code, 404)
        response = clientA.delete('/api/repositories/2/')
        self.assertEqual(response.status_code, 403)
        response = clientB.delete('/api/repositories/1/')
        self.assertEqual(response.status_code, 202)
        

    def test_repositoryCollaborators(self):
        clientA = Client()
        clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        clientB = Client()
        clientB.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_B", 'password' : "TEST_PASSWORD_B"}), 
            content_type='application/json'
        )
        clientD = Client()
        clientD.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_D", 'password' : "TEST_PASSWORD_D"}), 
            content_type='application/json'
        )
        clientAnonymous = Client()

        response = clientA.delete('/api/repositories/1/collaborators/')
        self.assertEqual(response.status_code, 405)

        response = clientA.get('/api/repositories/100/collaborators/')
        self.assertEqual(response.status_code, 404)
        response = clientAnonymous.get('/api/repositories/3/collaborators/')
        self.assertEqual(response.status_code, 403)
        response = clientA.get('/api/repositories/3/collaborators/')
        self.assertEqual(response.status_code, 403)
        
        response = clientD.get('/api/repositories/2/collaborators/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_USER_B"', response.content.decode())
        self.assertIn('"TEST_USER_C"', response.content.decode())

        response = clientAnonymous.post('/api/repositories/1/collaborators/',
        json.dumps([
            {'username' : 'TEST_USER_B'}
        ]),
        content_type='application/json')
        self.assertEqual(response.status_code, 401)
        response = clientA.post('/api/repositories/100/collaborators/',
        json.dumps([
            {'username' : 'TEST_USER_B'}
        ]),
        content_type='application/json')
        self.assertEqual(response.status_code, 404)
        response = clientB.post('/api/repositories/1/collaborators/',
        json.dumps([
            {'username' : 'TEST_USER_B'}
        ]),
        content_type='application/json')
        self.assertEqual(response.status_code, 403)
        response = clientA.post('/api/repositories/1/collaborators/',
        json.dumps([
            {}
        ]),
        content_type='application/json')
        self.assertEqual(response.status_code, 400)
        response = clientA.post('/api/repositories/1/collaborators/',
        json.dumps([
            {'username' : 'unknown'}
        ]),
        content_type='application/json')
        self.assertEqual(response.status_code, 410)
        response = clientA.post('/api/repositories/1/collaborators/',
        json.dumps([
            {'username' : 'TEST_USER_B'}
        ]),
        content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('"TEST_USER_B"', response.content.decode())
        

    def test_respositoryCollaboratorID(self):
        clientA = Client()
        clientA.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_A", 'password' : "TEST_PASSWORD_A"}), 
            content_type='application/json'
        )
        clientB = Client()
        clientB.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_B", 'password' : "TEST_PASSWORD_B"}), 
            content_type='application/json'
        )
        clientC = Client()
        clientC.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_C", 'password' : "TEST_PASSWORD_C"}), 
            content_type='application/json'
        )
        clientD = Client()
        clientD.post(
            '/api/signin/',
            json.dumps({'username' : "TEST_USER_D", 'password' : "TEST_PASSWORD_D"}), 
            content_type='application/json'
        )
        clientAnonymous = Client()

        response = clientA.post('/api/repositories/2/collaborators/TEST_USER_C/')
        self.assertEqual(response.status_code, 405)

        response = clientAnonymous.delete('/api/repositories/2/collaborators/TEST_USER_C/')
        self.assertEqual(response.status_code, 401)
        response = clientC.delete('/api/repositories/100/collaborators/TEST_USER_C/')
        self.assertEqual(response.status_code, 404)
        response = clientC.delete('/api/repositories/2/collaborators/unknown/')
        self.assertEqual(response.status_code, 404)
        response = clientC.delete('/api/repositories/2/collaborators/TEST_USER_B/')
        self.assertEqual(response.status_code, 403)
        response = clientB.delete('/api/repositories/2/collaborators/TEST_USER_B/')
        self.assertEqual(response.status_code, 410)

        response = clientC.delete('/api/repositories/2/collaborators/TEST_USER_C/')
        self.assertEqual(response.status_code, 202)
        self.assertIn('"TEST_USER_B"', response.content.decode())
        self.assertNotIn('"TEST_USER_C"', response.content.decode())
