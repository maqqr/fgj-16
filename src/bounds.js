import {
  SCREEN_H,
  SCREEN_W
} from './constants'

export function isIn ({ x, y }, state) {
  return x >= 0 && x <= SCREEN_W && y >= 0 && y <= SCREEN_H
}
