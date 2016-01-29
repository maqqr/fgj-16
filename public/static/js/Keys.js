/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down,w,a,s,d) {
    var up = up || false,
        left = left || false,
        right = right || false,
        down = down || false,
        w = w || false,
        a = a || false,
        s = s || false,
        d = d || false;


    var onKeyDown = function(e) {
        var that = this,
            c = e.keyCode;
        switch (c) {
            // Controls
            case 37: // Left
                that.left = true;
                break;
            case 38: // Up
                that.up = true;
                break;
            case 39: // Right
                that.right = true; // Will take priority over the left key
                break;
            case 40: // Down
                that.down = true;
                break;
            // WASD
            case 65: // A (Left)
                that.left = true;
                break;
            case 87: // W (Up)
                that.up = true;
                break;
            case 68: // D (Right)
                that.right = true;
                break;
            case 83: // S (Down)
                that.down = true;
                break;
        }
    };

    var onKeyUp = function(e) {
        var that = this,
            c = e.keyCode;
        switch (c) {
            case 37: // Left
                that.left = false;
                break;
            case 38: // Up
                that.up = false;
                break;
            case 39: // Right
                that.right = false;
                break;
            case 40: // Down
                that.down = false;
                break;
            // WASD
            case 65: // A (Left)
                that.left = false;
                break;
            case 87: // W (Up)
                that.up = false;
                break;
            case 68: // D (Right)
                that.right = false;
                break;
            case 83: // S (Down)
                that.down = false;
                break;
        }
    };

    return {
        up: up,
        left: left,
        right: right,
        down: down,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp
    };
};