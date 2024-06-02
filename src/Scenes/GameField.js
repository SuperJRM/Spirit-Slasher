class GameField extends Phaser.Scene {
    constructor() {
        super("gameFieldScene");
    }

    init() {
        // variables and settings
        this.playerSpeed = 2
    }

    create() {
        // Create a new tilemap game object which uses 8x8 pixel tiles, and is
        // 29 tiles wide and 259 tiles tall.
        this.map = this.add.tilemap("gameFieldMap", 8, 8, 20, 20);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("colored_tilemap_packed", "colored_tilemap_packed");

        // Create a layer
        this.groundLayer = this.map.createLayer("Tile Layer 1", this.tileset, 0, 0);
        this.groundLayer.setScale(8.0);

        my.sprite.enemy = [];

        my.sprite.enemy.push(this.add.sprite(
            480, 480, "enemy").setScale(8));

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        /* debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this); */

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