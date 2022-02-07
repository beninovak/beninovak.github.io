// Makes sure the "<div id='content'></div>"
// is filled with the homepage content by default
function loadHomepage() {
  fetch("home.html")
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      document.getElementById("content").innerHTML = html;
    });
}
