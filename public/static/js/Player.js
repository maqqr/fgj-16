/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startAngle, playerName, isEliminated,
    isLocal, startPoints) {
    var x = startX,
        y = startY,
        angle = startAngle,
        id,
        moveAmount = 2,
        name = playerName,
        eliminated = isEliminated,
        local = isLocal,
        // TODO eri kuva toisille pelaajille
        img = isEliminated ? img_redplayer : img_blueplayer,
        points = startPoints || 0;

    // Getters and setters
    var getID = function() {
        return id;
    }

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

    var isEliminated = function() {
        return eliminated;
    };

    var getPoints = function() {
        return points;
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
        img = eliminated ? img_redplayer : img_blueplayer;
    };

    var setPoints = function(newPoints) {
        points = newPoints;
    };

    // Update player position
    var update = function(keys, delta) {
        // Previous position
        var prevX = x,
            prevY = y,
            prevAngle = angle;



        // Calculate angle
        angle = calculateAngle(x, y);

        return (prevX != x || prevY != y) ? true : false;
    };

    // Draw player
    // TODO? playerID piti syöttää ulkopuolelta, muuten se oli undefined
    var draw = function(ctx, playerID) {
        ctx.save();
        if (isLocal) {
            ctx.fillStyle = "yellow";
        } else {
            ctx.fillStyle = "white";
        }
        ctx.fillRect(x-5, y-5, 10, 10);
        ctx.font = "9pt sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(getName(), x, y-30);
        ctx.restore();

        // Draw shadow & player
        drawRotatedImage(img_playershadow, x+5, y+5, angle);
        if (latestWinnerName == getName() && isEliminated()) {
            drawRotatedImage(img_winner, x, y, angle);
        } else {
            drawRotatedImage(img, x, y, angle);
        }

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
        update: update,
        draw: draw,
        id: id,
        getName: getName,
        setName: setName,
        getPoints: getPoints,
        setPoints: setPoints
    };
};
