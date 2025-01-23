// To ensure the event listeners work when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // To automatically direct to the all posts page 
    // and prevent any glitches when showing other profile or create tab
    displayAllPosts();

    // To enter into the specific user's profile when clicking on their name in
    // the post
    document.querySelectorAll('#username').forEach(function (event) {
        event.addEventListener("click", function () {
            const user = this.textContent;
            fetchPosts(user);
            displayProfile();
        })
    });

    // To like on a specific post and track that record when
    // a user is in the All Posts section of the social network
    document.querySelectorAll("#allPosts .likeBtn").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = this.closest(".post").querySelector(".postID").textContent;
            likePost(id, this);
        });
    });

    // To edit a specific post that the user made dynamically when the user is
    // in the All Posts section of the social network
    document.querySelectorAll("#allPosts .editPost").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = this.closest(".post").querySelector(".postID").textContent;
            editPost(id, this);
        });
    });

    // To like on a specific post and track that record when
    // a user is in the Profile section of the social network
    document.querySelectorAll("#postContainer .likeBtn").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = this.closest(".post").querySelector(".postID").textContent;
            likePost(id, this);
        });
    });

    // To edit a specific post that the user made dynamically when the user is
    // in the Profile section of the social network
    document.querySelectorAll("#postContainer .editPost").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = this.closest(".post").querySelector(".postID").textContent;
            editPost(id, this);
        });
    });

    // To retrieve the profile user's username directly when sending to Django
    // to follow that account 
    document.querySelector("form").addEventListener("submit", function(event) {
        const profileUser = document.querySelector("#postUser");
        document.querySelector("#hiddenFollow").value = profileUser.textContent;

        // I couldn't figure out how to change the text properly. My bad.
        // I should've done more better on this.
        const followBtn = document.querySelector("#followUser");
        if (followBtn.textContent === "Follow") {
            followBtn.textContent = "Unfollow";
        } else {
            followBtn.textContent = "Follow";
        }
    });
})

// The fetchPosts method focuses on retrieving all the posts dynamically
// from the Django models Post to display the post information 
// in HTML
function fetchPosts(username) {
    // To retrieve the username without any excessive whitespace and start
    // putting into the profile
    const trimmedUser = username.trim();
    document.querySelector("#postUser").innerHTML = trimmedUser;
    const postContainer = document.querySelector('#postContainer');

    // To send an AJAX to the Django profile method in views.py to 
    // retrieve all the information about this specific user to
    // display in their profile
    fetch(`/profile/${trimmedUser}`)
        .then(response => response.json())
        .then(data => {
            // To retrieve the user's followers and following count
            const followersHTML = document.querySelector("#userFollowers");
            followersHTML.innerHTML = `Followers: ${data.user.followers}`;

            const followingHTML = document.querySelector("#userFollowing");
            followingHTML.innerHTML = `Following: ${data.user.following}`;

            // To display a follow button only when the user currently using
            // the session is the one looking at their own profile
            const currentUser = document.querySelector("#sessionUser");

            // To prevent the user from following themselves
            if (currentUser.innerText == trimmedUser) {
                const followForm = document.querySelector(".followForm");
                followForm.remove();
            }

            // To display the list of posts that the user made on their
            // site
            data.posts.forEach(post => {
                // To have the box to display the user's posts
                const postBody = document.createElement('div');
                postBody.style.border = "1px solid black";
                postBody.style.margin = "1%";
                postBody.className = "post";

                // To display the user's description of each post
                const descriptionHTML = document.createElement("p");
                descriptionHTML.innerHTML = post.content;
                descriptionHTML.id = "postContent";
                postBody.appendChild(descriptionHTML);

                // To only let the user edit their OWN post and not anyone else
                // post
                if (currentUser.innerText == trimmedUser) {
                    const editHTML = document.createElement("p");
                    editHTML.innerHTML = "Edit";
                    editHTML.className = "editPost"
                    postBody.appendChild(editHTML);

                    // To allow the user to edit when on a different 
                    // body div for the profile
                    editHTML.addEventListener("click", function () {
                        const postID = postBody.querySelector(".postID").innerText;
                        editPost(postID, editHTML);
                    });
                }

                // To display the time that the user sent the post
                const timeHTML = document.createElement("p");
                const date = new Date(post.postDate);
                const options = {
                    month: 'long', day: 'numeric',
                    year: 'numeric', hour: 'numeric',
                    minute: 'numeric', hour12: true
                };
                const formattedDate = date.toLocaleString('en-US', options);
                timeHTML.innerHTML = formattedDate;
                postBody.appendChild(timeHTML);

                // To keep track of the postID when interacting with
                // Django and using it for easily make modifications
                // in the database
                const postID = document.createElement("p");
                postID.style.display = "none";
                postID.className = "postID";
                postID.innerHTML = post.id;
                postBody.appendChild(postID);

                // To keep track of the amount of likes a specific post has
                const likesHTML = document.createElement("p");
                likesHTML.innerHTML = `❤️ ${post.likes}`;
                likesHTML.className = "likeBtn";
                postBody.appendChild(likesHTML);

                // To add a like to the specific post
                likesHTML.addEventListener("click", function () {
                    const postID = postBody.querySelector(".postID").innerText;
                    likePost(postID, likesHTML);
                });

                // To let the user comment (This doesn't work right now)
                const commentsHTML = document.createElement("p");
                commentsHTML.innerHTML = "Comment";
                commentsHTML.id = "comment";
                postBody.appendChild(commentsHTML);

                // To add all the post body into the container needed
                postContainer.appendChild(postBody);
            });
        });
}

// To send an AJAX request to Django to indicate a user liked
// a specific post
function likePost(postID, button) {
    fetch(`/like/${postID}`)
        .then(response => response.json())
        .then(data => {
            // To update the new change in likes
            button.innerText = `❤️ ${data.postLikes[0].likes}`;
        });
    console.log("Liked a post!");
}

// To allow the user to dynamically edit a post within the all posts page
// OR their own profile
function editPost(postID, button) {
    // To replace the paragraph description within a specific post
    // with a text area to make new modifications to the post
    const postContent = button.closest(".post").querySelector("#postContent");
    const textarea = document.createElement("textarea");
    textarea.value = postContent.textContent;
    postContent.replaceWith(textarea);

    // To let the user save the content after making the changes
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    textarea.after(saveBtn);

    // To send an AJAX request in JSON to the Django database to save
    // the new change in description
    saveBtn.addEventListener("click", function () {
        const newValue = textarea.value;

        fetch(`/savePost/${postID}/${newValue}`)
            .then(response => response.json())
            .then(data => {
                // To dynamically update the content and replace the textarea
                // back to its intended original paragraph tag
                const newContent = document.createElement("p");
                newContent.id = "postContent";
                newContent.innerHTML = data.postContent[0].content;
                textarea.replaceWith(newContent);
                saveBtn.remove();
            });
    });
}

// To display the profile section when the user clicks on that section
function displayProfile() {
    document.querySelector("#allPosts").style.display = "none";
    document.querySelector("#profile").style.display = "block";
}

// Automatically by default to display all posts that the user sends on the
// social network
function displayAllPosts() {
    document.querySelector("#allPosts").style.display = "block";
    document.querySelector("#profile").style.display = "none";
}