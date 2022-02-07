// Needed because the 'autoplay'
// attribute doesn't always trigger
let video = document.getElementById("vid");
video.play();

// IMPORTANT
document.addEventListener("scroll", () => {
  // If you haven't scrolled past video
  // and you refresh, the page view will snap back to top
  if (document.documentElement.scrollTop <= video.clientHeight) {
    history.scrollRestoration = "manual";
  }

  // If you have scrolled past video
  // you will stay at the same spot on page refresh
  else {
    history.scrollRestoration = "auto";
  }
});

let scrollBtn = document.getElementById("scroll-btn");
// When down-arrow button is clicked scroll
// to the beginning of next section
scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: video.clientHeight,
    left: 0,
    behavior: "smooth"
  });
});

// Displays order-form
function displayOrderBlock() {
  let form = document.getElementById("order-form");
  form.style.display = "block";
  form.scrollIntoView();
}
