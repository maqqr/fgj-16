import _ from 'lodash'

import {
  INIT_PLAYER,
  PLAYER_JOINED,
  PLAYER_LEFT,
  PLAYER_UPDATED_POS,
  RESOURCE_PICKED,
  TIMER_UPDATED
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
    case RESOURCE_PICKED:
      return state => handlers.onResourcePicked(state, data)
    case TIMER_UPDATED:
      return state => onTimerUpdated(state, data)
    default:
      return state => state
  }
}

function onTimerUpdated (state, data) {
  console.log('new time' + data.timeofday)
  return { ...state, timeofday: data.timeofday }
}

function onInitPlayer (state, data) {
  console.log('player init', data)
  return { ...state, ...data }
}

export function sendPlayerStateToServer (io, state) {
  const { actors, collidedResource, playerId, updatedPosition } = state
  if (!(updatedPosition || collidedResource)) return state

  if (updatedPosition) {
    const player = _.find(actors, { id: playerId })
    io.emit(PLAYER_UPDATED_POS, _.pick(player, ['id', 'x', 'y', 'vx', 'vy']))
  }

  if (collidedResource) {
    io.emit(RESOURCE_PICKED, collidedResource) // TODO pick properties to send
  }

  return { ...state, updatedPosition: false, collidedResource: undefined }
}
