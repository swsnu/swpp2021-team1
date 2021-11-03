from django.urls import path

from . import views

urlpatterns = [ 
     path('token/', views.token, name='token'),
     path('session/', views.session, name='session'),

     path('signin/', views.signin, name='signin'),
     path('signout/', views.signout, name='signout'),

     path('users/', views.users, name='users'),
     path('users/<str:user_name>/', views.userID, name='userID'),
     path('users/<str:user_name>/friends/', views.userFriends, name='userFriends'),
     path('users/<str:user_name>/friends/<str:friend_name>/', views.userFriendID, name='userFriendID'),
    
     path('repositories/', views.repositories, name='repositories'),
     path('repositories/<int:repo_id>/', views.repositoryID, name='repositoryID'),
     path('repositories/<int:repo_id>/collaborators/', views.repositoryCollaborators,
         name='repositoryCollaborators'),
     path('repositories/<int:repo_id>/collaborators/<str:collaborator_name>/',
         views.repositoryCollaboratorID, name='repositoryCollaboratorID'),

     path('discussions/<int:repo_id>/', views.discussions, name='discussions'),
     #path('discussions/<int:discussion_id>/', views.discussionID, name='discussionID'),
     #path('discussion-comments/<int:discussion_id>/', views.discussionComments, name='discussionComments'),
     #path('discussion-comments/<int:discussion_id>/<int:Discussion_comment_id>/', views.discussionCommentID, name='discussionCommentID')

    
]
