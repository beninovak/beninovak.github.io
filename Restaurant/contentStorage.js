// If you visited any subpage in this browser session
// it remembers which and loads it when you reload the site
if(sessionStorage.getItem("lastOpenedSubpage") != null) {
    mainContentFetch(sessionStorage.getItem("lastOpenedSubpage"));
}