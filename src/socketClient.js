import _ from 'lodash'

import { PLAYER_UPDATED_POS } from './networkEventTypes'

export function onNetworkEvent (event, data) {
  switch (event) {
    case 'playerUpdatedPos':
      return state => onPlayerUpdatedPos(state, data)
    default:
      return state => state
  }
}

function onPlayerUpdatedPos (state, data) {
  console.log('updatedPos', data)
  return state
}

export function sendPlayerStateToServer (io, state) {
  const { actors, playerId, updatedPosition } = state
  if (!updatedPosition) return state

  const player = _.find(actors, { id: 0 })

  if (updatedPosition) {
    io.emit(PLAYER_UPDATED_POS, {
      playerId,
      ..._.pick(player, ['x', 'y', 'vx', 'vy'])
    })
  }

  return { ...state, updatedPosition: false }
}
