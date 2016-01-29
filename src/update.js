import { isIn } from './bounds'

export default (delta, state) => {
  state = updateActors(delta, state)
  return state // TODO
}

function updateActors (delta, state) {
  return {
    ...state,
    actors: state.actors.map(d => updateActor(delta, state, d))
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
