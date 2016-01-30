var worldObject = require('./WorldObject');

//Javascript inheritance stuff
Player.prototype = Object.create(worldObject.WorldObject.prototype);
Player.prototype.constructor = worldObject.WorldObject;


function Player(id){
	this.id = id;
	this.heldItem = null;
}


Player.prototype.PickUp = function(newItem){
	var old = this.heldItem;
	this.heldItem = newItem; 
	return old;
}

/**************************************************
** GAME PLAYER CLASS
**************************************************/
//var util = require("util");

/*var Player = function(startX, startY, startAngle, playerName, isEliminated,
    startPoints) {
    var x = startX,
        y = startY,
        angle = startAngle,
        id,
        moveAmount = 2,
        name = playerName,
        eliminated = isEliminated,
        lastmessage = new Date();
        points = startPoints ? startPoints : 0;

    // Getters and setters
    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var getAngle = function() {
        return angle;
    };

    var getName = function() {
        return name;
    };

    var getPoints = function() {
        return points;
    };

    var isEliminated = function() {
        return eliminated;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };

    var setAngle = function(newAngle) {
        angle = newAngle;
    };

    var setName = function(newName) {
        name = newName;
    };

    var setEliminated = function(elimination) {
        eliminated = elimination;
    };

    var setPoints = function(newPoints) {
        points = newPoints;
    };

    // Returns true if player can send message
    var checkSpamTimer = function() {
        var now = new Date();
        return (now - lastmessage) / 1000 > 2.0;
    };

    var resetSpamTimer = function() {
        lastmessage = new Date();
    };


    // Define which variables and methods can be accessed
    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        getAngle: getAngle,
        setAngle: setAngle,
        isEliminated: isEliminated,
        setEliminated: setEliminated,
        id: id,
        getName: getName,
        setName: setName,
        getPoints: getPoints,
        setPoints: setPoints,
        checkSpamTimer: checkSpamTimer,
        resetSpamTimer: resetSpamTimer
    };
};*/

// Export the Player class so you can use it in
// other files by using require("Player").Player
module.exports = Player;
