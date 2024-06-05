class GameField extends Phaser.Scene {
    constructor() {
        super("gameFieldScene");
    }

    init() {
        // variables and settings
        this.playerSpeed = 5.0, // Default: 5.0
        this.scale = 3.0, // Default: 3.0
        this.itemSpawnSpeed = 10000 // Default: 10000 (10 seconds)

        // Item names
        this.items = ["Gun"];
    }

    create() {
        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 29 tiles wide and 259 tiles tall.
        this.map = this.add.tilemap("gameFieldMap", 16, 16, 40, 20);

        // Add a tileset to the map, map made in Tiled
        this.tileset = this.map.addTilesetImage("dungeon_tileset_packed", "dungeon_tilesetmap_packed");

        // Create two layers: Ground, Collideable
        this.groundLayer = this.map.createLayer("Ground_Layer", this.tileset, 0, 0);
        this.groundLayer.setScale(this.scale);
        this.collideableLayer = this.map.createLayer("Collideable_Layer", this.tileset, 0, 0);
        this.collideableLayer.setScale(this.scale);

        // Make the Collideable_Layer have the collides property
        this.collideableLayer.setCollisionByProperty({
            collides: true
        });

        // Set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        my.sprite.enemy = [];

        for (let i = 0; i<10; i++) {
            let enemyX = Math.floor(Math.random() * this.map.widthInPixels*3);
            let enemyY = Math.floor(Math.random() * this.map.heightInPixels*3);
            //if ((enemyX < my.sprite.player.x-game.config.width/2 || enemyX > my.sprite.player.x-game.config.width/2) &&
            // (enemyY < my.sprite.player.y-game.config.height/2 || enemyY > my.sprite.player.y+game.config.height/2)) {
                my.sprite.enemy.push(this.add.sprite(enemyX, enemyY, "platformer_characters", "tile_0000.png").setScale(this.scale));
            //}
        }

        // Make player avatar collide with collideable layer
        this.physics.add.collider(my.sprite.player, this.collideableLayer);

        // Set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // Set up camera for the screen
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*3, this.map.heightInPixels*3);
        //this.cameras.main.setBounds(0, 0, 10000, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        /* debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this); */

        
        // Finished: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        // Add animation for fire
        // this.fire = this.map.createFromObjects("Objects", {
        //     name: "fireTop",
        //     key: "dungeon_tilesetmap_packed"
        // });

        // this.anims.create({
        //     key: "fireAnimation",
        //     frames: [
        //         { key: "dungeon_tilesetmap_packed", frame: 151 },
        //         { key: "dungeon_tilesetmap_packed", frame: 152 }
        //     ],
        //     frameRate: 5,
        //     repeat: -1 // Infinitely
        // });

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.

        // Inventory system that keeps track of what items the player has, and how many
        this.playerInventory = {};

        // Timer that periodically spawns an Item
        this.spawnTimer = this.time.addEvent({
            delay: this.itemSpawnSpeed, // Default is 10000 = 10 seconds
            callback: () => {
                // Randomly generate position for the item within the game world
                const x = Phaser.Math.RND.between(0, this.game.config.width);
                const y = Phaser.Math.RND.between(0, this.game.config.height);

                // Randomly select an item from the this.items array
                const itemName = this.items[Phaser.Math.RND.between(0, this.items.length - 1)];
                const item = this.physics.add.sprite(x, y, itemName);
                
                // Player collects item when touching the item
                item.setCollideWorldBounds(true);
                if (my.sprite.player) {
                    this.physics.add.overlap(my.sprite.player, item, () => {
                        item.destroy();
                        if (!this.playerInventory[itemName]) {
                            this.playerInventory[itemName] = 0;
                        }
                        this.playerInventory[itemName]++;

                        console.log("Item collected! Inventory:", this.playerInventory);
                    });
                } else {
                    console.error("Player or item is undefined.");
                }
            },
            callbackScope: this,
            loop: true // Repeat
        });
    }

    update() {
        if(cursors.left.isDown) {
            // TODO: have the player accelerate to the left
            if (my.sprite.player.x > (my.sprite.player.displayWidth/2)) {
                my.sprite.player.x -= this.playerSpeed;
            }

            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } 
        
        if(cursors.right.isDown) {
            // TODO: have the player accelerate to the right
            if (my.sprite.player.x < (1440+my.sprite.player.displayWidth/2)) {
                my.sprite.player.x += this.playerSpeed;
            }

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } 
        
        if(cursors.up.isDown) {
            // TODO: have the player accelerate to the right
            if (my.sprite.player.y > (my.sprite.player.displayHeight/2)) {
                my.sprite.player.y -= this.playerSpeed;
            }

            my.sprite.player.anims.play('walk', true);

        
        } 
        
        if(cursors.down.isDown) {
            // TODO: have the player accelerate to the right
            if (my.sprite.player.y < (1440+my.sprite.player.displayHeight/2)) {
                my.sprite.player.y += this.playerSpeed;
            }

            my.sprite.player.anims.play('walk', true);
        
        } 
        
        if(cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
            my.sprite.player.anims.play('idle');
        }

        

    }
}