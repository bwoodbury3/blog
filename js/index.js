const url = "/posts/";
const allPostsUrl = url + "posts.json";
const errPostUrl = url + "404.md";
const focusPostId = "post-focus";
const sidebarTagId = "post-list";

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
    element.setAttribute("src", post.url);
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
        .then(function (response) {
            callback(response)
        });
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
            postList += `<li><a href="?post=${post.name}">${post.name}</a></li>`;
        }
        set_content(sidebarTagId, postList);
    });
}

/*
 * Populate the latest post.
 *
 * @param name: The name of the post to render.
 */
function populate_post(name) {
    get_posts(function (response) {
        var posts = response.posts;

        if (name) {
            /*
             * If a post name is provided, try to render that post.
             */
            for (var post of posts) {
                if (post.name === name) {
                    load_post(focusPostId, post);
                    return;
                }
            }
        } else {
            /*
             * If a post name is not provided, display the latest post.
             */
            posts.sort((first, second) => second.date.localeCompare(first.date));
            load_post(focusPostId, posts[0]);
            return;
        }

        /* Couldn't find a post to show, provide an error */
        load_post_error(focusPostId);
    });
}

/*
 * Populate the post from the URL parameters. If no parameter is found, default
 * to the latest post.
 */
function render_content() {
    const urlParams = new URLSearchParams(window.location.search);
    populate_post(urlParams.get("post"));
}

populate_sidebar();
render_content();
