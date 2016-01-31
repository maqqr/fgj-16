import http from 'http'
import socketIO from 'socket.io'
import _ from 'lodash'

import { SCREEN_H, SCREEN_W } from '../src/constants'
import * as factory from '../src/factory'
import {
  INIT_PLAYER,
  PLAYER_JOINED,
  PLAYER_LEFT,
  PLAYER_UPDATED_POS,
  RESOURCE_PICKED,
  RESOURCE_ADDED,
  RESOURCE_STORED,
  TIMER_UPDATED,
  SERVER_MESSAGE
} from '../src/networkEventTypes'
import * as handlers from '../src/sharedEventHandlers'
import { hasPlayers } from '../src/stateSelectors'

const app = http.createServer(handler)
app.listen(31337)
const io = socketIO(app)
console.log('Listening on port 31337...')

function handler (req, res) {
  res.writeHead(200)
  return res.end('moro')
}

const resourceTypes = ["banana", "wood", "rock"]

let state = {
  actors: [],
  resources: {},
  neededResources: {},
  timeofday: 0.0
}

resourceTypes.forEach(function (t) {
  state.neededResources[t + "c"] = 0 // current
  state.neededResources[t + "n"] = 2 // needed
})

function resetResources() {
  for (var k in resourceTypes) {
    state.neededResources[k + "c"] = 0
  }
}

function gameOver() {
  resourceTypes.forEach(function (t) {
    state.neededResources[t + "c"] = 0 // current
    state.neededResources[t + "n"] = 5 // needed
  });
  state.timeofday = 0.0
  state.resources = {}
  state.actors = state.actors.filter(d => d.type !== 'resource')
  io.sockets.emit(INIT_PLAYER, state)
}

function newDay () {
  let fail = false
  resourceTypes.forEach(function (t) {
    if (state.neededResources[t + "c"] < state.neededResources[t + "n"]) {
      fail = true
    }
  })

  if (fail) {
    gameOver()
    io.sockets.emit(SERVER_MESSAGE, "Ritual failed. Game Over.")
  }
  else {
    resourceTypes.forEach(function (t) {
      state.neededResources[t + "c"] = 0
      state.neededResources[t + "n"] += 1
    })
    io.sockets.emit(INIT_PLAYER, state)
    io.sockets.emit(SERVER_MESSAGE, "Ritual completed.")
  }
}

// Resource spawning timer.
setInterval(() => {
  if (hasPlayers(state)) {
    const id = _.get(_.last(state.actors.filter(d => d.type === 'resource')), 'id', 9999) + 1
    const newResource = factory.makeResource({ id })
    io.sockets.emit(RESOURCE_ADDED, newResource)
    state = handlers.onResourceAdded(state, newResource)
  }
}, 2000)

// Day/night cycle.
setInterval(function () {
  state.timeofday += 0.0025
  if (state.timeofday > 1.0) {
    state.timeofday -= 1.0
    newDay()
  }
  io.sockets.emit(TIMER_UPDATED, { timeofday: state.timeofday })
}, 50)


io.on('connection', function (socket) {
  onPlayerConnected(socket)

  socket.on(PLAYER_UPDATED_POS, data => {
    socket.broadcast.emit(PLAYER_UPDATED_POS, data)
    state = handlers.onPlayerUpdatedPos(state, data)
  })

  socket.on(RESOURCE_PICKED, data => {
    socket.broadcast.emit(RESOURCE_PICKED, data)
    state = handlers.onResourcePicked(state, data)
  })

  socket.on(RESOURCE_STORED, data => {
    socket.broadcast.emit(RESOURCE_STORED, data)
    state = handlers.onResourceStored(state, data)
  })

  socket.on('disconnect', () => {
    const { id } = socket
    socket.broadcast.emit(PLAYER_LEFT, { id })
    state = handlers.onPlayerLeft(state, { id })

    // Restart state when the last player leaves
    if (!hasPlayers(state)) {
      state = { ...state, actors: [], resources: {}, timeofday: 0 }
      resetResources()
    }
  })
})

function onPlayerConnected (socket) {
  const id = socket.id
  const x = _.random(0, SCREEN_W)
  const y = _.random(0, SCREEN_H)
  const player = {
    id,
    x,
    y,
    vx: 0,
    vy: 0,
    texture: 'player',
    type: 'player',
    width: 30,
    height: 40,
    resources: {}
  }

  state = handlers.onPlayerJoined(state, player)
  socket.emit(INIT_PLAYER, { ...state, playerId: player.id })
  socket.broadcast.emit(PLAYER_JOINED, player)
}
