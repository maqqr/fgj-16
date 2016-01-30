import * as handlers from './sharedEventHandlers'
import { getCollidedResource } from './stateSelectors'

export default (fps, state) => {
  state = handleResourceCollisions(state)
  return state
}

function handleResourceCollisions (state) {
  state.collidedResource = getCollidedResource(state)

  if (state.collidedResource) {
    return handlers.onResourcePicked(state, state.collidedResource)
  }

  return state
}
