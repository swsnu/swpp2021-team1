from datetime import datetime

from django.utils import timezone
from django.test import TestCase

from project.enum import Scope
from project.models.models import User, Repository


class ModelsTestCase(TestCase):

    stubuser_a = {
        "username": "TEST_USER_A",
        "real_name": "REAL_USER_A",
        "email": "TEST_USER_A@test.com",
        "password": "TEST_PASSWORD_A",
        "visibility": Scope.PUBLIC,
        "bio": "My name is REAL_USER_A!",
    }

    stubuser_b = {
        "username": "TEST_USER_B",
        "real_name": "REAL_USER_B",
        "email": "TEST_USER_B@test.com",
        "password": "TEST_PASSWORD_B",
        "visibility": Scope.FRIENDS_ONLY,
        "bio": "My name is REAL_USER_B!",
    }

    stubuser_c = {
        "username": "TEST_USER_C",
        "real_name": "REAL_USER_C",
        "email": "TEST_USER_C@test.com",
        "password": "TEST_PASSWORD_C",
        "visibility": Scope.PRIVATE,
        "bio": "My name is REAL_USER_C!",
    }

    stubrepository_a = {
        "repo_name": "TEST_REPOSITORY_A",
        "visibility": Scope.PUBLIC,
        # owner,
        # route_id,
        # 'travel_start_date'
        # 'travel_end_date'
        # collaborators,
    }

    def makeUsers(self):
        User.objects.create_user(
            username=self.stubuser_a["username"],
            real_name=self.stubuser_a["real_name"],
            email=self.stubuser_a["email"],
            password=self.stubuser_a["password"],
            visibility=self.stubuser_a["visibility"],
            bio=self.stubuser_a["bio"],
        )
        User.objects.create_user(
            username=self.stubuser_b["username"],
            real_name=self.stubuser_b["real_name"],
            email=self.stubuser_b["email"],
            password=self.stubuser_b["password"],
            visibility=self.stubuser_b["visibility"],
            bio=self.stubuser_b["bio"],
        )
        User.objects.create_user(
            username=self.stubuser_c["username"],
            real_name=self.stubuser_c["real_name"],
            email=self.stubuser_c["email"],
            password=self.stubuser_c["password"],
            visibility=self.stubuser_c["visibility"],
            bio=self.stubuser_c["bio"],
        )

    def makeRepositories(self):
        repo_a = Repository(
            repo_name=self.stubrepository_a["repo_name"],
            visibility=self.stubrepository_a["visibility"],
        )
        repo_a.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()

    def test_user_model(self):
        self.makeUsers()
        self.assertEqual(User.objects.all().count(), 3)

        user_a = User.objects.get(user_id=1)
        self.assertEqual(user_a.username, "TEST_USER_A")

        user_b = User.objects.get(username="TEST_USER_B")
        self.assertEqual(user_b.email, "TEST_USER_B@test.com")

        user_c = User.objects.get(user_id=3)
        self.assertEqual(user_c.visibility, Scope.PRIVATE)

        user_a.friends.add(user_b)
        user_a.friends.add(user_c)
        user_a.save()
        self.assertEqual(user_a.friends.all().count(), 2)
        self.assertEqual(user_b.friends.all().count(), 1)
        self.assertEqual(user_c.friends.all().count(), 1)

        user_c.friends.remove(user_a)
        user_c.save()
        self.assertEqual(user_a.friends.all().count(), 1)
        self.assertEqual(user_c.friends.all().count(), 0)
        self.assertIn(user_b, user_a.friends.all())

        user_a.visibility = Scope.PRIVATE
        user_a.save()
        self.assertEqual(user_a.visibility, 2)

    def test_repository_model(self):
        self.makeUsers()
        self.makeRepositories()
        self.assertEqual(Repository.objects.all().count(), 1)

        repo_a = Repository.objects.get(repo_id=1)
        self.assertEqual(repo_a.repo_name, "TEST_REPOSITORY_A")
        self.assertEqual(repo_a.owner, None)
        self.assertEqual(repo_a.visibility, Scope.PUBLIC)

        self.assertEqual(repo_a.travel_start_date, timezone.localtime().date())
        self.assertEqual(repo_a.travel_end_date, timezone.localtime().date())

        user_a = User.objects.get(user_id=1)
        user_b = User.objects.get(user_id=2)
        user_c = User.objects.get(user_id=3)
        repo_a.owner = user_a
        repo_a.collaborators.add(user_a, user_b, user_c)
        repo_a.save()
        self.assertEqual(repo_a.owner.username, "TEST_USER_A")
        self.assertEqual(repo_a.collaborators.all().count(), 3)
        self.assertIn(user_c, repo_a.collaborators.all())

        date_string_a = "2023-05-28"
        date_string_b = "2024-5-28"
        new_start_date = timezone.make_aware(
            datetime.strptime(date_string_a, "%Y-%m-%d")
        )
        new_end_date = timezone.make_aware(datetime.strptime(date_string_b, "%Y-%m-%d"))
        repo_a.travel_start_date = new_start_date
        repo_a.travel_end_date = new_end_date
        repo_a.save()
        self.assertEqual(repo_a.travel_start_date.year, 2023)
        self.assertEqual(repo_a.travel_start_date.month, 5)
        self.assertEqual(repo_a.travel_end_date.month, 5)
