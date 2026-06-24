const ipcRenderer = {
  send(channel, payload) {
    window.thief.ipc.send(channel, payload)
  },
  on(channel, callback) {
    return window.thief.ipc.on(channel, message => callback({}, message))
  }
}

const shell = {
  openExternal(url) {
    window.thief.app.openExternal(url)
  }
}

const remote = {
  getGlobal(name) {
    if (name === 'text') {
      return window.thief.state.getTextState()
    }
    return {}
  }
}

export { ipcRenderer, remote, shell }
