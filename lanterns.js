// --- Configuration ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYNGynXBQJo3PERHuV8G97H7UDOMMjDJgJYZjzS3hkjABQmrCnwSz8TpotvEfiZVd5ew/exec'; // Replace with your Apps Script URL

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const proposalBox = document.getElementById('proposal-box');
const successBox = document.getElementById('success-box');

// --- Evasion Logic (Smooth Gliding) ---
let noButtonMoves = 0;

function dodgeCursor() {
    const xMax = window.innerWidth / 2 - 80;
    const yMax = window.innerHeight / 2 - 40;
    
    const randomX = (Math.random() * xMax * 2) - xMax;
    const randomY = (Math.random() * yMax * 2) - yMax;
    
    btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    // Decrease opacity but never fully disappear
    noButtonMoves++;
    const newOpacity = Math.max(0.1, 1 - (noButtonMoves * 0.15));
    btnNo.style.opacity = newOpacity;
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
    
    // Release the massive lantern wave
    releaseLanterns = true;
    
    // Log silently
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: 'accepted'
    }).catch(() => {});
});

// --- Floating Lanterns Particle Engine ---
const canvas = document.getElementById('lantern-sky');
const ctx = canvas.getContext('2d');
let lanterns = [];
let releaseLanterns = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Lantern {
    constructor(isMassiveRelease = false) {
        this.x = Math.random() * canvas.width;
        // If mass release, start entirely below the screen
        this.y = isMassiveRelease ? canvas.height + Math.random() * 500 : canvas.height + 50;
        
        // Perspective scaling
        this.z = Math.random() * 0.8 + 0.2; 
        
        this.width = 12 * this.z;
        this.height = 18 * this.z;
        
        // Upward speed and sway mechanics
        this.speedY = (Math.random() * 1 + 0.5) * this.z * (isMassiveRelease ? 2 : 1);
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayDistance = Math.random() * 50 + 20;
        this.angle = Math.random() * Math.PI * 2;
        
        // Lantern color (warm orange/yellow)
        const colors = [
            'rgba(255, 214, 10, 0.9)', 
            'rgba(255, 159, 28, 0.9)', 
            'rgba(255, 191, 0, 0.9)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
        this.y -= this.speedY;
        this.angle += this.swaySpeed;
        
        // Apply horizontal sway based on sine wave
        this.currentX = this.x + Math.sin(this.angle) * this.swayDistance;
        
        // Flicker effect
        this.opacity += (Math.random() - 0.5) * 0.1;
        this.opacity = Math.max(0.3, Math.min(1, this.opacity));
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        
        // Draw glow
        ctx.shadowBlur = 20 * this.z;
        ctx.shadowColor = '#ffeba1';
        
        // Draw lantern body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Slightly rounded rectangle for the lantern
        ctx.roundRect(this.currentX, this.y, this.width, this.height, 3);
        ctx.fill();
        
        // Draw the bright flame inside
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.currentX + this.width / 2, this.y + this.height - 3, 2 * this.z, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Ensure the `roundRect` method is available across all browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + r, y, r);
        this.closePath();
        return this;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ambient lantern generation
    if (!releaseLanterns && Math.random() < 0.02) {
        lanterns.push(new Lantern(false));
    }
    
    // Massive lantern generation upon acceptance
    if (releaseLanterns && lanterns.length < 150) {
        for(let i = 0; i < 5; i++) {
            lanterns.push(new Lantern(true));
        }
    }

    for (let i = 0; i < lanterns.length; i++) {
        lanterns[i].update();
        lanterns[i].draw();
        
        // Remove lanterns that drift far above the screen
        if (lanterns[i].y + lanterns[i].height < -100) {
            lanterns.splice(i, 1);
            i--;
        }
    }
    
    requestAnimationFrame(animate);
}

animate();
