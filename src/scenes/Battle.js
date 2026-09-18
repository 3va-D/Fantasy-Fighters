import { PlayerBattle } from './sprites/playerBattle.js';
import { Enemy } from './sprites/enemy.js';

export class Battle extends Phaser.Scene {

    constructor() {
        super("Battle");
        this.currentAnswer = null;
        this.currentTool = "paint";
        this.correct = null;
        this.isAttacking = false;
    }

    preload() {
        this.load.image("battleBackground", "assets/backgrounds/battleField.png");
        this.load.image("battleBar", "assets/battleBar.png");
    }

    create(data) {
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.add.image(0, 0, "battleBackground")
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);
        
        this.ui = this.add.container(0, 0);
        this.ui.setDepth(1000);
        this.ui.setScrollFactor(0);

        this.attackButton = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height - 100,
            180,
            60,
            0xFAF8FF
        );

        this.attackText = this.add.text(
            this.scale.width / 2,
            this.scale.height - 100,
            "Attack!",
            {
                fontSize: "28px",
                color: "#BEA8F0",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.attackButton.setStrokeStyle(3, 0xffffff);
        this.attackButton.setInteractive({ useHandCursor: true });

        this.ui.add(this.attackButton);
        this.ui.add(this.attackText);

        this.player = new PlayerBattle(this, -200, 300, 100);
        this.enemy = new Enemy(this, 1536, 300, 70);

        this.player.canMove = false;
        this.player.setFlipX(true);
        this.enemy.setFlipX(true);

        this.player.play("battle-walking");
        this.enemy.play("enemy-walking");

        this.tweens.add({
            targets: this.player,
            x: 500,
            duration: 1000,
            onComplete: () => {
                this.player.play("idle");
            }
        });

        this.tweens.add({
            targets: this.enemy,
            x: 1036,
            duration: 1000,
            onComplete: () => {
                this.enemy.play("enemy-idle");
            }
        });

        this.popupOverlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.4
        );
        this.popupOverlay.setVisible(false);
        this.popupOverlay.setDepth(2500);

        this.attackPopup = this.add.container(0, 0);
        this.attackPopup.setDepth(3000);
        this.attackPopup.setVisible(false);

        const popup = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2 - 30,
            this.scale.width * 0.8,
            this.scale.height * 0.8,
            0xFAF8FF
        );
        popup.setStrokeStyle(4, 0x444444);

        this.questionText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - (this.scale.height * 0.35),
            "Loading question...",
            {
                fontSize: "28px",
                color: "#BEA8F0",
                fontStyle: "bold",
                align: "center",
                wordWrap: { width: this.scale.width * 0.7 }
            }
        ).setOrigin(0.5);

        const canvasWidth = this.scale.width * 0.75;
        const canvasHeight = this.scale.height * 0.55;

        this.drawingCanvas = this.add.renderTexture(
            this.scale.width / 2,
            this.scale.height / 2 + 20, 
            canvasWidth,
            canvasHeight
        ).setOrigin(0.5);

        this.drawingCanvas.fill(0xffffff, 1);
        this.drawingCanvas.setInteractive();

        const toolbarY = this.scale.height - 128;
        const canvasLeftEdge = (this.scale.width / 2) - (canvasWidth / 2);

        const tools = [
            { name: 'Paint', key: 'paint', x: canvasLeftEdge + 40 },
            { name: 'Text', key: 'text', x: canvasLeftEdge + 120 },
            { name: 'Erase', key: 'erase', x: canvasLeftEdge + 200 }
        ];

        this.toolButtons = {};

        tools.forEach(tool => {
            const btn = this.add.text(tool.x, toolbarY, tool.name, {
                fontSize: "20px",
                color: tool.key === this.currentTool ? "#BEA8F0" : "#888888",
                fontStyle: "bold"
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.currentTool = tool.key;
                Object.keys(this.toolButtons).forEach(k => {
                    this.toolButtons[k].setColor(k === this.currentTool ? "#BEA8F0" : "#888888");
                });
            });

            this.toolButtons[tool.key] = btn;
        });

        const clearButton = this.add.text(this.scale.width / 2, toolbarY, "Clear Canvas", {
            fontSize: "20px",
            color: "#FF0000",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        clearButton.on('pointerdown', () => {
            this.drawingCanvas.clear();
            this.drawingCanvas.fill(0xffffff, 1);
        });

        this.drawingCanvas.on('pointerdown', (pointer) => {
            if (this.currentTool === 'text') {
                const localX = pointer.x - (this.drawingCanvas.x - this.drawingCanvas.width * this.drawingCanvas.originX);
                const localY = pointer.y - (this.drawingCanvas.y - this.drawingCanvas.height * this.drawingCanvas.originY);
                
                const userText = prompt("Enter text to draw:");
                if (userText) {
                    const txt = this.make.text({
                        x: 0,
                        y: 0,
                        text: userText,
                        style: { fontSize: '24px', color: '#000000' },
                        add: false
                    });
                    this.drawingCanvas.draw(txt, localX, localY);
                    txt.destroy();
                }
            } else {
                this.isDrawing = true;
                this.lastX = pointer.x - (this.drawingCanvas.x - this.drawingCanvas.width * this.drawingCanvas.originX);
                this.lastY = pointer.y - (this.drawingCanvas.y - this.drawingCanvas.height * this.drawingCanvas.originY);
                this.drawAtPointer(this.drawingCanvas, pointer, true);
            }
        });

        this.drawingCanvas.on('pointermove', (pointer) => {
            if (this.isDrawing && this.currentTool !== 'text') {
                this.drawAtPointer(this.drawingCanvas, pointer, false);
            }
        });

        this.input.on('pointerup', () => {
            this.isDrawing = false;
        });

        this.drawAtPointer = (canvas, pointer, isFirstPoint) => {
            const localX = pointer.x - (canvas.x - canvas.width * canvas.originX);
            const localY = pointer.y - (canvas.y - canvas.height * canvas.originY);

            const isErase = this.currentTool === 'erase';
            const strokeColor = isErase ? 0xffffff : 0x000000;
            const strokeWidth = isErase ? 16 : 4;
            const circleRadius = isErase ? 8 : (isFirstPoint ? 4 : 2);

            const brush = this.make.graphics({ x: 0, y: 0, add: false });
            brush.lineStyle(strokeWidth, strokeColor, 1);
            brush.fillStyle(strokeColor, 1);

            if (isFirstPoint) {
                brush.fillCircle(localX, localY, circleRadius);
            } else {
                brush.beginPath();
                brush.moveTo(this.lastX, this.lastY);
                brush.lineTo(localX, localY);
                brush.strokePath();
                brush.fillCircle(localX, localY, circleRadius);
            }

            canvas.draw(brush);
            brush.destroy();

            this.lastX = localX;
            this.lastY = localY;
        };

        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.step = '1';
        inputElement.placeholder = 'Enter number...';
        inputElement.style.cssText = `
            font-size: 24px;
            padding: 8px 12px;
            text-align: center;
            border: 2px solid #BEA8F0;
            border-radius: 8px;
            outline: none;
            width: 200px;
        `;

        inputElement.addEventListener('keydown', (e) => e.stopPropagation());
        inputElement.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        this.answerInput = this.add.dom(
            (this.scale.width / 2) + 500,
            (this.scale.height / 2) + 240,
            inputElement
        );

        const submitButtonX = (this.scale.width / 2) + 670;
        const submitButtonY = (this.scale.height / 2) + 242;

        this.submitButton = this.add.rectangle(
            submitButtonX,
            submitButtonY,
            100,
            44,
            0xBEA8F0
        ).setInteractive({ useHandCursor: true });

        this.submitText = this.add.text(
            submitButtonX,
            submitButtonY,
            "Submit",
            {
                fontSize: "18px",
                color: "#FFFFFF",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.submitButton.on("pointerover", () => this.submitButton.setFillStyle(0xA086DC));
        this.submitButton.on("pointerout", () => this.submitButton.setFillStyle(0xBEA8F0));
        this.submitButton.on("pointerdown", () => this.checkAnswer());

        this.attackPopup.add([
            popup,
            this.questionText,
            this.drawingCanvas,
            this.toolButtons.paint,
            this.toolButtons.text,
            this.toolButtons.erase,
            clearButton,
            this.answerInput,
            this.submitButton,
            this.submitText
        ]);

        this.createResultPopups();

        this.attackButton.on("pointerover", () => {
            this.attackButton.setFillStyle(0xE2DEEE);
        });

        this.attackButton.on("pointerout", () => {
            this.attackButton.setFillStyle(0xFAF8FF);
        });

        this.attackButton.on("pointerdown", async () => {
            this.tweens.add({
                targets: [this.attackButton, this.attackText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 80,
                yoyo: true
            });
            
            if (this.isAttacking || this.correctPopup.visible || this.incorrectPopup.visible) {
                console.log("Attack is already in progress or a result popup is open.");
                return;
            }

            this.isAttacking = true;

            this.attackPopup.setVisible(true);
            this.popupOverlay.setVisible(true);

            this.drawingCanvas.clear();

            try {
                this.questionText.setText("Loading question...");
                const response = await fetch('http://localhost:3000/api/question/random');
                
                if (!response.ok) {
                    throw new Error(`Server status: ${response.status}`);
                }

                const questionData = await response.json();
                this.questionText.setText(questionData.question);
                this.currentAnswer = questionData.answer;
            } catch (err) {
                console.error("Failed to load question:", err);
                this.questionText.setText("Failed to load question.");
            }
        });
    }

    createResultPopups() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.correctPopup = this.add.container(0, 0);
        this.correctPopup.setDepth(3500);
        this.correctPopup.setVisible(false);

        const correctBg = this.add.rectangle(centerX, centerY, 400, 220, 0xE8F5E9)
            .setStrokeStyle(4, 0x2E7D32);

        const correctTitle = this.add.text(centerX, centerY - 50, "Correct!", {
            fontSize: "32px",
            color: "#2E7D32",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const correctMsg = this.add.text(centerX, centerY - 10, "Great job! Attack hit!", {
            fontSize: "20px",
            color: "#1B5E20"
        }).setOrigin(0.5);

        const correctCloseBtn = this.add.rectangle(centerX, centerY + 50, 120, 40, 0x2E7D32)
            .setInteractive({ useHandCursor: true });

        const correctCloseText = this.add.text(centerX, centerY + 50, "Close", {
            fontSize: "18px",
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        correctCloseBtn.on("pointerdown", () => {
            this.correctPopup.setVisible(false);
            this.popupOverlay.setVisible(false);

            this.enemy.takeDamage(20);
            this.time.delayedCall(1000, () => {
                this.enemy.enemyTurn(this.player);
            }, [], this);

            if (this.enemy.currentHealth <= 0) {
                this.endBattle();
            }
        });

        this.correctPopup.add([correctBg, correctTitle, correctMsg, correctCloseBtn, correctCloseText]);

        this.incorrectPopup = this.add.container(0, 0);
        this.incorrectPopup.setDepth(3500);
        this.incorrectPopup.setVisible(false);

        const incorrectBg = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2 - 30,
            this.scale.width * 0.8,
            this.scale.height * 0.8,
            0xFAF8FF
        );
        incorrectBg.setStrokeStyle(4, 0x444444);

        const incorrectTitle = this.add.text(centerX, centerY - 300, "Incorrect!", {
            fontSize: "32px",
            color: "#C62828",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.incorrectMsg = this.add.text(centerX, centerY - 100, "Analyzing your work...", {
            fontSize: "20px",
            color: "#161212",
            align: "left",
            wordWrap: { width: this.scale.width * 0.7 } // Keeps text inside the box
        }).setOrigin(0.5);

        const incorrectCloseBtn = this.add.rectangle(centerX - 550, centerY + 235, 120, 40, 0xC62828)
            .setInteractive({ useHandCursor: true });

        const incorrectCloseText = this.add.text(centerX - 550, centerY + 235, "Close", {
            fontSize: "18px",
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        incorrectCloseBtn.on("pointerdown", () => {
            this.incorrectPopup.setVisible(false);
            this.popupOverlay.setVisible(false);

            this.enemy.enemyTurn(this.player);
        });

        this.incorrectPopup.add([incorrectBg, incorrectTitle, this.incorrectMsg, incorrectCloseBtn, incorrectCloseText]);
    }

    update() {
    }

    processOCR = async () => {
        if (!this.drawingCanvas) {
            console.error("Drawing canvas not found!");
            return;
        }

        try {
            // Show loading state immediately in the popup
            this.incorrectMsg.setText("Analyzing your handwritten work...");

            const image = await new Promise((resolve) => {
                this.drawingCanvas.snapshot((snapshotImage) => {
                    resolve(snapshotImage);
                });
            });

            const fetchRes = await fetch(image.src);
            const blob = await fetchRes.blob();

            const formData = new FormData();
            formData.append('image', blob, 'drawing.png');
            formData.append('question', this.questionText.text);

            const response = await fetch('http://localhost:5000/ocr', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.error) {
                console.error("OCR Error:", result.error);
                this.incorrectMsg.setText("Could not analyze work. Please try again.");
            } else {
                console.log("OCR Response:", result);

                // Directly read the string values returned by Python
                const feedback = result.feedback || "No feedback generated.";
                const transcription = result.transcription || "N/A";
                const userEntered = this.answerInput.node.value;

                // Display only the feedback and transcription
                const message = `Feedback:\n${feedback}\n\nTranscription:\n${transcription}`;
                this.incorrectMsg.setText(message);
            }

        } catch (err) {
            console.error("Frontend Fetch Error:", err);
            this.incorrectMsg.setText("Error connecting to feedback server.");
        }
    };

    async checkAnswer() {
        const rawValue = this.answerInput.node.value.trim();
        
        if (rawValue === '') {
            console.log("Please enter an answer!");
            return;
        }

        const enteredValue = parseInt(rawValue, 10);

        this.attackPopup.setVisible(false);
        this.answerInput.node.value = '';

        console.log("Entered value:", enteredValue);
        console.log("Correct answer:", this.currentAnswer);

        if (!isNaN(enteredValue) && Number(enteredValue) === Number(this.currentAnswer)) {
            console.log("✅ Correct answer!");
            this.correct = true;
            this.correctPopup.setVisible(true);

        } else {
            console.log("❌ Incorrect answer!");
            this.correct = false;
            this.incorrectPopup.setVisible(true);

            await this.processOCR();
        }

        this.isAttacking = false;
    }

    endBattle() {
        // Reset flags for future battles
        this.isAttacking = false;
        
        // Wake up the Start scene and pass the defeat status
        this.scene.wake("Start", { enemyDefeated: true });
        
        // Stop or sleep the battle scene
        this.scene.stop("Battle");
    }
}