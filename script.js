const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");
const namesList = document.getElementById("namesList");
const newNameInput = document.getElementById("newName");
const addNameButton = document.getElementById("addNameButton");

let segmentColors = [];

function getNames(exludeDisabled = false) {
  return Array.from(namesList.children)
    .map((li) => {
      if (exludeDisabled && li.childNodes[1].getAttribute("disabled")) {
        return null;
      }
      return li.childNodes[1].textContent;
    })
    .filter((name) => name !== null);
}

// Load names from localStorage
function loadNames() {
  const savedNames = JSON.parse(localStorage.getItem("wheelNames"));
  if (savedNames) {
    savedNames.forEach((name) => addNameToList(name));
  } else {
    addNameToList("Salty 🧂");
    addNameToList("Spicy 🌶️");
    addNameToList("Sweet 🍭");
  }
  renderWheel();
}

// Save names to localStorage
function saveNames() {
  const names = getNames();
  localStorage.setItem("wheelNames", JSON.stringify(names));
  renderWheel();
}

canvas.addEventListener("click", spinWheel);
addNameButton.addEventListener("click", addName);
newNameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addName();
  }
});

function addName() {
  const name = newNameInput.value.trim();
  if (name) {
    addNameToList(name);
    newNameInput.value = "";
    saveNames();
  }
}

function addNameToList(name) {
  const li = document.createElement("li");
  li.classList.add("flex", "justify-between", "items-center", "mb-1");
  li.innerHTML = `
    <span class="cursor-pointer select-none" onclick="toggleSpan(this)">${name}</span>
    <div>
      <button class="text-sm" onclick="removeName(this)">❌</button>
    </div>
  `;
  namesList.appendChild(li);
}

function toggleSpan(span) {
  if (span.getAttribute("disabled") == null || !span.getAttribute("disabled")) {
    console.log("disabled");
    span.classList.add("line-through");
    span.classList.add("text-slate-500");
    span.classList.remove("text-slate-300");
    span.setAttribute("disabled", true);
  } else {
    console.log("enabled");
    span.classList.remove("line-through");
    span.classList.remove("text-slate-500");
    span.classList.add("text-slate-300");
    span.removeAttribute("disabled");
  }
  renderWheel();
}

function removeName(button) {
  const li = button.closest("li");
  namesList.removeChild(li);
  saveNames();
}

function renderWheel() {
  const names = getNames(true);
  if (names.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  generateSegmentColors(names.length);
  drawWheel(names);
}

function drawWheel(names) {
  const numSegments = names.length;
  const segmentAngle = (2 * Math.PI) / numSegments;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSegments; i++) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, i * segmentAngle, (i + 1) * segmentAngle);
    ctx.fillStyle = segmentColors[i];
    ctx.fill();
    // ctx.strokeStyle = "#1e293b";
    // ctx.stroke();
    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(i * segmentAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#0A1D56";
    ctx.font = "20px Helvetica, Arial, sans-serif";
    ctx.fillText(`${names[i]} `, radius - 10, 10);
    ctx.restore();
  }
}

const colorsEven = ["#219C90", "#EE9322"];
const colorsOdd = [...colorsEven, "#EE4E4E"];

function generateSegmentColors(numSegments) {
  segmentColors = [];
  const colors = numSegments % 2 === 0 ? colorsEven : colorsOdd;
  const numColors = colors.length;

  for (let i = 0; i < numSegments; i++) {
    segmentColors.push(colors[i % numColors]);
  }
}

function spinWheel() {
  newNameInput.focus();
  const names = getNames(true);
  if (names.length === 0) {
    alert("Please enter some names.");
    return;
  }

  resultDiv.textContent = ""; // Hide result while spinning
  resultDiv.classList.add('hidden')

  const duration = 7000;
  const rotations = Math.random() * 5 + 5; // Spin for 5-10 full rotations
  const endAngle = rotations * 2 * Math.PI;
  const startTime = performance.now();

  function animateWheel(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const angle = easeOutCubic(progress) * endAngle;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawWheel(names);
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      const winningIndex =
        Math.floor(
          ((2 * Math.PI - (angle % (2 * Math.PI))) / (2 * Math.PI)) *
            names.length
        ) % names.length;
      resultDiv.innerHTML = `<span class="text-maintext">Winner: <b class="font-medium text-maintext ">${names[winningIndex]}</b></span>`;
      resultDiv.classList.remove('hidden')

    }
  }

  requestAnimationFrame(animateWheel);
}

function easeOutCubic(t) {
  return --t * t * t + 1;
}

// Randomly select background image
function setRandomBackgroundImage() {
  const backgroundNumber = Math.floor(Math.random() * 4) + 1; // Generates 1, 2, 3, or 4
  document.body.style.backgroundImage = `url('static/zbg${backgroundNumber}.jpeg')`;
}

// Load names and render the wheel when the page is loaded
window.onload = function() {
  setRandomBackgroundImage();
  loadNames();
};
