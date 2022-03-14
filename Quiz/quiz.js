const questionText = document.getElementById("question");
const answersText = document.getElementsByClassName("answer");
const answersCheckboxes = document.querySelectorAll("input[name='quiz']");
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const checkAnswersBtn = document.getElementById("check-answers-btn");
const warning = document.getElementById("warning");
let answerElements = document.getElementsByClassName("form-group");
let questions;
let shuffledQuestions;
let shuffledAnswers = [];  // Used when checking quiz results
let submittedAnswers = [];
let questionCounter = 0;

let numberOfQuestions;
let numberOfCorrectAnswers = 0;

let checkedQuestion;

startBtn.addEventListener("click", startQuiz);
submitBtn.addEventListener("click", gradeQuiz);
checkAnswersBtn.addEventListener("click", () => {
  // Shows all the checkboxes and labels when checking answers
  for(let i = 0; i < 4; i++) {
    answerElements[i].classList.remove("hide");
    answerElements[i].firstElementChild.disabled = true;
  }

  // Displays the correct button
  nextBtn.classList.remove("hide");
  checkAnswersBtn.classList.add("hide");

  // The "Check next answer" functionality is-
  // controlled by the same button as loading the next question
  nextBtn.removeEventListener("click", loadNextQuestion);
  nextBtn.addEventListener("click", checkAnswers);

  // Initiates the generator function used to go through the answers and stores it
  checkedQuestion = giveNextQnA(0);
  checkAnswers(checkedQuestion);
});

async function startQuiz() {

  shuffledAnswers = [];
  submittedAnswers = [];

  nextBtn.addEventListener("click", loadNextQuestion);
  nextBtn.removeEventListener("click", checkAnswers);

  questionCounter = 0;

  if(await getShuffledQuestions() === 1) {
    return;
  }

  // Hide "Start quiz" button and show "Next question" button
  startBtn.classList.add("hide");
  nextBtn.classList.remove("hide");

  // Displays all the checkboxes and labels when starting the quiz
  for(let i = 0; i < answerElements.length; i++) {
    answerElements[i].classList.remove("hide");
    answerElements[i].style.backgroundColor = "unset";
    answerElements[i].firstElementChild.disabled = false;
    answerElements[i].firstElementChild.checked = false;
  }

  // Loads first question
  loadNextQuestion();
}

async function getShuffledQuestions() {

  let questionsURL = await import("./submitQuiz")
      .then(({default: getChoiceData}) => getChoiceData());

  let responseCode;

  // Fetches the json file containing the questions and returns them in an array.
  const json = fetch(questionsURL)
  .then(response => response.json())
  .then(data => {
    responseCode = data.response_code;
    // Response code of '1' means that there are not enough questions of the desires type in the database.
    if(responseCode === 1) {
      warning.innerHTML = "There are not enough questions in the database which fit your paramaters! Please try different ones.";
      warning.classList.remove("hide");
    }
    
    else if(responseCode === 0) {
      warning.classList.add("hide");
    }
    return data.results;
  });

  // Stores the fetch results
  questions = await json;
  numberOfQuestions = questions.length;

  // Copies the questions array.
  // Makes 'questions' and 'shuffledQuestions'-
  // independant -> changing one does not change the other.
  shuffledQuestions = [...questions];
  shuffledQuestions = shuffleQuestions(questions);
  console.log(questions); 
  console.log(shuffledQuestions);

  // Will be used when trying to start the quiz
  return responseCode;
}

function shuffleQuestions(questions) {

  let index = questions.length;

  // Shuffles the array using the Fisher-Yates algorithm
  while(index--) {
    const j = Math.floor(Math.random() * (index + 1));
    const temp = shuffledQuestions[index];
    shuffledQuestions[index] = shuffledQuestions[j];
    shuffledQuestions[j] = temp;
  }

  return shuffledQuestions;
}

function loadNextQuestion() {

  // If no box was checked, submitAnswer returns false.
  // When that happens, exit this function to prevent loading next question.
  if(questionCounter > 0) {
    if(submitAnswer() === false) {
      return;
    }
  }

  // Happens when last question has been reached
  if(questionCounter === questions.length - 1) {

    // Hides the 'Next question' button and shows the submit quiz one
    nextBtn.classList.add("hide");
    submitBtn.classList.remove("hide");
  }

  let currentQuestion = shuffledQuestions[questionCounter];
  let allAnswers = [];

  // Add both the correct and incorrect questions to allAnswers array
  allAnswers.push(currentQuestion.correct_answer);
  currentQuestion.incorrect_answers.forEach(item => {
    allAnswers.push(item);
  });

  // Shuffles the answers using the Fisher-Yates algorithm
  let index = allAnswers.length;
  while(index--) {
    const j = Math.floor(Math.random() * (index + 1));
    const temp = allAnswers[index];
    allAnswers[index] = allAnswers[j];
    allAnswers[j] = temp;
  }

  // Used later when checking answers
  shuffledAnswers.push(allAnswers);

  // Display currect question
  questionText.innerHTML = questionCounter + 1 + ": " + currentQuestion.question;

  // Display current answers
  for(let i = 0; i < allAnswers.length; i++) {
    answersText[i].innerHTML = allAnswers[i];
  }
  
  questionCounter++;
}

function submitAnswer() {

  let anyBoxChecked = false;

  // Goes through all the checkboxes and gets-
  // the text of the label next to the checked one.
  answersCheckboxes.forEach(box => {
    if(box.checked) {
      let submittedAnswer = box.nextElementSibling.innerHTML;
      submittedAnswers.push(submittedAnswer);
      anyBoxChecked = true;
      box.checked = false;
      warning.classList.add("hide");
    }
  });

  // If user didn't check any box, display a warning and return false.
  // The false return will later be used in loadNextQuestion and gradeQuiz.
  if(!anyBoxChecked) {
    warning.classList.remove("hide");
    return false;
  }
}

function gradeQuiz() {
  // Prevents user from trying to submit the quiz before having answered the last question
  if(submitAnswer() === false) {
    return;
  }
  
  submitBtn.classList.add("hide");
  checkAnswersBtn.classList.remove("hide");

  // Loops through all the questions and checks the corresponding given answer.
  // If the correct answer matches the answer chosen by the user, numberOfCorrectAnswers is incremented.
  for(let i = 0; i < shuffledQuestions.length; i++) {
    if(shuffledQuestions[i].correct_answer === submittedAnswers[i]) {
      numberOfCorrectAnswers++;
    }
  }

  let grade = ((numberOfCorrectAnswers / numberOfQuestions) * 100).toFixed(0);

  // Hides all the checkboxes and labels after finishing the quiz
  for(let i = 0; i < answerElements.length; i++) {
    answerElements[i].classList.add("hide");
  }
  questionText.innerHTML = "You got " + grade + "% of the questions right!";

  // Will be used again when checking the answers
  questionCounter = 0;
}

function checkAnswers() {
  // Gets information about the next question by calling the next yield of the generator function
  let temp = checkedQuestion.next();

  if(temp.done) {
    nextBtn.classList.add("hide");
    startBtn.classList.remove("hide");
    questionText.innerHTML = "You finished the quiz!"
    for(let item of answerElements) {
      item.classList.add("hide");
    }
    return;
  }

  questionText.innerHTML = questionCounter + 1 + ": " + temp.value.question;
  questionCounter++;

  for(let i = 0; i < 4; i++) {
    // Unstyles and unchecks all of the answers
    answersText[i].parentElement.style.backgroundColor = "unset";
    answersText[i].previousElementSibling.checked = false;
    answersText[i].previousElementSibling.disabled = true;

    // Stores the n-th answer of the returned value-
    // of the generator function and writes it in the element
    let currentAnswerText = temp.value.answers[i];
    answersText[i].innerHTML = currentAnswerText;

    // If the current answer matches the correct answer, it's-
    // background will turn green to indicate this. This must always-
    // happen regardles of whether or not the user answered correctly.
    if(currentAnswerText === temp.value.correct_answer) {
      answersText[i].parentElement.style.backgroundColor = "lime";
    }

    // The submitted answer must always be checked-
    // and it's radio button enabled (for better visibility).
    if(currentAnswerText === temp.value.submitted_answer) {
      answersText[i].previousElementSibling.checked = true;
      answersText[i].previousElementSibling.disabled = false;

      // If the current answer (the one that was submitted)-
      // is incorrect, the answer's background color is changed to reflect this.
      if(currentAnswerText !== temp.value.correct_answer) {
        answersText[i].parentElement.style.backgroundColor = "red";
      }
    }
  } 
}

// Used for returning information about the next question.
// I used a generator function because it enables me to return the next question only when required.
function* giveNextQnA(index) {
  while(index < numberOfQuestions) {
    // Returns the question and answers in the same order as they were-
    // presented when taking the quiz, the answer the user selected, and the correct answer.
    yield {
      "question": shuffledQuestions[index].question,
      "answers": shuffledAnswers[index],
      "submitted_answer": submittedAnswers[index],
      "correct_answer": shuffledQuestions[index].correct_answer
    };
    index++;
  }

  return;
}