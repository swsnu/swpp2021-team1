from django.test import TestCase, Client
import json

from project.models.models import User, Repository

class RepositoryTestCase(TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()
    
    def test_post_repositories(self):
        pass
