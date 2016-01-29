/**************************************************
** GAME BALL CLASS (SERVER-SIDE)
**************************************************/
var Ball = function(startX, startY, startAngle, startSpeed, playerId) {
    var x = startX,
        y = startY,
        speed = startSpeed,
        moveX = Math.round(speed * Math.cos(startAngle) * 100) / 100,
        moveY = Math.round(speed * Math.sin(startAngle) * 100) / 100,
        playerId = playerId;

    // Update ball position, return false if out of screen
    var update = function(delta) {
        x += delta * moveX;
        y += delta * moveY;
        if (x > 800 || x < 0 || y > 800 || y < 0) {
            return false;
        }
        return true;
    };

    // Getters and setters
    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };

    // Define which variables and methods can be accessed
    return {
        update: update,     // TODO turhia julkisia attribuutteja
        moveX: moveX,
        moveY: moveY,
        speed: speed,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        playerId: playerId
    };
};

exports.Ball = Ball;