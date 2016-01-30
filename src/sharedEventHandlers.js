import _ from 'lodash'

export function onPlayerJoined (state, data) {
  console.log('player joined', data)
  return { ...state, actors: state.actors.concat(data) }
}

export function onPlayerLeft (state, data) {
  console.log('player left', data)
  return { ...state, actors: state.actors.filter(d => d.id !== data.id) }
}

export function onPlayerUpdatedPos (state, data) {
  return {
    ...state,
    actors: state.actors.map(d => {
      if (d.id === data.id) {
        return { ...d, ...data }
      }

      return d
    })
  }
}

export function onResourcePicked (state, data) {
  console.log('resource picked', data)
  const actors = state.actors.filter(d => d.id !== data.id)

  const { collidesWith, name } = data
  const actorIndex = _.findIndex(actors, a => a.id === collidesWith)
  const { resources } = actors[actorIndex]

  if (!resources[name]) resources[name] = 0
  resources[name] = resources[name] + 1
  actors[actorIndex].resources = resources

  if (!state.resources[name]) state.resources[name] = 0
  state.resources[name] = state.resources[name] + 1

  return { ...state, actors }
}
