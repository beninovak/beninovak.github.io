const firstName = document.getElementById("first")
const lastName = document.getElementById("last")
const telephone = document.getElementById("telephone")
const addButton = document.getElementById("addButton")
const sortButton = document.getElementById("sortButton")
const tableContacts = document.getElementById("contacts-table")
const tableBody = document.querySelector("#contacts-table tbody");

addButton.addEventListener("click", addToContacts)

function addToContacts() {
    let contactInfo = []
    let fn = firstName.value
    let ln = lastName.value
    let tele = telephone.value
    contactInfo.push(fn, ln, tele)
    
    let tableRow = document.createElement("TR")
    contactInfo.forEach(info => {
        let tableData = document.createElement("TD")
        tableData.setAttribute("contenteditable", "true")
        tableData.textContent = info
        tableRow.appendChild(tableData)
    })
    
    let deleteCell = document.createElement("TD")
    deleteCell.textContent = "X"
    deleteCell.addEventListener("dblclick", (event) => {
        event.target.parentNode.remove()
    })

    tableRow.appendChild(deleteCell)
    tableBody.appendChild(tableRow) 
}

// Pass 'e' to be able to get the caller of the function(a <th>).
// The sortBy is a number passed in the HTML by the <th>'s onclick attribute.
// It can be either a 0 or 1, representing the decision to sort the table by-
// either the name(0) or lastname(1) respectively.
function sortTable(e, sortBy) {
    let rows, lastCycleNothingChanged, comparisons, counter, currentRowText, nextRowText, ascending = true;
    rows = tableContacts.rows;

    // When called, assume nothing was changed
    lastCycleNothingChanged = true;

    // Handle the alternation between ascending and descending order with a custom attribute.
    // This is done to more easily handle the alternating sorts --> by having an outside reference for what was done last time.
    // By default it is set as "ascending" on the <th>'s that you want to sort by.
    if(e.getAttribute("data-order") == "ascending") {
        // Set the current sort order to ascending and set attribute to descending.
        // This will be used next time the user calls this function.
        ascending = true;
        e.lastChild.classList.add("reverse");
        e.setAttribute("data-order", "descending");
    } 

    // The opposite of above
    else {
        ascending = false;
        e.lastChild.classList.remove("reverse");
        e.setAttribute("data-order", "ascending");
    } 
        
    // -1 because there is always 1 comparison less than there are rows
    comparisons = rows.length - 1; 

    // Start at 1 to skip the headers
    counter = 1;

    // The loop keeps trying to sort until lastCycleNothingChanged-
    // is true, meaning that the last time the loop cycled through all-
    // of the rows, no rows were switched. When this happens they're sorted.
    while(true) {

        // If you've gone through all the rows, reset counter and go to top again
        if(counter == comparisons) {
            counter = 1;

            // If you've gone through all the rows and nothing changed-
            // last time, exit the loop --> rows are sorted.
            if(lastCycleNothingChanged) {
                break;
            }

            // If this stays true, it means there was no change last cycle
            lastCycleNothingChanged = true;
        }
        
        // When sortBy is 0 --> sort by name, when it's 1 --> sort by last name
        currentRowText = rows[counter].children[sortBy].textContent;
        nextRowText = rows[counter + 1].children[sortBy].textContent;

        // Value of 'ascending' set at the top of the function
        if(ascending) {
            // If current row is alphabetically higher than next row, switch them
            if(currentRowText.toLowerCase() > nextRowText.toLowerCase()) {
                        
                // insertBefore removes the child and moves it to desired spot (CTRL + X)
                rows[counter].parentNode.insertBefore(rows[counter + 1], rows[counter]);

                // Indicate that a change occured
                lastCycleNothingChanged = false;
            }
        }

        // The opposite of above
        else if(!ascending) {
            if(currentRowText.toLowerCase() < nextRowText.toLowerCase()) {
                        
                // insertBefore removes the child and moves it to desired spot (CTRL + X)
                rows[counter].parentNode.insertBefore(rows[counter + 1], rows[counter]);

                // Indicate that a change occured
                lastCycleNothingChanged = false;
            }
        }

        counter++;
    }
}