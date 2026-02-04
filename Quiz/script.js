const questionData = {
  easy: [
    {question:"Capital of France?",answers:[{text:"Paris",correct:true},{text:"Rome",correct:false},{text:"Madrid",correct:false},{text:"Berlin",correct:false}]},
    {question:"HTML stands for?",answers:[{text:"Hyper Text Markup Language",correct:true},{text:"High Tech...",correct:false},{text:"Hot To Make...",correct:false},{text:"None",correct:false}]},
    {question:"2+2=?",answers:[{text:"4",correct:true},{text:"5",correct:false},{text:"3",correct:false},{text:"22",correct:false}]},
    {question:"Color of sky?",answers:[{text:"Blue",correct:true},{text:"Green",correct:false},{text:"Purple",correct:false},{text:"Orange",correct:false}]}
  ],
  medium: [
    {question:"JS is client-side or server-side?",answers:[{text:"Both",correct:true},{text:"Client-side",correct:false},{text:"Server-side",correct:false},{text:"None",correct:false}]},
    {question:"CSS stands for?",answers:[{text:"Cascading Style Sheets",correct:true},{text:"Computer Style...",correct:false},{text:"Creative Style...",correct:false},{text:"Colorful Style...",correct:false}]},
    {question:"<script> tag is for?",answers:[{text:"JS",correct:true},{text:"CSS",correct:false},{text:"HTML",correct:false},{text:"XML",correct:false}]}
  ],
  hard: [
    {question:"ECMAScript 6 introduced?",answers:[{text:"let",correct:true},{text:"varonly",correct:false},{text:"constonly",correct:false},{text:"none",correct:false}]},
    {question:"Promise.resolve returns?",answers:[{text:"A Promise",correct:true},{text:"Array",correct:false},{text:"String",correct:false},{text:"Number",correct:false}]},
    {question:" === in JS means?",answers:[{text:"Strict equality",correct:true},{text:"Assignment",correct:false},{text:"Type conversion",correct:false},{text:"Inequality",correct:false}]},
    {question:"Optionally chaining operator?",answers:[{text:"?.",correct:true},{text:":?",correct:false},{text:"?.",correct:false},{text:"::",correct:false}]}
  ]
};

const setupBox = document.getElementById("setup-box"),
      quizBox = document.getElementById("quiz-box"),
      categorySelect = document.getElementById("category-select"),
      startBtn = document.getElementById("start-btn"),
      questionElement = document.getElementById("question"),
      answerButtons = document.getElementById("answer-buttons"),
      nextBtn = document.getElementById("next-btn"),
      timerDisplay = document.getElementById("time"),
      scoreBox = document.getElementById("score-box"),
      progressBar = document.getElementById("progress");

const soundCorrect = document.getElementById("sound-correct"),
      soundWrong = document.getElementById("sound-wrong"),
      soundTimeout = document.getElementById("sound-timeout");

let questions = [], currentQuestionIndex=0, score=0, timer, timeLeft=15;

startBtn.addEventListener("click", ()=>{
  const cat = categorySelect.value;
  if(!cat){ alert("Choose a category"); return; }
  questions = [...questionData[cat]];
  setupBox.classList.add("hidden"); quizBox.classList.remove("hidden");
  startQuiz();
});

function startQuiz(){
  currentQuestionIndex = 0; score=0;
  const high = localStorage.getItem("highScore_"+categorySelect.value)||0;
  scoreBox.textContent = `🏆 High Score: ${high}`;
  nextBtn.textContent = "Next"; showQuestion();
}

function startTimer(){
  timeLeft=15; updateTimerDisplay();
  timer = setInterval(()=>{
    timeLeft--; updateTimerDisplay();
    if(timeLeft<=0){ clearInterval(timer); soundTimeout.play(); autoSelectAnswer(); }
  },1000);
}

function updateTimerDisplay(){
  timerDisplay.textContent = timeLeft;
  timerDisplay.classList.toggle("red", timeLeft<=5);
}

function resetState(){
  clearInterval(timer); nextBtn.style.display="none"; answerButtons.innerHTML="";
}

function speak(text){
  if('speechSynthesis' in window){
    const u=new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
}

function showQuestion(){
  resetState();
  const q=questions[currentQuestionIndex];
  questionElement.textContent = q.question;
  q.answers.forEach(ans=>{
    const btn=document.createElement("button");
    btn.textContent=ans.text;
    if(ans.correct) btn.dataset.correct=ans.correct;
    btn.addEventListener("click", selectAnswer);
    answerButtons.appendChild(btn);
  });
  updateProgressBar(); speak([q.question, ...q.answers.map(a=>a.text)].join(". "));
  startTimer();
}

function selectAnswer(e){
  clearInterval(timer);
  const sel=e.target, correct=sel.dataset.correct==="true";
  correct? (sel.classList.add("correct"), soundCorrect.play(), score++) : (sel.classList.add("wrong"), soundWrong.play());
  Array.from(answerButtons.children).forEach(b=>{
    b.disabled=true;
    if(b.dataset.correct==="true") b.classList.add("correct");
  });
  nextBtn.style.display="block";
}

function autoSelectAnswer(){
  questionElement.innerHTML += "<br><span style='color:red'>Time's up!</span>";
  Array.from(answerButtons.children).forEach(b=>{
    b.disabled=true;
    if(b.dataset.correct==="true") b.classList.add("correct");
  });
  nextBtn.style.display="block";
}

function showScore(){
  resetState();
  questionElement.textContent = `🎉 Score = ${score} / ${questions.length}`;
  const key = "highScore_"+categorySelect.value;
  const high = Math.max(score, localStorage.getItem(key)||0);
  localStorage.setItem(key, high);
  scoreBox.textContent = `🏆 High Score: ${high}`;
  nextBtn.textContent="Play Again"; nextBtn.style.display="block";
  progressBar.style.width="100%";
}

function handleNextBtn(){
  currentQuestionIndex++;
  if(currentQuestionIndex<questions.length) showQuestion(); else showScore();
}

function updateProgressBar(){
  progressBar.style.width = ((currentQuestionIndex)/questions.length*100)+"%";
}

nextBtn.addEventListener("click", ()=>{
  if(currentQuestionIndex<questions.length) handleNextBtn(); else startQuiz();
});
