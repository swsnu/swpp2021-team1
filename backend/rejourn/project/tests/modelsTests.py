from django.test import TestCase, Client
import json

from project.enum import Scope
from project.models.models import *

from datetime import datetime
from django.utils import timezone

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


