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
        this.load.image("Sunshine", "sunshine.png");
        this.load.image("Crystal", "crystal.png");
        this.load.image("Rift", "rift.png");

        // Load enemy images (Credit: 0x72)
        this.load.image("Bat", "monster_bat.png");
        this.load.image("Skeleton", "monster_skelet.png");
        this.load.image("Zombie", "monster_zombie_green.png");

        // Load item animations (Credit: Tyler)
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
        this.load.spritesheet("sunshine_animation", "item_sunshine.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Load Audio (Credit: Kenney's)
        this.load.audio("CrystalSFX", "CrystalSFX.ogg");
        this.load.audio("HealSFX", "HealSFX.ogg");
        this.load.audio("DeadSFX", "DeadSFX.ogg");
        this.load.audio("DMGSFX", "DMGSFX.ogg");
        this.load.audio("FireworkSFX", "FireworkSFX.ogg");
        this.load.audio("RiftSFX", "RiftSFX.ogg");
        this.load.audio("ItemSFX", "ItemSFX.ogg");
        this.load.audio("SelectSFX", "SelectSFX.ogg");
        this.load.audio("PointSFX", "PointSFX.ogg");
    }

    create() {
        // Define animations for items
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
            key: 'sunshine_animation',
            frames: this.anims.generateFrameNumbers('sunshine_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Create animations for player movement
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

        // Enter Title Screen Scene
        this.scene.start("titleScreenScene")
    }

    // New scene is started in create()
    update() {
    }
}