from django.urls import path

from project.views import (
    userViews,
    repositoryViews,
    discussionViews,
    postViews,
    photoViews,
    routeViews,
)


urlpatterns = [
    ## userAPI
    path("token/", userViews.token, name="token"),
    path("session/", userViews.session, name="session"),
    path("signin/", userViews.signin, name="signin"),
    path("signout/", userViews.signout, name="signout"),
    path("users/", userViews.users, name="users"),
    path(
        "users/<str:user_name>/profile-picture/",
        userViews.profilePicture,
        name="profilePicture",
    ),
    path("users/<str:user_name>/", userViews.userID, name="userID"),
    path("users/<str:user_name>/friends/", userViews.userFriends, name="userFriends"),
    path(
        "users/<str:user_name>/friends/<str:friend_name>/",
        userViews.userFriendID,
        name="userFriendID",
    ),

    ## repositoryAPI
    path("repositories/", repositoryViews.repositories, name="repositories"),
    path(
        "repositories/<int:repo_id>/", repositoryViews.repositoryID, name="repositoryID"
    ),
    path(
        "repositories/<int:repo_id>/collaborators/",
        repositoryViews.repositoryCollaborators,
        name="repositoryCollaborators",
    ),
    path(
        "repositories/<int:repo_id>/collaborators/<str:collaborator_name>/",
        repositoryViews.repositoryCollaboratorID,
        name="repositoryCollaboratorID",
    ),

    ## discussionAPI
    path(
        "repositories/<int:repo_id>/discussions/",
        discussionViews.discussions,
        name="discussions",
    ),
    path(
        "discussions/<int:discussion_id>/",
        discussionViews.discussionID,
        name="discussionID",
    ),
    path(
        "discussions/<int:discussion_id>/comments/",
        discussionViews.discussionComments,
        name="discussionComments",
    ),
    path(
        "discussions/<int:discussion_id>/comments/<int:discussion_comment_id>/",
        discussionViews.discussionCommentID,
        name="discussionCommentID",
    ),

    ## postAPI
    path("users/<str:user_name>/posts/", postViews.userPosts, name="userPosts"),
    path("repositories/<int:repo_id>/posts/", postViews.repoPosts, name="repoPosts"),
    path("posts/<int:post_id>/", postViews.postID, name="postID"),
    path("posts/<int:post_id>/comments/", postViews.postComments, name="postComments"),
    path(
        "posts/<int:post_id>/comments/<int:post_comment_id>/",
        postViews.postCommentID,
        name="postCommentID",
    ),

    ## photoAPI
    path("repositories/<int:repo_id>/photos/", photoViews.photos, name="photos"),

    ## labelAPI


    ## routeAPI
    path("route-search/", routeViews.routeSearch, name="routeSearch"),
    path("repositories/<int:repo_id>/route/", routeViews.routeID, name="routeID"),

    path("places-search/", routeViews.placeSearch, name="placeSearch"),
    path("repositories/<int:repo_id>/route/places/", routeViews.places, name="places"),
    path("repositories/<int:repo_id>/route/places/<str:place_id>/", routeViews.placeID, name="placeID"),


]
