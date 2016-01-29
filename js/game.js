var myId=0;

var sprite;
var player;
var spritesList;
var cursors;
var ready = false;
var eurecaServer;

var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();
    
    eurecaClient.ready(function (proxy) {       
        eurecaServer = proxy;
    });
    
    // methods defined under "exports" namespace become available in the server side

    eurecaClient.exports.setId = function(id) 
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }
    
    eurecaClient.exports.kill = function(id)
    {   
        if (spritesList[id]) {
            spritesList[id].kill();
            console.log('killing ', id, spritesList[id]);
        }
    }   
    
    eurecaClient.exports.spawnEnemy = function(i, x, y)
    {
        
        if (i == myId) return; //this is me
        
        console.log('SPAWN');
        var tnk = new Player(i, game);
        spritesList[i] = tnk;
    }
    
    eurecaClient.exports.updateState = function(id, state)
    {
        if (spritesList[id])  {
            spritesList[id].cursor = state;
            spritesList[id].sprite.x = state.x;
            spritesList[id].sprite.y = state.y;
            spritesList[id].sprite.angle = state.angle;
            spritesList[id].update();
        }
    }
}


Player = function (index, game) {
    this.cursor = {
        left:false,
        right:false,
        up:false,
        down:false
    }

    this.input = {
        left:false,
        right:false,
        up:false,
        down:false
    }

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 30;
   
    this.currentSpeed =0;

    this.sprite = game.add.sprite(x, y, 'player', 'sprite1');
    this.sprite.anchor.set(0.5);

    this.sprite.id = index;
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.immovable = false;
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.bounce.setTo(0, 0);

    this.sprite.angle = 0;

    game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);

};

Player.prototype.update = function() {
    
    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up ||
        this.cursor.down != this.input.down
    );
    
    
    if (inputChanged)
    {
        //Handle input change here
        //send new values to the server     
        if (this.sprite.id == myId)
        {
            // send latest valid state to the server
            this.input.x = this.sprite.x;
            this.input.y = this.sprite.y;
            this.input.angle = this.sprite.angle;
            
            eurecaServer.handleKeys(this.input);
        }
    }

    if (this.cursor.left) {
        this.sprite.x -= 4;
    }
    else if (this.cursor.right) {
        this.sprite.x += 4;
    }
    else if (this.cursor.up) {
        this.sprite.y -= 4;
    }
    else if (this.cursor.down) {
        this.sprite.y += 4;
    }
};


Player.prototype.kill = function() {
    this.sprite.kill();
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {
    game.load.image('player', 'assets/player.png');
}


function create () {
    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;
  
    spritesList = {};
    
    player = new Player(myId, game);
    spritesList[myId] = player;
    sprite = player.sprite;
    sprite.x=0;
    sprite.y=0;

    sprite.bringToTop();
    
    game.camera.follow(sprite);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
}

function update () {
    //do not update if client not ready
    if (!ready) return;
    
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    player.input.down = cursors.down.isDown;
    player.input.tx = game.input.x+ game.camera.x;
    player.input.ty = game.input.y+ game.camera.y;
    
    for (var i in spritesList)
    {
        if (!spritesList[i]) continue;
        var curPlayer = spritesList[i].sprite;
        for (var j in spritesList)
        {
            if (!spritesList[j])
                continue;
            spritesList[j].update();
        }
    }
}

function render () {}

