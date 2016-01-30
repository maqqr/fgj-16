import {
  SCREEN_H,
  SCREEN_W
} from './constants'

export function isIn ({ x, y }, state) {
  return x >= 0 && x <= SCREEN_W && y >= 0 && y <= SCREEN_H
}


export function overlaps( {x,y}, {x2, y2}){
	return !(x < x2 && x2 > x &&
    y < y2 && y2 > y);
}