const questions = [
    {
        question: "Who is the creator of Chainsaw Man?",
        answers:[
            {text: "Kōhei Horikosh", correct: false},
            {text: "Tatsuki Fujimoto", correct: true},
            {text: "Hajime Isayama", correct: false},
            {text: "Masashi Kishimoto", correct: false},
        ]
    },
    {
        question: "Who does Denji consider his family?",
        answers:[
            {text: "Reze & Makima", correct: false},
            {text: "Kobeni & Himeno", correct: false},
            {text: "Aki & Power", correct: true},
            {text: "Fumiko & Yoshida", correct: false},
        ]
    },
    {
        question: "What was Pochita's contract to revive Denji?",
        answers:[
            {text: "Tell him about his dreams", correct: true},
            {text: "His soul", correct: false},
            {text: "Hugs", correct: false},
            {text: "An eye", correct: false},
        ]
    },
    {
        question: "How many are Quanxi's girlfriends?",
        answers:[
            {text: "4", correct: true},
            {text: "7", correct: false},
            {text: "10", correct: false},
            {text: "2", correct: false},
        ]
    }
];

const questionElement = document.getElementById("question");
const answerButton = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz(){
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    nextButton.style.display = "none";
    showQuestion();
}

function showQuestion(){
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;
    
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("quiz-btn");
        answerButton.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

function resetState(){
    nextButton.style.display = "none";
    while (answerButton.firstChild) {
        answerButton.removeChild(answerButton.firstChild);
    }
}

function selectAnswer(e){
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if (!isCorrect) {
        selectedBtn.classList.add("incorrect");
        selectedBtn.classList.add("shake");
        setTimeout(() => {
            selectedBtn.classList.remove("shake");
        }, 650);
    } else {
        score++;
        selectedBtn.classList.add("correct");
        selectedBtn.classList.add("animatedbtn");
        setTimeout(() => {
            selectedBtn.classList.remove("animatedbtn");
        }, 650);
    }
    Array.from(answerButton.children).forEach(button => {
        button.disabled = true;
    });
    nextButton.style.display = "block";
}

nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
});

function showResults(){
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Restart";
    nextButton.style.display = "block";
    nextButton.addEventListener("click", startQuiz, { once: true });
}

startQuiz();