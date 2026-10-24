(() => {
"use strict";
const STARTING_SCORE = 100;
const PENALTY_PER_WRONG_ANSWER = 8.33;
const questions = [
{id:"aortic valve",name:"Aortic valve",correct:1,explanation:"ตำแหน่ง Aortic valve คือตำแหน่ง 2nd ICS to the right sternal border",image:"assets/answer_aortic.png"},
{id:"pulmonic valve",name:"Pulmonic valve",correct:2,explanation:"ตำแหน่ง Pulmonic valve คือตำแหน่ง 2nd ICS to the left sternal border",image:"assets/answer_pulmonic.png"},
{id:"tricuspid valve",name:"Tricuspid valve",correct:3,explanation:"ตำแหน่ง Tricuspid valve คือตำแหน่ง 5th ICS to the lower left sternal border",image:"assets/answer_tricuspid.png"},
{id:"mitral valve",name:"Mitral valve",correct:4,explanation:"ตำแหน่ง Mitral valve คือตำแหน่ง Apex, PMI & 5th ICS at MCL",image:"assets/answer_mitral.png"}
];
const $ = id => document.getElementById(id);
const intro=$("intro"), quiz=$("quiz"), result=$("result"), modal=$("answerModal"), feedback=$("feedback"), choices=$("answerChoices");
let order=[], currentIndex=0, correctCount=0, score=STARTING_SCORE, modalOpen=false, answered=new Set();
function shuffle(array){const copy=[...array];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function displayScore(value){score=Math.max(0,Math.round((value+Number.EPSILON)*100)/100);$("scoreValue").textContent=`คะแนน ${score.toFixed(2)}`;}
function startGame(){order=shuffle(questions);currentIndex=0;correctCount=0;score=STARTING_SCORE;answered=new Set();intro.classList.add("hidden");result.classList.add("hidden");quiz.classList.remove("hidden");modal.classList.add("hidden");modalOpen=false;displayScore(score);renderQuestion();}
function renderQuestion(){const q=order[currentIndex];$("progressLabel").textContent=`ข้อ ${currentIndex+1} จาก ${order.length}`;$("scoreLabel").textContent=`ตอบถูก ${correctCount}/${order.length}`;$("progressBar").style.width=`${(currentIndex/order.length)*100}%`;$("questionText").textContent=`ตำแหน่งหมายเลขอะไร คือ ตำแหน่งที่ใช้ฟังเสียงลิ้นหัวใจใน “ตำแหน่ง ${q.name}”`;$("questionImage").src="assets/question.png";feedback.className="feedback hidden";feedback.textContent="";choices.replaceChildren();for(let n=1;n<=4;n++){const b=document.createElement("button");b.type="button";b.className="choice-btn";b.textContent=n;b.setAttribute("aria-label",`ตอบหมายเลข ${n}`);b.addEventListener("click",()=>checkAnswer(n));choices.appendChild(b);}}
function checkAnswer(number){if(modalOpen)return;const q=order[currentIndex];if(number!==q.correct){displayScore(score-PENALTY_PER_WRONG_ANSWER);feedback.className="feedback wrong";feedback.textContent=`ผิดค่ะ ลองตอบใหม่อีกครั้งนะคะ (หัก ${PENALTY_PER_WRONG_ANSWER.toFixed(2)} คะแนน)`;return;}if(!answered.has(q.id)){answered.add(q.id);correctCount++;}$("scoreLabel").textContent=`ตอบถูก ${correctCount}/${order.length}`;$("progressBar").style.width=`${((currentIndex+1)/order.length)*100}%`;$("modalTitle").textContent=`เฉลย: ${q.name}`;$("explanationText").textContent=q.explanation;$("answerImage").src=q.image;$("answerImage").alt=`ภาพเฉลยตำแหน่ง ${q.name}`;$("nextBtn").textContent=currentIndex===order.length-1?"ดูเฉลยรวมทุกตำแหน่ง":"ข้อต่อไป";modal.classList.remove("hidden");modalOpen=true;$("nextBtn").focus();}
function goNext(){modal.classList.add("hidden");modalOpen=false;if(currentIndex<order.length-1){currentIndex++;renderQuestion();$("questionText").scrollIntoView({behavior:"smooth",block:"start"});}else{quiz.classList.add("hidden");result.classList.remove("hidden");const finalScore=Math.max(0,Math.min(100,score));$("finalPercent").textContent=`${finalScore.toFixed(2).replace(/\\.00$/,"")}%`;$("finalScore").textContent=`คะแนนคงเหลือ ${finalScore.toFixed(2)} จาก 100 คะแนน`;result.scrollIntoView({behavior:"smooth",block:"start"});}}
$("startBtn").addEventListener("click",startGame);$("restartBtn").addEventListener("click",startGame);$("nextBtn").addEventListener("click",goNext);
$("closeModalBtn").addEventListener("click",()=>{modal.classList.add("hidden");modalOpen=false;feedback.className="feedback";feedback.textContent="ตอบถูกแล้วค่ะ กด “ข้อต่อไป” เพื่อดำเนินเกมส์ต่อ";const b=document.createElement("button");b.type="button";b.className="primary-btn";b.textContent=currentIndex===order.length-1?"ดูเฉลยรวมทุกตำแหน่ง":"ข้อต่อไป";b.style.marginTop="12px";b.addEventListener("click",()=>{b.remove();goNext();});feedback.appendChild(document.createElement("br"));feedback.appendChild(b);});
modal.addEventListener("click",event=>{if(event.target===modal){/* keep modal open */}});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modalOpen)event.preventDefault();});
})();

const STATS_URL = "1WWti2uft9Tr2o86_DBoxuFTrVN9aZZb_71r5K5OmGew";

// สร้างรหัสสุ่มใหม่เมื่อเริ่มเล่นแต่ละครั้ง
let gameSession = null;

function startGameSession(gameName) {
  gameSession = crypto.randomUUID();

  sendGameEvent({
    game: gameName,
    event: "start",
    session: gameSession
  });
}

function recordAnswer(gameName, isCorrect) {
  sendGameEvent({
    game: gameName,
    event: "answer",
    result: isCorrect ? "correct" : "incorrect",
    session: gameSession
  });
}

function finishGame(gameName) {
  sendGameEvent({
    game: gameName,
    event: "finish",
    session: gameSession
  });
}

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
    console.error("ส่งสถิติไม่สำเร็จ", error);
  });
}
