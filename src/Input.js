

function Input(){
	this.listeners = [];
}

Input.prototype.registerForInput = function(listener){
	this.listeners[this.listeners.length] = listener;
}
