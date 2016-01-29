

function Server(address){
	this.connectToServer(address);
}

Server.prototype.connectToServer = function(address){
	//Socket Magic
}

Server.prototype.registerForStateChange = function(callable){
	this.server.doTheThing(callable); //Dum di dum
}