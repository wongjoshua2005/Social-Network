from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.shortcuts import render
from django.db.models import Q
import json

from .models import User, Post, Follow, LikeTracker


def index(request):           
    # To  check if the user made any changes to their account or post
    if request.method == "POST":
        # To let the user know if the specific profile they clicked on can
        # be followed or not to prevent any issues with the display button     
        canFollow = True
        
        # To let the username string be retrieved when making any modifications
        # within Django models or a SQL modification
        username = request.user.username
        
        # To add the user to the follow list of a specific user
        if request.POST.get("follow"):
            # To look for the user to follow
            toFollow = request.POST.get("follow")
            
            followList = Follow.objects.filter(user=username)
            
            # To go through the current user's follow list to see
            # if the user is not already following the individual
            for user in followList:
                # To prevent the user from following again if they already
                # follow the individual
                if user.followUser == toFollow or toFollow == username:
                    canFollow = False
                    break
            
            # To let the database know that the user is following back
            # and increment the follower count accordingly
            if canFollow:
                followBack = Follow(user=username, followUser=toFollow)
                
                followBack.save()
                
                user = User.objects.get(username=username)
                user.following += 1
                user.save()
                
                followObj = User.objects.get(username=toFollow)
                followObj.followers += 1
                followObj.save()
                
                canFollow = False
            else:
                follow = Follow.objects.get(user=username, followUser=toFollow)
                follow.delete()
                
                followObj = User.objects.get(username=toFollow)
                followObj.followers -= 1
                followObj.save()
                
                user = User.objects.get(username=username)
                user.following -= 1
                user.save()
                canFollow = True
            
        else:
            # To save a new post being made on the social network to the
            # database
            description = request.POST.get("postDesc")
            post = Post(user=username, description=description)
            post.save()
    
    # To retrieve a list of all the posts made on the social network and
    # only limit to 10 posts being seen before letting the user
    # go to the next set of posts
    postList = Post.objects.all().order_by('-postDate')
    paginator = Paginator(postList, 10)
    pageNum = request.GET.get("page")
    pageObj = paginator.get_page(pageNum)
    
    return render(request, "network/index.html", {
        "postList": postList,
        "currentUser": request.user,
        "pageObj": pageObj,
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def create(request):
     # To allow the user to make a new post on the social network
    return render(request, "network/create-post.html")

def profile(request, username):
     # To retrieve all the data about the specific user and list of 
     # posts the user made back to the JavaScript fetch call to modify
     # in JavaScript ("index.js")
    user = User.objects.get(username=username)
    posts = Post.objects.filter(user=username).order_by('-postDate')
    postData = [{'content': post.description, 'likes': post.likes,
                 'postDate': post.postDate, 'id': post.id} for post in posts]
    userData = {
        'followers': user.followers,
        'following': user.following
    }
    return JsonResponse({'posts': postData, 'user': userData})

def like(request, postID):
    # To look if the user liked a specific post or not. Automatically 
    # creates a new object if it doesn't exist to prevent any errors
    # when modifying the post likes
    username = request.user.username
    likePost, created = LikeTracker.objects.get_or_create(user=username, 
                                                          postID=postID)
    post = Post.objects.get(id=postID)
    
    # To verify if the user liked a post to modify the count of likes made
    # for the specific post
    if not likePost.isLiked:
        post.likes += 1
        likePost.isLiked = True
    else:
        post.likes -= 1
        likePost.isLiked = False
        
    post.save()
    likePost.save()
    postData = [{"likes": post.likes}]
        
    return JsonResponse({"postLikes": postData})

def save(request, postID, newValue):
    # To save the changes made when a user wants to edit a specific post
    # to their liking
    post = Post.objects.get(id=postID)
    post.description = newValue
    post.save()
    postData = [{"content": post.description}]
    return JsonResponse({"postContent": postData})

def following(request):
    # To retrieve the user's following list
    username = request.user.username
    userObj = User.objects.get(username=username)
    
    followingList = Follow.objects.filter(user=username)
    listOfUsers = [user.followUser for user in followingList]
    
    # Use Q objects to filter posts by multiple users for the pagination
    query = Q()
    for user in listOfUsers:
        query |= Q(user=user)
    
    # To retrieve all the posts that the user currently follows
    followingPosts = Post.objects.filter(query).order_by('-postDate')
    
    # To allow paginator of only 10 posts per page
    paginator = Paginator(followingPosts, 10)
    pageNum = request.GET.get("page")
    pageObj = paginator.get_page(pageNum)
    
    
    return render(request, "network/following.html", {
        "totalFollowing": userObj.following,
        "pageObj": pageObj
    })