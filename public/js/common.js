export const postsUrl = "/posts"
export const allPostsUrl = `${postsUrl}/posts.json`;

/**
 * Set the content for a given tag.
 *
 * @param tagId: The tag to load the content into.
 * @param content: The content to populate (innerHTML).
 */
export function set_content(tagId, content) {
    var element = document.getElementById(tagId);
    if (!element) {
        console.log("Failed to set " + tagId);
        return;
    }
    element.innerHTML = content;
}

/**
 * Fetch the list of posts from the server.
 *
 * @return The posts as a list.
 */
export async function get_posts() {
    const response = await fetch(allPostsUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    })
    const json = await response.json();
    return json.posts;
}

/**
 * Render common elements.
 */
async function render_common() {
    // Render banner.
    const response = await fetch("/templates/banner.html");
    if (response.ok) {
        const content = await response.text();
        set_content("banner", content);
    }
}

/**
 * Populate the sidebar with all of the posts in posts.json, sorting by most
 * recent posts.
 */
async function populate_sidebar() {
    const posts = await get_posts();
    posts.sort((first, second) => second.date.localeCompare(first.date));

    var postList = ""
    for (const post of posts) {
        postList += `<li>
            <a href="?post=${post.name}">
                <p class="preview-title">${post.name}</p>
                <p class="preview-date">${post.date}</p>
            </a>
        </li>`;
    }
    set_content("post-list", postList);
}

render_common();
populate_sidebar();
