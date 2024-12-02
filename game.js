class CenteringGame {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 30;
        this.editor = null;
        this.powerups = {
            time: 1,
            hint: 1,
            skip: 1
        };
        this.achievements = {
            speed: false,
            trivia: false,
            perfect: false,
            level1: false,  // Level 1 achievement
            level2: false,  // Level 2 achievement
            level3: false   // Level 3 achievement
        };
        this.triviaTimer = null;
        this.currentTrivia = null;

        this.levels = [
            {
                time: 30,
                description: "Center the purple box using margin: auto",
                solution: ["margin-left: auto", "margin-right: auto"],
                hint: "Try using margin: auto"
            },
            {
                time: 45,
                description: "Center the box using Flexbox",
                solution: ["display: flex", "justify-content: center", "align-items: center"],
                hint: "Use display: flex with justify-content and align-items"
            },
            {
                time: 60,
                description: "Center using absolute positioning",
                solution: ["position: absolute", "top: 50%", "left: 50%", "transform: translate(-50%, -50%)"],
                hint: "Position absolute with transform translate"
            },
            {
                time: 75,
                description: "Center the box using CSS Grid",
                solution: ["display: grid", "place-items: center"],
                hint: "Try using CSS Grid with place-items"
            },
            {
                time: 90,
                description: "Center using Flexbox and margin",
                solution: ["display: flex", "margin: auto"],
                hint: "Combine Flexbox with margin: auto"
            }
        ];

        this.triviaQuestions = [
            {
                question: "What does position: absolute do?",
                answers: [
                    "Positions element relative to its first positioned ancestor",
                    "Positions element relative to its immediate parent",
                    "Removes element from document flow",
                    "Centers element on the page"
                ],
                correct: 0
            },
            {
                question: "Which property centers a div horizontally?",
                answers: [
                    "text-align: center",
                    "margin: 0 auto",
                    "align-items: center",
                    "justify-content: center"
                ],
                correct: 1
            },
            {
                question: "What's the difference between position: relative and absolute?",
                answers: [
                    "Relative keeps element in flow, absolute removes it",
                    "Relative is faster, absolute is slower",
                    "They are the same thing",
                    "Absolute is only for images"
                ],
                correct: 0
            },
            {
                question: "How do you vertically center with Flexbox?",
                answers: [
                    "vertical-align: middle",
                    "margin: auto 0",
                    "align-items: center",
                    "text-align: center"
                ],
                correct: 2
            }
        ];
    }

    init() {
        // Initialize CodeMirror
        this.editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
            mode: "css",
            theme: "monokai",
            lineNumbers: true,
            autoCloseBrackets: true,
            lineWrapping: true
        });

        // Event listeners
        document.getElementById("submit-btn").addEventListener("click", () => this.checkSolution());
        
        // Power-up event listeners
        document.querySelectorAll(".powerup").forEach(powerup => {
            powerup.addEventListener("click", (e) => this.usePowerup(e.currentTarget.dataset.powerup));
        });

        // Initialize first level
        this.startLevel(1);
        this.updatePowerupDisplay();
    }

    startLevel(level) {
        this.currentLevel = level;
        this.timeLeft = this.levels[level - 1].time;
        
        // Update UI
        document.getElementById("current-level").textContent = level;
        document.getElementById("level-description").textContent = this.levels[level - 1].description;
        document.getElementById("timer").textContent = this.timeLeft;
        
        // Reset editor
        this.editor.setValue("");
        
        // Clear previous timer
        if (this.timer) clearInterval(this.timer);
        
        // Start new timer
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById("timer").textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    handleTimeout() {
        clearInterval(this.timer);
        this.showFeedback("Time's up! Try again!", false);
        setTimeout(() => this.startLevel(this.currentLevel), 2000);
    }

    checkSolution() {
        const userCode = this.editor.getValue().toLowerCase();
        const currentSolution = this.levels[this.currentLevel - 1].solution;
        
        // Check if all required properties are present
        const isCorrect = currentSolution.every(prop => 
            userCode.includes(prop.toLowerCase())
        );

        if (isCorrect) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    handleSuccess() {
        // Calculate points based on time left
        const points = Math.floor(this.timeLeft * 10);
        this.score += points;
        document.getElementById("score").textContent = this.score;

        // Show success feedback
        this.showFeedback("Perfect! Get ready for the trivia question!", true);

        // Trigger celebration animation
        this.celebrate();

        // Check for achievements
        this.checkAchievements();

        // Show trivia question
        setTimeout(() => {
            this.showTriviaQuestion();
        }, 2000);
    }

    handleFailure() {
        this.showFeedback("Not quite right. Try again!", false);
    }

    showFeedback(message, isSuccess) {
        const feedback = document.getElementById("feedback");
        feedback.textContent = message;
        feedback.className = "feedback " + (isSuccess ? "success" : "error");
    }

    celebrate() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    usePowerup(type) {
        if (this.powerups[type] <= 0) {
            this.showFeedback("You don't have any " + type + " power-ups!", false);
            return;
        }

        switch(type) {
            case "time":
                this.timeLeft += 30;
                document.getElementById("timer").textContent = this.timeLeft;
                break;
            case "hint":
                this.showFeedback("Hint: " + this.levels[this.currentLevel - 1].hint, true);
                break;
            case "skip":
                if (this.currentLevel < this.levels.length) {
                    this.startLevel(this.currentLevel + 1);
                }
                break;
        }

        this.powerups[type]--;
        this.updatePowerupDisplay();
    }

    updatePowerupDisplay() {
        Object.entries(this.powerups).forEach(([type, count]) => {
            const element = document.querySelector(`.powerup[data-powerup="${type}"] .powerup-count`);
            if (element) element.textContent = count;
        });
    }

    unlockAchievement(achievementType, message) {
        const achievementElement = document.querySelector(`.achievement[data-achievement="${achievementType}"]`);
        if (achievementElement && !this.achievements[achievementType]) {
            this.achievements[achievementType] = true;
            achievementElement.classList.remove('locked');
            achievementElement.classList.add('achievement-unlocked');
            
            // Remove animation class after it completes
            setTimeout(() => {
                achievementElement.classList.remove('achievement-unlocked');
            }, 1000);

            this.showFeedback(message, true);
            this.celebrate();
        }
    }

    checkAchievements() {
        // Award achievement based on level completion
        if (this.currentLevel === 1) {
            this.unlockAchievement('level1', "🌟 Achievement Unlocked: Level 1 Master!");
        }
        else if (this.currentLevel === 2) {
            this.unlockAchievement('level2', "🏆 Achievement Unlocked: Level 2 Champion!");
        }
        else if (this.currentLevel === 3) {
            this.unlockAchievement('level3', "👑 Achievement Unlocked: Level 3 Expert!");
        }

        // Speed Demon Achievement
        if (this.timeLeft > this.levels[this.currentLevel - 1].time / 2) {
            if (!this.achievements.speed) {
                this.achievements.speed = true;
                document.querySelector('.achievement[data-achievement="speed"]').classList.remove('locked');
                this.showFeedback("🏃‍♂️ Achievement Unlocked: Speed Demon! Completed level with more than 50% time remaining!", true);
                this.celebrate();
            }
        }

        // Perfect Score Achievement
        if (this.score >= 1000 && !this.achievements.perfect) {
            this.achievements.perfect = true;
            document.querySelector('.achievement[data-achievement="perfect"]').classList.remove('locked');
            this.showFeedback("👑 Achievement Unlocked: Perfect Score! Reached 1000 points!", true);
            this.celebrate();
        }
    }

    showTriviaQuestion() {
        const modal = document.getElementById("trivia-modal");
        const questionContainer = modal.querySelector(".question");
        const answersContainer = modal.querySelector(".answers");
        
        // Select random trivia question
        this.currentTrivia = this.triviaQuestions[Math.floor(Math.random() * this.triviaQuestions.length)];
        
        // Display question
        questionContainer.textContent = this.currentTrivia.question;
        
        // Clear previous answers
        answersContainer.innerHTML = "";
        
        // Add answer options
        this.currentTrivia.answers.forEach((answer, index) => {
            const button = document.createElement("div");
            button.className = "answer-option";
            button.textContent = answer;
            button.addEventListener("click", () => this.checkTriviaAnswer(index));
            answersContainer.appendChild(button);
        });

        // Show modal
        modal.classList.add("active");
        
        // Start trivia timer
        this.startTriviaTimer();
    }

    startTriviaTimer() {
        let timeLeft = 20;
        const timerText = document.querySelector(".timer-text");
        const timerBar = document.querySelector(".timer-bar");
        
        this.triviaTimer = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            timerBar.style.width = (timeLeft / 20 * 100) + "%";
            
            if (timeLeft <= 0) {
                this.handleTriviaTimeout();
            }
        }, 1000);
    }

    handleTriviaTimeout() {
        clearInterval(this.triviaTimer);
        this.showFeedback("Time's up! Moving to next level...", false);
        setTimeout(() => {
            document.getElementById("trivia-modal").classList.remove("active");
            if (this.currentLevel < this.levels.length) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.endGame();
            }
        }, 2000);
    }

    checkTriviaAnswer(index) {
        clearInterval(this.triviaTimer);
        const isCorrect = index === this.currentTrivia.correct;
        
        // Visual feedback
        const answers = document.querySelectorAll(".answer-option");
        answers[this.currentTrivia.correct].classList.add("correct");
        if (!isCorrect) {
            answers[index].classList.add("wrong");
        }

        // Handle result
        if (isCorrect) {
            this.score += 100;
            document.getElementById("score").textContent = this.score;
            
            // Award a random power-up
            const randomPowerup = Object.keys(this.powerups)[Math.floor(Math.random() * 3)];
            this.powerups[randomPowerup]++;
            this.updatePowerupDisplay();
            this.showFeedback(`Correct! You earned a ${randomPowerup} power-up!`, true);
            
            // CSS Master Achievement - Get 3 trivia questions correct
            if (!this.achievements.trivia) {
                const triviaCorrect = parseInt(localStorage.getItem('triviaCorrect') || '0') + 1;
                localStorage.setItem('triviaCorrect', triviaCorrect);
                
                if (triviaCorrect >= 3) {
                    this.achievements.trivia = true;
                    document.querySelector('.achievement[data-achievement="trivia"]').classList.remove('locked');
                    this.showFeedback("🧠 Achievement Unlocked: CSS Master! Answered 3 trivia questions correctly!", true);
                    this.celebrate();
                }
            }
        }

        // Move to next level after delay
        setTimeout(() => {
            document.getElementById("trivia-modal").classList.remove("active");
            if (this.currentLevel < this.levels.length) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.endGame();
            }
        }, 2000);
    }

    endGame() {
        clearInterval(this.timer);
        this.showFeedback(`Congratulations! You've completed all levels! Final score: ${this.score}`, true);
        this.celebrate();
    }
}

// Start the game when the page loads
window.addEventListener("load", () => {
    const game = new CenteringGame();
    game.init();
});
