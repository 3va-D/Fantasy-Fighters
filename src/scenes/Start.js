import { Player } from './sprites/player.js';
import { Enemy } from './sprites/enemy.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
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

        this.enemy = new Enemy(this, 500, 1050);

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    update() {

        if (this.player) {
            this.player.update();
        }

        if (this.enemy) {
            this.enemy.update();
        }

        this.player.setDepth(this.player.y);
        this.enemy.setDepth(this.enemy.y);

        if (!this.battleStarted) {

            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.enemy.x,
                this.enemy.y
            );

            if (distance < 200) {
                this.battleStarted = true;
                this.scene.start("Battle");
                this.scene.launch("Battle", {
                    enemy: this.enemy
                });
            }
        }
    }
    
}
