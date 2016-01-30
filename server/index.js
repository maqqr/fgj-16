import http from 'http'
import socketIO from 'socket.io'
import _ from 'lodash'

import { SCREEN_H, SCREEN_W } from '../src/constants'
import {
  INIT_PLAYER,
  PLAYER_JOINED,
  PLAYER_LEFT,
  PLAYER_UPDATED_POS
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
  actors: []
}

io.on('connection', function (socket) {
  onPlayerConnected(socket)

  socket.on(PLAYER_UPDATED_POS, data => {
    socket.broadcast.emit(PLAYER_UPDATED_POS, data)
    state = handlers.onPlayerUpdatedPos(state, data)
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
    color: 'green',  // TODO random color
    width: 30,
    height: 20
  }

  state = handlers.onPlayerJoined(state, player)
  socket.emit(INIT_PLAYER, { actors: state.actors, playerId: player.id })
  socket.broadcast.emit(PLAYER_JOINED, player)
}
