/**
 * Author: Tero Paavolainen
 * Version: 1.0.0
 */

/**
 * A simple class to handle event based situations in other classes
 */
 
 /**
  * Initializes a new eventhandler based on given method and callBackClass.
  * CallbackClass is not necessary
  */
function EventHandler (method, callBackClass){
	this.method = method;
	this.callBackClass = callBackClass;
}

/**
 * Activates the method in the event handler based on if it has a callBackClass.
 * Will pass the given arguments forward as an args array.
 */
EventHandler.prototype.process = function(){
	//Passing arguments here allows some sort of parameter functionality but isnt the greatest way to handle this.
	//TODO: better argument passing since i dont like argument array passing like this
	if(this.callBackClass){
		this.method.call(this.callBackClass, arguments); 
	}
	else this.method(arguments);
}