class GameField extends Phaser.Scene {
    constructor() {
        super("gameFieldScene");
    }

    init() {
        // variables and settings
        this.playerSpeed = 5.0, // Default: 5.0
        this.scale = 3.0, // Default: 3.0
        this.itemSpawnSpeed = 1000 // Default: 10000 (10 seconds)
        this.health = 3;
        this.maxHealth = 3;
        this.enemyX = 32;
        this.enemyY = 32;
        this.enemySpawnSpeed = 1000;
        this.enemySpawnCheck = true;
        this.wave = 1;
        this.waveSpeed = 60000;
        this.maxMonsters = 100;
        this.maxBullets = 120;

        // Item names
        this.items = ["Gun", "Fireworks"];
    }

    create() {
        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 80 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("gameFieldMap", 16, 16, 80, 20);

        // Add a tileset to the map, map made in Tiled
        this.tileset = this.map.addTilesetImage("dungeon_tileset_packed", "dungeon_tilesetmap_packed");

        // Create two layers: Ground and Collideable
        // Collideable only layer with physics
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
        my.sprite.bullet = [];
        my.sprite.bats = [];
        my.sprite.skeletons = [];
        my.sprite.zombies = [];
        my.sprite.monster = [my.sprite.bats, my.sprite.skeletons, my.sprite.zombies];

        /* Set up bullets
        for (let i=0; i < this.maxBullets; i++) {
            // create a sprite which is offscreen and invisible
            my.sprite.bullet.push(this.add.sprite(-100, -100, "heartEmpty"));
            my.sprite.bullet[i].visible = false;
            my.sprite.bullet[i].active = false;
        }*/

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

        // Gun Item
        // Weapon: Shoot a projectile in the direction the player is facing every 3 seconds.
        // Each projectile deals 1 damage and pierces through enemies.
        // Consecutive pickups make this deal 1 more damage and makes faster bullets.
        this.gunTimer = this.time.addEvent({
            delay: 3000, // Default is 3000 = 3 seconds
            callback: () => {
                let gunCount = this.playerInventory["Gun"]; // Copies of Item

                if (this.playerInventory.hasOwnProperty("Gun")) { // Check if Item is owned
                    //const projectile = this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y, "heartEmpty");
                    if (my.sprite.bullet.length < this.maxBullets) {
                        my.sprite.bullet.push(this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "heartEmpty"));
                    }
                    let bullet = my.sprite.bullet[my.sprite.bullet.length-1];
                    bullet.setVelocity(200 + ((gunCount - 1) * 50), 0);
                    /*this.physics.add.overlap(bullet, [my.sprite.batGroup, my.sprite.skeletonGroup, my.sprite.zombieGroup], (bullet, enemy) => {
                        enemy.health -= 1;
                        bullet.destroy();
                    });*/
                }
            },
            callbackScope: this,
            loop: true // Repeat
        });

        // Fireworks Item
        // Weapon: Shoot 6 projectiles all around the player once every 6 seconds.
        // Each projectile deals 1 damage.
        // Consecutive pickups add extra shots.
        this.fireworksTimer = this.time.addEvent({
            delay: 6000, // Default is 6000 = 6 seconds
            callback: () => {
                let fireworksCount = this.playerInventory["Fireworks"]; // Copies of Item
                const projectileCount = 6 + ((fireworksCount - 1) * 3);
                const angleCount = (2 * Math.PI) / projectileCount;

                if (this.playerInventory.hasOwnProperty("Fireworks")) { // Check if Item is owned
                    for (let i = 0; i < projectileCount; i++) {
                        const angle = i * angleCount;
                        const velocityX = Math.cos(angle) * 200;
                        const velocityY = Math.sin(angle) * 200;

                        //const projectile = this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y, "heartEmpty");
                        if (my.sprite.bullet.length < this.maxBullets) {
                            my.sprite.bullet.push(this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "heartEmpty"));
                        }
                        let bullet = my.sprite.bullet[my.sprite.bullet.length-1];
                        bullet.setVelocity(velocityX, velocityY);
                    }
                        // this.physics.add.overlap(projectile, my.sprite.skeletonGroup, (projectile, enemy) => {
                        //     enemy.health -= 1;
                        //     if (enemy.health <= 0) {
                        //         enemy.destroy();
                        //     }
                        //     projectile.destroy();
                        // });
                }
            },
            callbackScope: this,
            loop: true // Repeat
        });

        // Shotgun Item
        // Weapon: Shoots 4 bullets in a cone occasionally.
        // Each projectile deals 1 damage and pierces through enemies.
        // Consecutive pickups make this deal 1 more damage and makes bullets faster.
        this.shotgunTimer = this.time.addEvent({
            delay: 5000, // Delay for occasional shooting, adjust as needed
            callback: () => {
                let shotgunCount = this.playerInventory["Shotgun"]; // Copies of Item

                if (this.playerInventory.hasOwnProperty("Shotgun")) { // Check if Item is owned
                    // Calculate angle for cone spread (in radians)
                    const coneSpread = Phaser.Math.DegToRad(30); // Adjust cone spread as needed
                    const playerX = my.sprite.player.x;
                    const playerY = my.sprite.player.y;

                    // for (let i = 0; i < 4; i++) {

                        // const bullet = this.physics.add.sprite(playerX, playerY, "heartEmpty");
                        // bullet.setVelocity(velocityX, velocityY);
                        // this.physics.add.overlap(bullet, [my.sprite.batGroup, my.sprite.skeletonGroup, my.sprite.zombieGroup], (bullet, enemy) => {
                            //For later
                        // });
                    // }
                }
            },
            callbackScope: this,
            loop: true // Repeat occasionally
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

        // Creates initial health bar
        for (let i = 0; i < this.maxHealth ; i++) {
            let position = 50 + (i * 100);
            if (this.health < this.maxHealth) {
                this.add.sprite(200, position, "heartEmpty");
            }
            else {
                this.add.sprite(position, 50, "heart");
            }
        }
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
            if (my.sprite.player.x < (3840+my.sprite.player.displayWidth/2)) {
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
            if (my.sprite.player.y < (960+my.sprite.player.displayHeight/2)) {
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
                if (my.sprite.zombies.length < this.maxMonsters) {
                    my.sprite.zombies.push(this.physics.add.sprite(this.enemyX, this.enemyY, "item"));
                    let zombie = my.sprite.zombies[my.sprite.zombies.length-1];
                    zombie.health = 5;
                    zombie.visible = true;
                    this.enemySpawnCheck = false;
                }
            }
        }
        else if ((this.wave % 2) == 0) {
            if (this.enemySpawnCheck == true) {
                if (my.sprite.skeletons.length < this.maxMonsters) {
                    my.sprite.skeletons.push(this.physics.add.sprite(this.enemyX, this.enemyY, "item"));
                    let skeleton = my.sprite.skeletons[my.sprite.skeletons.length-1];
                    skeleton.health = 3;
                    skeleton.visible = true;
                    this.enemySpawnCheck = false;
                }
            }
        }
        else {
            if (this.enemySpawnCheck == true) {
                if (my.sprite.bats.length < this.maxMonsters) {
                    my.sprite.bats.push(this.physics.add.sprite(this.enemyX, this.enemyY, "item"));
                    let bat = my.sprite.bats[my.sprite.bats.length-1];
                    bat.health = 1;
                    bat.visible = true;
                    this.enemySpawnCheck = false;
                }
            }
        }

        // Enemy Movement
        for (var i = 0; i < my.sprite.monster.length; i++) {
            for (var j = 0; j < my.sprite.monster[i].length; j++) {
                let enemy = my.sprite.monster[i][j];
                if (enemy.x < my.sprite.player.x) {
                    enemy.x++;}
                else {enemy.x--;}
                    
                if (enemy.y < my.sprite.player.y) {
                    enemy.y++;}
                else {enemy.y--;}
            }
        }

        // Bullet collision
        for (let bullet of my.sprite.bullet) {
            for (var i = 0; i < my.sprite.monster.length; i++) {
                for (var j = 0; j < my.sprite.monster[i].length; j++) {
                    let enemy = my.sprite.monster[i][j];
                    if (this.collides(enemy, bullet)) {
                        //bullet.setVelocity(0)
                        bullet.x = -100
                        bullet.y = -100
                        bullet.destroy();
                        enemy.health--;
                        if (enemy.health <= 0) {
                            enemy.x = -200;
                            enemy.y = -200
                            enemy.destroy();}
                    }
                }
            }
        }

        // Bullet Despawmning
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => (bullet.x < (3840+bullet.displayWidth) && bullet.x > -(bullet.displayWidth) 
        && bullet.y > -(bullet.displayHeight) && bullet.y < (960+bullet.displayHeight)));
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}