const homeButton = document.createElement("a");
const icon = document.createElement("img");

// Style declared to avoid having to link a seperate css file-
// to every .html file and to have a single declaration of the style.
const style = `
    width: 50px; 
    height: 50px; 
    position: fixed; 
    bottom: 30px; 
    right: 30px; 
    border-radius: 50%; 
    text-align: center; 
    border: 3px solid white; 
    outline: 3px solid black; 
    background-color: #7366c7;
    cursor: pointer;
    z-index: 1000;
    box-sizing: content-box;`;

const iconStyle = "width: 35px; height: 45px;"

// Styles the icon
icon.style.cssText = iconStyle;
icon.src = "../house.svg";

// Styles the button and links it to the homepage
homeButton.style.cssText = style;
homeButton.href = "../index.html";

homeButton.appendChild(icon);
document.body.appendChild(homeButton);