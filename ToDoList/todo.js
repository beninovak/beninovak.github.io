const tooltip = document.getElementById("tooltip");
const itemInfo = document.getElementById("item-info");
let mouseHoveringOnIcon = false;
let allTodosSelected = false;
let itemCounter = 0;

let deleteColor = "#f02e51";
let markImportantColor = "#f07229";

const markImportantTooltipText = "Mark as important";
const unmarkImportantTooltipText = `Marked as important.
      Click again to remove mark.`;

const selectAllBtn = document.getElementById("select-all");
const deleteSelectedBtn = document.getElementById("delete-button");

// Used in handleWarning when displaying warning popup
const warningAlert = document.getElementById("warning-background");
const warningHeader = document.querySelector("#warning-alert h3");
const warningText = document.querySelector("#warning-alert p");

// Stores input for retrieving to-do content.
// Stores list in order to append the to-do's to it
const itemInput = document.getElementById("item-input");
const toDoList = document.getElementById("list");

// Used to keep track of warning popup choices.
// Used in fetchChoice() and changed when warning popup buttons are pressed
let userChoice = null;

// Will contain each to-do's text to check for duplicates
let allTodos = [];

const noButton = document.getElementById("no-button");
const yesButton = document.getElementById("yes-button");
const OKButton = document.getElementById("ok-button");


if(!localStorage.getItem("todos")) {localStorage.setItem("todos", "[]")};
// If local storage already has some to-do's, add them to the local array
if(JSON.parse(localStorage.getItem("todos")).length !== 0) {
  // Items are stored in the same variable-
  // in local storage, separated by commas. This-
  // makes an array of individual to-do's from that variable.
  let savedTodos = JSON.parse(localStorage.getItem("todos"));

  // Adds the separated values in the local array
  savedTodos.forEach((item) => {
    createItemToAdd(item);
  });

  deleteSelectedBtn.classList.remove("disabled");
  deleteSelectedBtn.ariaDisabled = false;
}

// Updates userChoice when the choice buttons are clicked
noButton.addEventListener("click", () => userChoice = false);
yesButton.addEventListener("click", () => userChoice = true);
OKButton.addEventListener("click", () => userChoice = "OK");
deleteSelectedBtn.addEventListener("click", (e) => {
  // For some reason reading the ariaDisabled attribute returns a string.
  // If that string is "false", meaning the button is not disabled, run the function.
  if((e.target.ariaDisabled) === "false") {
    deleteSelected();
  }
});

// Pressing enter inside input will call addItemToList()
itemInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    addItemToList();
  }
});

function createItemToAdd(itemToAdd) {
  // Creates the to-do item
  let itemToBeAdded = document.createElement("li");

  // Creates checkbox used for marking completion
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = itemToAdd.completed;

  // When checkbox is clicked cross over-
  // the text of the to-do, marking completion.
  checkbox.addEventListener("click", (e) => {
    let parentId = parseInt(e.target.parentElement.getAttribute("item-id"));

    if(e.target.checked) {
      e.target.nextSibling.classList.add("marked-as-complete");
    }

    else {
      e.target.nextSibling.classList.remove("marked-as-complete");
    }

    if(allTodos[parentId].completed == true) {
      allTodos[parentId].completed = false;
    }

    else {
      if(e.target.checked) {
        allTodos[parentId].completed = true;
      }
    }
  });

  let itemText = document.createElement("div");
  itemText.classList.add("text");
  itemText.innerHTML = itemToAdd.text;

  // Creates the div that will hold the 'delete' and 'important' icons
  let icons = document.createElement("div");

  // Creates 'delete' icon img
  let deleteIcon = document.createElement("img");
  deleteIcon.src = "trash-icon.svg";

  // Creates 'mark as important' icon img
  let importantIcon = document.createElement("img");
  importantIcon.src = "important-icon.svg";

  // Creates 'info' icon img
  let infoIcon = document.createElement("img");
  infoIcon.src = "info-icon.svg";

  // Gives the icons functionality
  deleteIcon.addEventListener("dblclick", deleteItem);
  importantIcon.addEventListener("click", markAsImportant);
  infoIcon.addEventListener("click", (e) => {
    e.preventDefault();
    displayInfo(e, itemToAdd.text, itemToAdd.date);
  });

  // Leaving the info-icon with the cursor hides the info box.
  infoIcon.addEventListener("mouseleave", () => {
    itemInfo.style.visibility = "hidden";
  });

  // If user hovers over the info box itself, this ensures it stays on screen
  itemInfo.addEventListener("mouseenter", () => {
    itemInfo.style.visibility = "visible";
  });

  // If user was hovered on the info box and leaves it, hide the box.
  itemInfo.addEventListener("mouseleave", () => {
    itemInfo.style.visibility = "hidden";
  });

  // Add the icons to the icon block
  icons.appendChild(infoIcon);
  icons.appendChild(importantIcon);
  icons.appendChild(deleteIcon);

  // Sets the id of each individual item as an attribute
  itemToBeAdded.setAttribute("item-id", itemCounter);

  if(itemToAdd.important) {
    itemToBeAdded.classList.add("important");
    importantIcon.classList.add("important-icon-selected");
  }

  if(itemToAdd.completed) {
    itemText.classList.add("marked-as-complete");
  }

  itemToBeAdded.appendChild(checkbox);
  itemToBeAdded.appendChild(itemText);
  itemToBeAdded.appendChild(icons);

  // Adds to the array of all to-do's -> used in checking for duplicates
  allTodos.push({
    text: itemToAdd.text,
    date: itemToAdd.date,
    important: itemToAdd.important,
    completed: itemToAdd.completed
  });

  deleteSelectedBtn.classList.remove("disabled");
  deleteSelectedBtn.ariaDisabled = false;

  // Add the to-do item to the list
  toDoList.appendChild(itemToBeAdded);

  // Keeps track of number of items. Is also used in 'deleteItem'
  itemCounter++;
}

async function addItemToList() {

  // The trim() method removes whitespaces either side of the string
  let itemInputText = itemInput.value.trim();
  let isDuplicate = false;

  // Creation date of to-do item will be part of the item's data.
  // 'toLocaleString()' gives me DD/MM/YYYY HH:MM:SS.
  let dateOfCreation = new Date().toLocaleString("sl-SI", {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'});

  // If input is empty, change it to show that that's invalid and do nothing.
  // If the input text's length is 0 (because of the trim() method, do the same).
  if ((itemInputText === "") || (itemInputText.length === 0)) {
    itemInput.value = "";
    itemInput.placeholder = "You cannot add an empty to-do";
    itemInput.classList.add("empty");
    itemInput.style.backgroundColor = "#f02e51";
    return;
  }

  allTodos.forEach((item) => {
    if(item.text == itemInputText) {
      isDuplicate = true;
      return;
    }
  });

  // If array already has an identical to-do, warn the user
  if(isDuplicate) {

    // Display warning popup
    warningAlert.classList.remove("hide")

    // Store user's decision about creating-
    // a duplicate with handleWarning(), which-
    // periodically checks whether the user has made a choice.
    let createDuplicate = await handleWarning("duplicate");

    // If user chose not to add a duplicate, hide the-
    // warning popup, clear the input, and leave the function.
    // If 'true' the function proceeds as normal and adds the duplicate.
    if(!createDuplicate) {
      warningAlert.classList.add("hide");
      itemInput.value = "";
      return;
    }

    // Hide warning popup
    warningAlert.classList.add("hide");
  }

  createItemToAdd({
    text: itemInputText,
    date: dateOfCreation,
    important: false,
    completed: false
  });

  // Remove "empty warning" when valid to-do is added
  itemInput.classList.remove("empty");
  itemInput.placeholder = "Type your to-do here";
  itemInput.style.background = "white";

  // Clears input after adding item
  itemInput.value = "";
}

async function deleteItem() {

  let listItem = this.parentElement.parentElement;
  let listItemId = parseInt(listItem.getAttribute("item-id"));
  let temp = listItem.nextSibling;

  // Checks if the item marked for deletion is marked as important
  if(listItem.classList.contains("important")) {

    // Display popup
    warningAlert.classList.remove("hide");

    // Store user's decision about deleting an-
    // important to-do with handleWarning(), which-
    // periodically checks whether the user has made a choice.
    let deleteImportant = await handleWarning("deleteImportant");

    // If user chose not to delete an important-
    // to-do, hide warning popup and leave the function.
    // If 'true' the function proceeds as normal and deletes the to-do.
    if(!deleteImportant) {
      warningAlert.classList.add("hide");
      return;
    }

    // Hide warning popup
    warningAlert.classList.add("hide");
  }

  // Cycles through the to-do items and adjusts their id's.
  // It keeps getting the nextSilbing and subtracts 1 from it's id.
  while(temp != null) {
    temp.setAttribute("item-id", parseInt(temp.getAttribute("item-id")) - 1);
    temp = temp.nextSibling;
  }

  // Adjust counter after deletion
  itemCounter--;

  if(itemCounter === 0) {
    deleteSelectedBtn.classList.add("disabled");
    deleteSelectedBtn.ariaDisabled = true;
  }

  allTodos.splice(listItemId, 1);

  listItem.remove();

  // If last to-do is deleted, remove tooltip
  if (toDoList.childElementCount == 0) {
    tooltip.style.visibility = "hidden";
  }
}

function markAsImportant(e) {
  let parent = this.parentElement.parentElement;

  // The class turns the icon yellow if the to-do is being-
  // marked as important and back to black if it is being unmarked.
  // This is done to better show the to-do was marked as important.
  e.target.classList.toggle("important-icon-selected");

  // Add important class if it doesn't have it, remove it if it does.
  // Change tooltip text instantly.
  if (parent.classList.contains("important")) {
    parent.classList.remove("important");
    tooltip.innerHTML = markImportantTooltipText;

    // Stores importance info in allTodos
    allTodos[parseInt(parent.getAttribute("item-id"))].important = false;
  }

  else {
    parent.classList.add("important");
    tooltip.innerHTML = unmarkImportantTooltipText;

    // Stores importance info in allTodos
    allTodos[parseInt(parent.getAttribute("item-id"))].important = true;
  }
}

function displayInfo(e, content, date) {
  itemInfo.innerHTML = `${content}
                       Created on: ${date}`;

  // Display tooltip and position it vertically at the cursor
  itemInfo.style.visibility = "visible";

  // Moves it 50px higher so as to not block the to-do itself.
  // This ensures the cursor will be on the bottom edge of the-
  // info box,because the info box itself is 50 px high.
  itemInfo.style.top = e.clientY - 50 + "px";

  // Setting the info box's 'right' property ensures-
  // the cursor will be on the right edge of the info box.
  itemInfo.style.right = window.innerWidth - e.clientX + "px";
}

function handleWarning(type, choice) {

  if(choice === "confirm") {
    document.querySelector("#warning-alert .yes-no-group").classList.add("hide");
    document.querySelector("#warning-alert .ok-group").classList.add("show");
  }

  else {
    document.querySelector("#warning-alert .yes-no-group").classList.remove("hide");
    document.querySelector("#warning-alert .ok-group").classList.remove("show");
  }

  // Changes warning-alert title and text-
  // to appropriately convey the warning to user
  switch(type) {
    case "duplicate":
      warningHeader.innerHTML = "Duplicate alert!"
      warningText.innerHTML = `You already have the exact same to-do.
      Are you sure you want to add a duplicate?`
      break;

    case "deleteImportant":
      warningHeader.innerHTML = "Deleting important to-do!"
      warningText.innerHTML = `You are trying to delete a to-do
      which is marked as important. Are you sure you want to do that?`
      break;

    case "deleteSelectedNoneSelected":
      warningHeader.innerHTML = "No to-do's selected!";
      warningText.innerHTML = `Please select which to-do's you want to
      delete.`;
      break;

    case "deleteSelected":
      warningHeader.innerHTML = "Confirm deletion of to-do's!"
      warningText.innerHTML = `Please confirm your decision to delete
      the selected to-do's. If you don't want to, press No.`;
      break;

    default:
      break;
  }
  // As soon as user has pressed either the 'yes' or 'no' button,
  // 'result != null' will become true, and the choice will be passed-
  // on in the 'resolve(result)'. The promise performs the check every 100ms.
  return new Promise((resolve) => {
    // Save the interval
    const checkInterval = setInterval(() => {
      let result = fetchChoice();

      if(result != null) {
        // Cancel the interval after user has made a choice.
        // Without this the choice button clicks don't register-
        // properly in the case of another duplicate warning popup.
        clearInterval(checkInterval);
        resolve(result);
      }
    }, 100);
  });
}

// Used in handleWarning to periodically-
// check for user's choice when displaying a warning.
function fetchChoice() {
  if(userChoice === true) {
    userChoice = null;
    return true;
  }

  else if (userChoice === false) {
    userChoice = null;
    return false;
  }

  else if(userChoice === "OK") {
    userChoice = null;
    return "OK";
  }
}

// Selects all the to-do's
function selectAll() {
  // Gets array of all the checkboxes
  let allCheckboxes = document.querySelectorAll("#list input");

  // If all to-do's aren't selected yet,
  // go through all of them and set them to checked.
  if(!allTodosSelected) {
    allCheckboxes.forEach(item => {
      item.checked = true;
    });
    allTodosSelected = true;
  }

  // If all to-do's are already selected,
  // go through all of them and uncheck them,
  // set the ones that were marked as completed-
  // to uncompleted, and remove the text line-through style.
  else {
    allCheckboxes.forEach(item => {
      item.checked = false;
      let parentId = parseInt(item.parentElement.getAttribute("item-id"));
      allTodos[parentId].completed = false;
      item.nextSibling.classList.remove("marked-as-complete");
    });

    allTodosSelected = false;
  }
}

async function deleteSelected() {

  // Gets list of all checkboxes
  let allCheckboxes = document.querySelectorAll("#list input");

  warningAlert.classList.remove("hide");

  let counter = 0;

  let anyTodoChecked = false;

  allCheckboxes.forEach(item => {
    if(item.checked) {
      anyTodoChecked = true;
      counter++;
    }
  });

  if(!anyTodoChecked) {
    await handleWarning("deleteSelectedNoneSelected", "confirm");
  }

  else {
    let deleteSelected = await handleWarning("deleteSelected");

    if(!deleteSelected) {
      warningAlert.classList.add("hide");
      return;
    }
  }

  itemCounter -= counter;

  if(itemCounter === 0) {
    deleteSelectedBtn.classList.add("disabled");
    deleteSelectedBtn.ariaDisabled = true;
  }

  // Cycles through all checkboxes
  allCheckboxes.forEach(item => {
    // If the current checkbox is selected, delete it
    if(item.checked) {
      
      // Get index of item in allTodos array, 
      // which matches the text of the selected item.
      let index = allTodos.findIndex(ele => {
        return ele.text == item.nextSibling.innerHTML;
      });

      // Delete item at the index from allTodos array
      allTodos.splice(index, 1);

      // Remove the item from screen
      item.parentElement.remove();
    }
  });

  // Get array of all items
  let allItems = toDoList.children;

  // Adjust item id's after deletion
  for(let i = 0; i < allItems.length; i++) {
    allItems[i].setAttribute("item-id", i);
  }
  
  // Hide warning
  warningAlert.classList.add("hide");
}

window.addEventListener("beforeunload", () => {
  // Adds the array to local storage
  localStorage.setItem("todos", JSON.stringify(allTodos));
  allTodos = [];
});