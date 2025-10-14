// Typing animation
const text = "Unlock Your Potential...";
let i = 0;
function typeWriter() {
  const elem = document.getElementById("typing-text");
  if (i < text.length) {
    elem.innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, 120);
  }
}
typeWriter();

// Show sub-options with fade effect
function showSubOptions(exam) {
  // Fade out other main options
  document.querySelectorAll('.main-option').forEach(option => {
    if(option.id !== exam) {
      option.style.transition = "opacity 0.5s ease";
      option.style.opacity = 0;
      setTimeout(() => option.style.display = 'none', 500);
    }
  });

  // Show relevant sub-options
  document.querySelectorAll('.sub-options').forEach(sub => sub.style.display = 'none');
  const element = document.getElementById('sub-' + exam);
  element.style.display = 'flex';
  element.style.opacity = 0;
  element.style.transition = "opacity 0.5s ease";
  setTimeout(() => element.style.opacity = 1, 10);
}

// Start Quiz
function startQuiz(exam, subCategory) {
  alert(`Starting ${exam} - ${subCategory} Quiz`);
  // Connect this to your existing quiz page or load quiz dynamically
}

// Particle animation on right panel
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const particles = [];
for(let i=0; i<100; i++){
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random()-0.5)*2,
    speedY: (Math.random()-0.5)*2
  });
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if(p.x < 0 || p.x > canvas.width) p.speedX *= -1;
    if(p.y < 0 || p.y > canvas.height) p.speedY *= -1;
  });
  requestAnimationFrame(animate);
}
animate();
function startQuiz(main, sub, event) {
  event.stopPropagation(); // Prevent parent click from toggling dropdown
  window.location.href = `${main}_${sub}.html`; // Redirect to correct HTML page
}

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});
