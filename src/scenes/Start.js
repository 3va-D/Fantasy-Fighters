import { Player } from './sprites/player.js';
import { Enemy } from './sprites/enemy.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    init(data) {
        // Track if the enemy was defeated in a previous run
        this.enemyDefeated = data.enemyDefeated || false;
    }

    preload() {
        this.load.image('background', 'assets/backgrounds/startingBackground.png');

        this.load.spritesheet('player', 'assets/spriteSheets/characters/Character_Skin_White.png', { 
            frameWidth: 500, 
            frameHeight: 500 
        });

        this.load.spritesheet(
            'enemy',
            'assets/spriteSheets/Alpha-Wolf_Form1.png',
            {
                frameWidth: 400,
                frameHeight: 400
            }
        );
    }

    create() {
        const worldWidth = 2000;
        const worldHeight = 2000;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.bg.setDisplaySize(worldWidth, worldHeight);

        this.player = new Player(this, worldWidth / 2, worldHeight / 2);

        // Only create the enemy if it hasn't been defeated yet
        if (!this.enemyDefeated) {
            this.enemy = new Enemy(this, 500, 1050, 'none');
        }

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Listen for when this scene resumes from the Battle scene
        this.events.on('wake', (sys, data) => {
            if (data && data.enemyDefeated && this.enemy) {
                this.enemy.destroy();
                this.enemy = null;
                this.enemyDefeated = true;
            }
        });
    }

    update() {
        if (this.player) {
            this.player.update();
            this.player.setDepth(this.player.y);
        }

        if (this.enemy) {
            this.enemy.update();
            this.enemy.setDepth(this.enemy.y);
        }

        // Check distance only if the enemy exists
        if (!this.battleStarted && this.enemy) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.enemy.x,
                this.enemy.y
            );

            if (distance < 200) {
                this.battleStarted = true;
                // Switch sleeps 'Start' and launches 'Battle' while keeping player position saved
                this.scene.switch("Battle");
            }
        }
    }
}