class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("dungeon_tilesetmap_packed", "dungeon_tilesetmap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("gameFieldMap", "gameFieldMap.tmj");   // Tilemap in JSON

        // Load health images (Credit: Kenny's)
        this.load.image("heart", "heart.png");
        this.load.image("heartEmpty", "heartEmpty.png");

        // Load item images (Credit: Tyler)
        this.load.image("treasure", "treasure.png");
        this.load.image("Fireworks", "fireworks.png");
        this.load.image("Health", "health.png");
        this.load.image("Crystal", "crystal.png");
        this.load.image("Rift", "rift.png");
        this.load.spritesheet("crystal_animation", "weapon_crystal.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("fireworks_animation", "weapon_fireworks.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("rift_animation", "weapon_rift.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("health_animation", "item_health.png", {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        // Define animations for Fireworks
        this.anims.create({
            key: 'fireworks_animation',
            frames: this.anims.generateFrameNumbers('fireworks_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'crystal_animation',
            frames: this.anims.generateFrameNumbers('crystal_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'rift_animation',
            frames: this.anims.generateFrameNumbers('rift_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'health_animation',
            frames: this.anims.generateFrameNumbers('health_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("gameFieldScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}