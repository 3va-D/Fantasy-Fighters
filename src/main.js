import { Start } from './scenes/Start.js';
import { Battle } from "./scenes/Battle.js";

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [ Start, Battle],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE, 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true // Required for DOM input elements
    }
}

new Phaser.Game(config);