var worldObject = require('./WorldObject');

//Javascript inheritance stuff
Player.prototype = Object.create(worldObject.WorldObject.prototype);
Player.prototype.constructor = worldObject.WorldObject;


function Player(id){
	this.id = id;
	this.heldItem = null;
	this.vx = 0;
	this.vy = 0;
}


Player.prototype.PickUp = function(newItem){
	var old = this.heldItem;
	this.heldItem = newItem; 
	return old;
}
