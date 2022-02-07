function mainContentFetch(fileName) {
  // Gets module's html and inserts it into the content div
  fetch(fileName + ".html")
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      document.getElementById("content").innerHTML = html;
    });

  // Gets the styles for the module by creating a '<link>'
  // with path to '.css' file and appending it to the '<head>'
  let moduleStyle = fileName + "Style";
  if (!document.getElementById(moduleStyle)) {
    let head = document.getElementsByTagName("head")[0];
    let link = document.createElement("link");
    link.id = moduleStyle;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "Styles/" + fileName + ".css";
    head.appendChild(link);
  }
}
