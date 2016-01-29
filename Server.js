

function ServerConnection(address){
	this.connectToServer(address);
}

ServerConnection.prototype.connectToServer = function(address){
	this.url = "http://" + document.domain;
    this.socket = io.connect(url, {port: 8000, transports: ["websocket"]});
	this.pingSentDate;   // Date object of when the latest ping request was sent
    this.pingTime;      
	
}


ServerConnection.prototype.registerToServerEvents = function(){
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
}


// Socket connected
ServerConnection.prototype.onSocketConnected = function() {
    console.log("Connected to socket server");
    onMessage({name: "PALVELIN", msg: "Yhdistetty palvelimelle"});
}

// Socket disconnected - most probably due to same IP error
ServerConnection.prototype.onSocketDisconnect = function() {
    console.log("Disconnected from socket server");
    onMessage({name: "PALVELIN", msg: "Yhteys katkesi." +
        "Onko peli käynnissä toisella välilehdellä?"});
}

// New player
ServerConnection.prototype.onNewPlayer = function(data) {
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


// Update a player (position, angle, elimination state, points)
ServerConnection.prototype.onUpdatePlayer = function(data) {
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
ServerConnection.prototype.onRemovePlayer = function(data) {
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
ServerConnection.prototype.onHit = function(data) {
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

ServerConnection.prototype.sendPing = function() {
    pingSentDate = new Date();
    socket.emit("ping");
}

// Ping response received
ServerConnection.prototype.onPing = function() {
    pingTime = new Date() - pingSentDate;
}

// Chat message received
ServerConnection.prototype.onMessage = function(data) {
	var elem = document.createElement("div"),
        timeStr = new Date().toLocaleTimeString();
	elem.innerHTML = "[" + timeStr + "] <strong>" + data.name + "</strong>: " + data.msg;
	chat.appendChild(elem);
    chat.scrollTop = chat.scrollHeight;
}

// Current round is over
ServerConnection.prototype.onGameOver = function(data) {
    var msg;
    if (data.winner) {
        latestWinnerName = data.winner;
        msg = "Erä päättyi. Erän voitti <b>" + data.winner + "</b>.";
    } else {
        msg = "Erä päättyi keskeytykseen.";
    }
    onMessage({name: "PALVELIN", msg: msg});

    canvas.onmousedown = null;
    canvas.onmouseup   = null;
    paused = true;
    countdown = 5;
    startCountdown();
}

// New game starts
ServerConnection.prototype.onNewGame = function(data) {
    onMessage({name: "PALVELIN", msg: "Uusi erä alkoi"});
    snd_start.play();

    canvas.onmousedown = onMouseDown;
    canvas.onmouseup   = onMouseUp;
    paused = false;
}

// Server-side error
ServerConnection.prototype.onError = function() {
    onMessage({name: "PALVELIN", msg: "Tapahtui virhe - todennäköisesti palvelin on täynnä"});
}

// Server asks for name
ServerConnection.prototype.onAskName = function() {
    var name = prompt("Enter name:", "anonymous");
    onMessage({name: "PALVELIN", msg: "Tervetuloa " + name});
    socket.emit("new player", {name: name});
}

// Existing session reactivated
ServerConnection.prototype.onWelcomeBack = function(data) {
    onMessage({name: "PALVELIN", msg: "Tervetuloa takaisin " + data.name});
    socket.emit("new player", {name: data.name, points: data.points, new: false});
}




ServerConnection.prototype.registerForStateChange = function(callable){
	this.server.doTheThing(callable); //Dum di dum
}