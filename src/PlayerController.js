

function PlayerController(){

	
}


PlayerController.prototype.register = function(playersId, state){
	this.id = playersId;
	this.state = state;
	//this.player = this.state.findPlayer(this.id);
}