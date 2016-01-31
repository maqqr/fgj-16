import {
  SCREEN_H,
  SCREEN_W
} from './constants'

export default (interp, state, cx, res, offset) => {
  clear(interp, cx, '#4A58B9')
  drawGame(interp, state, cx, res, offset)
  drawGUI(interp, state, cx, res)

  //drawLogo(interp, state, cx, res)
}

function drawGame (interp, state, cx, res, offset) {
  cx.save()
  cx.translate(offset.x, offset.y)
  drawBackground(interp, state, cx, res)
  drawActors(interp, state, cx, res)
  cx.restore()
  drawNight(interp, state, cx, res)
}

function drawGUI (interp, state, cx, res) {
  drawGameScore(interp, state, cx, res)
  drawClock(interp, state, cx, res)

  if (state.messageTimer > 0)
  {
    cx.font="30px Arial";
    cx.fillStyle = 'black'
    cx.fillText(state.message, 200, 50)
    cx.font="12px Arial";
  }
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
    if (d.type === 'player') {
      //cx.fillText(JSON.stringify(d.resources), d.x, d.y)
      let hasResource = false
      for (var restype in d.resources) {
        hasResource = true
        cx.drawImage(res[restype], d.x, d.y - 27, 30, 30)
      }
      if (hasResource) {
        cx.drawImage(res.playercarry, d.x, d.y, d.width, d.height)
      }
      else {
        cx.drawImage(res.player, d.x, d.y, d.width, d.height)
      }
    }
    else if (d.color !== undefined) {
      cx.fillStyle = d.color
      cx.fillRect(d.x, d.y, d.width, d.height)
    }
    else if (d.texture !== undefined) {
      cx.drawImage(res[d.texture], d.x, d.y, d.width, d.height)
    }
  })
}

function drawGameScore (interp, { neededResources }, cx, res) {
  cx.fillStyle = 'black';
  //cx.fillText(JSON.stringify(resources), 10, 10)
  const resourceTypes = ["banana", "wood", "rock"]
  for (var i = resourceTypes.length - 1; i >= 0; i--) {
    let name = resourceTypes[i]
    cx.fillText(name + ": " + neededResources[name+"c"] + " / " + neededResources[name+"n"], 10, 30 + 20 * i)
  }
}

function drawClock (interp, { timeofday }, cx, res) {
  const clocksize = 100
  drawRotatedTexture(cx, res.clock, SCREEN_W - clocksize/2, clocksize/2, -2 * Math.PI * timeofday)
  cx.drawImage(res.clockborder, SCREEN_W - clocksize, 0, clocksize, clocksize)
}

function drawRotatedTexture (cx, tex, x, y, angle) {
  cx.save()
  cx.translate(x, y)
  cx.rotate(angle)
  cx.scale(0.5, 0.5)
  cx.drawImage(tex, -(tex.width/2), -(tex.height/2))
  cx.restore()
}

function drawLogo (interp, { menufade }, cx, res) {
  if (menufade > 0) {
    clear(interp, cx, 'black')

    cx.globalAlpha = 1.0 - Math.abs(1.5 - menufade) / 1.5
    cx.drawImage(res.logo, 0, 0, SCREEN_W, SCREEN_H)

    cx.globalAlpha = 1.0
  }
}

function drawNight (interp, { timeofday }, cx, res) {
  const maxDarkness = 0.5
  if (timeofday > 0.4) {
    // Fade to darkness.
    cx.globalAlpha = 0.5 - maxDarkness * (0.5 - timeofday) / 0.1
    if (timeofday > 0.5) {
      cx.globalAlpha = 1.0 - maxDarkness
    }

    // Fade to lightness.
    if (timeofday > 0.9) {
      cx.globalAlpha = 0.5 - 0.5 * (timeofday - 0.9) / 0.1
    }

    cx.fillStyle = 'black'
    cx.fillRect(0, 0, SCREEN_W, SCREEN_H)
    cx.globalAlpha = 1.0
  }
}