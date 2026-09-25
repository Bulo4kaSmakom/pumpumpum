const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const BLUE_SHADES = [
    "#3b82f6",
    "#93c5fd",
    "#bfdbfe",
    "#60a5fa",
    "#2563eb",
    "#1d4ed8"
];

const floatParticles = [];
const burstParticles = [];
const FLOAT_COUNT = 140;

class Particle {
    constructor(x, y, type, tx = 0, ty = 0, tz = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = BLUE_SHADES[Math.floor(Math.random() * BLUE_SHADES.length)];

        if (this.type === "float") {
            this.size = Math.random() * 2 + 0.5;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = -(Math.random() * 0.4 + 0.1);
            this.maxLife = Math.random() * 200 + 100;
        } else if (this.type === "burst") {
            this.size = Math.random() * 2 + 1;
            this.tx = tx;
            this.ty = ty;
            this.tz = tz;
            this.cx = 0;
            this.cy = 0;
            this.cz = 0;
            this.speed = Math.random() * 0.04 + 0.02;
            this.maxLife = Math.random() * 80 + 120;
            this.startX = x;
            this.startY = y;
        }
        this.life = this.maxLife;
    }

    update(angle) {
        this.life--;

        if (this.type === "float") {
            this.x += this.vx;
            this.y += this.vy;
        } else if (this.type === "burst") {
            this.cx += (this.tx - this.cx) * this.speed;
            this.cy += (this.ty - this.cy) * this.speed;
            this.cz += (this.tz - this.cz) * this.speed;

            const cosY = Math.cos(angle);
            const sinY = Math.sin(angle);

            const rx = this.cx * cosY - this.cz * sinY;
            const rz = this.cx * sinY + this.cz * cosY;

            const perspective = 400 / (400 + rz);
            this.x = this.startX + rx * perspective;
            this.y = this.startY + this.cy * perspective;
            this.size = Math.max(0.5, (Math.random() * 1.5 + 1) * perspective);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.shadowBlur = this.type === "burst" ? 15 : 5;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

for (let i = 0; i < FLOAT_COUNT; i++) {
    const p = new Particle(Math.random() * width, Math.random() * height, "float");
    p.life = Math.random() * p.maxLife;
    floatParticles.push(p);
}

function spawnHeartBurst(x, y) {
    const count = 140;
    for (let i = 0; i < count; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = (Math.random() - 0.5) * Math.PI;

        let tx = 16 * Math.pow(Math.sin(u), 3) * Math.cos(v);
        let ty = -(13 * Math.cos(u) - 5 * Math.cos(2*u) - 2 * Math.cos(3*u) - Math.cos(4*u)) * (0.5 + 0.5 * Math.cos(v));
        let tz = 16 * Math.pow(Math.sin(u), 3) * Math.sin(v);

        const scale = 8;
        tx *= scale;
        ty *= scale;
        tz *= scale;

        burstParticles.push(new Particle(x, y, "burst", tx, ty, tz));
    }
}

window.addEventListener('click', (e) => {
    spawnHeartBurst(e.clientX, e.clientY);
});

let rotation = 0;

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, width, height);

    rotation += 0.015;

    for (let i = floatParticles.length - 1; i >= 0; i--) {
        const p = floatParticles[i];
        p.update();
        p.draw();

        if (p.life <= 0 || p.y < 0) {
            floatParticles[i] = new Particle(Math.random() * width, height + 10, "float");
        }
    }

    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.update(rotation);
        p.draw();

        if (p.life <= 0) {
            burstParticles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

animate();
