const homeButton = document.createElement("a");
const icon = document.createElement("img");

// Style declared to avoid having to link a seperate css file to every .html file
// and to have a single declaration of the style that will propagate to all pages if it is changed
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
    background-color: #c9823a; 
    cursor: pointer;`;

const iconStyle = "width: 35px; height: 45px;"

// Styles the button and links it to the homepage
homeButton.style.cssText = style;
homeButton.href = "../index.html";

// Styles the icon
icon.style.cssText = iconStyle;
icon.src = "../house.svg";

homeButton.appendChild(icon);
document.body.appendChild(homeButton);