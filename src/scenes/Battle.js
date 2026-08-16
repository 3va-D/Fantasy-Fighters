import { PlayerBattle } from './sprites/playerBattle.js';
import { Enemy } from './sprites/enemy.js';

export class Battle extends Phaser.Scene {

    constructor() {
        super("Battle");
        this.currentAnswer = null; // Store answer for validation
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

        this.player = new PlayerBattle(this, -200, 300);
        this.enemy = new Enemy(this, 1536, 300);

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

        // ===== Popup Setup =====
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

        // Created as scene instance variable to update text dynamically
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

        const drawingCanvas = this.add.renderTexture(
            this.scale.width / 2,
            this.scale.height / 2 + 20, 
            canvasWidth,
            canvasHeight
        ).setOrigin(0.5);

        drawingCanvas.fill(0xffffff, 1);
        drawingCanvas.setInteractive();

        drawingCanvas.on('pointerdown', (pointer) => {
            this.isDrawing = true;
            this.lastX = pointer.x - (drawingCanvas.x - drawingCanvas.width * drawingCanvas.originX);
            this.lastY = pointer.y - (drawingCanvas.y - drawingCanvas.height * drawingCanvas.originY);
            this.drawAtPointer(drawingCanvas, pointer, true);
        });

        drawingCanvas.on('pointermove', (pointer) => {
            if (this.isDrawing) {
                this.drawAtPointer(drawingCanvas, pointer, false);
            }
        });

        this.input.on('pointerup', () => {
            this.isDrawing = false;
        });

        this.drawAtPointer = (canvas, pointer, isFirstPoint) => {
            const localX = pointer.x - (canvas.x - canvas.width * canvas.originX);
            const localY = pointer.y - (canvas.y - canvas.height * canvas.originY);

            const brush = this.make.graphics({ x: 0, y: 0, add: false });
            brush.lineStyle(4, 0x000000, 1);
            brush.fillStyle(0x000000, 1);

            if (isFirstPoint) {
                brush.fillCircle(localX, localY, 4);
            } else {
                brush.beginPath();
                brush.moveTo(this.lastX, this.lastY);
                brush.lineTo(localX, localY);
                brush.strokePath();
                brush.fillCircle(localX, localY, 2);
            }

            canvas.draw(brush);
            brush.destroy();

            this.lastX = localX;
            this.lastY = localY;
        };

        const clearButton = this.add.text(this.scale.width / 2, this.scale.height - 128, "Clear Canvas", {
            fontSize: "20px",
            color: "#FF0000",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        clearButton.on('pointerdown', () => {
            drawingCanvas.clear();
            drawingCanvas.fill(0xffffff, 1);
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

        this.attackPopup.add([
            popup,
            this.questionText,
            drawingCanvas,
            clearButton
        ]);

        // ===== Attack Button Listeners =====
        this.attackButton.on("pointerover", () => {
            this.attackButton.setFillStyle(0xE2DEEE);
        });

        this.attackButton.on("pointerout", () => {
            this.attackButton.setFillStyle(0xFAF8FF);
        });

        // Trigger fetch request on attack click
        this.attackButton.on("pointerdown", async () => {
            this.tweens.add({
                targets: [this.attackButton, this.attackText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 80,
                yoyo: true
            });

            // Display popup and overlay
            this.attackPopup.setVisible(true);
            this.popupOverlay.setVisible(true);

            // Fetch question from backend API
            try {
                this.questionText.setText("Loading question...");
                const response = await fetch('http://localhost:3000/api/question/random');
                
                if (!response.ok) {
                    throw new Error(`Server status: ${response.status}`);
                }

                const questionData = await response.json();

                // Update text and save answer
                this.questionText.setText(questionData.question);
                this.currentAnswer = questionData.answer;
            } catch (err) {
                console.error("Failed to load question:", err);
                this.questionText.setText("Failed to load question.");
            }
        });

        // Create HTML input element
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

        // Prevent key presses from triggering Phaser game shortcuts
        inputElement.addEventListener('keydown', (e) => e.stopPropagation());

        // Sanitize input to strip out non-digit characters ('e', '.', '-', etc.)
        inputElement.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // Convert into a Phaser DOM GameObject and position it inside the popup
        this.answerInput = this.add.dom(
            (this.scale.width / 2),
            this.scale.height / 2 + 100,
            inputElement
        );

        // Add to your popup container
        this.attackPopup.add(this.answerInput);
    }

    update() {
        const enteredValue = parseInt(this.answerInput.node.value, 10);

        if (!isNaN(enteredValue) && enteredValue === this.currentAnswer) {
            console.log("Correct answer!");
        } else {
            console.log("Incorrect answer!");
        }
    }
}