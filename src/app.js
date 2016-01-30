/* global requestAnimationFrame */
import socketIO from 'socket.io-client'
import _ from 'lodash'

import {
  DEFAULT_LOOP_PROPS,
  MAX_FPS,
  TIME_STEP
} from './constants'
import draw from './draw'
import onKey from './keys'
import end from './end'
import initialState from './initialState'
import * as networkEventTypes from './networkEventTypes'
import { onNetworkEvent, sendPlayerStateToServer } from './socketClient'
import update from './update'
import loadResources from './resources'

let RESOURCES = {}
let EVENTS = []
let CANVAS_CONTEXT

['keydown', 'keypress', 'keyup'].forEach(d => {
  window.addEventListener(d, e => EVENTS.push(onKey(d, e)), false)
})

const io = socketIO('http://localhost:3001')

_.keys(networkEventTypes).forEach(d => {
  io.on(d, data => EVENTS.push(onNetworkEvent(d, data)))
})

global.app = () => {
  CANVAS_CONTEXT = document.getElementById('canvas').getContext('2d')
  loadResources(function (res) {
    RESOURCES = res
    requestAnimationFrame(ts => mainLoop(ts, DEFAULT_LOOP_PROPS, initialState))
  })
}

function mainLoop (timestamp, props, state) {
  let {
    delta,
    fps,
    framesThisSecond,
    lastFPSUpdate,
    lastFrameTimeMS
  } = props

  // Throttle the frame rate.
  if (timestamp < lastFrameTimeMS + (1000 / MAX_FPS)) {
    requestAnimationFrame(ts => mainLoop(ts, props, state))
    return
  }

  delta += timestamp - lastFrameTimeMS
  lastFrameTimeMS = timestamp

  if (timestamp > lastFPSUpdate + 1000) {
    fps = 0.25 * framesThisSecond + 0.75 * fps

    lastFPSUpdate = timestamp
    framesThisSecond = 0
  }

  framesThisSecond++

  EVENTS.forEach(d => { state = d(state) })
  EVENTS = []

  let numUpdateSteps = 0
  while (delta >= TIME_STEP) {
    state = update(TIME_STEP, state)
    delta -= TIME_STEP
    if (++numUpdateSteps >= 240) {
      delta = 0
      break
    }
  }

  draw(delta / TIME_STEP, state, CANVAS_CONTEXT, RESOURCES)

  state = end(fps, state)

  state = sendPlayerStateToServer(io, state)

  requestAnimationFrame(ts => mainLoop(ts, {
    delta,
    fps,
    framesThisSecond,
    lastFPSUpdate,
    lastFrameTimeMS
  }, state))
}
