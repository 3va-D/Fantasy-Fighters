export class PlayerBattle extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, health) {
        super(scene, x, y, 'player');

        scene.add.existing(this);

        this.createAnimations(scene);

        this.setScale(0.5); 

        // Track Health
        this.maxHealth = health;
        this.currentHealth = health;

        // Create Health Bar Graphics
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    updateHealthBar() {
        this.healthBar.clear();

        const width = 80;
        const height = 10;
        // Position the bar centered horizontally under the sprite
        const barX = this.x - width / 2;
        const barY = this.y + (this.displayHeight / 2) + 10;

        // Background / Border (Red or Dark)
        this.healthBar.fillStyle(0xd9534f, 1);
        this.healthBar.fillRect(barX, barY, width, height);

        // Foreground (Green percentage bar)
        const healthPercentage = Math.max(0, this.currentHealth / this.maxHealth);
        this.healthBar.fillStyle(0x5cb85c, 1);
        this.healthBar.fillRect(barX, barY, width * healthPercentage, height);
    }

    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.updateHealthBar();
        
        this.flashRed();
    }

    flashRed() {
        let flashes = 0;

        const flashTimer = this.scene.time.addEvent({
            delay: 100, // Speed of each flash step in milliseconds
            repeat: 3,  // 4 steps total = 2 red flashes (Red -> Normal -> Red -> Normal)
            callback: () => {
                if (flashes % 2 === 0) {
                    this.setTint(0xff0000); // Tint red
                } else {
                    this.clearTint(); // Reset color
                }
                flashes++;
            }
        });
    }

    // Keep the health bar attached to the sprite during movement tweens
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.healthBar) {
            this.updateHealthBar();
        }
    }

    destroy(fromScene) {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy(fromScene);
    }

    createAnimations(scene) {

        scene.anims.create({
            key: 'battle-walking',
            frames: scene.anims.generateFrameNumbers('player', { start: 5, end: 12 }),
            frameRate: 10,
            repeat: -1
        });
        scene.anims.create({
            key: 'battle-idle',
            frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
    }

    update() {
       
    }
}
