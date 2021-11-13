from .discussionTests import DiscussionTestCase, DiscussionCommentTestCase
from .modelsTests import ModelsTestCase
from .photoTests import PhotoTestCase
from .userTests import UserTestCase, UserFriendTestCase
from .postTests import PostTestCase, PostCommentTestCase
from .repositoryTests import RepositoryTestCase

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
]
