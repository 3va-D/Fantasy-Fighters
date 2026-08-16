export class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.speed = 160;

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.createAnimations(scene);

        this.canMove = true;

        this.setScale(0.5); 
    }

    createAnimations(scene) {

        if (!scene.anims.exists('idle')) {

            scene.anims.create({
                key: 'walking',
                frames: scene.anims.generateFrameNumbers('player', { start: 5, end: 12 }),
                frameRate: 10,
                repeat: -1
            });
            scene.anims.create({
                key: 'idle',
                frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            });
        }
    }

    update() {
        this.setVelocity(0);
        let moving = false;

        // 1. Handle Horizontal Movement Inputs
        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.anims.play('walking', true);
            this.setFlipX(false);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.anims.play('walking', true);
            this.setFlipX(true);
            moving = true;
        }

        // 2. Handle Vertical Movement Inputs
        if (this.cursors.up.isDown) {
            this.setVelocityY(-this.speed);
            if (!moving) this.anims.play('walking', true);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.setVelocityY(this.speed);
            if (!moving) this.anims.play('walking', true);
            moving = true;
        }

        // 3. Normalize diagonal velocity FIRST
        this.body.velocity.normalize().scale(moving ? this.speed : 0);

        // 4. Handle the Idle Animation LAST (and add ', true' to let it loop)
        if (!moving) {
            this.anims.play('idle', true);
        }

        if (!this.canMove) {
            this.setVelocity(0);
            return;
        }
    }
}
