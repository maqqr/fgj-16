
//Javascript inheritance stuff
Player.prototype = Object.create(WorldObject.prototype);
Player.prototype.constructor = WorldObject;


function Player(id){
	this.id = id;
	this.heldItem = null;
}


Player.prototype.PickUp = function(newItem){
	var old = this.heldItem;
	this.heldItem = newItem; 
	return old;
}