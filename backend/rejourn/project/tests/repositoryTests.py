import json
from datetime import datetime

from django.utils import timezone
from django.test import TestCase, Client

from project.models.models import User, Repository
from project.enum import Scope


class RepositoryTestCase(TestCase):

    # user_a, user_b, user_c, user_d, user_e : PUBLIC
    # user_c & user_d are friends
    # repo_a : { PUBLIC / owner : user_a / collaborators : user_a /
    #           travel_start_date : 2021-11-09 / travel_end_date : 2021-11-10}
    # repo_b : { FRIENDS_ONLY / owner : user_b / collaborators : user_b, user_c /
    #           travel_start_date : 2021-11-11 / travel_end_date : 2021-11-12 }
    # repo_c : { PRIVATE / owner : user_c / collaborators : user_c, user_d /
    #           travel_start_date : 2021-11-13 / travel_end_date : 2021-11-14}

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
        "visibility": Scope.PUBLIC,
        "bio": "My name is REAL_USER_B!",
    }

    stubuser_c = {
        "username": "TEST_USER_C",
        "real_name": "REAL_USER_C",
        "email": "TEST_USER_C@test.com",
        "password": "TEST_PASSWORD_C",
        "visibility": Scope.PUBLIC,
        "bio": "My name is REAL_USER_C!",
    }

    stubuser_d = {
        "username": "TEST_USER_D",
        "real_name": "REAL_USER_D",
        "email": "TEST_USER_D@test.com",
        "password": "TEST_PASSWORD_D",
        "visibility": Scope.PUBLIC,
        "bio": "My name is REAL_USER_D!",
    }

    stubuser_e = {
        "username": "TEST_USER_E",
        "real_name": "REAL_USER_E",
        "email": "TEST_USER_E@test.com",
        "password": "TEST_PASSWORD_E",
        "visibility": Scope.PUBLIC,
        "bio": "My name is REAL_USER_E!",
    }

    stubrepo_a = {
        "repo_name": "TEST_REPO_A",
        "visibility": Scope.PUBLIC,
        "owner": "TEST_USER_A",
        "travel_start_date": timezone.make_aware(datetime(2021, 11, 9)),
        "travel_end_date": timezone.make_aware(datetime(2021, 11, 10)),
        "collaborators": ["TEST_USER_A"],
    }

    stubrepo_b = {
        "repo_name": "TEST_REPO_B",
        "visibility": Scope.FRIENDS_ONLY,
        "owner": "TEST_USER_B",
        "travel_start_date": timezone.make_aware(datetime(2021, 11, 11)),
        "travel_end_date": timezone.make_aware(datetime(2021, 11, 12)),
        "collaborators": ["TEST_USER_B", "TEST_USER_C"],
    }

    stubrepo_c = {
        "repo_name": "TEST_REPO_C",
        "visibility": Scope.PRIVATE,
        "owner": "TEST_USER_C",
        "travel_start_date": timezone.make_aware(datetime(2021, 11, 13)),
        "travel_end_date": timezone.make_aware(datetime(2021, 11, 14)),
        "collaborators": ["TEST_USER_C", "TEST_USER_D"],
    }

    def setUp(self):
        User.objects.create_user(
            username=self.stubuser_a["username"],
            real_name=self.stubuser_a["real_name"],
            email=self.stubuser_a["email"],
            password=self.stubuser_a["password"],
            visibility=self.stubuser_a["visibility"],
            bio=self.stubuser_a["bio"],
        )
        user_a = User.objects.get(username="TEST_USER_A")
        User.objects.create_user(
            username=self.stubuser_b["username"],
            real_name=self.stubuser_b["real_name"],
            email=self.stubuser_b["email"],
            password=self.stubuser_b["password"],
            visibility=self.stubuser_b["visibility"],
            bio=self.stubuser_b["bio"],
        )
        user_b = User.objects.get(username="TEST_USER_B")
        User.objects.create_user(
            username=self.stubuser_c["username"],
            real_name=self.stubuser_c["real_name"],
            email=self.stubuser_c["email"],
            password=self.stubuser_c["password"],
            visibility=self.stubuser_c["visibility"],
            bio=self.stubuser_c["bio"],
        )
        user_c = User.objects.get(username="TEST_USER_C")
        User.objects.create_user(
            username=self.stubuser_d["username"],
            real_name=self.stubuser_d["real_name"],
            email=self.stubuser_d["email"],
            password=self.stubuser_d["password"],
            visibility=self.stubuser_d["visibility"],
            bio=self.stubuser_d["bio"],
        )
        user_d = User.objects.get(username="TEST_USER_D")
        User.objects.create_user(
            username=self.stubuser_e["username"],
            real_name=self.stubuser_e["real_name"],
            email=self.stubuser_e["email"],
            password=self.stubuser_e["password"],
            visibility=self.stubuser_e["visibility"],
            bio=self.stubuser_e["bio"],
        )
        user_c.friends.add(user_d)
        user_c.save()

        repo_a = Repository(
            repo_name=self.stubrepo_a["repo_name"],
            visibility=self.stubrepo_a["visibility"],
            owner=user_a,
            travel_start_date=self.stubrepo_a["travel_start_date"],
            travel_end_date=self.stubrepo_a["travel_end_date"],
        )
        repo_a.save()
        repo_a.collaborators.add(user_a)
        repo_a.save()

        repo_b = Repository(
            repo_name=self.stubrepo_b["repo_name"],
            visibility=self.stubrepo_b["visibility"],
            owner=user_b,
            travel_start_date=self.stubrepo_b["travel_start_date"],
            travel_end_date=self.stubrepo_b["travel_end_date"],
        )
        repo_b.save()
        repo_b.collaborators.add(user_b)
        repo_b.collaborators.add(user_c)
        repo_b.save()

        repo_c = Repository(
            repo_name=self.stubrepo_c["repo_name"],
            visibility=self.stubrepo_c["visibility"],
            owner=user_c,
            travel_start_date=self.stubrepo_c["travel_start_date"],
            travel_end_date=self.stubrepo_c["travel_end_date"],
        )
        repo_c.save()
        repo_c.collaborators.add(user_c)
        repo_c.collaborators.add(user_d)
        repo_c.save()

    def tearDown(self):
        User.objects.all().delete()
        Repository.objects.all().delete()

    def test_repositories(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )

        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json",
        )

        client_d = Client()
        client_d.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_D", "password": "TEST_PASSWORD_D"}),
            content_type="application/json",
        )

        client_anonymous = Client()
        response = client_anonymous.delete("/api/repositories/")
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                    "collaborators": [],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

        response = client_a.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_B",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                    "collaborators": [],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        response = client_a.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

        response = client_a.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": 3,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                    "collaborators": [],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client_a.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                    "collaborators": [{"username": "unknown"}],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client_a.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "20211202",
                    "collaborators": [],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)

        response = client_a.post(
            "/api/repositories/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                    "collaborators": [],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('"TEST_REPO"', response.content.decode())

        response = client_a.get("/api/repositories/")
        self.assertEqual(response.status_code, 400)
        response = client_a.get(
            "/api/repositories/?owner=TEST_USER_A&username=TEST_USER_A"
        )
        self.assertEqual(response.status_code, 400)
        response = client_a.get("/api/repositories/?owner=unknown")
        self.assertEqual(response.status_code, 410)
        response = client_a.get("/api/repositories/?username=unknown")
        self.assertEqual(response.status_code, 410)

        response = client_a.get("/api/repositories/?owner=TEST_USER_A")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_A"', response.content.decode())
        self.assertIn('"TEST_REPO"', response.content.decode())
        response = client_b.get("/api/repositories/?owner=TEST_USER_A")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_A"', response.content.decode())
        self.assertNotIn('"TEST_REPO"', response.content.decode())

        response = client_d.get("/api/repositories/?owner=TEST_USER_B")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_B"', response.content.decode())
        response = client_d.get("/api/repositories/?username=TEST_USER_B")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_B"', response.content.decode())
        response = client_d.get("/api/repositories/?owner=TEST_USER_C")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_C"', response.content.decode())
        response = client_d.get("/api/repositories/?username=TEST_USER_A")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('"TEST_REPO"', response.content.decode())

    def test_repositoryID(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json",
        )
        client_c = Client()
        client_c.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_C", "password": "TEST_PASSWORD_C"}),
            content_type="application/json",
        )
        client_d = Client()
        client_d.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_D", "password": "TEST_PASSWORD_D"}),
            content_type="application/json",
        )
        client_anonymous = Client()

        response = client_a.post("/api/repositories/1/")
        self.assertEqual(response.status_code, 405)

        response = client_a.get("/api/repositories/100/")
        self.assertEqual(response.status_code, 404)

        response = client_anonymous.get("/api/repositories/1/")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_REPO_A"', response.content.decode())
        self.assertIn('"TEST_USER_A"', response.content.decode())
        response = client_anonymous.get("/api/repositories/2/")
        self.assertEqual(response.status_code, 403)

        response = client_a.get("/api/repositories/3/")
        self.assertEqual(response.status_code, 403)
        response = client_d.get("/api/repositories/2/")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_USER_C"', response.content.decode())
        response = client_d.get("/api/repositories/3/")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_USER_C"', response.content.decode())

        response = client_anonymous.put("/api/repositories/1/")
        self.assertEqual(response.status_code, 401)

        response = client_a.put(
            "/api/repositories/1/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO_A",
                    "owner": "TEST_USER_A",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        response = client_a.put(
            "/api/repositories/1/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "unknown",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)
        response = client_a.put(
            "/api/repositories/1/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": 3,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)
        response = client_a.put(
            "/api/repositories/1/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "20211201",
                    "travel_end_date": "2021-12-02",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)
        response = client_a.put(
            "/api/repositories/100/",
            json.dumps(
                {
                    "repo_name": "TEST_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_A",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        response = client_b.put(
            "/api/repositories/1/",
            json.dumps(
                {
                    "repo_name": "CHANGED_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_B",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        response = client_a.put(
            "/api/repositories/1/",
            json.dumps(
                {
                    "repo_name": "CHANGED_REPO",
                    "visibility": Scope.PRIVATE,
                    "owner": "TEST_USER_B",
                    "travel_start_date": "2021-12-01",
                    "travel_end_date": "2021-12-02",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('"CHANGED_REPO"', response.content.decode())
        self.assertIn('"TEST_USER_B"', response.content.decode())

        response = client_anonymous.delete("/api/repositories/3/")
        self.assertEqual(response.status_code, 401)
        response = client_a.delete("/api/repositories/100/")
        self.assertEqual(response.status_code, 404)
        response = client_a.delete("/api/repositories/2/")
        self.assertEqual(response.status_code, 403)
        response = client_b.delete("/api/repositories/1/")
        self.assertEqual(response.status_code, 202)

    def test_repositoryCollaborators(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json",
        )
        client_d = Client()
        client_d.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_D", "password": "TEST_PASSWORD_D"}),
            content_type="application/json",
        )
        client_anonymous = Client()

        response = client_a.delete("/api/repositories/1/collaborators/")
        self.assertEqual(response.status_code, 405)

        response = client_a.get("/api/repositories/100/collaborators/")
        self.assertEqual(response.status_code, 404)
        response = client_anonymous.get("/api/repositories/3/collaborators/")
        self.assertEqual(response.status_code, 403)
        response = client_a.get("/api/repositories/3/collaborators/")
        self.assertEqual(response.status_code, 403)

        response = client_d.get("/api/repositories/2/collaborators/")
        self.assertEqual(response.status_code, 200)
        self.assertIn('"TEST_USER_B"', response.content.decode())
        self.assertIn('"TEST_USER_C"', response.content.decode())

        response = client_anonymous.post(
            "/api/repositories/1/collaborators/",
            json.dumps([{"username": "TEST_USER_B"}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        response = client_a.post(
            "/api/repositories/100/collaborators/",
            json.dumps([{"username": "TEST_USER_B"}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        response = client_b.post(
            "/api/repositories/1/collaborators/",
            json.dumps([{"username": "TEST_USER_B"}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        response = client_a.post(
            "/api/repositories/1/collaborators/",
            json.dumps([{}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        response = client_a.post(
            "/api/repositories/1/collaborators/",
            json.dumps([{"username": "unknown"}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 410)
        response = client_a.post(
            "/api/repositories/1/collaborators/",
            json.dumps([{"username": "TEST_USER_B"}]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('"TEST_USER_B"', response.content.decode())

    def test_respositoryCollaboratorID(self):
        client_a = Client()
        client_a.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_A", "password": "TEST_PASSWORD_A"}),
            content_type="application/json",
        )
        client_b = Client()
        client_b.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_B", "password": "TEST_PASSWORD_B"}),
            content_type="application/json",
        )
        client_c = Client()
        client_c.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_C", "password": "TEST_PASSWORD_C"}),
            content_type="application/json",
        )
        client_d = Client()
        client_d.post(
            "/api/signin/",
            json.dumps({"username": "TEST_USER_D", "password": "TEST_PASSWORD_D"}),
            content_type="application/json",
        )
        client_anonymous = Client()

        response = client_a.post("/api/repositories/2/collaborators/TEST_USER_C/")
        self.assertEqual(response.status_code, 405)

        response = client_anonymous.delete(
            "/api/repositories/2/collaborators/TEST_USER_C/"
        )
        self.assertEqual(response.status_code, 401)
        response = client_c.delete("/api/repositories/100/collaborators/TEST_USER_C/")
        self.assertEqual(response.status_code, 404)
        response = client_c.delete("/api/repositories/2/collaborators/unknown/")
        self.assertEqual(response.status_code, 404)
        response = client_c.delete("/api/repositories/2/collaborators/TEST_USER_B/")
        self.assertEqual(response.status_code, 403)
        response = client_b.delete("/api/repositories/2/collaborators/TEST_USER_B/")
        self.assertEqual(response.status_code, 410)

        response = client_c.delete("/api/repositories/2/collaborators/TEST_USER_C/")
        self.assertEqual(response.status_code, 202)
        self.assertIn('"TEST_USER_B"', response.content.decode())
        self.assertNotIn('"TEST_USER_C"', response.content.decode())
