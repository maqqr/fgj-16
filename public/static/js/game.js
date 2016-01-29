/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,         // Canvas DOM element
    ctx,            // Canvas rendering context
    chat,			// Chat DOM element
    keys,
	keyListeners,	// Keyboard input
    localPlayer,    // Local player
    remotePlayers,  // Remote players
    socket,         // Socket connection
    mouseX,
    mouseY,
                    // positive if loading a shot
    fps,            // Keeps track of FPS
 // Latest ping value, in milliseconds
    playerList,     // List of players and points drawn on canvas
    paused = false, // Whether game is paused or not
    countdown,      // Countdown number for new round
    latestWinnerName;

// Images
var img_blueplayer,
    img_redplayer,
    img_playershadow,
    img_crown,
    img_shadowborder,
    img_ball,
    img_ballshadow,
    img_winner;

// Sounds (ogg files to save space, compatible enough?)
var snd_throw; // When ball is thrown
var snd_hit; // Somebody gets burned
var snd_start; // At the start of match

// Globals
var MAX_SHOT_LOADING_TIME = 80,  // Näitä on vähän turhan helppo muokata (huijata)
    SHOT_COOLOFF_TIME     = 60,
    RING_RADIUS           = 225,
    RING_RADIUS_SQUARED   = RING_RADIUS * RING_RADIUS,
    WIDTH = 800,
    HEIGHT = 600;


/**************************************************
** GAME INITIALISATION
**************************************************/

function init() {
	// Declare the HTML elements
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	chat = document.getElementById("chat");

    // Load images etc.
    loadResources();

    // Initialise keyboard controls
    keys = new Keys();

    // Initialise the local player
    localPlayer = new Player(0, 0, 30, "anonymous", true, true);

    // Initialise socket connection


	// Initialise arrays
	remotePlayers = [];


    // Start listening for events
    setEventHandlers();
}


function addInputListener(listener){
	keyListeners[keyListeners.length] = listener;
}


function loadResources() {
    img_blueplayer = new Image();
    img_blueplayer.src = 'img/blue.png';
    img_redplayer = new Image();
    img_redplayer.src = 'img/red.png';
    img_playershadow = new Image();
    img_playershadow.src = 'img/player_shadow.png';
    img_ball = new Image();
    img_ball.src = "img/ball.png";
    img_ballshadow = new Image();
    img_ballshadow.src = "img/ball_shadow.png";
    img_crown = new Image();
    img_crown.src = 'img/crown.png';
    img_shadowborder = new Image();
    img_shadowborder.src = "img/border_shadow.png";
    img_winner = new Image();
    img_winner.src = "img/red_winner.png";

    snd_hit = new Audio("snd/snd_ball_hit.ogg");
    snd_throw = new Audio("snd/snd_ball_throw.ogg");
    snd_start = new Audio("snd/start.ogg");
}

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
    // Keyboard
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("keyup", onKeyup, false);

    // Mouse
    canvas.onmousemove = onMouseMove;
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup   = onMouseUp;

  
};

// Mouse move
function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left,
    mouseY = e.clientY - rect.top;
}

// Mouse button down - start to shoot
function onMouseDown(e) {
    
}

// Mouse button up - launch the ball with a speed proportional to loading time
function onMouseUp(e) {
   
}

// Keyboard key down
function onKeydown(e) {
    if (localPlayer) {
        keys.onKeyDown(e);
    }
}

// Keyboard key up
function onKeyup(e) {
    if (localPlayer) {
        keys.onKeyUp(e);
    }
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
var fpsDate = new Date(), loopCount = 0, delta, deltaDate = new Date();

function animate() {
    // Calculate delta time
    var now = new Date();
    delta = ((now - deltaDate) / 1000) * 60;
    delta = Math.round(delta * 1000) / 1000;
    deltaDate = now;

    // Update game state, draw the frame
    update(delta);
    draw();

    // Calculate FPS and send a ping request every 200 frames
    if (++loopCount == 200) {
        loopCount = 0;
        d0 = new Date();
        fps = Math.round(200000 / (d0 - fpsDate));
        fpsDate = d0;

        //sendPing();
    }

    // Request a new animation frame using Paul Irish's shim
    window.requestAnimFrame(animate);
}


/**************************************************
** GAME UPDATE
**************************************************/
function update(delta) {
     if (keys.up) {
         y -= delta * moveAmount;
     } else if (keys.down) {
         y += delta * moveAmount;
     }

     // Left key takes priority over right
     if (keys.left) {
         x -= delta * moveAmount;
     } else if (keys.right) {
         x += delta * moveAmount;
     }
	 keyListeners.forEach(function(element, ,i,o){
		element.inputUpdated(x, y);
	 });
}


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
    // Wipe the canvas clean
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the local player
    localPlayer.draw(ctx, localPlayer.id);

    // Draw the remote players
    for (var i = 0; i < remotePlayers.length; i++) {
        remotePlayers[i].draw(ctx, remotePlayers[i].id);
    }


    /*
    drawPlayerList();
    drawInfo();
    */

    if (paused) {
        drawPaused();
    }

    ctx.drawImage(img_shadowborder,0,0);
}


// Draw an image
function drawImage(image, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.drawImage(image, -(image.width/2), -(image.height/2));
    ctx.restore();
}

function drawPlayerList() {
    if (!playerList) {
        return;
    }
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "9pt sans-serif";
    var height;
    for (var i = 0; i < playerList.length; i++) {
        height = canvas.height - (i+1) * 16;
        if (playerList[i].eliminated) {
            ctx.fillStyle = "red";
            ctx.fillText("x", 5, height);
            ctx.fillStyle = "white";
        }
        ctx.fillText(playerList[i].name, 20, height);
        ctx.fillText(playerList[i].points, 100, height);
    }
    ctx.restore();
}

// Draw debugging info
function drawInfo() {
    var lines = ["FPS: " + fps,
                "Ping (ms): " + pingTime];
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "9pt sans-serif";
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width - 100, (i+1)*20);
    }
    ctx.restore();
}

// Draw pause screen
function drawPaused() {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#33CCFF";
    ctx.fillRect(2*canvas.width/8, canvas.height/8, 4*canvas.width/8, 6*canvas.height/8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.font = "20pt sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Erä päättyi", canvas.width/2, 2*canvas.height/8);
    ctx.font = "200pt sans-serif";
    ctx.fillText(countdown, canvas.width/2, 7*canvas.height/10);
    ctx.restore();
}

// Draw rotated image
function drawRotatedImage(image, x, y, angle) {
    // save the current co-ordinate system before we screw with it
    ctx.save();

    // move to the middle of where we want to draw our image
    ctx.translate(x, y);

    // rotate around that point, converting our angle from degrees to radians
    ctx.rotate(angle);

    // draw it up and to the left by half the width
    // and height of the image
    ctx.drawImage(image, -(image.width/2), -(image.height/2));

    // and restore the co-ords to how they were when we began
    ctx.restore();
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/


// Send a ping request


// Send a chat message
function sendMessage() {
    var textbox = document.getElementById("chatmsg"),
        rawMsg = textbox.value;
	msg = rawMsg.trim().substr(0, 100);
	if (msg) {
		console.log("Lähetetään viesti: " + msg);
		socket.emit("msg", {name: localPlayer.getName(), msg: msg});
		onMessage({name: localPlayer.getName(), msg: msg});
	}
    textbox.value = "";
    textbox.blur();
}


// Update the list of players and points drawn on canvas
function updatePlayerList() {
    var spaces, players = remotePlayers.slice();
    players.push(localPlayer);
    players.sort(function (a,b) {return a.getPoints() - b.getPoints();});
    playerList = players.map(function (player) {
        return {id: player.id,
                name: player.getName(),
                points: player.getPoints(),
                eliminated: player.isEliminated()};
    });


}

// Counts down from 4
function startCountdown() {
    if (--countdown !== 0) {
        setTimeout(startCountdown, 1000);
    }
}

// Repeat a string - "asd".repeat(2) -> "asdasdasd"
String.prototype.repeat = function(num)
{
    return new Array(num + 1).join(this);
};
