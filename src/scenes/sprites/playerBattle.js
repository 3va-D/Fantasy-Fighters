export class PlayerBattle extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);

        this.createAnimations(scene);

        this.setScale(0.5); 
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
