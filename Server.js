var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , State = require('./src/State')
  , stateFunctions = require('./src/StateFunctions')
  , Player = require('./src/Player');
  

// serve static files from the current directory
app.use(express.static(__dirname));

var currentState = new State();
var pl = new Player(2);
pl.setPosition(100,100);
stateFunctions.addPlayer(currentState, pl);
currentState.runningId = 5;

//we'll keep clients data here
var clients = {};
  
//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;

//create an instance of EurecaServer
var eurecaServer = new EurecaServer({allow:['setId', 'spawnEnemy', 'kill', 'updateState']});

//attach eureca.io to our http server
eurecaServer.attach(server);




//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
    
    //register the client
    clients[conn.id] = {id:conn.id, remote:remote}
    
    //here we call setId (defined in the client side)
    remote.setId(conn.id);
	remote.updateState(currentState);
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
    
    var removeId = clients[conn.id].id;
    
    delete clients[conn.id];
    
    for (var c in clients)
    {
        var remote = clients[c].remote;
        
        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }   
});


eurecaServer.exports.getState = function(){
	return currentState;
}


eurecaServer.exports.handshake = function()
{
    for (var c in clients)
    {
        var remote = clients[c].remote;
        for (var cc in clients)
        {
            //send latest known position
            var x = clients[cc].laststate ? clients[cc].laststate.x:  0;
            var y = clients[cc].laststate ? clients[cc].laststate.y:  0;

            remote.spawnEnemy(clients[cc].id, x, y);
        }
    }
}


//be exposed to client side
eurecaServer.exports.handleKeys = function (keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    
    for (var c in clients)
    {
        var remote = clients[c].remote;
        remote.updateState(updatedClient.id, keys);
        
        //keep last known state so we can send it to new connected clients
        clients[c].laststate = keys;
    }
}
server.listen(8000);