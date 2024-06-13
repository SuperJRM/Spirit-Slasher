class GameField extends Phaser.Scene {
    constructor() {
        super("gameFieldScene");
    }

    init() {
        // variables and settings
        this.playerSpeed = 3.0; // Default: 3.0
        this.scale = 3.0; // Default: 3.0
        this.itemSpawnSpeed = 10000; // Default: 10000 (10 seconds)
        this.maxHealth = 3; // Default: 3 (3 Hearts)
        this.enemyX = 32; // Default: 32
        this.enemyY = 32; // Default: 32
        this.enemySpawnSpeed = 1500; // Default: 1500 (1.5 seconds)
        this.enemySpawnCheck = true; // Default: true
        this.wave = 1; // Default: 1
        this.waveSpeed = 60000; // Default: 60000 (60 seconds)
        this.maxMonsters = 120; // Default: 120
        this.maxBullets = 300; // Default: 300
        this.defaultInvincibilityTimer = 15; // Default: 15, for 1.5 seconds of invincibility

        // Item names
        this.items = ["Crystal", "Fireworks", "Sunshine", "Rift"];
    }

    create() {
        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 80 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("gameFieldMap", 16, 16, 80, 20);
        this.physics.world.setBounds(0,0, 80*16*3 , 20*16*3);

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

        // Set up player and monster avatars
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.bullet = [];
        my.sprite.bats = [];
        my.sprite.skeletons = [];
        my.sprite.zombies = [];
        my.sprite.monster = [my.sprite.bats, my.sprite.skeletons, my.sprite.zombies];

        // Make player avatar collide with collideable layer
        this.physics.add.collider(my.sprite.player, this.collideableLayer);

        // Set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // Set up camera for the screen
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*3, (this.map.heightInPixels*3));
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        // Debug view removal
        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        this.physics.world.debugGraphic.clear()
        
        /* Start of inventory system
         * Inventory system will hold one of four items from the this.items array
         * Initialized at the top. Players can pick up one of the four and have it
         * permanently affect how they play
         */
        this.playerInventory = {};

        /* Timer that periodically spawns an Item
         * The Player can touch the Item in the world and pick it up, adding it to inventory
         */
        this.spawnItemTimer = this.time.addEvent({
            delay: this.itemSpawnSpeed,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        });

        /* Timers below will check if Player has the following weapon Items
         * If they do on check, will shoot a projectile
         * Dupe Items make the attack more powerful */

        // Shoot Crystal
        this.crystalTimer = this.time.addEvent({
            delay: 3000, // Default is 3000 = 3 seconds
            callback: this.shootCrystal,
            callbackScope: this,
            loop: true // Repeat
        });

        // Shoot Fireworks
        this.fireworksTimer = this.time.addEvent({
            delay: 6000, // Default is 6000 = 6 seconds
            callback: this.shootFireworks,
            callbackScope: this,
            loop: true // Repeat
        });

        // Summon Rift
        this.riftTimer = this.time.addEvent({
            delay: 5000, // Default is 5000 = 5 seconds
            callback: this.summonRift,
            callbackScope: this,
            loop: true // Repeat
        });

        // Timer that changes wave count
        // Default changes the waves to get more intense every minute
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

        // Timer for invincibility frames
        // If player is hit, checked somewhere else, will make invincibilityTimer count down
        // While this is happening, player avatar flickers and is immune to damage
        this.invincibilityFrameTimer = this.time.addEvent({
            delay: 100, // 100 = 0.1 seconds
            callback: () => {
                if (this.invincibilityTimer) { // If invincibilityTimer has a value, go down in value
                    this.invincibilityTimer--;
                    my.sprite.player.setVisible(!my.sprite.player.visible); // Make player flicker to show damage
                } else {
                    my.sprite.player.setVisible(true); // Make sure player is visible at the end
                }
            },
            callbackScope: this,
            loop: true // Repeat
        });

        /* Create UI
         * Hovers directly beneath the player avatar, holds both health and inventory info
         * Then is constantly updated in update() with updateUI()
         */
        this.createUI();
    }

    update() {
        // Player control and animations
        if(cursors.left.isDown) { // Holding left makes player go left
            if (my.sprite.player.x > (my.sprite.player.displayWidth/2)) {
                my.sprite.player.x -= this.playerSpeed;
            }
            my.sprite.player.faceLeft = true;
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
        } 
        if(cursors.right.isDown) { // Holding right makes player go right
            if (my.sprite.player.x < (2350+my.sprite.player.displayWidth/2)) {
                my.sprite.player.x += this.playerSpeed;
            }
            my.sprite.player.faceLeft = false;
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
        }         
        if(cursors.up.isDown) { // Holding up makes player go up
            if (my.sprite.player.y > (my.sprite.player.displayHeight/2)+48) {
                my.sprite.player.y -= this.playerSpeed;
            }
            my.sprite.player.anims.play('walk', true);
        }         
        if(cursors.down.isDown) { // Holding down makes player go down
            if (my.sprite.player.y < (908+my.sprite.player.displayHeight/2)) {
                my.sprite.player.y += this.playerSpeed;
            }
            my.sprite.player.anims.play('walk', true);
        }
        if(cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
            my.sprite.player.anims.play('idle');
        }
        
        // Enemy spawning in waves
        if ((this.wave % 3) == 0) {
            if (this.enemySpawnCheck == true) {
                if (my.sprite.zombies.length < this.maxMonsters) {
                    my.sprite.zombies.push(this.physics.add.sprite(this.enemyX, this.enemyY, "Zombie").setScale(this.scale));
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
                    my.sprite.skeletons.push(this.physics.add.sprite(this.enemyX, this.enemyY, "Skeleton").setScale(this.scale));
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
                    my.sprite.bats.push(this.physics.add.sprite(this.enemyX, this.enemyY, "Bat").setScale(this.scale));
                    let bat = my.sprite.bats[my.sprite.bats.length-1];
                    bat.health = 1;
                    bat.visible = true;
                    this.enemySpawnCheck = false;
                }
            }
        }

        // Enemy Movement and sprite direction
        // Enemies will chase the player avatar down
        for (var i = 0; i < my.sprite.monster.length; i++) {
            for (var j = 0; j < my.sprite.monster[i].length; j++) {
                let enemy = my.sprite.monster[i][j];
                if (enemy.x < my.sprite.player.x) {
                    enemy.x += .25;
                    enemy.setFlip(true, false);
                }
                else {
                    enemy.x -= .25;
                    enemy.resetFlip();
                }
                    
                if (enemy.y < my.sprite.player.y) {
                    enemy.y += .25;}
                else {enemy.y -= .25;}
            }
        }

        // Bullet collision
        for (let bullet of my.sprite.bullet) { 
            // Checks each bullet and removes those out of bounds
            let indexBullet = my.sprite.bullet.findIndex(Ibullet => Ibullet === bullet);
            if (bullet.x > (3840+bullet.displayWidth) || bullet.x < -(bullet.displayWidth) || bullet.y < 16+(bullet.displayHeight) || bullet.y > (900+bullet.displayHeight)) {
                bullet.x = -100
                bullet.y = -100
                bullet.visible = false;
                bullet.destroy();
                my.sprite.bullet.splice(indexBullet, 1);
            }
            // Iterates through each enemy, dealing damage and removing dead bullets/enemies upon collision
            for (var i = 0; i < my.sprite.monster.length; i++) {
                for (var j = 0; j < my.sprite.monster[i].length; j++) {
                    let enemy = my.sprite.monster[i][j];
                    if (this.collides(enemy, bullet)) {
                        bullet.x = -100
                        bullet.y = -100
                        bullet.visible = false;
                        bullet.destroy();
                        my.sprite.bullet.splice(indexBullet, 1);
                        enemy.health--;
                        if (enemy.health <= 0) {
                            enemy.x = -200;
                            enemy.y = -200;
                            enemy.visible = false;
                            this.sound.play("PointSFX", {
                                volume: .25   // Can adjust volume using this, goes from 0 to 1
                            });
                            enemy.destroy();
                            my.sprite.monster[i].splice(j, 1);
                        }
                    }
                }
            }
        }

        // Update the UI
        this.updateUI();

        /* When Player makes contact with enemy, Player loses 1 health and starts
         * an immunity timer to prevent damage */
        for (let i = 0; i < my.sprite.monster.length; i++) {
            for (let j = 0; j < my.sprite.monster[i].length; j++) {
                const enemy = my.sprite.monster[i][j];
    
                // Check for collision between player and enemy
                if (this.collides(my.sprite.player, enemy) && !this.invincibilityTimer) {
                    // Player collides with enemy, decrement player's health
                    my.sprite.player.health -= 1;
                    this.sound.play("DMGSFX", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                    if (my.sprite.player.health <= 0) {
                        this.sound.play("DeadSFX", {
                            volume: 1   // Can adjust volume using this, goes from 0 to 1
                        });
                        this.scene.start("endScreenScene");
                    }
                    this.invincibilityTimer = this.defaultInvincibilityTimer;
                }
            }
        }
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    // Create the initial health bar and item counter
    createUI() {
        // Create a container to hold the hearts and inventory
        this.healthBarContainer = this.add.container();
        this.itemContainer = this.add.container();

        // For each heart (Default: 3), make a heart below the player
        for (let i = 0; i < this.maxHealth; i++) {
            // Since player starts out full health always, no need to check for damaged hearts
            const heart = this.add.sprite(i * 30, 0, "heart").setScale(1.5);
            this.healthBarContainer.add(heart);
        }

        // Initialize health values
        my.sprite.player.health = this.maxHealth;
    }

    // Constantly update the health bar and item counter and align below the player
    updateUI() {
        // Update health bar based on player's health
        for (let i = 0; i < this.maxHealth; i++) {
            const heartSprite = this.healthBarContainer.list[i];
    
            if (i < my.sprite.player.health) { // Show full heart for health
                heartSprite.setTexture("heart");
            } else { // Show lost heart for health
                heartSprite.setTexture("heartEmpty");
            }
        }
    
        // Update item icons based on player's inventory
        this.itemContainer.removeAll(true); // Remove existing item icons to start anew
    
        let iconX = 0;
        for (const itemName in this.playerInventory) {
            if (this.playerInventory.hasOwnProperty(itemName)) {
                const itemCount = this.playerInventory[itemName];
                
                if (itemCount > 0) { // Check if the item count is greater than 0
                    // Add the item icon
                    const itemIcon = this.add.sprite(iconX, 0, itemName).setScale(1.5);
                    this.itemContainer.add(itemIcon);
                    // Add amount of item owned in inventory (at least 1)
                    const itemText = this.add.text(iconX, 20, itemCount.toString(),
                        { fontSize: '16px'
                    });
                    this.itemContainer.add(itemText);
        
                    iconX += 23; // Adjust the spacing between item icons as needed, default: 23
                }
            }
        }
    
        // Set position of UI elements directly below player
        const healthX = my.sprite.player.x - (this.healthBarContainer.width / 2) - 30;
        const healthY = my.sprite.player.y + 40;
        this.healthBarContainer.setPosition(healthX, healthY);
        const itemContainerX = healthX;
        const itemContainerY = healthY + 25;
        this.itemContainer.setPosition(itemContainerX, itemContainerY);
    }

    // Spawn a random item in the game world
    spawnItem() {
        // Randomly generate position for the item within the game world
        const x = Phaser.Math.RND.between(0, this.game.config.width);
        const y = Phaser.Math.RND.between(48, this.game.config.height);

        // Randomly select an item from the this.items array
        const itemName = this.items[Phaser.Math.RND.between(0, this.items.length - 1)];
        const item = this.physics.add.sprite(x, y, itemName).setScale(3);

        if (["Crystal", "Fireworks", "Sunshine", "Rift"].includes(itemName)) {
            // Play the corresponding animation
            item.anims.play(itemName.toLowerCase() + '_animation');
            this.sound.play("ItemSFX", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }

        // Player collects item when touching the item
        item.setCollideWorldBounds(true);
        if (my.sprite.player) {
            this.physics.add.overlap(my.sprite.player, item, () => {
                // Sunshine Item
                // Upon pickup, restore health to max value, and slightly increase speed
                if (itemName === "Sunshine") {
                    my.sprite.player.health = this.maxHealth;
                    if (this.playerSpeed < 6.0) {
                        this.playerSpeed += 0.3;
                    }
                    console.log("Player health restored to 3 hearts.");
                    this.sound.play("HealSFX", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                }
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
    }

    // Crystal Item
    // Weapon: Shoot a projectile in the direction the player is facing every 3 seconds.
    // Each projectile deals 1 damage and pierces through enemies.
    // Consecutive pickups make this deal 1 more damage and makes faster bullets.
    shootCrystal() {
        let crystalCount = this.playerInventory["Crystal"]; // Copies of Item

        if (this.playerInventory.hasOwnProperty("Crystal")) { // Check if Item is owned
            let delay = 0; // Initial delay for the first bullet
            this.sound.play("CrystalSFX", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            for (let i = 0; i < crystalCount; i++) {
                setTimeout(() => {
                    if (my.sprite.bullet.length < this.maxBullets) {
                        const bullet = this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y - (my.sprite.player.displayHeight / 2), "Crystal").setScale(2).setAlpha(0.9);
                        bullet.visible = true;
                        if (my.sprite.player.faceLeft == true) {
                            bullet.setVelocity(-200 - (i * 50), 0);
                            bullet.setAngle(-90)
                        }
                        else {
                            bullet.setVelocity(200 + (i * 50), 0);
                            bullet.setAngle(90)
                        }
                        my.sprite.bullet.push(bullet);
                    }
                }, delay);

                delay += 30; // Increase delay for the next bullet
            }
        }
    }

    // Fireworks Item
    // Weapon: Shoot 6 projectiles all around the player once every 6 seconds.
    // Each projectile deals 1 damage.
    // Consecutive pickups add extra shots.
    shootFireworks() {
        let fireworksCount = this.playerInventory["Fireworks"]; // Copies of Item
        const projectileCount = 6 + ((fireworksCount - 1) * 3);
        const angleCount = (2 * Math.PI) / projectileCount;

        if (this.playerInventory.hasOwnProperty("Fireworks")) { // Check if Item is owned
            for (let i = 0; i < projectileCount; i++) {
                const angle = i * angleCount;
                const velocityX = Math.cos(angle) * 200;
                const velocityY = Math.sin(angle) * 200;

                if (my.sprite.bullet.length < this.maxBullets) {
                    my.sprite.bullet.push(this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "Fireworks").setScale(2).setAlpha(0.9));
                }
                let bullet = my.sprite.bullet[my.sprite.bullet.length-1];
                bullet.setVelocity(velocityX, velocityY);
            }
            this.sound.play("FireworkSFX", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }
    }

    // Rift Item
    // Weapon: Summon a random rift at the ground where you stand.
    // It stays there until an enemy touches it to deal damage, then disappears.
    // Consecutive pickups make the rift last longer and increase its size, and also how many it can eat
    summonRift() {
        let riftCount = this.playerInventory["Rift"]; // Copies of Item

        if (this.playerInventory.hasOwnProperty("Rift")) {
            for (let i = 0; i < riftCount / 2; i++) {
                // Add the rift sprite to the bullet array (assuming my.sprite.bullet is an array)
                my.sprite.bullet.push(this.physics.add.sprite(my.sprite.player.x, my.sprite.player.y - (my.sprite.player.displayHeight / 2), "Rift"));
            
                // Get the last added rift sprite
                let rift = my.sprite.bullet[my.sprite.bullet.length - 1];
                rift.anims.play("rift_animation");
                rift.setScale(5 + ((riftCount - 1)));
                rift.setAlpha(0.7);
            
                // Set a timer to remove the rift after a certain duration
                this.time.delayedCall(3000 + (500 * (riftCount - 1)), () => {
                    rift.destroy();
                });
            }
            this.sound.play("RiftSFX", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
        }
    }
}