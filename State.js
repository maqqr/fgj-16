

function State(){
	this.grains = [];
	this.players = [];
	
}


State.prototype.addGrain = function(grain){
	this.grains[this.grains.length] = grain;
}


State.prototype.addPlayer = function(player){
	this.players[player.id] = player;
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