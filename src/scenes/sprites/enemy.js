export class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.5);

        this.createAnimations(scene);

        this.play('enemy-idle');
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