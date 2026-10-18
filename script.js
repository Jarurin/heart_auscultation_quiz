(() => {
  "use strict";

  const questions = [
    {
      id: "aortic valve",
      name: "Aortic valve",
      correct: 1,
      explanation: "ตำแหน่ง Aortic valve คือตำแหน่ง 2nd ICS to the right sternal border",
      image: "assets/answer_aortic.png"
    },
    {
      id: "pulmonic valve",
      name: "Pulmonic valve",
      correct: 2,
      explanation: "ตำแหน่ง Pulmonic valve คือตำแหน่ง 2nd ICS to the left sternal border",
      image: "assets/answer_pulmonic.png"
    },
    {
      id: "tricuspid valve",
      name: "Tricuspid valve",
      correct: 3,
      explanation: "ตำแหน่ง Tricuspid valve คือตำแหน่ง 5th ICS to the lower left sternal border",
      image: "assets/answer_tricuspid.png"
    },
    {
      id: "mitral valve",
      name: "Mitral valve",
      correct: 4,
      explanation: "ตำแหน่ง Mitral valve คือตำแหน่ง Apex, PMI & 5th ICS at MCL",
      image: "assets/answer_mitral.png"
    }
  ];

  const $ = (id) => document.getElementById(id);
  const intro = $("intro");
  const quiz = $("quiz");
  const result = $("result");
  const modal = $("answerModal");
  const feedback = $("feedback");
  const choices = $("answerChoices");

  let order = [];
  let currentIndex = 0;
  let correctCount = 0;
  let answered = new Set();
  let modalOpen = false;

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function startGame() {
    order = shuffle(questions);
    currentIndex = 0;
    correctCount = 0;
    answered = new Set();
    intro.classList.add("hidden");
    result.classList.add("hidden");
    quiz.classList.remove("hidden");
    modal.classList.add("hidden");
    modalOpen = false;
    renderQuestion();
  }

  function renderQuestion() {
    const q = order[currentIndex];
    $("progressLabel").textContent = `ข้อ ${currentIndex + 1} จาก ${order.length}`;
    $("scoreLabel").textContent = `ตอบถูก ${correctCount}/${order.length}`;
    $("progressBar").style.width = `${(currentIndex / order.length) * 100}%`;
    $("questionText").textContent = `ตำแหน่งหมายเลขอะไร คือ ตำแหน่งที่ใช้ฟังเสียงลิ้นหัวใจใน “ตำแหน่ง ${q.name}”`;
    $("questionImage").src = "assets/question.png";
    feedback.className = "feedback hidden";
    feedback.textContent = "";
    choices.replaceChildren();

    for (let n = 1; n <= 4; n++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-btn";
      button.textContent = n;
      button.setAttribute("aria-label", `ตอบหมายเลข ${n}`);
      button.addEventListener("click", () => checkAnswer(n));
      choices.appendChild(button);
    }
  }

  function checkAnswer(number) {
    if (modalOpen) return;
    const q = order[currentIndex];
    if (number !== q.correct) {
      feedback.className = "feedback wrong";
      feedback.textContent = "ผิดค่ะ ลองตอบใหม่อีกครั้งนะคะ";
      return;
    }

    if (!answered.has(q.id)) {
      answered.add(q.id);
      correctCount++;
    }
    $("scoreLabel").textContent = `ตอบถูก ${correctCount}/${order.length}`;
    $("progressBar").style.width = `${((currentIndex + 1) / order.length) * 100}%`;
    $("modalTitle").textContent = `เฉลย: ${q.name}`;
    $("explanationText").textContent = q.explanation;
    $("answerImage").src = q.image;
    $("answerImage").alt = `ภาพเฉลยตำแหน่ง ${q.name}`;
    $("nextBtn").textContent = currentIndex === order.length - 1 ? "ดูเฉลยรวมทุกตำแหน่ง" : "ข้อต่อไป";
    modal.classList.remove("hidden");
    modalOpen = true;
    $("nextBtn").focus();
  }

  function goNext() {
    modal.classList.add("hidden");
    modalOpen = false;
    if (currentIndex < order.length - 1) {
      currentIndex++;
      renderQuestion();
      $("questionText").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      quiz.classList.add("hidden");
      result.classList.remove("hidden");
      $("finalScore").textContent = `ตอบถูกครบ ${correctCount} จาก ${order.length} ตำแหน่ง`;
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  $("startBtn").addEventListener("click", startGame);
  $("restartBtn").addEventListener("click", startGame);
  $("nextBtn").addEventListener("click", goNext);
  $("closeModalBtn").addEventListener("click", () => {
    // Keep the explanation open until the learner chooses to continue.
    modal.classList.add("hidden");
    modalOpen = false;
    feedback.className = "feedback";
    feedback.textContent = "ตอบถูกแล้วค่ะ กด “ข้อต่อไป” เพื่อดำเนินเกมส์ต่อ";
    // Restore a continue action in the quiz when the modal is closed.
    const continueBtn = document.createElement("button");
    continueBtn.type = "button";
    continueBtn.className = "primary-btn";
    continueBtn.textContent = currentIndex === order.length - 1 ? "ดูเฉลยรวมทุกตำแหน่ง" : "ข้อต่อไป";
    continueBtn.style.marginTop = "12px";
    continueBtn.addEventListener("click", () => {
      continueBtn.remove();
      goNext();
    });
    feedback.appendChild(document.createElement("br"));
    feedback.appendChild(continueBtn);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      // Deliberately do not dismiss on backdrop click; this prevents skipping feedback accidentally.
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalOpen) {
      event.preventDefault();
    }
  });
})();
