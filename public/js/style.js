/*
 * The threshold at which the floating sidebar converts to a hamburger menu.
 * Mainly needed to not split the screen for mobile.
 */
const conversionThresholdWidth = 800;
const sidebarTagId = "post-sidebar";
const summariesTagId = "post-summaries";
const hamburgerTagId = "hamburger-menu";

var isExpanded = false;
var isHamburger = false;

/*
 * Expands the hamburger menu.
 */
function expandSidebar() {
    var sidebar = document.getElementById(sidebarTagId);
    sidebar.classList.remove("fixed");
    sidebar.classList.remove("collapse-menu");
    sidebar.classList.add("expand-menu");
    isExpanded = true;

    var hamburger = document.getElementById(hamburgerTagId);
    hamburger.classList.add("change");
}

/*
 * Collapses the hamburger menu.
 */
function collapseSidebar() {
    var sidebar = document.getElementById(sidebarTagId);
    sidebar.classList.remove("fixed");
    sidebar.classList.remove("expand-menu");
    sidebar.classList.add("collapse-menu");
    isExpanded = false;

    var hamburger = document.getElementById(hamburgerTagId);
    hamburger.classList.remove("change");
}

/*
 * Convert the sidebar to a hamburger menu that's collapsed by default.
 */
function convertToHamburger() {
    /* Set hamburger menu CSS */
    var hamburger = document.getElementById(hamburgerTagId);
    hamburger.style.visibility = "visible";

    /* Set sidebar CSS */
    collapseSidebar();

    /* Set main content CSS */
    var posts = document.getElementById(summariesTagId);
    posts.style.width = "calc(100% - 20px)";

    isHamburger = true;
}

/*
 * Convert the sidebar to a floating menu.
 */
function convertToFloating() {
    /* Set hamburger menu CSS */
    var hamburger = document.getElementById(hamburgerTagId);
    hamburger.style.visibility = "hidden";

    /* Set sidebar CSS */
    var sidebar = document.getElementById(sidebarTagId);
    sidebar.classList.remove("collapse-menu");
    sidebar.classList.remove("expand-menu");
    sidebar.classList.add("fixed");

    /* Set main content CSS */
    var posts = document.getElementById(summariesTagId);
    posts.style.width = "calc(70% - 20px)";

    isHamburger = false;
}

/*
 * Toggle the sidebar if the hamburger menu is active.
 */
function toggleSidebar() {
    if (isExpanded) {
        collapseSidebar();
    } else {
        expandSidebar();
    }
}

/*
 * Set the sidebar; callback function for when the page is active.
 * Only redraw CSS if the viewport has changed.
 */
function setSidebar() {
    if (document.body.clientWidth < conversionThresholdWidth && !isHamburger) {
        convertToHamburger();
    } else if (document.body.clientWidth > conversionThresholdWidth && isHamburger) {
        convertToFloating();
    }
}

/*
 * Initialize the sidebar position.
 */
function initializeSidebar() {
    if (document.body.clientWidth < conversionThresholdWidth) {
        convertToHamburger();
    } else {
        convertToFloating();
    }
}

window.addEventListener("resize", (event) => setSidebar());
initializeSidebar();
