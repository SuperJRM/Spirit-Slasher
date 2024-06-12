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
        this.load.image("money", "money.png");
        this.load.spritesheet("crystal", "weapon_crystal.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("fireworks", "weapon_fireworks.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("rift", "weapon_rift.png", {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
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