
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # To let the user create a post on their account
    path("create", views.create, name="create"),
    
    # To display the user's profile on the social network
    path("profile/<str:username>/", views.profile, name='profile'),
    
    # To like someone's post
    path("like/<int:postID>/", views.like, name="like"),
    
    # To make any save changes when editing your own post
    path("savePost/<int:postID>/<str:newValue>/", views.save, name="save"),
    
    # To display a list of users that the individual is following
    path("following/", views.following, name="following"),
]
