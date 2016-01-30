addGrain = function(state, grain){
	state.grains[state.grains.length] = grain;
}


addPlayer = function(state, player){
	state.players[player.id] = player;
    return state;
}

movePlayer = function(state, id, x, y){
	player = state.players[id];
    player.x = player.x + x;
    player.y = player.y + y;
}

findPlayer = function(state, id){
	return state.players[id];
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports.addPlayer = addPlayer;
	module.exports.addGrain = addGrain;
	module.exports.findPlayer = findPlayer;
    module.exports.movePlayer = movePlayer;
}
