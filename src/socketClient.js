import _ from 'lodash'

import {
  INIT_PLAYER,
  PLAYER_JOINED,
  PLAYER_LEFT,
  PLAYER_UPDATED_POS
} from './networkEventTypes'
import * as handlers from './sharedEventHandlers'

export function onNetworkEvent (event, data) {
  switch (event) {
    case INIT_PLAYER:
      return state => onInitPlayer(state, data)
    case PLAYER_JOINED:
      return state => handlers.onPlayerJoined(state, data)
    case PLAYER_LEFT:
      return state => handlers.onPlayerLeft(state, data)
    case PLAYER_UPDATED_POS:
      return state => handlers.onPlayerUpdatedPos(state, data)
    default:
      return state => state
  }
}

function onInitPlayer (state, data) {
  console.log('player init', data)
  return { ...state, ...data }
}

export function sendPlayerStateToServer (io, state) {
  const { actors, playerId, updatedPosition } = state
  if (!updatedPosition) return state

  const player = _.find(actors, { id: playerId })

  if (updatedPosition) {
    io.emit(PLAYER_UPDATED_POS, _.pick(player, ['id', 'x', 'y', 'vx', 'vy']))
  }

  return { ...state, updatedPosition: false }
}
