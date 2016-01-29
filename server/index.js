import http from 'http'
import socketIO from 'socket.io'

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
})
