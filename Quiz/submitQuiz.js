const questionAmount = document.getElementById("question-amount");
const categorySelect = document.getElementById("category-select");
const difficultySelect = document.getElementById("difficulty-select");
const confirmChoiceBnt = document.getElementById("confirm-choice");
let categories;
let completeURL;

const baseURL = "https://opentdb.com/api.php?";

// Gets all categories and their ID's from the .json file
const json = fetch("categories.json")
      .then(response => response.json())
      .then(data => data.trivia_categories);


// Waits for the .json file to be fetched and populates the <select> with category <option>'s
async function getCategories() {
    categories = await json;
    
    for(let category of categories) {
        let option = document.createElement("option");
        option.innerHTML = category.name;
        categorySelect.appendChild(option);
    }
}

// Creates URL for API request based on users choices.
// This function will be exported to the "quiz.js" script, to be used when starting the quiz.
export default async function getChoiceData() {
    // Stores the selected options
    let amount = questionAmount.value;
    let category = categorySelect.value;    
    let categoryID = null;
    let difficulty = difficultySelect.value;

    // Finds appropriate categoryID
    categories.forEach(item => {
        if(item.name === category) {
            categoryID = item.id;
        }
    });

    // Creates appropriate URL
    if(categoryID === null) {
        completeURL = `${baseURL}amount=${amount}&difficulty=${difficulty}&type=multiple`;
        return completeURL;
    }

    completeURL = `${baseURL}amount=${amount}&category=${categoryID}&difficulty=${difficulty}&type=multiple`;

    // This is used in 'quiz.js'
    return completeURL;
}

// Gets categories when page loads
getCategories();