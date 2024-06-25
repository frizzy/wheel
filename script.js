const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resultDiv = document.getElementById("result");
const namesTextArea = document.getElementById("names");

let segmentColors = [];

// Load names from localStorage
function loadNames() {
  const savedNames = localStorage.getItem("wheelNames");
  if (savedNames) {
    namesTextArea.value = savedNames;
  } else {
    namesTextArea.value = "Salty 🧂\nSpicy 🌶️";
  }
  renderWheel();
}

// Save names to localStorage
function saveNames() {
  const names = namesTextArea.value;
  localStorage.setItem("wheelNames", names);
  renderWheel();
}

spinButton.addEventListener("click", spinWheel);
namesTextArea.addEventListener("input", saveNames);

function renderWheel() {
  const names = namesTextArea.value
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name);
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
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();
    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(i * segmentAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#1e293b";
    ctx.font = "20px Helvetica, Arial, sans-serif";
    ctx.fillText(`${names[i]} `, radius - 10, 10);
    ctx.restore();
  }
}

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 75%)`;
}

function generateSegmentColors(numSegments) {
  segmentColors = [];
  for (let i = 0; i < numSegments; i++) {
    segmentColors.push(getRandomColor());
  }
}

function spinWheel() {
  const names = namesTextArea.value
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name);
  if (names.length === 0) {
    alert("Please enter some names.");
    return;
  }

  resultDiv.textContent = ""; // Hide result while spinning

  const duration = 5000;
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
      resultDiv.textContent = `Winner: ${names[winningIndex]}`;
    }
  }

  requestAnimationFrame(animateWheel);
}

function easeOutCubic(t) {
  return --t * t * t + 1;
}

// Load names and render the wheel when the page is loaded
window.onload = loadNames;
