const subdomain = "/"
const postsUrl = subdomain + "posts/";
const allPostsUrl = postsUrl + "posts.json";
const errPostUrl = postsUrl + "404.md";
const focusPostId = "post-focus";
const postListTagId = "post-list";

/*
 * Set the content for a given tag.
 *
 * @param tagId: The tag to load the content into.
 * @param content: The content to populate (innerHTML).
 */
function set_content(tagId, content) {
    var element = document.getElementById(tagId);
    if (!element) {
        console.log("Failed to set " + tagId);
        return;
    }
    element.innerHTML = content;
}

/*
 * Load a given markdown file into the given HTML tag.
 *
 * @param tagId: The tag to load the post into.
 * @param post: The post object (see posts.json).
 */
function load_post(tagId, post) {
    var element = document.getElementById(tagId);
    element.setAttribute("src", postsUrl + post.file);
}

function load_post_error(tagId) {
    var element = document.getElementById(tagId);
    element.setAttribute("src", errPostUrl);
}

/*
 * Fetch a list of posts from the server.
 *
 * @param callback: The function to call with the post data.
 */
function get_posts(callback) {
    fetch(allPostsUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    })
        .then(response => response.json())
        .then(response => callback(response));
}

/*
 * Populate the sidebar with all of the posts in posts.json, sorting by most
 * recent posts.
 */
function populate_sidebar() {
    get_posts(function (response) {
        var posts = response.posts;
        posts.sort((first, second) => second.date.localeCompare(first.date));

        var postList = ""
        for (var post of posts) {
            postList += `<li>
                <a href="?post=${post.name}">
                    <p class="preview-title">${post.name}</p>
                    <p class="preview-date">${post.date}</p>
                </a>
            </li>`;
        }
        set_content(postListTagId, postList);
    });
}

/*
 * Populate the post content.
 */
function populate_post() {
    /*
     * Fetch a list of posts from the server.
     */
    get_posts(function (response) {
        var posts = response.posts;
        posts.sort((first, second) => second.date.localeCompare(first.date));
        const urlParams = new URLSearchParams(window.location.search);

        /*
         * If a post name is not provided, set it to the latest post.
         */
        if (!urlParams.has("post")) {
            urlParams.set("post", "latest");
            window.location.search = urlParams.toString();
        }
        var name = urlParams.get("post")

        /*
         * Try to render the post.
         */
        for (var post of posts) {
            if (post.name === name || name === "latest") {
                load_post(focusPostId, post);
                return;
            }
        }

        /* Couldn't find a post to show, provide an error */
        load_post_error(focusPostId);
    });
}

populate_sidebar();
populate_post();
