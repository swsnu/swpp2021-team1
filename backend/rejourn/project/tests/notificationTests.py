import json
import tempfile
import shutil

from django.test import TestCase, Client

from project.models.models import Repository, User, Photo, Label, Notification
from project.enum import Scope, NoticeType


class NotificationTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(
            username="TEST_USER_A",
            real_name="REAL_USER_A",
            password="TEST_PASSWORD_A"
        )
        User.objects.create_user(
            username="TEST_USER_B",
            real_name="REAL_USER_B",
            password="TEST_PASSWORD_B"
        )
        user_a = User.objects.get(user_id=1)
        user_b = User.objects.get(user_id=2)

        repo_a = Repository(
            repo_name="TEST_REPO_A",
            visibility=Scope.PUBLIC,
            owner=user_a,
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.collaborators.add(user_b)
        repo_a.save()

        repo_b = Repository(
            repo_name="TEST_REPO_B",
            visibility=Scope.PUBLIC,
            owner=user_a,
        )
        repo_b.save()
        repo_b.collaborators.add(user_a)
        repo_b.save()

        label_a = Label(
            label_name="TEST_LABEL_A",
            repository=repo_a,
            user=user_a,
        )
        label_a.save()
        label_b = Label(
            label_name="TEST_LABEL_B",
            repository=repo_b,
            user=user_a,
        )
        label_b.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
        Photo.objects.all().delete()
        Label.objects.all().delete()

    def test_labels(self):
        pass