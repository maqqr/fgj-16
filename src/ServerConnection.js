

function ServerConnection(port){
	this.port = port;
	this.stateUpdateListeners = [];
	this.onClientConnected = null;
	//this.connectToServer(port);
	//this.registerToServerEvents(events);
}



ServerConnection.prototype.connectToServer = function(){
	var con = this;
	this.eurecaClient = new Eureca.Client();
	this.eurecaClient.exports.setId = con.setId;
	this.eurecaClient.exports.updateState = function(state){
		con.updateState(state);
	};
	this.url = "http://" + document.domain;
    //this.socket = io.connect(url, {port: portNum, transports: ["websocket"]});
	this.pingSentDate;   // Date object of when the latest ping request was sent
    this.pingTime;      
	this.eurecaClient.ready(this.clientConnected);
}


ServerConnection.prototype.setId = function(id)
{
	this.id = id;
}


ServerConnection.prototype.updateState = function(state)
{
	this.stateUpdateListeners.forEach(function(element){
		element.process(state);
	});
}


ServerConnection.prototype.clientConnected = function(proxy){
	this.server = proxy;
	if(this.onClientConnected)
		this.onClientConnected.process();
	
}


ServerConnection.prototype.registerToServerEvents = function(events){
	
	events.forEach(function(element, index, arr){
		//this.socket.on(element.name, element.func)
	});
	
	//  // Socket connection successful
    //this.socket.on("connect", events.id);
    //
    //// Socket disconnection
    //this.socket.on("disconnect", onSocketDisconnect);
    //
    //// New player message received
    //this.socket.on("new player", onNewPlayer);
    //
    //// New ball message received
    //this.socket.on("new ball", onNewBall);
    //
    //// Player move message received
    //this.socket.on("update", onUpdatePlayer);
    //
    //// Player removed message received
    //this.socket.on("remove player", onRemovePlayer);
    //
    //// A player eliminated
    //this.socket.on("hit", onHit);
    //
    //// Ping response message received
    //this.socket.on("ping", onPing);
    //
    //// Chat message received
    //this.socket.on("msg", this.onMessage);
    //
    //// Current round is over
    //this.socket.on("game over", onGameOver);
    //
    //// New game starts
    //this.socket.on("newgame", onNewGame);
    //
    //// Error
    //this.socket.on("error", onError);
    //
    //// Server asks for name
    //this.socket.on("ask name", onAskName);
    //
    //// Welcome message received - existing session reactivated
    //this.socket.on("welcome back", onWelcomeBack);
}

ServerConnection.prototype.getFreeId = function(){
	   
	return 2;
}

ServerConnection.prototype.getState = function(){
	this.updateState(this.server.getState());
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

ServerConnection.prototype.registerForOnClientConnected = function(callable, caller){
	this.onClientConnected = new EventHandler(callable, caller);
}

ServerConnection.prototype.registerForStateChange = function(callable, caller){
	this.stateUpdateListeners[this.stateUpdateListeners.length] = new EventHandler(callable, caller);
}