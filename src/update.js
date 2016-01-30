import { isIn } from './bounds'
import { PLAYER_V } from './constants'

export default (delta, state) => {
  state = updatePlayer(delta, state)
  state = updateActors(delta, state)
  return state // TODO
}

function updateActors (delta, state) {
  return {
    ...state,
    actors: state.actors.map(d => updateActor(delta, state, d))
  }
}

function updatePlayer (delta, state) {
  const { actors, keyboard, playerId } = state

  return {
    ...state,
    actors: actors.map(d => {
      if (d.id === playerId) {
        let vx = 0
        let vy = 0
        if (keyboard.right) vx += PLAYER_V
        if (keyboard.left) vx -= PLAYER_V
        if (keyboard.up) vy -= PLAYER_V
        if (keyboard.down) vy += PLAYER_V

        return { ...d, vx, vy }
      }

      return d
    })
  }
}

function updateActor (delta, state, actor) {
  const outOfBounds = !isIn(actor, state)
  const pos = outOfBounds ? { x: 10, y: 10 } : {
    x: actor.x + actor.vx * delta,
    y: actor.y + actor.vy * delta
  }

  return {
    ...actor,
    ...pos
  }
}