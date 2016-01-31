import { WORLD_W, WORLD_H } from './constants'

export function makeResource (props) {
  let r = Math.random()
  let res = {
    id: Math.floor(Math.random() * 10000), // fingers crossed
    type: 'resource',
    name: 'banana',
    texture: 'banana',
    x: Math.floor(Math.random() * WORLD_W),
    y: Math.floor(Math.random() * WORLD_H),
    vx: 0,
    vy: 0,
    width: 40,
    height: 40,
    ...props
  }
  if (r < 0.33) {
    res.name = 'wood'
    res.texture = 'wood'
  }
  else if (r < 0.66) {
    res.name = 'rock'
    res.texture = 'rock'
  }
  return res
}
