let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("generated-calendar-slide");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}

document.getElementById("generate-schedules-button").onclick = function () {
  document.getElementById("generated-schedules-popup").style.display = "block";
}

document.querySelector(".generated-schedule-popup-close").onclick = function () {
  document.getElementById("generated-schedules-popup").style.display = "none";
}

window.onclick = function (event) {
  if (event.target == document.getElementById("generated-schedules-popup")) {
    document.getElementById("generated-schedules-popup").style.display = "none";
  }
}

document.querySelector(".generated-schedule-popup-prev").addEventListener('click', function () {
  plusSlides(-1);
});

document.querySelector(".generated-schedule-popup-next").addEventListener('click', function () {
  plusSlides(1);
});

var popup = document.getElementById("popupScheduledMeetings");
var popup1 = document.getElementById("popupScheduledMeetings1");

var btn = document.getElementById("openScheduledMeetings");
var btn1 = document.getElementById("openScheduledMeetings1");

btn.onclick = function () {
  popup.style.display = "block";
}
btn1.onclick = function () {
  popup1.style.display = "block";
}

var span = document.getElementsByClassName("close-btn")[0];
var span1 = document.getElementsByClassName("close-btn")[1];

span.onclick = function () {
  popup.style.display = "none";
}
span1.onclick = function () {
  popup1.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == popup) {
    popup.style.display = "none";
  } else if (event.target == popup1) {
    popup1.style.display = "none";
  }
}
