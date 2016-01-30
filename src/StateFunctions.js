addGrain = function(state, grain){
	state.grains[state.grains.length] = grain;
}


addPlayer = function(state, player){
	state.players[state.players.length] = player;
}

findPlayer = function(state, id){
	
	var found;
	found = state.players[id];
	state.players.forEach(function(element, index, array){
		if(element.id == id){
			return found;
		}
	});
	return null;
	
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports.addPlayer = addPlayer;
	module.exports.addGrain = addGrain;
	module.exports.findPlayer = findPlayer;
}
