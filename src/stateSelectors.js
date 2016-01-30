import _ from 'lodash'

export function getPlayer ({ actors, playerId }) {
  return _.find(actors, { id: playerId })
}

export function getPlayers ({ actors }) {
  return _.filter(actors, { type: 'player' })
}

export function getResources ({ actors }) {
  return _.filter(actors, { type: 'resource' })
}