// Gets the language select dropdown
const languageSelect = document.getElementById("language-select");

const lastUsedLanguage = localStorage.getItem("last_used_language");

// Because English is the default language, I check if any other language was last used.
// This is so that if English was last used, it doesn't go through all the elements and overrides their text with identical text.
if(lastUsedLanguage &&  lastUsedLanguage!== "EN") {
    // Selects the option in the select element corresponding to the last used language and translates into it.
    document.querySelector(`option[value='${lastUsedLanguage}']`).selected = true;
    document.querySelector(`option:not([value='${lastUsedLanguage}'])`).selected = false;
    changeLanguage();
}

// Reads the json file and returns it's data
function getJSON() {
    const languages = fetch("languages.json")
    .then(response => response.json());

    return languages;
}

// Called when user changes language selection in dropdown
async function changeLanguage() {
    // Waits for the fetch
    let languages = await getJSON();
    let chosenLanguageData;
    let phoneNumberPlaceholder;

    // Store the appropriate translation depending on user's choice of language.
    // Also changes the placeholder text of the phone number input.
    switch(languageSelect.value) {
        case "SI":
            chosenLanguageData = languages.slovene;
            phoneNumberPlaceholder = "Vnesite kot 000-111-222";
            break;

        case "EN":
            chosenLanguageData = languages.english;
            phoneNumberPlaceholder = "Input as 000-111-222";
            break;
    }

    // Find and change phone number input's placeholder
    document.getElementById("number").setAttribute("placeholder", phoneNumberPlaceholder);;

    // Translates text into selected language
    for(let key in chosenLanguageData) {
        let currentText = chosenLanguageData[key];
        
        // If the type of the current key is string, it means there is-
        // only one element with this key, so document.querySelector is used.
        if(typeof(currentText) === "string") {
            // Find the element with the current key and change it's text to the current key's value
            let element = document.querySelector(`[data-key='${key}']`);
            element.innerHTML = currentText;
        }

        // If the type of the current key is object, it means there are-
        // multiple elements with this key, so document.querySelectorAll is used to get them all.
        else {
            // Find all the elements with the current key
            let elements = document.querySelectorAll(`[data-key='${key}']`);

            // Loop through all the elements and change their text to the corresponding text
            for(let i = 0; i < elements.length; i++) {
                elements[i].innerHTML = currentText[i];
            }
        }
    }
}

// Store the last used language in localStorage
window.addEventListener("beforeunload", () => {
    localStorage.setItem("last_used_language", languageSelect.value);
});