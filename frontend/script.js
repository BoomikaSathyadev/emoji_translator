class EmojiTranslator {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.translateBtn = document.getElementById('translateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.translatedText = document.getElementById('translatedText');
        this.resultContainer = document.getElementById('resultContainer');
        this.teddy = document.getElementById('teddy');
        this.background = document.getElementById('background');
        this.competitiveMode = false;
        this.score = 0;
        
        this.initEventListeners();
        this.enableCompetitiveMode();
    }

    initEventListeners() {
        this.translateBtn.addEventListener('click', () => this.translateText());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.translateText();
        });

    }

    async translateText() {
        const text = this.textInput.value.trim();
        console.log('Input text:', text);
        
        if (!text) {
            this.showError('Please enter some text!');
            return;
        }

        try {
            console.log('Sending request to /translate');
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                this.displayResult(data);
                this.updateTeddyMood(data.mood);
                this.updateBackground(data.background);
            } else {
                this.showError(data.error);
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showError('Translation failed. Please try again!');
        }
    }

    displayResult(data) {
        this.translatedText.textContent = data.translated;
        this.resultContainer.classList.add('show');
        
        // Extract and sprinkle the actual emojis found
        const foundEmojis = this.extractEmojis(data.translated);
        if (foundEmojis.length > 0) {
            this.sprinkleFoundEmojis(foundEmojis);
        }        
        
        // Only increment score if emojis were found
        if (this.competitiveMode && foundEmojis.length > 0) {
            this.score++;
            this.updateScore();
        }
    }

    updateTeddyMood(mood = null) {
        // Remove existing mood classes
        this.teddy.classList.remove('happy', 'sad', 'neutral');
        
        if (mood) {
            this.teddy.classList.add(mood);
        } else {
            // Real-time mood detection based on input
            const text = this.textInput.value.toLowerCase();
            const positiveWords = ['happy', 'joy', 'love', 'kind', 'smile', 'laugh', 'peace', 'hope', 'trust', 'calm', 'relaxed', 'excited', 'enthusiasm', 'energy', 'fun', 'cheerful', 'grateful', 'thankful', 'proud', 'brave', 'strong', 'confident', 'winner', 'success', 'growth', 'shine', 'bright', 'safe', 'positive', 'support', 'caring', 'helpful', 'friend', 'family', 'together', 'respect', 'loyal', 'honest', 'fair', 'beautiful', 'amazing', 'awesome', 'great', 'fantastic', 'wonderful', 'perfect', 'enjoy', 'celebrate', 'inspire', 'motivate', 'encourage', 'hopeful', 'passion', 'dream', 'goal', 'victory', 'healthy', 'lucky', 'prosper', 'smiling', 'achievement'
];
            const negativeWords = ['hurt', 'hate', 'jealous', 'angry', 'sad', 'upset', 'mad', 'frustrated', 'annoyed', 'irritated', 'disappointed', 'lonely', 'depressed', 'miserable', 'hopeless', 'worried', 'anxious', 'nervous', 'stressed', 'confused', 'afraid', 'scared', 'insecure', 'guilty', 'ashamed', 'embarrassed', 'bored', 'tired', 'sick', 'weak', 'fight', 'argue', 'enemy', 'attack', 'blame', 'insult', 'rude', 'mean', 'selfish', 'dishonest', 'liar', 'cheat', 'betrayal', 'unfair', 'broken', 'pain', 'loss', 'cry', 'shout', 'scream', 'kill', 'destroy', 'fail', 'lose', 'quit', 'reject', 'abandon', 'ignore', 'envy', 'jealousy', 'distrust', 'doubt', 'anger', 'hatred', 'resentment'
];
            
            if (positiveWords.some(word => text.includes(word))) {
                this.teddy.classList.add('happy');
                this.autoUpdateBackground(text);
            } else if (negativeWords.some(word => text.includes(word))) {
                this.teddy.classList.add('sad');
                if (text.includes('angry') || text.includes('mad') || text.includes('hate')) {
                    this.updateBackground('angry');
                }
            } else {
                this.teddy.classList.add('neutral');
            }
        }
    }
    
    autoUpdateBackground(text) {
        const words = text.toLowerCase().split(/\s+/);
        
        if (words.includes('pizza')) {
            this.updateBackground('pizza');
        } else if (words.includes('love') || words.includes('heart')) {
            this.updateBackground('love');
        } else if (words.includes('coffee')) {
            this.updateBackground('coffee');
        } else if (words.includes('party')) {
            this.updateBackground('party');
        }
    }

    updateBackground(backgroundType) {
        // Remove existing background classes
        this.background.classList.remove('pizza', 'coffee', 'party', 'love');
        
        if (backgroundType && backgroundType !== 'default') {
            this.background.classList.add(backgroundType);
            this.addFloatingParticles(backgroundType);
        }
    }

    addFloatingParticles(mood) {
        // Clear existing particles
        document.querySelectorAll('.floating-particle').forEach(p => p.remove());
        
        const particles = this.getParticlesForMood(mood);
        if (particles.length === 0) return;
        
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.textContent = particles[0]; // Use the specific emoji
                particle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    font-size: ${1.5 + Math.random() * 2}em;
                    pointer-events: none;
                    z-index: 0;
                    animation: float-particle ${3 + Math.random() * 4}s ease-in-out infinite;
                    opacity: 0.7;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => particle.remove(), 8000);
            }, i * 300);
        }
    }

    getParticlesForMood(mood) {
        const moodParticles = {
            pizza: ['🍕'],
            love: ['❤️'],
            heart: ['❤️'],
            coffee: ['☕'],
            party: ['🎉']
        };
        
        return moodParticles[mood] || [];
    }
    
    enableCompetitiveMode() {
        this.competitiveMode = true;
        document.body.classList.add('competition-mode');
        this.createScoreDisplay();
    }
    
    createScoreDisplay() {
        const scoreDiv = document.createElement('div');
        scoreDiv.id = 'scoreDisplay';
        scoreDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #8B0000;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.2em;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
            z-index: 1000;
            animation: score-glow 2s ease-in-out infinite;
        `;
        scoreDiv.textContent = `Score: ${this.score}`;
        document.body.appendChild(scoreDiv);
    }
    
    updateScore() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${this.score}`;
            scoreDisplay.style.animation = 'none';
            setTimeout(() => {
                scoreDisplay.style.animation = 'score-pulse 0.5s ease-out, score-glow 2s ease-in-out infinite';
            }, 10);
        }
    }
    
    addVictoryEffect() {
        const victoryEmojis = ['🏆', '🥇', '🎉', '🎊', '👑', '⭐', '🌟', '💫'];
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const victory = document.createElement('div');
                victory.textContent = victoryEmojis[Math.floor(Math.random() * victoryEmojis.length)];
                victory.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: -50px;
                    font-size: ${2 + Math.random() * 2}em;
                    pointer-events: none;
                    z-index: 1000;
                    animation: victory-fall ${2 + Math.random() * 2}s ease-out forwards;
                `;
                
                document.body.appendChild(victory);
                setTimeout(() => victory.remove(), 4000);
            }, i * 100);
        }
    }

    addSparkleEffect() {
        const sparkles = ['✨', '⭐', '🌟', '💫'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                sparkle.style.position = 'fixed';
                sparkle.style.left = Math.random() * window.innerWidth + 'px';
                sparkle.style.top = Math.random() * window.innerHeight + 'px';
                sparkle.style.fontSize = '2em';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '1000';
                sparkle.style.animation = 'sparkle 2s ease-out forwards';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 2000);
            }, i * 200);
        }
    }

    extractEmojis(text) {
        return text.split(' ').filter(word => 
            /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(word)
        );
    }

    sprinkleFoundEmojis(emojis) {
        if (emojis.length === 0) return;
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                const particle = document.createElement('div');
                particle.textContent = emoji;
                particle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: -50px;
                    font-size: ${1.5 + Math.random() * 1.5}em;
                    pointer-events: none;
                    z-index: 1000;
                    animation: emoji-fall ${2 + Math.random() * 2}s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 4000);
            }, i * 100);
        }
    }

    clearAll() {
        this.textInput.value = '';
        this.translatedText.textContent = '';
        this.resultContainer.classList.remove('show');
        this.teddy.classList.remove('happy', 'sad');
        this.teddy.classList.add('neutral');
        this.background.classList.remove('pizza', 'coffee', 'party', 'love');
        document.querySelectorAll('.floating-particle').forEach(p => p.remove());
        this.score = 0;
        this.updateScore();
        this.textInput.focus();
    }

    showError(message) {
        alert(message);
    }
}

// Add sparkle and particle animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
    
    @keyframes float-particle {
        0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.7;
        }
        25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
            opacity: 1;
        }
        50% {
            transform: translateY(-10px) translateX(-15px) rotate(180deg);
            opacity: 0.8;
        }
        75% {
            transform: translateY(-30px) translateX(5px) rotate(270deg);
            opacity: 0.9;
        }
    }
    
    .floating-particle {
        user-select: none;
        will-change: transform, opacity;
    }
    
    @keyframes score-glow {
        0%, 100% { box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4); }
        50% { box-shadow: 0 4px 25px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 165, 0, 0.6); }
    }
    
    @keyframes score-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes victory-fall {
        0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes emoji-fall {
        0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Clear input on page refresh
window.addEventListener('load', () => {
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.value = '';
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new EmojiTranslator();
});