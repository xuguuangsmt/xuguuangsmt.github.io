// 俄罗斯方块游戏核心逻辑
const TETROMINOS = {
    I: {
        shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        color: '#00FFFF'
    },
    J: {
        shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
        color: '#0000FF'
    },
    L: {
        shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        color: '#FF8C00'
    },
    O: {
        shape: [[1, 1], [1, 1]],
        color: '#FFFF00'
    },
    S: {
        shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
        color: '#00FF00'
    },
    T: {
        shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        color: '#800080'
    },
    Z: {
        shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
        color: '#FF0000'
    }
};

const COLORS = {
    empty: '#111',
    border: '#333'
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

class TetrisGame {
    constructor() {
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.gamePaused = false;
        this.gameInterval = null;
        this.dropSpeed = 1000;
        this.gamepadConnected = false;
        this.audioContext = null;
        this.explosionParticles = [];
        this.explosionAnimating = false;
        this.initAudio();
        
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.startButton = document.getElementById('start-button');
        
        this.startButton.addEventListener('click', () => this.startGame());
        this.setupEventListeners();
        this.init();
    }
    
    init() {
        this.resetBoard();
        this.generateNewPiece();
        this.generateNextPiece();
        this.updateUI();
        this.drawBoard();
        this.drawNextPiece();
    }
    
    resetBoard() {
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.gamePaused = false;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }
    
    startGame() {
        if (this.gameOver) {
            // 游戏结束状态，重新开始
            this.resetBoard();
            this.gameInterval = setInterval(() => this.dropPiece(), this.dropSpeed);
        } else if (this.gamePaused) {
            // 暂停状态，继续游戏
            this.gamePaused = false;
            this.gameInterval = setInterval(() => this.dropPiece(), this.dropSpeed);
        } else if (!this.gameInterval) {
            // 未开始状态，开始游戏
            this.gameInterval = setInterval(() => this.dropPiece(), this.dropSpeed);
        } else {
            // 游戏中状态，暂停游戏
            this.gamePaused = true;
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.updateUI();
    }
    
    generateNewPiece() {
        if (this.nextPiece) {
            this.currentPiece = {
                ...this.nextPiece,
                x: Math.floor((BOARD_WIDTH - this.nextPiece.shape[0].length) / 2),
                y: 0
            };
        } else {
            const keys = Object.keys(TETROMINOS);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const tetromino = TETROMINOS[randomKey];
            this.currentPiece = {
                shape: tetromino.shape,
                color: tetromino.color,
                x: Math.floor((BOARD_WIDTH - tetromino.shape[0].length) / 2),
                y: 0
            };
        }
        this.generateNextPiece();
        
        if (!this.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver = true;
            clearInterval(this.gameInterval);
            this.gameInterval = null;
            this.playSound('gameOver');
            this.updateUI();
        }
    }
    
    generateNextPiece() {
        const keys = Object.keys(TETROMINOS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const tetromino = TETROMINOS[randomKey];
        this.nextPiece = {
            shape: tetromino.shape,
            color: tetromino.color
        };
        this.drawNextPiece();
    }
    
    rotatePiece() {
        if (!this.currentPiece || this.gameOver || this.gamePaused) return;
        
        const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
        if (this.isValidMove(rotatedShape, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotatedShape;
            this.drawBoard();
            this.playSound('rotate');
        }
    }
    
    rotateMatrix(matrix) {
        const N = matrix.length;
        const result = Array(N).fill().map(() => Array(N).fill(0));
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                result[j][N - 1 - i] = matrix[i][j];
            }
        }
        return result;
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece || this.gameOver || this.gamePaused) return;
        
        if (this.isValidMove(this.currentPiece.shape, this.currentPiece.x + dx, this.currentPiece.y + dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.drawBoard();
            this.playSound('move');
            return true;
        }
        return false;
    }
    
    dropPiece() {
        if (!this.currentPiece || this.gameOver || this.gamePaused) return;
        
        if (!this.movePiece(0, 1)) {
            this.lockPiece();
            this.playSound('drop');
            this.clearLines();
            this.generateNewPiece();
        }
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        let clearedRows = [];
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                clearedRows.push({ row: y, colors: [...this.board[y]] });
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.updateLevel();
            this.playExplosionSound(linesCleared);
            this.createExplosion(clearedRows);
            this.updateUI();
        }
    }
    
    createExplosion(clearedRows) {
        for (let rowData of clearedRows) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                for (let i = 0; i < 3; i++) {
                    this.explosionParticles.push({
                        x: x * BLOCK_SIZE + BLOCK_SIZE / 2,
                        y: rowData.row * BLOCK_SIZE + BLOCK_SIZE / 2,
                        vx: (Math.random() - 0.5) * 10,
                        vy: (Math.random() - 0.5) * 10,
                        life: 1,
                        color: rowData.colors[x] || '#fff',
                        size: Math.random() * 6 + 2
                    });
                }
            }
        }
        this.explosionAnimating = true;
        this.animateExplosion();
    }
    
    animateExplosion() {
        if (this.explosionParticles.length === 0) {
            this.explosionAnimating = false;
            return;
        }
        
        this.drawBoard();
        
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const p = this.explosionParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life -= 0.03;
            
            if (p.life <= 0) {
                this.explosionParticles.splice(i, 1);
                continue;
            }
            
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        this.ctx.globalAlpha = 1;
        
        if (this.explosionAnimating) {
            requestAnimationFrame(() => this.animateExplosion());
        }
    }
    
    playExplosionSound(linesCleared) {
        if (!this.audioContext) return;
        
        const baseFreq = 200 + linesCleared * 100;
        
        for (let i = 0; i < linesCleared; i++) {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(baseFreq + i * 150, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800 + i * 200, this.audioContext.currentTime + 0.15);
                
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, i * 50);
        }
        
        const noise = this.audioContext.createOscillator();
        const noiseGain = this.audioContext.createGain();
        noise.type = 'sawtooth';
        noise.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        noise.frequency.setValueAtTime(100, this.audioContext.currentTime);
        noise.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.3);
        noiseGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        noise.start(this.audioContext.currentTime);
        noise.stop(this.audioContext.currentTime + 0.3);
    }
    
    calculateScore(linesCleared) {
        const baseScores = [0, 100, 300, 500, 800];
        return baseScores[linesCleared] * this.level;
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropSpeed = 1000 - (this.level - 1) * 100;
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
                this.gameInterval = setInterval(() => this.dropPiece(), this.dropSpeed);
            }
        }
    }
    
    isValidMove(shape, x, y) {
        for (let shapeY = 0; shapeY < shape.length; shapeY++) {
            for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
                if (shape[shapeY][shapeX]) {
                    const boardX = x + shapeX;
                    const boardY = y + shapeY;
                    
                    if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                        return false;
                    }
                    
                    if (boardY >= 0 && this.board[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                this.drawBlock(x, y, this.board[y][x] || COLORS.empty);
            }
        }
        
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const boardX = this.currentPiece.x + x;
                        const boardY = this.currentPiece.y + y;
                        if (boardY >= 0) {
                            this.drawBlock(boardX, boardY, this.currentPiece.color);
                        }
                    }
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * BLOCK_SIZE) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * BLOCK_SIZE) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.drawBlockOnNext(x, y, this.nextPiece.color, offsetX, offsetY);
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        this.ctx.strokeStyle = COLORS.border;
        this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
    
    drawBlockOnNext(x, y, color, offsetX, offsetY) {
        this.nextCtx.fillStyle = color;
        this.nextCtx.fillRect(offsetX + x * BLOCK_SIZE, offsetY + y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        this.nextCtx.strokeStyle = COLORS.border;
        this.nextCtx.strokeRect(offsetX + x * BLOCK_SIZE, offsetY + y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
        
        if (this.gameOver) {
            this.startButton.textContent = '游戏结束，点击重新开始';
        } else if (this.gamePaused) {
            this.startButton.textContent = '继续游戏';
        } else if (!this.gameInterval) {
            this.startButton.textContent = '开始游戏';
        } else {
            this.startButton.textContent = '暂停游戏';
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    this.startGame();
                    break;
            }
        });
        
        // 手柄支持
        window.addEventListener('gamepadconnected', (e) => {
            console.log('手柄已连接:', e.gamepad.id);
            this.gamepadConnected = true;
            this.pollGamepad();
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('手柄已断开:', e.gamepad.id);
            this.gamepadConnected = false;
        });
    }
    
    pollGamepad() {
        if (!this.gamepadConnected) return;
        
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0];
        
        if (gamepad) {
            // 左摇杆左右移动
            if (gamepad.axes[0] < -0.5) {
                this.movePiece(-1, 0);
            } else if (gamepad.axes[0] > 0.5) {
                this.movePiece(1, 0);
            }
            
            // 左摇杆向下移动
            if (gamepad.axes[1] > 0.5) {
                this.movePiece(0, 1);
            }
            
            // A键旋转
            if (gamepad.buttons[0].pressed) {
                this.rotatePiece();
            }
            
            // B键开始/暂停
            if (gamepad.buttons[1].pressed) {
                this.startGame();
            }
        }
        
        requestAnimationFrame(() => this.pollGamepad());
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('音频不可用:', e);
        }
    }
    
    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'move':
                oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'rotate':
                oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
            case 'drop':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
            case 'clear':
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
            case 'gameOver':
                oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 1);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 1);
                break;
        }
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});