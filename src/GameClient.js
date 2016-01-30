
function GameClient(){
	
	this.init = function(){
		this.cursors = this.phaserGame.input.keyboard.createCursorKeys();
		this.playerSprites = [];
	}
	
	this.preload = function()
	{
		this.phaserGame.load.image('sky', 'assets/sky.png')
		this.phaserGame.load.image('ball', 'assets/ball.png')

	}
	
	this.create = function(){
		this.connectToServer();
		this.background = this.phaserGame.add.sprite(0,0, 'sky');
	}
	
	this.inputUpdated = function(x, y){
		this.movePlayer(x, y, this.player.id, true);
	}

	this.movePlayer = function(x, y, id, serverNeedsNotify)
	{
		if(serverNeedsNotify){
			this.notifyMovement(id, x, y);
		}
	
	}	

	
	this.update = function (){
		var x = 0;
		var y = 0;
		if (this.cursors.up.isDown)
		{
			y += 4;
			
		}
		else if (this.cursors.down.isDown)
		{
			y -= 4;
		}
	
		if (this.cursors.left.isDown)
		{
			x -= 4;
		}
		else if (this.cursors.right.isDown)
		{
			x += 4;
		}
		if(this.player !== undefined && (x !== 0 || y !== 0))
			this.inputUpdated(x, y);
	}
	
	

	this.setId = function(player)
	{
		this.player = player;
		var playerSprite = this.phaserGame.add.sprite(0,0, 'ball');
		playerSprite.player = player;
		this.playerSprites[this.playerSprites.length] = playerSprite;
	}



	this.connectToServer = function(){
		var con = this;
		this.eurecaClient = new Eureca.Client();
		this.eurecaClient.exports.setId = function(player){ con.setId(player);};
		this.eurecaClient.exports.updateUI = function(state){ con.updateUI(state); };
		//this.eurecaClient.exports.updateState = function(state){
		//	con.updateState(state);
		//};
		this.url = "http://" + document.domain;
		//this.socket = io.connect(url, {port: portNum, transports: ["websocket"]});
		this.pingSentDate;   // Date object of when the latest ping request was sent
		this.pingTime;      
		this.eurecaClient.ready(function (proxy) {con.server = proxy;});
	}
	

	this.updateUI = function(state){
		console.log(state.runningId);
		for(var playerKey in state.players){
            var elem = state.players[playerKey];
			this.playerSprites[0].x = elem.x;
			this.playerSprites[0].y = elem.y;
		}
	}
	
	
	this.notifyMovement = function(id, x, y){
		this.server.onPlayerMove(id, x, y);
	}


	
	var client = this;
	this.phaserGame = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example');
	this.phaserGame.state.add('Client', this);
	this.phaserGame.state.start('Client');
	

	
	
	
}

var gameClient = new GameClient();


