// --- Configuration ---
const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE'; // Replace with your Apps Script URL

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const proposalBox = document.getElementById('proposal-box');
const successBox = document.getElementById('success-box');

// --- Button Evasion Logic ---
// Uses smooth transforms instead of abrupt CSS left/top changes
let currentX = 0;
let currentY = 0;

function moveButton() {
    // Calculate boundaries based on window size
    const xMax = window.innerWidth / 2 - 100;
    const yMax = window.innerHeight / 2 - 50;
    
    // Generate new random coordinates away from the current position
    currentX = (Math.random() * xMax * 2) - xMax;
    currentY = (Math.random() * yMax * 2) - yMax;
    
    btnNo.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    // Fade slightly to emulate magic
    let currentOpacity = parseFloat(window.getComputedStyle(btnNo).opacity);
    if(currentOpacity > 0.2) {
        btnNo.style.opacity = (currentOpacity - 0.15).toString();
    }
}

// Trigger evasion on hover and touch
btnNo.addEventListener('mouseover', moveButton);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents click registering on mobile before move
    moveButton();
});

// --- Acceptance Logic ---
btnYes.addEventListener('click', () => {
    // Transition UI
    proposalBox.classList.add('hidden');
    successBox.classList.remove('hidden');
    
    // Intensify particle effect
    magicIntensity = 4;
    
    // Silently log to Google Sheets
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: 'accepted'
    }).catch(err => console.log("Connection secured."));
});

// --- Advanced Particle Engine ---
const canvas = document.getElementById('magical-realm');
const ctx = canvas.getContext('2d');
let particles = [];
let magicIntensity = 1;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const pointer = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    addParticles(2);
});

window.addEventListener('touchmove', (e) => {
    pointer.x = e.touches[0].clientX;
    pointer.y = e.touches[0].clientY;
    addParticles(2);
});

class Orb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2.5 + 0.5;
        this.baseX = (Math.random() - 0.5) * 2;
        this.baseY = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.005;
        
        // Romantic color palette: Gold, Cyan, Soft Pink
        const colors = ['#ffd194', '#70e1f5', '#ff9a9e'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.x += this.baseX * magicIntensity;
        this.y += this.baseY * magicIntensity;
        this.life -= this.decay * (magicIntensity * 0.5);
    }
    
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
    }
}

function addParticles(amount) {
    for (let i = 0; i < amount; i++) {
        // Spread slightly from cursor
        const offsetX = pointer.x + (Math.random() * 40 - 20);
        const offsetY = pointer.y + (Math.random() * 40 - 20);
        particles.push(new Orb(offsetX, offsetY));
    }
}

function renderScene() {
    // Create a trailing effect by drawing a semi-transparent dark rectangle
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(10, 5, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ambient floating particles when cursor is still
    if(Math.random() < 0.1 * magicIntensity) {
        particles.push(new Orb(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(renderScene);
}

renderScene();
