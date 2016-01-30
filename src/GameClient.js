
function GameClient(){
	this.server = new ServerConnection(8000);
	
	preload : function()
	{
		game.load.image('sky', 'assets/sky.png')
		game.load.image('ball', 'assets/ball.png')
		this.server.connectToServer();
	}
	
	create : function(){
		
	}
	
	inputUpdated : function(x, y){
		this.movePlayer(x, y, this.player.id, true);
	}

	movePlayer : function(x, y, id, serverNeedsNotify)
	{
		var found = this.state.findPlayer(id);
		if(found == undefined)
			return;
		found.x = x;
		found.y = y;
		if(serverNeedsNotify){
			this.server.notifyMovement(id, x, y);
	}
	
}

	
	update : function (){
		var x;
		var y;
		if (cursors.up.isDown)
		{
			y += 4;
			
		}
		else if (cursors.down.isDown)
		{
			y -= 4;
		}
	
		if (cursors.left.isDown)
		{
			x -= 4;
		}
		else if (cursors.right.isDown)
		{
			x += 4;
		}
		inputUpdated(x, y);
	}
	
	


	connectToServer : function(){
		var con = this;
		this.eurecaClient = new Eureca.Client();
		this.eurecaClient.exports.setId = con.setId;
		this.eurecaClient.exports.updateState = function(state){
			con.updateState(state);
		};
		this.url = "http://" + document.domain;
		//this.socket = io.connect(url, {port: portNum, transports: ["websocket"]});
		this.pingSentDate;   // Date object of when the latest ping request was sent
		this.pingTime;      
		this.eurecaClient.ready(this.clientConnected);
	}
	
	notifyMovement : function(id, x, y){
		this.server.onPlayerMove(id, x, y);
	}


	setId : function(id)
	{
		this.player.id = id;
	}

	
	
	
	this.phaserGame = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: this.preload, create: this.create, update: this.update});
	this.cursors = this.phaserGame.input.keyboard.createCursorKeys();
	
	
	
}


