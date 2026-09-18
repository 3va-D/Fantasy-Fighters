export class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, health) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.5);

        this.createAnimations(scene);

        this.play('enemy-idle');

        if (health !== 'none') {
            // Track Health
            this.maxHealth = health;
            this.currentHealth = health;

            // Create Health Bar Graphics
            this.healthBar = scene.add.graphics();
            this.updateHealthBar();
        }
    }

    updateHealthBar() {
        this.healthBar.clear();

        const width = 80;
        const height = 10;
        const barX = this.x - width / 2;
        const barY = this.y + (this.displayHeight / 2) + 10;

        // Red Background
        this.healthBar.fillStyle(0xd9534f, 1);
        this.healthBar.fillRect(barX, barY, width, height);

        // Green Remaining Health Bar
        const healthPercentage = Math.max(0, this.currentHealth / this.maxHealth);
        this.healthBar.fillStyle(0x5cb85c, 1);
        this.healthBar.fillRect(barX, barY, width * healthPercentage, height);
    }

    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.updateHealthBar();
        this.flashRed();
    }

    enemyTurn(player) {
        const damage = Phaser.Math.Between(5, 15);
        player.takeDamage(damage);
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

    update() {

    }

    createAnimations(scene) {
        if (!scene.anims.exists('enemy-idle')) {

            scene.anims.create({
                key: 'enemy-walking',
                frames: scene.anims.generateFrameNumbers('enemy', { start: 5, end: 12 }),
                frameRate: 10,
                repeat: -1
            });
            scene.anims.create({
                key: 'enemy-idle',
                frames: scene.anims.generateFrameNumbers('enemy', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            });
        }
    }

}