from django.contrib.auth.models import AbstractUser
from django.db import models

# To keep track of the users that sign onto the social network
class User(AbstractUser):
    followers = models.BigIntegerField(default=0)
    following = models.BigIntegerField(default=0)

# To keep track of all the posts made on the social network
class Post(models.Model):
    user = models.CharField(max_length=150)
    description = models.TextField()
    postDate = models.DateTimeField(auto_now_add=True)
    likes = models.BigIntegerField(default=0) 

# To keep track on which user follows another user or not
class Follow(models.Model):
    user = models.CharField(max_length=150)
    followUser = models.CharField(max_length=150)

# To keep track of when user likes a specific post to ensure
# only one user can like a post at a time.
class LikeTracker(models.Model):
    user = models.CharField(max_length=150)
    postID = models.CharField(max_length=150)
    isLiked = models.BooleanField(default=False)