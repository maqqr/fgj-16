/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,         // Canvas DOM element
    ctx,            // Canvas rendering context
    chat,			// Chat DOM element
    keys,           // Keyboard input
    localPlayer,    // Local player
    remotePlayers,  // Remote players
    balls,          // Thrown balls
    socket,         // Socket connection
    mouseX,
    mouseY,
    shotTimer = 0,  // 0 if not loading a shot, negative if cooling off,
                    // positive if loading a shot
    fps,            // Keeps track of FPS
    pingSentDate,   // Date object of when the latest ping request was sent
    pingTime,       // Latest ping value, in milliseconds
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
    url = "http://" + document.domain;
    socket = io.connect(url, {port: 8000, transports: ["websocket"]});

	// Initialise arrays
	remotePlayers = [];
	balls = [];

    // Start listening for events
    setEventHandlers();
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

    // Socket connection successful
    socket.on("connect", onSocketConnected);

    // Socket disconnection
    socket.on("disconnect", onSocketDisconnect);

    // New player message received
    socket.on("new player", onNewPlayer);

    // New ball message received
    socket.on("new ball", onNewBall);

    // Player move message received
    socket.on("update", onUpdatePlayer);

    // Player removed message received
    socket.on("remove player", onRemovePlayer);

    // A player eliminated
    socket.on("hit", onHit);

    // Ping response message received
    socket.on("ping", onPing);

    // Chat message received
    socket.on("msg", onMessage);

    // Current round is over
    socket.on("game over", onGameOver);

    // New game starts
    socket.on("newgame", onNewGame);

    // Error
    socket.on("error", onError);

    // Server asks for name
    socket.on("ask name", onAskName);

    // Welcome message received - existing session reactivated
    socket.on("welcome back", onWelcomeBack);
};

// Mouse move
function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left,
    mouseY = e.clientY - rect.top;
}

// Mouse button down - start to shoot
function onMouseDown(e) {
    if (shotTimer === 0) {
        shotTimer = 40;
    }
}

// Mouse button up - launch the ball with a speed proportional to loading time
function onMouseUp(e) {
    if (shotTimer > 0) {
        var rect = canvas.getBoundingClientRect(),
            speed = Math.min(Math.floor(shotTimer / 10), 8),
            x = localPlayer.getX(),
            y = localPlayer.getY(),
            angle = localPlayer.getAngle();

        // Send ball data to the game server
        socket.emit("new ball", {x: x, y: y, angle: angle, speed: speed});
        mouseX = e.clientX - rect.left,
        mouseY = e.clientY - rect.top;
        shotTimer = -SHOT_COOLOFF_TIME;
    } else {
        // TODO bugi
    }
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

// Socket connected
function onSocketConnected() {
    console.log("Connected to socket server");
    onMessage({name: "PALVELIN", msg: "Yhdistetty palvelimelle"});
}

// Socket disconnected - most probably due to same IP error
function onSocketDisconnect() {
    console.log("Disconnected from socket server");
    onMessage({name: "PALVELIN", msg: "Yhteys katkesi." +
        "Onko peli käynnissä toisella välilehdellä?"});
}

// New player
function onNewPlayer(data) {
    console.log("New player connected: " + data.id);
    onMessage({name: "PALVELIN", msg: data.name + " liittyi peliin"});

    // Initialise the new player
    var newPlayer = new Player(data.x, data.y, data.angle, data.name,
        data.eliminated, false, data.points);
    newPlayer.id = data.id;

    // Add new player to the remote players array
    remotePlayers.push(newPlayer);

    // Update list of players drawn on canvas
    updatePlayerList();
}

// New ball
function onNewBall(data) {
    snd_throw.currentTime = 0;
    snd_throw.play();
    console.log("Uusi pallo pelissä");

    // Initialise the new ball
    var newBall = new Ball(data.x, data.y, data.angle, data.speed);

    // Add new ball to the balls array
    balls.push(newBall);
}

// Update a player (position, angle, elimination state, points)
function onUpdatePlayer(data) {
    var player = data.local ? localPlayer : playerById(data.id);

    if (!player) {
        return;
    }

    if ("x" in data) {
        player.setX(data.x);
        player.setY(data.y);
    }

    if ("angle" in data) {
        player.setAngle(data.angle);
    }

    if ("name" in data) {
        player.setName(data.name);
    }

    if ("eliminated" in data) {
        player.setEliminated(data.eliminated);
        updatePlayerList();
    }

    if ("points" in data) {
        player.setPoints(data.points);
        updatePlayerList();
    }

    /*
    if ("id" in data && data.local) {
        console.log("ID muuttui: " + data.id);
        player.id = data.id;
    }
    */
}

// Remove player
function onRemovePlayer(data) {
    var removePlayer = playerById(data.id);

    // Player not found
    if (!removePlayer) {
        console.log("Player not found: "+data.id);
        return;
    }

    // Remove player from array
    remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);

    // Update list of players drawn on canvas, notify the local player
    updatePlayerList();
    onMessage({msg: data.name + " poistui pelistä", name: "PALVELIN"});
}

// Local player hit by another player
function onHit(data) {
    console.log(data);
    var eliminated = playerById(data.eliminatedId),
        eliminator = playerById(data.eliminatorId);

    // Check if local player was hit or hit someone else
    if (!eliminated) {// && data.eliminatedId == localPlayer.id) {
        eliminated = localPlayer;
    } else if (!eliminator) { //&& data.eliminatorId == localPlayer.id) {
        eliminator = localPlayer;
    }
    console.log("1." + eliminator === localPlayer);
    console.log(eliminated === localPlayer);
    // Update hitters & hittees points
    eliminated.setPoints(data.eliminatedPoints);
    eliminator.setPoints(data.eliminatorPoints);

    snd_hit.play();

    /* Laitettu pois tilapäisesti koska näitä tulee paljon jos on monta pelaajaa
    // Notify client, update canvas player list
    onMessage({
        name: "PALVELIN",
        msg: eliminator.getName()  + " poltti pelaajan " + eliminated.getName()});
    updatePlayerList();
    */
}

// Ping response received
function onPing() {
    pingTime = new Date() - pingSentDate;
}

// Chat message received
function onMessage(data) {
	var elem = document.createElement("div"),
        timeStr = new Date().toLocaleTimeString();
	elem.innerHTML = "[" + timeStr + "] <strong>" + data.name + "</strong>: " + data.msg;
	chat.appendChild(elem);
    chat.scrollTop = chat.scrollHeight;
}

// Current round is over
function onGameOver(data) {
    var msg;
    if (data.winner) {
        latestWinnerName = data.winner;
        msg = "Erä päättyi. Erän voitti <b>" + data.winner + "</b>.";
    } else {
        msg = "Erä päättyi keskeytykseen.";
    }
    onMessage({name: "PALVELIN", msg: msg});
    balls.length = 0;  // Clear all balls
    canvas.onmousedown = null;
    canvas.onmouseup   = null;
    paused = true;
    countdown = 5;
    startCountdown();
}

// New game starts
function onNewGame(data) {
    onMessage({name: "PALVELIN", msg: "Uusi erä alkoi"});
    snd_start.play();
    balls.length = 0;  // Clear all balls
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup   = onMouseUp;
    paused = false;
}

// Server-side error
function onError() {
    onMessage({name: "PALVELIN", msg: "Tapahtui virhe - todennäköisesti palvelin on täynnä"});
}

// Server asks for name
function onAskName() {
    var name = prompt("Enter name:", "anonymous");
    onMessage({name: "PALVELIN", msg: "Tervetuloa " + name});
    socket.emit("new player", {name: name});
}

// Existing session reactivated
function onWelcomeBack(data) {
    onMessage({name: "PALVELIN", msg: "Tervetuloa takaisin " + data.name});
    socket.emit("new player", {name: data.name, points: data.points, new: false});
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

        sendPing();
    }

    // Request a new animation frame using Paul Irish's shim
    window.requestAnimFrame(animate);
}


/**************************************************
** GAME UPDATE
**************************************************/
function update(delta) {
	// Update local player and check for change
	if (localPlayer.update(keys, delta)) {
        // Restrict player movement
        restrictPlayerMovement(localPlayer);

		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(),
			angle: localPlayer.getAngle()});
	}

	// Update balls
	for (var i = 0; i < balls.length; i++) {
		if (!balls[i].update(delta)) {
			// Ball out of screen, remove from list
			balls.splice(i, 1);
			console.log("Pallo pois ruudusta");
		}
	}

	// Increase the shotTimer if loading a shot, or cooling one off
	if (shotTimer !== 0) {
		shotTimer++;
	}
}


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
    // Wipe the canvas clean
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If loading a shot or cooling a shot off, draw loading bar
    if (shotTimer && localPlayer.isEliminated()) {
        drawLoadingBar();
    }

    // Draw the local player
    localPlayer.draw(ctx, localPlayer.id);

    // Draw the remote players
    for (var i = 0; i < remotePlayers.length; i++) {
        remotePlayers[i].draw(ctx, remotePlayers[i].id);
    }

    // Draw local and remote balls
    for (var j = 0; j < balls.length; j++) {
        balls[j].draw(ctx);
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

// Draw a shot loading bar under the local player
function drawLoadingBar() {
    var x = localPlayer.getX() - 30,
        y = localPlayer.getY() + 30,
        fillPercent;
        fillWidth = Math.min(((Math.abs(shotTimer)-40)/40)*60, 60);

    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, 60, 8);

    if (shotTimer > 0) {
        fillPercent = (shotTimer - 40) / 40;
        ctx.fillStyle = "green";
    } else {
        fillPercent = Math.abs(shotTimer) / SHOT_COOLOFF_TIME;
        ctx.fillStyle = "orange";
    }

    ctx.fillRect(x, y, Math.min(fillPercent * 60, 60), 8);
    ctx.restore();
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

// Player can't leave/enter the circle
function restrictPlayerMovement(player) {
    var relativeX = player.getX() - WIDTH/2;
    var relativeY = player.getY() - HEIGHT/2;
    var over_border = player.isEliminated() ?
                      Math.pow(relativeX, 2) + Math.pow(relativeY, 2) < RING_RADIUS_SQUARED
                    : Math.pow(relativeX, 2) + Math.pow(relativeY, 2) > RING_RADIUS_SQUARED;

    if (over_border) {
        var vectorLength = Math.sqrt(Math.pow(relativeX, 2) + Math.pow(relativeY, 2));
        relativeX = (relativeX / vectorLength) * RING_RADIUS;
        relativeY = (relativeY / vectorLength) * RING_RADIUS;
        player.setX(WIDTH/2 + relativeX);
        player.setY(HEIGHT/2 + relativeY);
    }

    // Prevent player from moving over the level border
    if (player.getX() < 0) player.setX(0);
    if (player.getY() < 0) player.setY(0);
    if (player.getX() > WIDTH) player.setX(WIDTH);
    if (player.getY() > HEIGHT) player.setY(HEIGHT);
}

// Laskee x-akselin ja annetun pisteen välisen kulman (CCW) radiaaneina
function calculateAngle(objectX, objectY) {
    return Math.atan2(mouseY - objectY, mouseX - objectX);
}

// Find player by ID
function playerById(id) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    }

    return false;
}

// Send a ping request
function sendPing() {
    pingSentDate = new Date();
    socket.emit("ping");
}

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
