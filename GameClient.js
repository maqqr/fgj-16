

function GameClient(){
	this.start();
	
	//this.server = server;
	this.state = this.server.getState();
	this.pc = new PlayerController(this.server.getFreeId(), this.state)
	//this.player = this.state.findPlayer(this.id);
	//this.ui = ui;
	this.registerEvents();

}

GameClient.prototype.start = function()
{
	this.server = new Server("Localhost:8888");
	this.ui = new UI();
	this.input = new Input();
}


GameClient.prototype.registerEvents = function(){
	this.input.registerForInput(this.inputUpdated);
	this.server.registerForStateChange(this.updateState); //To be made into smaller different callables
}


GameClient.prototype.inputUpdated = function(x, y){
	this.movePlayerFromInput(this.pc.player.x + x, this.pc.player.y + y, this.id, true);
}


GameClient.prototype.movePlayer = function(x, y, id, serverNeedsNotify)
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


GameClient.prototype.updateState = function(state)
{
	this.state = state;
	//this.ui.drawState(this.state);
}
}