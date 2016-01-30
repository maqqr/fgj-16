import {
  SCREEN_H,
  SCREEN_W
} from './constants'

export default (interp, state, cx, res, offset) => {
  clear(interp, cx, '#4A58B9')
  cx.save()
  cx.translate(offset.x, offset.y)
  drawBackground(interp, state, cx, res)
  drawActors(interp, state, cx, res)
  cx.restore()
  drawGameScore(interp, state, cx, res)
  drawLogo(interp, state, cx, res)
}

function clear (interp, cx, color) {
  cx.fillStyle = color
  cx.fillRect(0, 0, SCREEN_W, SCREEN_H)
}

function drawBackground (interp, state, cx, res) {
  cx.drawImage(res.background, 0, 0)
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

    if (d.type === 'player') {
      cx.fillText(JSON.stringify(d.resources), d.x, d.y)
    }
  })
}

function drawGameScore (interp, { resources }, cx, res) {
  cx.fillStyle = 'black';
  cx.fillText(JSON.stringify(resources), 10, 10)
}

function drawLogo (interp, { menufade }, cx, res) {
  if (menufade > 0) {
    clear(interp, cx, 'black')

    cx.globalAlpha = 1.0 - Math.abs(1.5 - menufade) / 1.5
    cx.drawImage(res.logo, 0, 0, SCREEN_W, SCREEN_H)

    cx.globalAlpha = 1.0
  }
}