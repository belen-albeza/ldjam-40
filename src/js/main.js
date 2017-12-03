'use strict';

var PlayScene = require('./play-scene.js');
var TitleScene = require('./title-scene.js');
const utils = require('./utils.js');


var BootScene = {
    init: function () {
        // NOTE: change this to suit your preferred scale mode.
        //       see http://phaser.io/docs/2.6.2/Phaser.ScaleManager.html
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
    },
    preload: function () {
        // load here assets required for the loading screen
        this.game.cache.addBitmapData('background',
            utils.makeImage(this.game,
                        this.game.world.width,
                        this.game.world.height,
                        '#efedef'));
        this.game.cache.addBitmapData('preloader_bar',
            utils.makeImage(this.game, this.game.world.width, 8, '#0d1321'));
    },

    create: function () {
        this.game.state.start('preloader');
    }
};


var PreloaderScene = {
    preload: function () {
        this.game.add.image(0, 0, this.game.cache.getBitmapData('background'));
        this.loadingBar = this.game.add.sprite(0, 240,
            this.game.cache.getBitmapData('preloader_bar'));
        this.loadingBar.anchor.setTo(0, 0.5);
        this.load.setPreloadSprite(this.loadingBar);

        this.game.add.text(8, 256, 'LOADING…', {
            font: 'Helvetica, Arial, sans-serif',
            fontSize: '32px',
            fontWeight: 'bold',
            fill: '#0d1321'
        });

        // generate procedural assets

        this.game.cache.addBitmapData('walker',
            utils.makeImage(this.game, 48, 48, '#966b9d'));
        this.game.cache.addBitmapData('ghost',
            utils.makeImageCircle(this.game, 48, '#966b9d'));
        this.game.cache.addBitmapData('pickup',
            utils.makeImageCircle(this.game, 16, '#b8336a'));
        this.game.cache.addBitmapData('pickup-icon',
            utils.makeImageCircle(this.game, 24, '#fff'));
        this.game.cache.addBitmapData('chara',
            utils.makeImage(this.game, 32, 32, '#0d1321'));

        //
        // game assets
        //

        // json levels
        this.game.load.json('level:1', 'data/level01.json');
        this.game.load.json('level:2', 'data/level02.json');
        this.game.load.json('level:3', 'data/level03.json');
        this.game.load.json('level:4', 'data/level04.json');
        this.game.load.json('level:5', 'data/level05.json');
        this.game.load.json('level:6', 'data/level06.json');

        // sfx
        this.game.load.audio('sfx:pickup', 'audio/pickup.wav');
        this.game.load.audio('sfx:jump', 'audio/jump.wav');
        this.game.load.audio('sfx:reload', 'audio/tremolo.wav');
        this.game.load.audio('sfx:death', 'audio/hurt.wav');
        this.game.load.audio('sfx:win', 'audio/win.wav');
        // bgm
        this.game.load.audio('bgm:main', ['audio/bgm.ogg', 'audio/bgm.mp3']);
    },

    create: function () {
        this.game.state.start('title');
        // this.game.state.start('play', true, false, 5); // start at level 1
    }
};


window.onload = function () {
    var game = new Phaser.Game(960, 600, Phaser.AUTO);

    game.state.add('boot', BootScene);
    game.state.add('preloader', PreloaderScene);
    game.state.add('title', TitleScene);
    game.state.add('play', PlayScene);

    game.state.start('boot');
};
