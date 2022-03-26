// important elements
const modal = document.getElementById("result-modal");
const btn = document.getElementById("btn-record");
const span = document.getElementsByClassName("close")[0];
const dateField = document.getElementById('date');
const eventField = document.getElementById('event');
const targetDateField = document.getElementById('target-date');

// events
let yearData = [];
fetch('/js/yearData.json')
  .then(function (response) {
    return response.json();
  })
  .then(json => {
    yearData = json;
    updateEventText();
  });

// speech recognition
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.onresult = e => {
  let input = e.results[0][0].transcript;
  const vielCount = (input.match(/viel/g) || []).length;
  const yearDifference = vielCount == 0 ? 1 : vielCount * 10;
  if (input.includes('früher')) {
    yearValue -= yearDifference;
  } else if (input.includes('später')) {
    yearValue += yearDifference;
  } else if (input.includes('fertig')) {
    checkDate();
    return;
  } else {
    return;
  }
  if (yearValue < 1900) yearValue = 1900;
  if (yearValue > 2022) yearValue = 2022;
  updateEventText();
}

// speech synthesis
const synth = window.speechSynthesis;

// date input
const minDate = new Date(1900, 1, 1);
const maxDate = new Date(2022, 12, 31);
const targetDate = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
const startDate = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
targetDateField.textContent = "Zieldatum: " + targetDate.toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" });
let dayValue = startDate.getDate();
let monthValue = startDate.getMonth() + 1;
let yearValue = startDate.getFullYear();

// device orientation
window.addEventListener('deviceorientation', e => {
  monthValue = monthValue + e.beta / 70;
  if (monthValue < 1) monthValue = 1;
  if (monthValue > 12) monthValue = 12;

  dayValue = dayValue + e.gamma / 70;
  if (dayValue < 1) dayValue = 1;
  if (dayValue > 31) dayValue = 31;
});

// update date input
setInterval(() => {
  dateField.value = String(Math.round(dayValue)).padStart(2, '0') + '.' + String(Math.round(monthValue)).padStart(2, '0') + '.' + yearValue;
  btn.disabled = synth.speaking;
}, 50);

// modal stuff
btn.onclick = () => {
  recognition.start();
}

span.onclick = () => {
  modal.style.display = "none";
}

window.onclick = e => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

function updateEventText() {
  const event = yearData.filter(elem => elem.year == yearValue)[0].event;
  eventField.textContent = event;
  speakText(event);
}

function checkDate() {
  if (Math.round(dayValue) == targetDate.getDate() && Math.round(monthValue) == targetDate.getMonth() + 1 && yearValue == targetDate.getFullYear()) {
    modal.style.display = "block";
    speakText("Das Datum ist korrekt.");
  }
}

function speakText(text) {
  let utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  utterance.lang = 'de-DE';
  synth.speak(utterance);
}
