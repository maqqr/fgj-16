import http from 'http'
import socketIO from 'socket.io'

import { PLAYER_UPDATED_POS } from '../src/networkEventTypes'

const app = http.createServer(handler)
app.listen(3001)
const io = socketIO(app)

function handler (req, res) {
  res.writeHead(200)
  return res.end('moro')
}

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' })

  socket.on('my other event', function (data) {
    console.log(data)
  })

  socket.on('playerUpdate', data => {
    console.log('playerUpdate', data)
    socket.emit('playerUpdate', data)
  })

  socket.on(PLAYER_UPDATED_POS, data => {
    console.log(PLAYER_UPDATED_POS, data);
    socket.broadcast.emit(PLAYER_UPDATED_POS)
  })
})
