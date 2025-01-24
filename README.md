# Joshua Wong's Social Network

The social network focuses on testing my knowledge in Python and JavaScript by learning how to change between different parts of the web application dynamically and ensuring a smooth experience for the user.  My social network allows users to like, edit, and view profiles in real time without reloading the web page. The features on this web page are a test of my knowledge of JavaScript, using fetch API to make AJAX calls to the Django back end. I currently do not have plans to update my social network, but this project is a milestone in expanding my knowledge in software development. The project is an import from my CS50W (Web Programming with Python and JavaScript).

Here's a like to a video that shows the demo of this project:
https://www.youtube.com/watch?v=GhTI_fHeVYY

## Getting Started

The instructions below will show you how to get a copy of this project to run on your local machine for development and testing purposes. Look at the deployment section for notes on deploying this project onto a live system.

### Prerequisites

Here are the prerequisites you need in your local environment to run this repository.

```
Python 3.11.2
Django 5.1.5
SQLite
```
Note: Django automatically supports SQLite for users' information on the social network.

### Installing

This is the step-by-step guide to ensuring that this program will run in your local environment.
Note: The examples are for installing using the Debian OS. 

Install Python onto your local environment:

```
sudo apt update
python3 --version 
sudo apt install python3
```
If Python is already installed, you can skip to the next steps.

Install pip3:

```
sudo apt install python3-pip
```

If you're on Debian 12, you need to install a virtual environment onto the repo. To do this, make sure you have git installed and make a clone of this repository.
If you need help to clone a repository:
```
git clone https://github.com/wongjoshua2005/Social-Network
```

To install Django onto the repo, you need the virtual environment. Here's how you do it:
```
python3 -m venv .venv 
```
Note: .venv is just a name I picked out. It can be whatever name you want.

To activate the virtual environment:
```
source .venv/bin/activate
```

To install Django when activating the virtual environment:
```
pip3 install django
```

You've now installed the necessary Python libraries to run the social network using Django!

## Deployment

To run this social network, you go into the Application repo and run this command:
```
python3 manage.py runserver
```
Click on the link and it will take you to the social network!

## Built With

* [Django](https://www.djangoproject.com/) - Web Framework
* [SQLite](https://www.sqlite.org/) - Database for storing users' information

## Acknowledgments

* Thank you to CS50 for making learning free and accessible to everyone around the world! 
