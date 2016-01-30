

function WorldObject(id){
	this.id = id;
	this.x = 0;
	this.y = 0;
}

WorldObject.prototype.setPosition = function(x,y){
	this.x = x;
	this.y = y;
}


module.exports.WorldObject = WorldObject;