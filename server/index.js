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
  TIMER_UPDATED
} from '../src/networkEventTypes'
import * as handlers from '../src/sharedEventHandlers'

const app = http.createServer(handler)
app.listen(3001)
const io = socketIO(app)
console.log('Listening on port 3001...')

function handler (req, res) {
  res.writeHead(200)
  return res.end('moro')
}

let state = {
  actors: [
    factory.makeResource({ id: 0 }),
    factory.makeResource({ id: 1 })
  ],
  resources: {},
  timeofday: 0.0
}

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

  socket.on('disconnect', () => {
    const { id } = socket
    socket.broadcast.emit(PLAYER_LEFT, { id })
    state = handlers.onPlayerLeft(state, { id })
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
    width: 30,
    height: 40,
    resources: {}    
  }

  state = handlers.onPlayerJoined(state, player)
  socket.emit(INIT_PLAYER, { ...state, playerId: player.id })
  socket.broadcast.emit(PLAYER_JOINED, player)
}

setInterval(function () {
  state.timeofday += 0.1
  io.sockets.emit(TIMER_UPDATED, { timeofday: state.timeofday })
}, 1000)
