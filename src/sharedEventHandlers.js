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
