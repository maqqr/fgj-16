


function GameClient(){

	
	this.server = new ServerConnection(8000);
	this.pc = new PlayerController()
	this.state = null;
	
	this.input = new Input();
	this.ui = new UI();
	this.ui.registerForOnClientConnected(this.start, this);
	this.ui.start();


}

GameClient.prototype.start = function()
	{
		var client = this;
		//var events = [
		//{name:"connect", func:client.onConnect}
		//];
		//this.server.registerToServerEvents(events);
		this.registerEvents();
		this.server.connectToServer();

		this.pc.register(this.server.getFreeId(), this.state);


	}


GameClient.prototype.onConnect = function(){
	this.server.getState();
}


GameClient.prototype.registerEvents = function(){
	this.input.registerForInput(this.inputUpdated);
	//var client = this;
	this.server.registerForOnClientConnected(this.onConnect, this);
	this.server.registerForStateChange(this.updateState, this);
}


GameClient.prototype.inputUpdated = function(x, y){
	this.movePlayerFromInput(this.pc.player.x + x, this.pc.player.y + y, this.id, true);
}


GameClient.prototype.movePlayer = function(x, y, id, serverNeedsNotify)
{
	var found = this.state.findPlayer(id);
	if(found == undefined)
		return;
	found.x = x;
	found.y = y;
	if(serverNeedsNotify){
		this.server.notifyMovement(id, x, y);
	}
	
}


GameClient.prototype.updateState = function(stateArgs)
{
	this.state = stateArgs[0];
	this.ui.updateState(this.state);
	//this.ui.drawState(this.state);
}

GameClient.prototype.onSocketConnected = function() {
    console.log("Connected to socket server");
    this.onMessage({name: "PALVELIN", msg: "Yhdistetty palvelimelle"});
}

// Socket disconnected - most probably due to same IP error
GameClient.prototype.onSocketDisconnect = function() {
    console.log("Disconnected from socket server");
    this.onMessage({name: "PALVELIN", msg: "Yhteys katkesi." +
        "Onko peli käynnissä toisella välilehdellä?"});
}

// New player
GameClient.prototype.onNewPlayer = function(data) {
    console.log("New player connected: " + data.id);
    this.onMessage({name: "PALVELIN", msg: data.name + " liittyi peliin"});

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
GameClient.prototype.onUpdatePlayer = function(data) {
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
GameClient.prototype.onRemovePlayer = function(data) {
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
    this.onMessage({msg: data.name + " poistui pelistä", name: "PALVELIN"});
}

// Local player hit by another player
GameClient.prototype.onHit = function(data) {
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



// Current round is over
GameClient.prototype.onGameOver = function(data) {
    var msg;
    if (data.winner) {
        latestWinnerName = data.winner;
        msg = "Erä päättyi. Erän voitti <b>" + data.winner + "</b>.";
    } else {
        msg = "Erä päättyi keskeytykseen.";
    }
    this.onMessage({name: "PALVELIN", msg: msg});

    //canvas.onmousedown = null;
    //canvas.onmouseup   = null;
    paused = true;
    countdown = 5;
    startCountdown();
}

// New game starts
GameClient.prototype.onNewGame = function(data) {
    this.onMessage({name: "PALVELIN", msg: "Uusi erä alkoi"});
    snd_start.play();

    canvas.onmousedown = onMouseDown;
    canvas.onmouseup   = onMouseUp;
    paused = false;
}

// Server-side error
GameClient.prototype.onError = function() {
    this.onMessage({name: "PALVELIN", msg: "Tapahtui virhe - todennäköisesti palvelin on täynnä"});
}

// Server asks for name
GameClient.prototype.onAskName = function() {
    var name = prompt("Enter name:", "anonymous");
    this.onMessage({name: "PALVELIN", msg: "Tervetuloa " + name});
    socket.emit("new player", {name: name});
}

// Existing session reactivated
GameClient.prototype.onWelcomeBack = function(data) {
    this.onMessage({name: "PALVELIN", msg: "Tervetuloa takaisin " + data.name});
    socket.emit("new player", {name: data.name, points: data.points, new: false});
}



gameClient = new GameClient();
gameClient.start();


