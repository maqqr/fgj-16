import {
  SCREEN_H,
  SCREEN_W
} from './constants'

export default (interp, state, cx, res) => {
  clear(interp, state, cx)
  drawActors(interp, state, cx, res)
}

function clear (interp, state, cx) {
  cx.fillStyle = 'white'
  cx.fillRect(0, 0, SCREEN_W, SCREEN_H)
}

function drawActors (interp, { actors }, cx, res) {
  actors.forEach(d => {
    if (d.color !== undefined) {
      cx.fillStyle = d.color
      cx.fillRect(d.x, d.y, d.width, d.height)
    }
    else if (d.texture !== undefined) {
      cx.drawImage(res.player, d.x, d.y, d.width, d.height)
    }
  })
}