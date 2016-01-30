import _ from 'lodash'

import { getCollidedResources } from './stateSelectors'

export default (fps, state) => {
  state = handleResourceCollisions(state)
  return state
}

function handleResourceCollisions (state) {
  const collidedResources = getCollidedResources(state)
  const actors = state.actors.filter(d => {
    return !(d.type === 'resource' && (d.collidesWith || d.collidesWith === 0))
  })

  collidedResources.forEach(({ collidesWith, name }) => {
    const actorIndex = _.findIndex(actors, a => a.id === collidesWith)
    const { resources } = actors[actorIndex]

    if (!resources[name]) resources[name] = 0
    resources[name] = resources[name] + 1
    actors[actorIndex].resources = resources

    if (!state.resources[name]) state.resources[name] = 0
    state.resources[name] = state.resources[name] + 1
  })

  return { ...state, actors }
}
