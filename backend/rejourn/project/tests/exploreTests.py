import json
import shutil
import tempfile
import datetime

from django.test import TestCase, Client, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from project.models.models import User, Repository, Route, PlaceInRoute, Photo
from project.enum import Scope

MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ExploreTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(
            username="MAIN_USER",
            email="MAIN_EMAIL",
            password="MAIN_PW",
            visibility=Scope.PUBLIC,
        )
        user_0 = User.objects.get(username="MAIN_USER")
        User.objects.create_user(
            username="abcdef",
            email="TEST_A_EMAIL",
            password="TEST_A_PW",
            visibility=Scope.PUBLIC,
        )
        user_a = User.objects.get(username="abcdef")
        User.objects.create_user(
            username="defabc",
            email="TEST_B_EMAIL",
            password="TEST_B_PW",
            visibility=Scope.PUBLIC,
        )
        user_b = User.objects.get(username="defabc")
        User.objects.create_user(
            username="abcghi",
            email="TEST_C_EMAIL",
            password="TEST_C_PW",
            visibility=Scope.FRIENDS_ONLY,
        )
        user_c = User.objects.get(username="abcghi")
        User.objects.create_user(
            username="ghiabc",
            email="TEST_D_EMAIL",
            password="TEST_D_PW",
            visibility=Scope.FRIENDS_ONLY,
        )
        user_d = User.objects.get(username="ghiabc")
        User.objects.create_user(
            username="abcjkl",
            email="TEST_E_EMAIL",
            password="TEST_E_PW",
            visibility=Scope.PRIVATE,
        )
        user_e = User.objects.get(username="abcjkl")
        User.objects.create_user(
            username="jklabc",
            email="TEST_F_EMAIL",
            password="TEST_F_PW",
            visibility=Scope.PRIVATE,
        )
        user_f = User.objects.get(username="jklabc")

    def tearDown(self):
    def test_exploreUsers(self):
    def test_exploreRepositories(self):
    def test_explorePlaces(self):
    def test_feeds(self):