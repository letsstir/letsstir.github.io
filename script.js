class PixelStir {
    constructor() {
        this.canvas = document.getElementById('stirCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spoon = document.getElementById('spoon');
        
        this.particles = [];
        this.ingredients = [];
        this.stirCount = 0;
        this.lastMousePos = { x: 0, y: 0 };
        this.mousePos = { x: 0, y: 0 };
        this.isStirring = false;
        this.stirVelocity = 0;
        this.mixQuality = 0;
        
        this.colors = {
            coffee: '#8B4513',
            milk: '#F5F5DC',
            sugar: '#FFFFFF',
            paint: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
        };
        
        this.init();
        this.animate();
    }
    
    init() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        document.getElementById('addCoffee').addEventListener('click', () => this.addIngredient('coffee'));
        document.getElementById('addMilk').addEventListener('click', () => this.addIngredient('milk'));
        document.getElementById('addSugar').addEventListener('click', () => this.addIngredient('sugar'));
        document.getElementById('addColor').addEventListener('click', () => this.addIngredient('paint'));
        document.getElementById('clearMix').addEventListener('click', () => this.clearMix());
        
        this.createBowl();
    }
    
    createBowl() {
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 200;
        
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#636e72');
        gradient.addColorStop(0.8, '#2d3436');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.lastMousePos = { ...this.mousePos };
        this.mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        this.spoon.style.left = this.mousePos.x + 'px';
        this.spoon.style.top = this.mousePos.y + 'px';
        
        if (this.isStirring) {
            this.calculateStirVelocity();
            this.createStirEffects();
        }
    }
    
    handleMouseDown(e) {
        this.isStirring = true;
        this.spoon.style.transform = 'translate(-50%, -50%) rotate(15deg) scale(1.1)';
    }
    
    handleMouseUp(e) {
        this.isStirring = false;
        this.spoon.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
    }
    
    handleMouseLeave(e) {
        this.isStirring = false;
        this.spoon.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
    }
    
    calculateStirVelocity() {
        const dx = this.mousePos.x - this.lastMousePos.x;
        const dy = this.mousePos.y - this.lastMousePos.y;
        this.stirVelocity = Math.sqrt(dx * dx + dy * dy);
        
        if (this.stirVelocity > 2) {
            this.stirCount++;
            this.updateMixQuality();
            document.getElementById('stirCount').textContent = this.stirCount;
        }
    }
    
    updateMixQuality() {
        if (this.ingredients.length === 0) {
            this.mixQuality = 0;
            document.getElementById('mixQuality').textContent = 'No Ingredients';
            return;
        }
        
        this.mixQuality = Math.min(100, this.stirCount * 2);
        
        if (this.mixQuality < 20) {
            document.getElementById('mixQuality').textContent = 'Barely Mixed';
        } else if (this.mixQuality < 50) {
            document.getElementById('mixQuality').textContent = 'Getting There';
        } else if (this.mixQuality < 80) {
            document.getElementById('mixQuality').textContent = 'Well Mixed';
        } else {
            document.getElementById('mixQuality').textContent = 'Perfectly Stirred!';
        }
    }
    
    createStirEffects() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const distanceFromCenter = Math.sqrt(
            Math.pow(this.mousePos.x - centerX, 2) + 
            Math.pow(this.mousePos.y - centerY, 2)
        );
        
        if (distanceFromCenter < 200 && this.stirVelocity > 1) {
            for (let i = 0; i < Math.floor(this.stirVelocity / 2); i++) {
                this.createParticle();
            }
            
            this.createRipple();
        }
    }
    
    createParticle() {
        const colors = this.getActiveColors();
        if (colors.length === 0) return;
        
        const particle = {
            x: this.mousePos.x + (Math.random() - 0.5) * 20,
            y: this.mousePos.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            size: Math.random() * 4 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2
        };
        
        this.particles.push(particle);
    }
    
    createRipple() {
        const ripple = {
            x: this.mousePos.x,
            y: this.mousePos.y,
            radius: 0,
            maxRadius: 30 + this.stirVelocity * 2,
            life: 1.0,
            color: this.getActiveColors()[0] || '#ffffff'
        };
        
        this.particles.push(ripple);
    }
    
    getActiveColors() {
        const colors = [];
        this.ingredients.forEach(ingredient => {
            if (ingredient.type === 'paint') {
                colors.push(ingredient.color);
            } else {
                colors.push(this.colors[ingredient.type]);
            }
        });
        return colors;
    }
    
    addIngredient(type) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        let color = this.colors[type];
        if (type === 'paint') {
            color = this.colors.paint[Math.floor(Math.random() * this.colors.paint.length)];
        }
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const radius = Math.random() * 100 + 50;
            
            const ingredient = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                color: color,
                type: type,
                size: Math.random() * 6 + 4,
                life: 1.0,
                mixed: false
            };
            
            this.ingredients.push(ingredient);
        }
        
        this.updateMixQuality();
    }
    
    clearMix() {
        this.particles = [];
        this.ingredients = [];
        this.stirCount = 0;
        this.mixQuality = 0;
        document.getElementById('stirCount').textContent = '0';
        document.getElementById('mixQuality').textContent = 'Not Mixed';
        this.createBowl();
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            if (particle.radius !== undefined) {
                particle.radius += 2;
                particle.life -= 0.05;
                return particle.life > 0 && particle.radius < particle.maxRadius;
            } else {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.life -= 0.02;
                particle.angle += particle.spin;
                return particle.life > 0;
            }
        });
        
        this.ingredients.forEach(ingredient => {
            if (this.isStirring) {
                const dx = this.mousePos.x - ingredient.x;
                const dy = this.mousePos.y - ingredient.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 50) {
                    const force = (50 - distance) / 50;
                    ingredient.vx += (dx / distance) * force * 0.5;
                    ingredient.vy += (dy / distance) * force * 0.5;
                    ingredient.mixed = true;
                }
            }
            
            ingredient.x += ingredient.vx;
            ingredient.y += ingredient.vy;
            ingredient.vx *= 0.95;
            ingredient.vy *= 0.95;
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const distanceFromCenter = Math.sqrt(
                Math.pow(ingredient.x - centerX, 2) + 
                Math.pow(ingredient.y - centerY, 2)
            );
            
            if (distanceFromCenter > 200) {
                const angle = Math.atan2(ingredient.y - centerY, ingredient.x - centerX);
                ingredient.x = centerX + Math.cos(angle) * 195;
                ingredient.y = centerY + Math.sin(angle) * 195;
                ingredient.vx *= -0.3;
                ingredient.vy *= -0.3;
            }
        });
    }
    
    render() {
        this.createBowl();
        
        this.ingredients.forEach(ingredient => {
            this.ctx.save();
            this.ctx.translate(ingredient.x, ingredient.y);
            this.ctx.fillStyle = ingredient.color;
            this.ctx.globalAlpha = ingredient.mixed ? 0.8 : 1.0;
            
            this.ctx.fillRect(-ingredient.size/2, -ingredient.size/2, ingredient.size, ingredient.size);
            
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(-ingredient.size/2, -ingredient.size/2, ingredient.size, ingredient.size);
            this.ctx.restore();
        });
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            
            if (particle.radius !== undefined) {
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            } else {
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.angle);
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            }
            this.ctx.restore();
        });
    }
    
    animate() {
        this.updateParticles();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelStir();
});