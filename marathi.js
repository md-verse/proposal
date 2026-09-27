// --- Configuration ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYNGynXBQJo3PERHuV8G97H7UDOMMjDJgJYZjzS3hkjABQmrCnwSz8TpotvEfiZVd5ew/exec'; // Replace with your Apps Script URL

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const proposalBox = document.getElementById('proposal-box');
const successBox = document.getElementById('success-box');

// --- Evasion Logic ---
let evadeAttempts = 0;

function dodgeCursor() {
    const xLimit = window.innerWidth / 2 - 90;
    const yLimit = window.innerHeight / 2 - 40;
    
    const randomX = (Math.random() * xLimit * 2) - xLimit;
    const randomY = (Math.random() * yLimit * 2) - yLimit;
    
    btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    evadeAttempts++;
    btnNo.style.opacity = Math.max(0.15, 1 - (evadeAttempts * 0.12));
}

btnNo.addEventListener('mouseover', dodgeCursor);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeCursor();
});

// --- Acceptance Logic ---
btnYes.addEventListener('click', () => {
    proposalBox.classList.add('hidden');
    successBox.classList.remove('hidden');
    
    // Change weather state on acceptance
    accepted = true;
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: 'accepted'
    }).catch(() => {});
});

// --- Monsoon Rain Particle Engine ---
const canvas = document.getElementById('rain-canvas');
const ctx = canvas.getContext('2d');
let raindrops = [];
let accepted = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Raindrop {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        
        // Determine if this is background rain or foreground glass trickle
        this.isTrickle = Math.random() > 0.8;
        
        if (this.isTrickle) {
            this.length = Math.random() * 5 + 5;
            this.speed = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.thickness = Math.random() * 2 + 1;
        } else {
            this.length = Math.random() * 20 + 10;
            this.speed = Math.random() * 15 + 10;
            this.opacity = Math.random() * 0.2 + 0.1;
            this.thickness = Math.random() * 1 + 0.5;
        }
    }

    update() {
        if (accepted) {
            // Rain slows down and clears up when she says yes
            this.speed *= 0.98;
            this.opacity -= 0.005;
        }

        this.y += this.speed;
        
        // Trickle effect randomly slows down as it slides on glass
        if (this.isTrickle && Math.random() > 0.9) {
            this.speed = Math.random() * 2 + 0.5;
        }

        if (this.y > canvas.height) {
            if (!accepted) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }
    }

    draw() {
        if (this.opacity <= 0) return;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.strokeStyle = `rgba(178, 235, 242, ${this.opacity})`;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

// Generate rain
for (let i = 0; i < 200; i++) {
    raindrops.push(new Raindrop());
}

function animateRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < raindrops.length; i++) {
        raindrops[i].update();
        raindrops[i].draw();
    }
    
    requestAnimationFrame(animateRain);
}

animateRain();