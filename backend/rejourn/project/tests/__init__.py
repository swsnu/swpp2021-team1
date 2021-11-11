from .discussionTests import DiscussionTestCase, DiscussionCommentTestCase
from .modelsTests import ModelsTestCase
from .photoTests import PhotoTestCase
from .userTests import UserTestCase
from .postTests import PostTestCase
from .repositoryTests import RepositoryTestCase

__all__ = [
   'ModelsTestCase',
   'UserTestCase',
   'DiscussionTestCase',
   'DiscussionCommentTestCase',
   'RepositoryTestCase',
   'PhotoTestCase',
   'PostTestCase',
]