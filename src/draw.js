import {
  SCREEN_H,
  SCREEN_W
} from './constants'

export default (interp, state, cx) => {
  clear(interp, state, cx)
  drawActors(interp, state, cx)
}

function clear (interp, state, cx) {
  cx.fillStyle = 'white'
  cx.fillRect(0, 0, SCREEN_W, SCREEN_H)
}

function drawActors (interp, { actors }, cx) {
  actors.forEach(d => {
    cx.fillStyle = d.color
    cx.fillRect(d.x, d.y, d.width, d.height)
  })
}
