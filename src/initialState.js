export default {
  playerId: 9999999,
  resources: {},
  neededResources: {},
  actors: [
    {
      id: 9999999,
      type: 'player',
      resources: {},
      texture: 'player',
      x: 10,
      y: 10,
      vx: 0,
      vy: 0,
      width: 30,
      height: 40
    },
    {
      id: 74239875,
      type: 'resource',
      name: 'banana',
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
  },
  menufade: 3.0,
  timeofday: 0.0,
  messageTimer: 4.0,
  message: "Hello World"
}
