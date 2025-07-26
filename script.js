class AbstractDisruption {
    constructor() {
        this.canvas = document.getElementById('conformityCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.conformityGrid = [];
        this.disruptions = [];
        this.questionWaves = [];
        this.provocationParticles = [];
        this.mouseTrail = [];
        this.lastMousePos = { x: 0, y: 0 };
        this.mouseSpeed = 0;
        this.lastMoveTime = Date.now();
        this.idleStartTime = null;
        this.mouseHistory = [];
        this.isTouchDevice = 'ontouchstart' in window;
        this.gestureThreshold = this.isTouchDevice ? 80 : 50;
        
        this.disruptionLevel = 0;
        this.conformityIndex = 100;
        this.currentMode = null;
        
        this.setupCanvas();
        this.gridSize = Math.max(15, Math.min(25, Math.floor(Math.min(this.canvas.width, this.canvas.height) / 40)));
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
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        const maxWidth = Math.min(window.innerWidth * 0.95, 1200);
        const maxHeight = Math.min(window.innerHeight * 0.7, 800);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxHeight + 'px';
        
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 500);
        });
    }
    
    handleResize() {
        const maxWidth = Math.min(window.innerWidth * 0.95, 1200);
        const maxHeight = Math.min(window.innerHeight * 0.7, 800);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxHeight + 'px';
        
        this.gridSize = Math.max(15, Math.min(25, Math.floor(Math.min(maxWidth, maxHeight) / 40)));
        this.cols = Math.floor(maxWidth / this.gridSize);
        this.rows = Math.floor(maxHeight / this.gridSize);
        
        this.initConformityGrid();
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
                    lastDisruption: 0,
                    anticipation: 0.0
                };
            }
        }
    }
    
    bindEvents() {
        if (this.isTouchDevice) {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        } else {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }
        
        document.querySelectorAll('.mode-segment').forEach(segment => {
            segment.addEventListener('click', (e) => {
                const mode = e.currentTarget.getAttribute('data-mode');
                this.setMode(mode);
            });
        });
        
        document.getElementById('resetField').addEventListener('click', () => this.resetField());
        
        this.updateHints();
    }
    
    setMode(mode) {
        document.querySelectorAll('.mode-segment').forEach(segment => segment.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        this.currentMode = mode;
        this.updateHints();
    }
    
    updateHints() {
        const modeHint = document.getElementById('modeHint');
        const gestureHint = document.getElementById('gestureHint');
        
        if (!this.currentMode) {
            modeHint.textContent = 'Select a mode to begin stirring';
            modeHint.classList.add('visible');
            gestureHint.classList.remove('visible');
        } else {
            modeHint.classList.remove('visible');
            
            const hints = {
                question: this.isTouchDevice ? 'Touch & drag to question conformity' : 'Click & move to spark questions',
                challenge: this.isTouchDevice ? 'Swipe boldly to challenge order' : 'Move fast to challenge norms',
                provocation: this.isTouchDevice ? 'Draw patterns to provoke change' : 'Create gestures to provoke',
                chaos: this.isTouchDevice ? 'Spiral touches unleash chaos' : 'Spiral movements create chaos'
            };
            
            gestureHint.textContent = hints[this.currentMode];
            gestureHint.classList.add('visible');
        }
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
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastMoveTime;
        const distance = Math.sqrt(
            (x - this.lastMousePos.x) ** 2 + (y - this.lastMousePos.y) ** 2
        );
        
        this.mouseSpeed = deltaTime > 0 ? distance / deltaTime : 0;
        this.lastMoveTime = currentTime;
        this.idleStartTime = null;
        
        this.addToMouseTrail(x, y);
        this.createProximityEffects(x, y);
        this.addToMouseHistory(x, y);
        this.detectGestures();
        
        if (this.currentMode) {
            this.createSubtleDisturbance(x, y);
        }
        
        this.lastMousePos = { x, y };
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (this.currentMode) {
            this.createDisruption(x, y, this.currentMode);
            this.updateMetrics();
        }
        
        this.lastMousePos = { x, y };
        this.lastMoveTime = Date.now();
        this.idleStartTime = null;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastMoveTime;
        const distance = Math.sqrt(
            (x - this.lastMousePos.x) ** 2 + (y - this.lastMousePos.y) ** 2
        );
        
        this.mouseSpeed = deltaTime > 0 ? distance / deltaTime : 0;
        this.lastMoveTime = currentTime;
        this.idleStartTime = null;
        
        this.addToMouseTrail(x, y);
        this.createProximityEffects(x, y);
        this.addToMouseHistory(x, y);
        this.detectGestures();
        
        if (this.currentMode) {
            this.createSubtleDisturbance(x, y);
        }
        
        this.lastMousePos = { x, y };
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.idleStartTime = Date.now() + 1000;
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
    
    addToMouseTrail(x, y) {
        this.mouseTrail.push({
            x: x,
            y: y,
            life: 1.0,
            intensity: Math.min(this.mouseSpeed * 0.1, 0.8),
            size: 2 + Math.min(this.mouseSpeed * 0.05, 8),
            timestamp: Date.now()
        });
        
        if (this.mouseTrail.length > 50) {
            this.mouseTrail.shift();
        }
    }
    
    createProximityEffects(mouseX, mouseY) {
        const gridX = Math.floor(mouseX / this.gridSize);
        const gridY = Math.floor(mouseY / this.gridSize);
        const proximityRadius = 3;
        
        for (let dy = -proximityRadius; dy <= proximityRadius; dy++) {
            for (let dx = -proximityRadius; dx <= proximityRadius; dx++) {
                const cellX = gridX + dx;
                const cellY = gridY + dy;
                
                if (cellX >= 0 && cellX < this.cols && cellY >= 0 && cellY < this.rows) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= proximityRadius) {
                        const cell = this.conformityGrid[cellY][cellX];
                        const influence = (proximityRadius - distance) / proximityRadius;
                        
                        cell.anticipation = Math.min(1.0, (cell.anticipation || 0) + influence * 0.1);
                        cell.pulse += influence * 0.05;
                    }
                }
            }
        }
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
        const anticipationInfluence = cell.anticipation || 0;
        
        const r = Math.floor(cell.baseColor[0] + chaosInfluence * 150 + anticipationInfluence * 80);
        const g = Math.floor(cell.baseColor[1] + (1 - orderInfluence) * 100 + anticipationInfluence * 60);
        const b = Math.floor(cell.baseColor[2] + orderInfluence * 50 + anticipationInfluence * 120);
        
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
        
        document.querySelectorAll('.mode-segment').forEach(segment => segment.classList.remove('active'));
        this.currentMode = null;
        this.updateHints();
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
    
    updateMouseTrail() {
        const currentTime = Date.now();
        this.mouseTrail = this.mouseTrail.filter(point => {
            point.life -= 0.02;
            return point.life > 0;
        });
        
        if (this.lastMoveTime && currentTime - this.lastMoveTime > 500) {
            if (!this.idleStartTime) {
                this.idleStartTime = currentTime;
            }
        }
    }

    updateConformityGrid() {
        const currentTime = Date.now();
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.conformityGrid[y][x];
                
                cell.pulse += 0.05;
                
                if (cell.anticipation > 0) {
                    cell.anticipation = Math.max(0, cell.anticipation - 0.02);
                    this.updateCellColor(cell);
                }
                
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
        
        if (this.idleStartTime && currentTime - this.idleStartTime > 2000) {
            if (Math.random() < 0.02) {
                this.createSpontaneousDisruption();
                this.idleStartTime = currentTime;
            }
        }
    }
    
    addToMouseHistory(x, y) {
        this.mouseHistory.push({ x, y, timestamp: Date.now() });
        
        if (this.mouseHistory.length > 20) {
            this.mouseHistory.shift();
        }
    }
    
    detectGestures() {
        if (this.mouseHistory.length < 5) return;
        
        const recent = this.mouseHistory.slice(-10);
        const totalDistance = this.calculatePathDistance(recent);
        const directDistance = this.calculateDirectDistance(recent[0], recent[recent.length - 1]);
        
        if (totalDistance > this.gestureThreshold) {
            const curvature = totalDistance / (directDistance + 1);
            
            if (curvature > 1.8) {
                this.createGestureEffect('spiral', recent);
            } else if (this.detectZigzag(recent)) {
                this.createGestureEffect('zigzag', recent);
            } else if (curvature < 1.2 && this.mouseSpeed > 2) {
                this.createGestureEffect('sweep', recent);
            }
        }
    }
    
    calculatePathDistance(points) {
        let distance = 0;
        for (let i = 1; i < points.length; i++) {
            distance += this.calculateDirectDistance(points[i-1], points[i]);
        }
        return distance;
    }
    
    calculateDirectDistance(point1, point2) {
        return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
    }
    
    detectZigzag(points) {
        if (points.length < 6) return false;
        
        let directionChanges = 0;
        let lastDirection = null;
        
        for (let i = 1; i < points.length - 1; i++) {
            const dx1 = points[i].x - points[i-1].x;
            const dx2 = points[i+1].x - points[i].x;
            const currentDirection = dx1 * dx2 < 0 ? 'change' : 'same';
            
            if (lastDirection === 'same' && currentDirection === 'change') {
                directionChanges++;
            }
            lastDirection = currentDirection;
        }
        
        return directionChanges > 2;
    }
    
    createGestureEffect(type, points) {
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        
        switch (type) {
            case 'spiral':
                this.createDisruption(centerX, centerY, 'chaos');
                break;
            case 'zigzag':
                points.forEach((point, i) => {
                    if (i % 2 === 0) {
                        this.createDisruption(point.x, point.y, 'challenge');
                    }
                });
                break;
            case 'sweep':
                const startPoint = points[0];
                const endPoint = points[points.length - 1];
                this.createDisruption(startPoint.x, startPoint.y, 'question');
                this.createDisruption(endPoint.x, endPoint.y, 'provocation');
                break;
        }
        
        this.mouseHistory = [];
    }

    createSpontaneousDisruption() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const modes = ['question', 'challenge', 'provocation'];
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        
        this.createDisruption(x, y, randomMode);
    }
    
    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderConformityGrid();
        this.renderMouseTrail();
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
                
                if (cell.anticipation > 0.1) {
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${cell.anticipation * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.setLineDash([2, 2]);
                    this.ctx.strokeRect(pixelX, pixelY, this.gridSize - 1, this.gridSize - 1);
                    this.ctx.setLineDash([]);
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
    
    renderMouseTrail() {
        this.mouseTrail.forEach((point, index) => {
            this.ctx.save();
            
            const trailAlpha = point.life * 0.6;
            const speedInfluence = Math.min(point.intensity * 2, 1);
            this.ctx.globalAlpha = trailAlpha;
            
            const gradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, point.size
            );
            
            const baseIntensity = point.intensity * speedInfluence;
            gradient.addColorStop(0, `rgba(255, 255, 255, ${baseIntensity})`);
            gradient.addColorStop(0.3, `rgba(128, 200, 255, ${baseIntensity * 0.8})`);
            gradient.addColorStop(0.7, `rgba(255, 128, 255, ${baseIntensity * 0.4})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (index > 0 && speedInfluence > 0.3) {
                const prevPoint = this.mouseTrail[index - 1];
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${trailAlpha * 0.3})`;
                this.ctx.lineWidth = Math.max(1, point.size * 0.3);
                this.ctx.beginPath();
                this.ctx.moveTo(prevPoint.x, prevPoint.y);
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
            }
            
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
        this.updateMouseTrail();
        this.updateConformityGrid();
        this.updateMetrics();
        
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AbstractDisruption();
});