import { SCREEN_W, SCREEN_H } from './constants'

export function makeResource (props) {
  return {
    id: Math.floor(Math.random() * 10000), // fingers crossed
    type: 'resource',
    name: 'banana',
    color: 'blue',
    x: Math.floor(Math.random() * SCREEN_W),
    y: Math.floor(Math.random() * SCREEN_H),
    vx: 0,
    vy: 0,
    width: 40,
    height: 40,
    ...props
  }
}
