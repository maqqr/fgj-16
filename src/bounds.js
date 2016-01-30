import {
  WORLD_H,
  WORLD_W
} from './constants'

export function isIn ({ x, y }, state) {
  return x >= 0 && x <= WORLD_W && y >= 0 && y <= WORLD_H
}
