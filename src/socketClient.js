import _ from 'lodash'

import {
  INIT_PLAYER,
  PLAYER_JOINED,
  PLAYER_LEFT,
  PLAYER_UPDATED_POS,
  RESOURCE_PICKED,
  RESOURCE_ADDED,
  RESOURCE_STORED,
  TIMER_UPDATED
} from './networkEventTypes'
import {
  STORE_X,
  STORE_Y,
  STORE_RADIUS_SQ
} from './constants'
import * as handlers from './sharedEventHandlers'
import { getPlayer, getPlayers, getResources } from './stateSelectors'

export function onNetworkEvent (event, data) {
  //console.log('received event', event);
  switch (event) {
    case INIT_PLAYER:
      return state => onInitPlayer(state, data)
    case PLAYER_JOINED:
      return state => handlers.onPlayerJoined(state, data)
    case PLAYER_LEFT:
      return state => handlers.onPlayerLeft(state, data)
    case PLAYER_UPDATED_POS:
      return state => handlers.onPlayerUpdatedPos(state, data)
    case RESOURCE_ADDED:
      return state => handlers.onResourceAdded(state, data)
    case RESOURCE_PICKED:
      return state => handlers.onResourcePicked(state, data)
    case RESOURCE_STORED:
      return state => handlers.onResourceStored(state, data)
    case TIMER_UPDATED:
      return state => onTimerUpdated(state, data)
    default:
      return state => state
  }
}

function onTimerUpdated (state, data) {
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

  // Store resource
  let player = getPlayer(state)
  if ((player.x - STORE_X)*(player.x - STORE_X) + (player.y - STORE_Y)*(player.y - STORE_Y) < STORE_RADIUS_SQ) {
    let count = 0
    for (var key in player.resources) {
      io.emit(RESOURCE_STORED, {type: key, id: playerId})
      handlers.onResourceStored(state, {type: key, id: playerId})
    }
  }

  return { ...state, updatedPosition: false, collidedResource: undefined }
}
