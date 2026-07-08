const PALETTES = [
    { name: 'Sunset', colors: ['#ff7b54', '#ffb26b', '#ffd56b', '#939b62'] },
    { name: 'Ocean', colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef'] },
    { name: 'Forest', colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d'] },
    { name: 'Cyberpunk', colors: ['#7109aa', '#b20238', '#e73895', '#00e5ff'] },
    { name: 'Monochrome', colors: ['#222222', '#555555', '#999999', '#dddddd'] },
    { name: 'Pastel', colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9'] },
    { name: 'Neon', colors: ['#ff00ff', '#00ffff', '#00ff00', '#ffff00'] },
    { name: 'Vaporwave', colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff'] }
];

let currentPaletteIndex = 0;
let currentPatternType = 'geometric';
let currentWallpaperMode = 'dark';

// DOM Elements
const canvasDesktop = document.getElementById('canvas-desktop');
const ctxDesktop = canvasDesktop.getContext('2d');
const canvasMobile = document.getElementById('canvas-mobile');
const ctxMobile = canvasMobile.getContext('2d');

const paletteSelector = document.getElementById('palette-selector');
const patternBtns = document.querySelectorAll('.pattern-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const generateBtn = document.getElementById('generate-btn');
const themeToggle = document.getElementById('theme-toggle');

const downloadDesktopBtn = document.getElementById('download-desktop');
const downloadMobileBtn = document.getElementById('download-mobile');

// State
let appSeed = Math.random();

// PRNG
class PRNG {
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
}

function init() {
    renderPalettes();
    setupEventListeners();
    generateLayout();
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minutes}`;
    
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = now.toLocaleDateString('en-US', options);
    
    const dTime = document.getElementById('desktop-time');
    const mTime = document.getElementById('mobile-time');
    const dDate = document.getElementById('desktop-date');
    const mDate = document.getElementById('mobile-date');
    
    if (dTime) dTime.textContent = timeStr;
    if (mTime) mTime.textContent = timeStr;
    if (dDate) dDate.textContent = dateStr;
    if (mDate) mDate.textContent = dateStr;
}

function renderPalettes() {
    paletteSelector.innerHTML = '';
    PALETTES.forEach((palette, index) => {
        const option = document.createElement('div');
        option.className = `palette-option ${index === currentPaletteIndex ? 'active' : ''}`;
        option.dataset.index = index;
        
        const colorsDiv = document.createElement('div');
        colorsDiv.className = 'palette-colors';
        palette.colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = color;
            colorsDiv.appendChild(colorDiv);
        });
        
        option.appendChild(colorsDiv);
        
        option.addEventListener('click', () => {
            document.querySelectorAll('.palette-option').forEach(el => el.classList.remove('active'));
            option.classList.add('active');
            currentPaletteIndex = index;
            drawAll(); 
        });
        
        paletteSelector.appendChild(option);
    });
}

function setupEventListeners() {
    patternBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            patternBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentPatternType = e.target.dataset.type;
            generateLayout(); 
        });
    });

    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentWallpaperMode = e.target.dataset.mode;
            
            const clocks = document.querySelectorAll('.clock-overlay');
            if (currentWallpaperMode === 'light') {
                clocks.forEach(c => c.classList.add('clock-dark-mode'));
            } else {
                clocks.forEach(c => c.classList.remove('clock-dark-mode'));
            }
            
            drawAll(); // Just redraw with new bg
        });
    });

    generateBtn.addEventListener('click', generateLayout);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('site-dark');
    });

    downloadDesktopBtn.addEventListener('click', () => downloadCanvas(canvasDesktop, 'nuWalls-Desktop'));
    downloadMobileBtn.addEventListener('click', () => downloadCanvas(canvasMobile, 'nuWalls-Mobile'));
}

function generateLayout() {
    appSeed = Math.random() * 10000;
    drawAll();
}

function drawAll() {
    drawPattern(canvasDesktop, ctxDesktop, appSeed);
    drawPattern(canvasMobile, ctxMobile, appSeed);
}

function drawPattern(canvas, ctx, seed) {
    const prng = new PRNG(seed);
    const width = canvas.width;
    const height = canvas.height;
    const colors = PALETTES[currentPaletteIndex].colors;
    
    // Background based on Wallpaper Mode
    if (currentWallpaperMode === 'dark') {
        ctx.fillStyle = '#111111';
    } else {
        ctx.fillStyle = '#f7f7f7';
    }
    ctx.fillRect(0, 0, width, height);
    
    const numShapes = Math.floor(prng.range(20, 50));
    
    for (let i = 0; i < numShapes; i++) {
        ctx.save();
        const color = colors[Math.floor(prng.next() * colors.length)];
        ctx.fillStyle = color;
        ctx.globalAlpha = prng.range(0.3, 0.9);
        
        const x = prng.range(-width * 0.2, width * 1.2);
        const y = prng.range(-height * 0.2, height * 1.2);
        const size = prng.range(width * 0.05, width * 0.4);
        
        if (currentPatternType === 'geometric') {
            const shapeType = Math.floor(prng.range(0, 3));
            if (shapeType === 0) {
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (shapeType === 1) {
                ctx.translate(x, y);
                ctx.rotate(prng.range(0, Math.PI));
                ctx.fillRect(-size/2, -size/2, size, size);
            } else {
                ctx.translate(x, y);
                ctx.rotate(prng.range(0, Math.PI));
                ctx.fillRect(-size/2, -size/4, size, size/2);
            }
        } else if (currentPatternType === 'waves') {
            ctx.beginPath();
            ctx.moveTo(-width, y);
            ctx.bezierCurveTo(
                x - size, y - size,
                x + size, y + size,
                width * 2, y
            );
            ctx.lineWidth = prng.range(2, 20);
            ctx.strokeStyle = color;
            ctx.stroke();
        } else if (currentPatternType === 'triangles') {
            ctx.translate(x, y);
            ctx.rotate(prng.range(0, Math.PI * 2));
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.866, size * 0.5);
            ctx.lineTo(-size * 0.866, size * 0.5);
            ctx.closePath();
            ctx.fill();
        } else if (currentPatternType === 'blobs') {
            ctx.translate(x, y);
            ctx.beginPath();
            const radius = size / 2;
            ctx.moveTo(radius, 0);
            for(let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                const r = radius + prng.range(-radius * 0.3, radius * 0.3);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
