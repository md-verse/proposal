const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYNGynXBQJo3PERHuV8G97H7UDOMMjDJgJYZjzS3hkjABQmrCnwSz8TpotvEfiZVd5ew/exec'; 

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const proposalBox = document.getElementById('proposal-box');
const successBox = document.getElementById('success-box');

// Evasion Logic
btnNo.addEventListener('mouseover', () => {
    const x = (Math.random() * 300) - 150;
    const y = (Math.random() * 300) - 150;
    btnNo.style.transform = `translate(${x}px, ${y}px)`;
});

// Acceptance Logic
btnYes.addEventListener('click', () => {
    proposalBox.classList.add('hidden');
    successBox.classList.remove('hidden');
    
    // Disperse particles into a magical galaxy
    particles.forEach(p => p.explode());
    
    fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: 'accepted' }).catch(() => {});
});

// --- Image Particle Engine ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source-image');

let particles = [];
let mouse = { x: null, y: null, radius: 80 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('resize', init);

class Particle {
    constructor(x, y, color) {
        this.originX = x;
        this.originY = y;
        // Start scattered randomly around the screen
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.color = color;
        this.size = 2;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.ease = 0.05; // Speed of assembly
        this.exploded = false;
    }

    explode() {
        this.exploded = true;
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = (Math.random() - 0.5) * 15;
        this.ease = 1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        if (this.exploded) {
            this.x += this.vx;
            this.y += this.vy;
            return;
        }

        // Mouse interaction: push particles away
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
        } else {
            // Gently glide back to original image position
            this.x += (this.originX - this.x) * this.ease;
            this.y += (this.originY - this.y) * this.ease;
        }
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];

    // Calculate dimensions to center the portrait
    const imgAspect = image.width / image.height;
    // Cap height at 60% of screen to leave room for text
    const targetHeight = Math.min(canvas.height * 0.6, 600); 
    const targetWidth = targetHeight * imgAspect;
    
    const offsetX = (canvas.width - targetWidth) / 2;
    const offsetY = (canvas.height - targetHeight) / 2 - 50; // Shift slightly up

    // Draw image to canvas temporarily to extract pixels
    ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, targetWidth, targetHeight);
    
    // Read the pixel data
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sample pixels (higher number = fewer particles, better performance)
    const samplingResolution = 6; 

    for (let y = 0; y < canvas.height; y += samplingResolution) {
        for (let x = 0; x < canvas.width; x += samplingResolution) {
            const index = (y * canvas.width + x) * 4;
            const alpha = pixels[index + 3];
            
            // If pixel is not transparent
            if (alpha > 0) {
                const red = pixels[index];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];
                const color = `rgb(${red}, ${green}, ${blue})`;
                particles.push(new Particle(x, y, color));
            }
        }
    }
}

function animate() {
    // Slight trailing effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

// Ensure image is fully loaded before extracting pixels
if (image.complete) {
    init();
    animate();
} else {
    image.addEventListener('load', () => {
        init();
        animate();
    });
}