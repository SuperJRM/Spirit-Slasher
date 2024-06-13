class EndScreen extends Phaser.Scene {
    constructor() {
        super("endScreenScene");
    }

    init() {
        // variables and settings
        this.scale = 3.0; // Default: 3.0
    }

    create() {
        /* Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 80 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("gameFieldMap", 16, 16, 80, 20);
        this.physics.world.setBounds(0,0, 80*16*3 , 20*16*3);

        // Add a tileset to the map, map made in Tiled
        this.tileset = this.map.addTilesetImage("dungeon_tileset_packed", "dungeon_tilesetmap_packed");

        // Create two layers: Ground and Collideable
        this.groundLayer = this.map.createLayer("Ground_Layer", this.tileset, 0, 0);
        this.groundLayer.setScale(this.scale);
        this.collideableLayer = this.map.createLayer("Collideable_Layer", this.tileset, 0, 0);
        this.collideableLayer.setScale(this.scale);*/

        // Text
        this.ending = this.add.text(720, 150, 'GAME OVER',
            { 
               fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(4).setTint(0xCD001A);
        this.ending.y += 150;

        this.retry = this.add.text(740, 610, 'Try Again?',
            {
                fontFamily: 'Georgia, serif'
            }
        ).setOrigin(0.5).setScale(this.scale);

        this.credits = this.add.text(740, 725, 'Credits:',
            { 
                fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(2).setTint(0xCD001A);
        this.credits1 = this.add.text(740, 775, 'Kenny for health icons, player sprites and animation, and SFX',
            { 
                fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(2).setTint(0xCD001A);
        this.credits2 = this.add.text(740, 800, 'Tyler Torrella for item sprites and animation',
            { 
                fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(2).setTint(0xCD001A);
        this.credits3 = this.add.text(740, 825, '0x72 for enemies & background sprites',
            { 
                fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(2).setTint(0xCD001A);
        this.credits3 = this.add.text(740, 850, 'Game made by Tyler Torrella and Jason Rangel-Martinez',
            { 
                fontFamily: 'Garamond, serif' 
            }
        ).setOrigin(0.5).setScale(2).setTint(0xCD001A);

        // Select
        this.selectBat = this.add.sprite(570, 620, "Bat", "monster_bat.png").setScale(2);

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