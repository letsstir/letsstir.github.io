class AbstractDisruption {
    constructor() {
        this.canvas = document.getElementById('conformityCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.conformityGrid = [];
        this.disruptions = [];
        this.questionWaves = [];
        this.provocationParticles = [];
        
        this.disruptionLevel = 0;
        this.conformityIndex = 100;
        this.currentMode = null;
        
        this.gridSize = 20;
        this.cols = Math.floor(this.canvas.width / this.gridSize);
        this.rows = Math.floor(this.canvas.height / this.gridSize);
        
        this.modes = {
            question: { color: '#ff0080', intensity: 0.3, spread: 2 },
            challenge: { color: '#00ff80', intensity: 0.6, spread: 3 },
            provocation: { color: '#8000ff', intensity: 0.4, spread: 4 },
            chaos: { color: '#ff8000', intensity: 0.8, spread: 5 }
        };
        
        this.init();
        this.animate();
    }
    
    init() {
        this.initConformityGrid();
        this.bindEvents();
    }
    
    initConformityGrid() {
        this.conformityGrid = [];
        for (let y = 0; y < this.rows; y++) {
            this.conformityGrid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.conformityGrid[y][x] = {
                    order: 1.0,
                    chaos: 0.0,
                    pulse: Math.random() * Math.PI * 2,
                    baseColor: [50, 50, 100],
                    currentColor: [50, 50, 100],
                    disrupted: false,
                    lastDisruption: 0
                };
            }
        }
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        document.getElementById('questionMode').addEventListener('click', () => this.setMode('question'));
        document.getElementById('challengeMode').addEventListener('click', () => this.setMode('challenge'));
        document.getElementById('provocationMode').addEventListener('click', () => this.setMode('provocation'));
        document.getElementById('chaosMode').addEventListener('click', () => this.setMode('chaos'));
        document.getElementById('resetField').addEventListener('click', () => this.resetField());
    }
    
    setMode(mode) {
        document.querySelectorAll('.disrupt-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode + 'Mode').classList.add('active');
        this.currentMode = mode;
    }
    
    handleCanvasClick(e) {
        if (!this.currentMode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.createDisruption(x, y, this.currentMode);
        this.updateMetrics();
    }
    
    handleMouseMove(e) {
        if (!this.currentMode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.createSubtleDisturbance(x, y);
    }
    
    createDisruption(x, y, mode) {
        const modeConfig = this.modes[mode];
        
        const disruption = {
            x: x,
            y: y,
            mode: mode,
            intensity: modeConfig.intensity,
            radius: 0,
            maxRadius: 50 + Math.random() * 100,
            life: 1.0,
            color: modeConfig.color,
            spread: modeConfig.spread
        };
        
        this.disruptions.push(disruption);
        
        this.createQuestionWave(x, y, mode);
        this.createProvocationParticles(x, y, mode);
        
        this.disruptGridArea(x, y, modeConfig.spread * 20, modeConfig.intensity);
    }
    
    createSubtleDisturbance(x, y) {
        if (Math.random() < 0.1) {
            const gridX = Math.floor(x / this.gridSize);
            const gridY = Math.floor(y / this.gridSize);
            
            if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
                const cell = this.conformityGrid[gridY][gridX];
                cell.chaos = Math.min(1.0, cell.chaos + 0.05);
                cell.pulse += 0.2;
            }
        }
    }
    
    createQuestionWave(x, y, mode) {
        const wave = {
            x: x,
            y: y,
            radius: 0,
            maxRadius: 200,
            thickness: 3,
            life: 1.0,
            color: this.modes[mode].color,
            frequency: 0.1,
            amplitude: 5
        };
        
        this.questionWaves.push(wave);
    }
    
    createProvocationParticles(x, y, mode) {
        const count = 20 + Math.random() * 30;
        const modeConfig = this.modes[mode];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 2 + Math.random() * 4,
                color: modeConfig.color,
                resistance: Math.random() * 0.5 + 0.5,
                spin: (Math.random() - 0.5) * 0.3
            };
            
            this.provocationParticles.push(particle);
        }
    }
    
    disruptGridArea(centerX, centerY, radius, intensity) {
        const gridCenterX = Math.floor(centerX / this.gridSize);
        const gridCenterY = Math.floor(centerY / this.gridSize);
        const gridRadius = Math.ceil(radius / this.gridSize);
        
        for (let dy = -gridRadius; dy <= gridRadius; dy++) {
            for (let dx = -gridRadius; dx <= gridRadius; dx++) {
                const gridX = gridCenterX + dx;
                const gridY = gridCenterY + dy;
                
                if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= gridRadius) {
                        const cell = this.conformityGrid[gridY][gridX];
                        const falloff = 1 - (distance / gridRadius);
                        const disruptionAmount = intensity * falloff;
                        
                        cell.chaos = Math.min(1.0, cell.chaos + disruptionAmount);
                        cell.order = Math.max(0.0, cell.order - disruptionAmount * 0.5);
                        cell.disrupted = true;
                        cell.lastDisruption = Date.now();
                        
                        this.updateCellColor(cell);
                    }
                }
            }
        }
    }
    
    updateCellColor(cell) {
        const chaosInfluence = cell.chaos;
        const orderInfluence = cell.order;
        
        const r = Math.floor(cell.baseColor[0] + chaosInfluence * 150);
        const g = Math.floor(cell.baseColor[1] + (1 - orderInfluence) * 100);
        const b = Math.floor(cell.baseColor[2] + orderInfluence * 50);
        
        cell.currentColor = [
            Math.min(255, Math.max(0, r)),
            Math.min(255, Math.max(0, g)),
            Math.min(255, Math.max(0, b))
        ];
    }
    
    updateMetrics() {
        let totalChaos = 0;
        let totalCells = this.cols * this.rows;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                totalChaos += this.conformityGrid[y][x].chaos;
            }
        }
        
        this.disruptionLevel = Math.min(100, (totalChaos / totalCells) * 100);
        this.conformityIndex = Math.max(0, 100 - this.disruptionLevel);
        
        document.getElementById('disruptionLevel').style.width = this.disruptionLevel + '%';
        document.getElementById('conformityValue').textContent = Math.round(this.conformityIndex) + '%';
    }
    
    resetField() {
        this.initConformityGrid();
        this.disruptions = [];
        this.questionWaves = [];
        this.provocationParticles = [];
        this.disruptionLevel = 0;
        this.conformityIndex = 100;
        this.updateMetrics();
        
        document.querySelectorAll('.disrupt-btn').forEach(btn => btn.classList.remove('active'));
        this.currentMode = null;
    }
    
    updateDisruptions() {
        this.disruptions = this.disruptions.filter(disruption => {
            disruption.radius += 2;
            disruption.life -= 0.02;
            return disruption.life > 0 && disruption.radius < disruption.maxRadius;
        });
    }
    
    updateQuestionWaves() {
        this.questionWaves = this.questionWaves.filter(wave => {
            wave.radius += 1.5;
            wave.life -= 0.015;
            wave.frequency += 0.01;
            return wave.life > 0 && wave.radius < wave.maxRadius;
        });
    }
    
    updateProvocationParticles() {
        this.provocationParticles = this.provocationParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            particle.life -= 0.02;
            particle.spin += 0.1;
            
            return particle.life > 0 && 
                   particle.x > -50 && particle.x < this.canvas.width + 50 &&
                   particle.y > -50 && particle.y < this.canvas.height + 50;
        });
    }
    
    updateConformityGrid() {
        const currentTime = Date.now();
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.conformityGrid[y][x];
                
                cell.pulse += 0.05;
                
                if (cell.disrupted && currentTime - cell.lastDisruption > 3000) {
                    cell.chaos = Math.max(0, cell.chaos - 0.01);
                    cell.order = Math.min(1, cell.order + 0.005);
                    
                    if (cell.chaos < 0.1) {
                        cell.disrupted = false;
                    }
                    
                    this.updateCellColor(cell);
                }
            }
        }
    }
    
    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderConformityGrid();
        this.renderQuestionWaves();
        this.renderDisruptions();
        this.renderProvocationParticles();
    }
    
    renderConformityGrid() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.conformityGrid[y][x];
                const pixelX = x * this.gridSize;
                const pixelY = y * this.gridSize;
                
                const pulseFactor = Math.sin(cell.pulse) * 0.1 + 0.9;
                const [r, g, b] = cell.currentColor;
                
                const adjustedR = Math.floor(r * pulseFactor);
                const adjustedG = Math.floor(g * pulseFactor);
                const adjustedB = Math.floor(b * pulseFactor);
                
                this.ctx.fillStyle = `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
                this.ctx.fillRect(pixelX, pixelY, this.gridSize - 1, this.gridSize - 1);
                
                if (cell.disrupted) {
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${cell.chaos * 0.5})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(pixelX, pixelY, this.gridSize - 1, this.gridSize - 1);
                }
            }
        }
    }
    
    renderQuestionWaves() {
        this.questionWaves.forEach(wave => {
            this.ctx.save();
            this.ctx.globalAlpha = wave.life * 0.7;
            this.ctx.strokeStyle = wave.color;
            this.ctx.lineWidth = wave.thickness;
            
            this.ctx.beginPath();
            const segments = 64;
            for (let i = 0; i <= segments; i++) {
                const angle = (Math.PI * 2 * i) / segments;
                const waveOffset = Math.sin(angle * 8 + wave.frequency * 50) * wave.amplitude;
                const x = wave.x + Math.cos(angle) * (wave.radius + waveOffset);
                const y = wave.y + Math.sin(angle) * (wave.radius + waveOffset);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
            this.ctx.restore();
        });
    }
    
    renderDisruptions() {
        this.disruptions.forEach(disruption => {
            this.ctx.save();
            this.ctx.globalAlpha = disruption.life * 0.8;
            
            const gradient = this.ctx.createRadialGradient(
                disruption.x, disruption.y, 0,
                disruption.x, disruption.y, disruption.radius
            );
            gradient.addColorStop(0, disruption.color + '88');
            gradient.addColorStop(0.7, disruption.color + '44');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(disruption.x, disruption.y, disruption.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = disruption.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.restore();
        });
    }
    
    renderProvocationParticles() {
        this.provocationParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.spin);
            
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            this.ctx.restore();
        });
    }
    
    animate() {
        this.updateDisruptions();
        this.updateQuestionWaves();
        this.updateProvocationParticles();
        this.updateConformityGrid();
        this.updateMetrics();
        
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AbstractDisruption();
});