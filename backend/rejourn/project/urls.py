from django.urls import path

from . import views

urlpatterns = [

    path('/signin/', views.signin, name='signin'),
    path('/signout/', views.signout, name='signout'),

    path('/users/', views.users, name='users'),
    path('/users/<str:user_name>/', views.userID, name='userID'),
    path('/users/<str:user_name>/friends/', views.userFriends, name='userFriends'),
    path('/users/<str:user_name>/friends/<str:friend_name>/', views.userFriendID, name='userFriendID'),
    
    path('/repositories/', views.repositories, name='repositories'),
    path('/repositories/<int:repo_id>/', views.repositoryID, name='repositoryID'),
    
    
]
