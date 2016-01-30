
import { overlaps } from './bounds'

function (state){
	let players = [];
	let resources = [];
	state.actors.forEach((el, arr, i) =>
	{
		//First check if its a resource or a player
		if(el.type === 'resource')
		{
			players.forEach((pl) => {
				if(overlaps({x:pl.x, y:pl.y}, {x2:el.x, y2:el.y})){
					
				}
			});
		}
		else{
			
		}
	} );
}

