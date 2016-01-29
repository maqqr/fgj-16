const KEY_DIR_MAPPING = {
  38: 'up',
  39: 'right',
  40: 'down',
  37: 'left'
}
const DIR_KEYS = Object.keys(KEY_DIR_MAPPING)

export default (eventType, { keyCode }) => {
  if (DIR_KEYS.indexOf(keyCode + '') >= 0) {
    return state => updateKeyboard(state, eventType, keyCode)
  }

  return state => state
}

function updateKeyboard (state, eventType, keyCode) {
  const keyboard = {
    ...state.keyboard,
    [KEY_DIR_MAPPING[keyCode]]: eventType === 'keydown'
  }

  return { ...state, keyboard }
}
