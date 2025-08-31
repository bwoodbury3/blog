import { get_posts, postsUrl } from "/js/common.js"

const errPostUrl = `${postsUrl}/404.md`;
const focusPostId = "post-focus";

/**
 * Load a given markdown file into the given HTML tag.
 *
 * @param post: The post object (see posts.json).
 */
function load_post(post) {
    const element = document.getElementById(focusPostId);
    element.setAttribute("src", `${postsUrl}/${post.file}`);
}

/**
 * Render 'post not found' stuff.
 */
function load_post_error() {
    const element = document.getElementById(tagfocusPostIdId);
    element.setAttribute("src", errPostUrl);
}

/**
 * Populate the post content.
 */
async function populate_post() {
    const urlParams = new URLSearchParams(window.location.search);

    // If a post name is not provided, set it to the latest post.
    if (!urlParams.has("post")) {
        urlParams.set("post", "latest");
        window.location.search = urlParams.toString();
    }
    const name = urlParams.get("post")

    // Try to render the post.
    const posts = await get_posts();
    for (const post of posts) {
        if (post.name === name || name === "latest") {
            load_post(post);
            return;
        }
    }

    // Couldn't find a post to show, provide an error.
    load_post_error();
}

populate_post();
