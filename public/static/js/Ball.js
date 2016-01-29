/**************************************************
** GAME BALL CLASS
**************************************************/
var Ball = function(startX, startY, startAngle, startSpeed) {
    var x = startX,
        y = startY,
        speed = startSpeed,
        moveX = Math.round(speed * Math.cos(startAngle) * 100) / 100,
        moveY = Math.round(speed * Math.sin(startAngle) * 100) / 100,
        img = img_ball,
        id;

    // Update ball position, return false if out of screen
    var update = function(delta) {
        x += delta * moveX;
        y += delta * moveY;
        if (x > canvas.width || x < 0 || y > canvas.height || y < 0) {
            return false;
        }
        return true;
    };

    // Draw the ball
    var draw = function(ctx) {
        drawImage(img_ballshadow, x+10, y+10);
        drawImage(img, x, y);
    };

    // Define which variables and methods can be accessed
    return {
        update: update,
        draw: draw,
        moveX: moveX,
        moveY: moveY,
        speed: speed,
        id: id,
        x: x,
        y: y
    };
};
