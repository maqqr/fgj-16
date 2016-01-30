

function State(){
	this.grains = [];
	this.players = [];
	this.runningId = 0;
}


State.prototype.addGrain = function(grain){
	this.grains[this.grains.length] = grain;
}


State.prototype.addPlayer = function(player){
	this.players[this.players.length] = player;
}

State.prototype.findPlayer = function(id){
	
	var found;
	found = this.players[id];
	//this.players.forEach(function(element, index, array){
	//	if(element.id == id){
	//		found = element;
	//		break;
	//	}
	//});
	return found;
	
}

module.exports = State;