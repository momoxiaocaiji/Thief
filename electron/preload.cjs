const { contextBridge, ipcRenderer } = require('electron')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')

const allowedSendChannels = new Set([
  'bg_text_color',
  'jump_page',
  'MouseAction',
  'webOpacity',
  'pdfOpacity',
  'videoOpacity'
])

const allowedOnChannels = new Set(['bg_text_color', 'text'])

contextBridge.exposeInMainWorld('thief', {
  db: {
    get(key) {
      return ipcRenderer.sendSync('db:get', key)
    },
    set(key, value) {
      return ipcRenderer.sendSync('db:set', { key, value })
    },
    getMany(keys) {
      return ipcRenderer.sendSync('db:getMany', keys)
    },
    setMany(payload) {
      return ipcRenderer.sendSync('db:setMany', payload)
    }
  },
  book: {
    search(term) {
      return ipcRenderer.sendSync('book:search', term)
    }
  },
  dialog: {
    openText() {
      return ipcRenderer.sendSync('dialog:openText')
    },
    openVideo() {
      return ipcRenderer.sendSync('dialog:openVideo')
    },
    openPdf() {
      return ipcRenderer.sendSync('dialog:openPdf')
    }
  },
  ipc: {
    send(channel, payload) {
      if (allowedSendChannels.has(channel)) {
        ipcRenderer.send(channel, payload)
      }
    },
    on(channel, callback) {
      if (!allowedOnChannels.has(channel)) {
        return () => {}
      }

      const handler = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    }
  },
  state: {
    getTextState() {
      return ipcRenderer.sendSync('state:getText')
    }
  },
  app: {
    openExternal(url) {
      ipcRenderer.send('app:openExternal', url)
    }
  },
  file: {
    readFileBuffer(filePath) {
      const buffer = fs.readFileSync(filePath)
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    },
    toFileUrl(filePath) {
      return pathToFileURL(filePath).href
    }
  }
})
