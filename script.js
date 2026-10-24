
"use strict";

// ========================================
// 1. ระบบเก็บสถิติ Google Sheets
// ========================================

const STATS_URL = "https://script.google.com/a/macros/msu.ac.th/s/AKfycbyB4Ydw1c16MFGyTBcKXJti64OyyDf13Ma24Q7ywvkgwNChCHhEubCdkNKUuUilJRuZMw/exec";

const GAME_NAME = "Heart Auscultation Quiz";
let gameSession = null;

function sendGameEvent(data) {
  if (!gameSession) return;

  fetch(STATS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data),
    keepalive: true
  }).catch(error => {
    console.error("ส่งสถิติไม่สำเร็จ:", error);
  });
}

function startGameSession() {
  gameSession = crypto.randomUUID();

  sendGameEvent({
    game: GAME_NAME,
    event: "start",
    session: gameSession
  });
}

function recordAnswer(isCorrect) {
  sendGameEvent({
    game: GAME_NAME,
    event: "answer",
    result: isCorrect ? "correct" : "incorrect",
    session: gameSession
  });
}

function finishGame() {
  sendGameEvent({
    game: GAME_NAME,
    event: "finish",
    session: gameSession
  });
}


// ========================================
// 2. ข้อมูลและการตั้งค่าเกมเดิม
// ========================================

(() => {
  const STARTING_SCORE = 100;
  const PENALTY_PER_WRONG_ANSWER = 8.33;

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

  const $ = id => document.getElementById(id);

  const intro = $("intro");
  const quiz = $("quiz");
  const result = $("result");
  const modal = $("answerModal");
  const feedback = $("feedback");
  const choices = $("answerChoices");

  let order = [];
  let currentIndex = 0;
  let correctCount = 0;
  let score = STARTING_SCORE;
  let modalOpen = false;
  let answered = new Set();
  let gameFinished = false;

  function shuffle(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function displayScore(value) {
    score = Math.max(
      0,
      Math.round((value + Number.EPSILON) * 100) / 100
    );

    $("scoreValue").textContent = `คะแนน ${score.toFixed(2)}`;
  }

  // ========================================
  // 3. เริ่มเกมและบันทึกสถิติ
  // ========================================

  function startGame() {
    order = shuffle(questions);
    currentIndex = 0;
    correctCount = 0;
    score = STARTING_SCORE;
    answered = new Set();
    modalOpen = false;
    gameFinished = false;

    // สร้าง Session ใหม่และบันทึกการเริ่มเกม
    startGameSession();

    intro.classList.add("hidden");
    result.classList.add("hidden");
    quiz.classList.remove("hidden");
    modal.classList.add("hidden");

    displayScore(score);
    renderQuestion();
  }

  // ========================================
  // 4. แสดงคำถาม
  // ========================================

  function renderQuestion() {
    const q = order[currentIndex];

    $("progressLabel").textContent =
      `ข้อ ${currentIndex + 1} จาก ${order.length}`;

    $("scoreLabel").textContent =
      `ตอบถูก ${correctCount}/${order.length}`;

    $("progressBar").style.width =
      `${(currentIndex / order.length) * 100}%`;

    $("questionText").textContent =
      `ตำแหน่งหมายเลขอะไร คือ ตำแหน่งที่ใช้ฟังเสียงลิ้นหัวใจใน “ตำแหน่ง ${q.name}”`;

    $("questionImage").src = "assets/question.png";

    feedback.className = "feedback hidden";
    feedback.textContent = "";

    choices.replaceChildren();

    for (let n = 1; n <= 4; n++) {
      const b = document.createElement("button");

      b.type = "button";
      b.className = "choice-btn";
      b.textContent = n;
      b.setAttribute("aria-label", `ตอบหมายเลข ${n}`);

      b.addEventListener("click", () => checkAnswer(n));

      choices.appendChild(b);
    }
  }

  // ========================================
  // 5. ตรวจคำตอบและบันทึกถูก-ผิด
  // ========================================

  function checkAnswer(number) {
    if (modalOpen || gameFinished) return;

    const q = order[currentIndex];

    // ถ้าตอบข้อนี้ถูกแล้ว จะไม่รับคำตอบซ้ำ
    if (answered.has(q.id)) return;

    const isCorrect = number === q.correct;

    // บันทึกทุกครั้งที่มีการตอบจริง
    // คำตอบผิดซ้ำจะถูกนับทุกครั้ง
    recordAnswer(isCorrect);

    if (!isCorrect) {
      displayScore(score - PENALTY_PER_WRONG_ANSWER);

      feedback.className = "feedback wrong";
      feedback.textContent =
        `ผิดค่ะ ลองตอบใหม่อีกครั้งนะคะ (หัก ${PENALTY_PER_WRONG_ANSWER.toFixed(2)} คะแนน)`;

      return;
    }

    answered.add(q.id);
    correctCount++;

    $("scoreLabel").textContent =
      `ตอบถูก ${correctCount}/${order.length}`;

    $("progressBar").style.width =
      `${((currentIndex + 1) / order.length) * 100}%`;

    $("modalTitle").textContent = `เฉลย: ${q.name}`;
    $("explanationText").textContent = q.explanation;
    $("answerImage").src = q.image;
    $("answerImage").alt = `ภาพเฉลยตำแหน่ง ${q.name}`;

    $("nextBtn").textContent =
      currentIndex === order.length - 1
        ? "ดูเฉลยรวมทุกตำแหน่ง"
        : "ข้อต่อไป";

    modal.classList.remove("hidden");
    modalOpen = true;

    $("nextBtn").focus();
  }

  // ========================================
  // 6. ไปข้อถัดไปหรือจบเกม
  // ========================================

  function goNext() {
    if (gameFinished) return;

    modal.classList.add("hidden");
    modalOpen = false;

    if (currentIndex < order.length - 1) {
      currentIndex++;

      renderQuestion();

      $("questionText").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    } else {
      // บันทึกการเล่นจบเพียงครั้งเดียว
      gameFinished = true;
      finishGame();

      quiz.classList.add("hidden");
      result.classList.remove("hidden");

      const finalScore = Math.max(
        0,
        Math.min(100, score)
      );

      $("finalPercent").textContent =
        `${finalScore.toFixed(2).replace(/\.00$/, "")}%`;

      $("finalScore").textContent =
        `คะแนนคงเหลือ ${finalScore.toFixed(2)} จาก 100 คะแนน`;

      result.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  // ========================================
  // 7. ปุ่มควบคุมเกมเดิม
  // ========================================

  $("startBtn").addEventListener("click", startGame);
  $("restartBtn").addEventListener("click", startGame);
  $("nextBtn").addEventListener("click", goNext);

  $("closeModalBtn").addEventListener("click", () => {
    if (!modalOpen || gameFinished) return;

    modal.classList.add("hidden");
    modalOpen = false;

    feedback.className = "feedback";
    feedback.textContent =
      "ตอบถูกแล้วค่ะ กด “ข้อต่อไป” เพื่อดำเนินเกมส์ต่อ";

    const b = document.createElement("button");

    b.type = "button";
    b.className = "primary-btn";
    b.textContent =
      currentIndex === order.length - 1
        ? "ดูเฉลยรวมทุกตำแหน่ง"
        : "ข้อต่อไป";

    b.style.marginTop = "12px";

    b.addEventListener("click", () => {
      b.remove();
      goNext();
    });

    feedback.appendChild(document.createElement("br"));
    feedback.appendChild(b);
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      // คงหน้าต่างเฉลยไว้
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modalOpen) {
      event.preventDefault();
    }
  });

})();
