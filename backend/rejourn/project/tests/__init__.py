from .discussionTests import DiscussionTestCase, DiscussionCommentTestCase
from .modelsTests import ModelsTestCase
from .photoTests import PhotoTestCase
from .userTests import UserTestCase, UserFriendTestCase
from .postTests import PostTestCase, PostCommentTestCase
from .repositoryTests import RepositoryTestCase
from .labelTests import LabelTestCase
from .routeTests import RouteTestCase
from .exploreTests import ExploreTestCase

__all__ = [
    "ModelsTestCase",
    "UserTestCase",
    "UserFriendTestCase",
    "DiscussionTestCase",
    "DiscussionCommentTestCase",
    "RepositoryTestCase",
    "PhotoTestCase",
    "PostTestCase",
    "PostCommentTestCase",
    "LabelTestCase",
    "RouteTestCase",
    "ExploreTestCase",
]
