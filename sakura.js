// --- Configuration ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYNGynXBQJo3PERHuV8G97H7UDOMMjDJgJYZjzS3hkjABQmrCnwSz8TpotvEfiZVd5ew/exec'; // Replace with your Apps Script URL

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const proposalBox = document.getElementById('proposal-box');
const successBox = document.getElementById('success-box');

// --- Evasion Logic ---
let evadeCount = 0;

function dodgeCursor() {
    const xBound = window.innerWidth / 2 - 90;
    const yBound = window.innerHeight / 2 - 40;
    
    const targetX = (Math.random() * xBound * 2) - xBound;
    const targetY = (Math.random() * yBound * 2) - yBound;
    
    btnNo.style.transform = `translate(${targetX}px, ${targetY}px)`;
    
    evadeCount++;
    btnNo.style.opacity = Math.max(0.15, 1 - (evadeCount * 0.12));
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
    
    // Trigger the magical wind gust
    windGust = true;
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: 'accepted'
    }).catch(() => {});
});

// --- 3D Sakura Particle Engine ---
const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');
let petals = [];
let windGust = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Petal {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = (Math.random() * canvas.height) - canvas.height;
        this.size = Math.random() * 12 + 6;
        
        // Falling speed
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 2 - 1;
        
        // 3D tumbling mechanics
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 4 - 2) * 0.05;
        this.flip = Math.random();
        this.flipSpeed = (Math.random() * 0.05) + 0.01;
        
        // Colors ranging from pale pink to deep rose
        const colors = ['#ffd1dc', '#ffb6c1', '#f48fb1', '#fce4ec'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Apply wind gust physics if accepted
        if (windGust) {
            this.speedX += 0.1; // Blow to the right
            this.speedY = Math.max(-2, this.speedY - 0.05); // Create an updraft
            this.rotationSpeed += 0.01; // Spin faster
        }

        this.y += this.speedY;
        this.x += this.speedX;
        
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        // Reset petal to top when it falls off screen (unless wind gust is active)
        if (this.y > canvas.height + 20) {
            if (!windGust) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }
        
        // Wrap around horizontally
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.x < -20) this.x = canvas.width + 20;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Simulate 3D flipping by scaling the Y axis based on a sine wave
        ctx.scale(1, Math.sin(this.flip));
        
        // Draw the curved petal shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0 - this.size);
        ctx.bezierCurveTo(this.size, 0 - this.size, this.size, this.size, 0, this.size);
        ctx.bezierCurveTo(0 - this.size, this.size, 0 - this.size, 0 - this.size, 0, 0 - this.size);
        ctx.fill();
        
        ctx.restore();
    }
}

// Generate initial ambient petals
for (let i = 0; i < 70; i++) {
    petals.push(new Petal());
}

function animateSakura() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add massive influx of petals during the wind gust
    if (windGust && petals.length < 400) {
        for(let i = 0; i < 5; i++) {
            let p = new Petal();
            p.y = canvas.height + 20; // Spawn from bottom
            p.speedY = -(Math.random() * 5 + 3); // Shoot upwards
            p.speedX = Math.random() * 8 + 2; // Shoot right
            petals.push(p);
        }
    }

    for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw();
        
        // Clean up petals that blow far off screen during gust
        if (windGust && (petals[i].x > canvas.width + 50 || petals[i].y < -50)) {
            petals.splice(i, 1);
            i--;
        }
    }
    
    requestAnimationFrame(animateSakura);
}

animateSakura();