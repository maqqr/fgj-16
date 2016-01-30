export default {
  playerId: 0,
  actors: [
    {
      id: 0,
      type: 'player',
      texture: 'player',
      x: 10,
      y: 10,
      vx: 0,
      vy: 0,
      height: 20,
      width: 10
    },

    {
      id: 1,
      type: 'resource',
      color: 'blue',
      x: 50,
      y: 50,
      vx: 0,
      vy: 0,
      width: 50,
      height: 40
    }
  ],
  keyboard: {
    up: false,
    right: false,
    down: false,
    left: false
  }
}
