class GameField extends Phaser.Scene {
    constructor() {
        super("gameFieldScene");
    }

    init() {
        // variables and settings
        this.playerSpeed = 5.0, // Default: 5.0
        this.scale = 3.0, // Default: 3.0
        this.itemSpawnSpeed = 10000 // Default: 10000 (10 seconds)
        this.enemyX = 32;
        this.enemyY = 32;
        this.enemySpawnSpeed = 1000;
        this.enemySpawnCheck = true;
        this.wave = 1;
        this.waveSpeed = 60000;

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


        // Monster Spawn w/Groups:
        // Bat:
        my.sprite.batGroup = this.add.group({
            defaultKey: "item",
            maxSize: 100,
            health: 1
            }
        )
        my.sprite.batGroup.createMultiple({
            active: false,
            key: my.sprite.batGroup.defaultKey,
            repeat: my.sprite.batGroup.maxSize-1
        });
        
        // Skeleton:
        my.sprite.skeletonGroup = this.add.group({
            defaultKey: "item",
            maxSize: 100,
            health: 3
            }
        )
        my.sprite.skeletonGroup.createMultiple({
            active: false,
            key: my.sprite.skeletonGroup.defaultKey,
            repeat: my.sprite.skeletonGroup.maxSize-1
        });

        // Zombie:
        my.sprite.zombieGroup = this.add.group({
            defaultKey: "item",
            maxSize: 100,
            health: 5
            }
        )
        my.sprite.zombieGroup.createMultiple({
            active: false,
            key: my.sprite.zombieGroup.defaultKey,
            repeat: my.sprite.zombieGroup.maxSize-1
        });

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

        // Timer that changes wave count
        this.waveTimer = this.time.addEvent({
            delay: this.waveSpeed, // 60000 = 60 seconds
            callback: () => {
                this.wave++;
            },
            callbackScope: this,
            loop: true // Repeat
        });

        // Timer that regulates enemy spawning
        this.enemySpawnTimer = this.time.addEvent({
            delay: this.enemySpawnSpeed, // 1000 = 1 second
            callback: () => {
                do {
                    this.enemyX = Math.floor(Math.random() * (this.map.widthInPixels*this.scale));
                }
                while (this.enemyX > (my.sprite.player.x - 720) && this.enemyX < (my.sprite.player.x + 720));
                do {
                    this.enemyY = Math.floor(Math.random() * (this.map.heightInPixels*this.scale));
                }
                while (this.enemyY > (my.sprite.player.y - 450) && this.enemyY < (my.sprite.player.y + 450));
                this.enemySpawnCheck = true;
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
            if (my.sprite.player.x < (1920+my.sprite.player.displayWidth/2)) {
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
            if (my.sprite.player.y < (1920+my.sprite.player.displayHeight/2)) {
                my.sprite.player.y += this.playerSpeed;
            }
            my.sprite.player.anims.play('walk', true);
        } 
        
        if(cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
            my.sprite.player.anims.play('idle');
        }
        
        // Enemy spawning
        if ((this.wave % 3) == 0) {
            if (this.enemySpawnCheck == true) {
                let zombie = my.sprite.zombieGroup.getFirstDead();
                if (zombie != null) {
                    zombie.active = true;
                    zombie.visible = true;
                    zombie.x = this.enemyX;
                    zombie.y = this.enemyY;
                    this.enemySpawnCheck = false;
                }
            }
        } 
        else if ((this.wave % 2) == 0) {
            if (this.enemySpawnCheck == true) {
                let skeleton = my.sprite.skeletonGroup.getFirstDead();
                if (skeleton != null) {
                    skeleton.active = true;
                    skeleton.visible = true;
                    skeleton.x = this.enemyX;
                    skeleton.y = this.enemyY;
                    this.enemySpawnCheck = false;
                }
            }
        }
        else {
            if (this.enemySpawnCheck == true) {
                let bat = my.sprite.batGroup.getFirstDead();
                if (bat != null) {
                    bat.active = true;
                    bat.visible = true;
                    bat.x = this.enemyX;
                    bat.y = this.enemyY;
                    this.enemySpawnCheck = false;
                }
            }
        }

        // Check for dead enemies + Movement
        for (let bat of my.sprite.batGroup.getChildren()) {
            if (bat.health <= 0) {
                bat.health = 1;
                bat.active = false;
                bat.visible = false;
            }
            if (bat.active == true) {
                if (bat.x < my.sprite.player.x) {
                    bat.x++;
                }
                else {bat.x--;}
                if (bat.y < my.sprite.player.y) {
                    bat.y++;
                }
                else {bat.y--;}
            }
        }
        for (let skeleton of my.sprite.skeletonGroup.getChildren()) {
            if (skeleton.health <= 0) {
                skeleton.health = 3;
                skeleton.active = false;
                skeleton.visible = false;
            }
            if (skeleton.active == true) {
                if (skeleton.x < my.sprite.player.x) {
                    skeleton.x++;
                }
                else {skeleton.x--;}
                if (skeleton.y < my.sprite.player.y) {
                    skeleton.y++;
                }
                else {skeleton.y--;}
            }
        }
        for (let zombie of my.sprite.zombieGroup.getChildren()) {
            if (zombie.health <= 0) {
                zombie.health = 5;
                zombie.active = false;
                zombie.visible = false;
            }
            if (zombie.active == true) {
                if (zombie.x < my.sprite.player.x) {
                    zombie.x++;
                }
                else {zombie.x--;}
                if (zombie.y < my.sprite.player.y) {
                    zombie.y++;
                }
                else {zombie.y--;}
            }
        }

    }
}