class TitleScreen extends Phaser.Scene {
    constructor() {
        super("titleScreenScene");
    }

    init() {
        // variables and settings
        this.scale = 3.0; // Default: 3.0
    }

    create() {
        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 80 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("gameFieldMap", 16, 16, 80, 20);
        this.physics.world.setBounds(0,0, 80*16*3 , 20*16*3);

        // Add a tileset to the map, map made in Tiled
        this.tileset = this.map.addTilesetImage("dungeon_tileset_packed", "dungeon_tilesetmap_packed");

        // Create two layers: Ground and Collideable
        this.groundLayer = this.map.createLayer("Ground_Layer", this.tileset, 0, 0);
        this.groundLayer.setScale(this.scale);
        this.collideableLayer = this.map.createLayer("Collideable_Layer", this.tileset, 0, 0);
        this.collideableLayer.setScale(this.scale);

        // Text
        this.spirit = this.add.text(720, 150, 'Spirit',
            {
                fontFamily: 'Brush Script MT, cursive'
            }
        ).setOrigin(0.5).setScale(this.scale);
        this.spirit.y += 100;
        this.spirit.x -= 50;

        this.slasher = this.add.text(720, 150, 'Slasher',
            { 
               fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(4);
        this.slasher.y += 150;

        this.start = this.add.text(770, 610, 'Press Enter to Start',
            {
                fontFamily: 'Georgia, serif'
            }
        ).setOrigin(0.5).setScale(this.scale);

        // Decoration + Select
        this.gem = this.add.sprite(590, 285, "Crystal", "crystal.png").setScale(5);
        this.chest = this.add.sprite(860, 280, "treasure", "treasure.png").setScale(2);
        this.skelet = this.add.sprite(745, 253, "Skeleton", "monster_skelet.png").setScale(2);
        this.selectBat = this.add.sprite(525, 620, "Bat", "monster_bat.png").setScale(2);

        // Enter key input
        this.ent = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (this.ent.isDown) {
            this.selectBat.visible = false;
            this.sound.play("SelectSFX", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            this.startTimer = this.time.addEvent({
                delay: 1000, // 1000 = 1 second
                callback: () => {
                    this.scene.start("gameFieldScene");
                },
                callbackScope: this,
                loop: false
            });
        }

    }
}