

function UI()
{
	this.pairs = [];
	this.gameState = undefined;

}

UI.prototype.registerForOnClientConnected = function(callable, caller){
	this.onPreloadDone = new EventHandler(callable, caller);
}



UI.prototype.start = function()
{
	this.phaserGame = new Phaser.Game(1024, 768, Phaser.AUTO);
	this.phaserGame.state.add('UI', this);
	this.phaserGame.state.start('UI');
	this.gameState = undefined;
}



UI.prototype.preload = function(){
	this.phaserGame.load.image('sky', 'assets/sky.png');
	this.phaserGame.load.image('ball', 'assets/ball.png');
	if(this.onPreloadDone)
		this.onPreloadDone.process();
}


UI.prototype.create = function(){
	this.background = this.phaserGame.add.image(0,0,'sky')
	this.background.scale.setTo(2, 2);

}


UI.prototype.createObjects = function(state){
	this.updateState(state);
}


UI.prototype.updateState = function(state)
{
	if(this.phaserGame == undefined) return;
	if(this.gameState && this.gameState.players != undefined)
		var oldState = this.gameState
	this.gameState = state;
	for (var playerInArr in this.gameState.players){
		var player = this.gameState.players[playerInArr];
		if(oldState)
			var inOld = findPlayer(oldState, player.id);
		if(inOld)
		{
			var pair = this.pairs[inOld.id];
			pair.wObj.setPosition(player.x, player.y);
			pair.sprite.x = player.x;
			pair.sprite.y = player.y;
			
		}
		else
		{
			this.pairs[player.id] = { wObj: player, sprite: this.phaserGame.add.sprite(player.x, player.y, 'ball') };
		}
	}
	
}


UI.prototype.update = function(){
	

}

UI.prototype.init = function(){
	
}




