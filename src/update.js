import _ from 'lodash'

import { isIn } from './bounds'
import { collides } from './collision'
import { PLAYER_V } from './constants'
import { getPlayer, getPlayers, getResources } from './stateSelectors'

export default (delta, state) => {
  state = updatePlayer(delta, state)
  state = updateActors(delta, state)
  state = updateResources(delta, state)
  state = updateMenu(delta, state)
  return state // TODO
}

function updateMenu (delta, state) {
  console.log(delta);
  return {
    ...state,
    menufade: Math.max(0, state.menufade - 0.5 * 0.001 * delta)
  }
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
  const newPos = {
    x: actor.x + actor.vx * delta,
    y: actor.y + actor.vy * delta
  }
  const outOfBounds = !isIn(newPos, state)
  const pos = outOfBounds ? { x: actor.x, y: actor.y } : newPos
  return { ...actor, ...pos }
}

function updateResources (delta, state) {
  return {
    ...state,
    actors: state.actors.map(d => {
      return d.type === 'resource' ? updateResource(delta, state, d) : d
    })
  }
}

function updateResource (delta, state, resource) {
  const players = getPlayers(state)
  for (let p of players) {
    if (collides(p, resource)) return { ...resource, collidesWith: p.id }
  }

  return resource
}
