const path = require('node:path')
const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, shell, dialog, nativeImage, TouchBar } = require('electron')
const axios = require('axios')
const db = require('./services/db.cjs')
const book = require('./services/book.cjs')
const stock = require('./services/stock.cjs')
const ad = require('./services/ad.cjs')
const osUtil = require('./services/os-util.cjs')

const { TouchBarButton, TouchBarSpacer } = TouchBar

const isMac = process.platform === 'darwin'
const isDev = !!process.env.VITE_DEV_SERVER_URL
const rendererUrl = process.env.VITE_DEV_SERVER_URL || ''

let tray = null
let settingWindow = null
let soWindow = null
let desktopWindow = null
let desktopBarWindow = null
let webWindow = null
let videoWindow = null
let pdfWindow = null
let autoPageTime = null
let autoStockTime = null
let touchBarText = null
let textState = { text: '' }
let keyPreviousRegistered = null
let keyNextRegistered = null
let keyBossRegistered = null
let keyAutoRegistered = null

function assetPath(...segments) {
  return path.join(__dirname, '..', ...segments)
}

function createTouchBarText() {
  touchBarText = new TouchBarButton({
    label: '',
    backgroundColor: '#363636',
    click: () => BossKey(2)
  })

  return new TouchBar({
    items: [touchBarText]
  })
}

function createTouchBarButton() {
  return new TouchBar({
    items: [
      new TouchBarButton({
        label: '🤒 Previous',
        backgroundColor: '#a923ce',
        click: () => PreviousPage()
      }),
      new TouchBarSpacer({ size: 'small' }),
      new TouchBarButton({
        label: '🤪 Next',
        backgroundColor: '#2352ce',
        click: () => NextPage()
      }),
      new TouchBarSpacer({ size: 'small' }),
      new TouchBarButton({
        label: '👻 Boss',
        backgroundColor: '#ce2323',
        click: () => BossKey(2)
      }),
      new TouchBarSpacer({ size: 'small' })
    ]
  })
}

function loadWindowRoute(win, route) {
  if (isDev) {
    win.loadURL(`${rendererUrl}#/${route}`)
    return
  }

  win.loadFile(assetPath('dist', 'index.html'), { hash: `/${route}` })
}

function baseWindowOptions(overrides = {}) {
  return {
    useContentSize: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: assetPath('electron', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: false
    },
    ...overrides
  }
}

function lockZoom(win) {
  const contents = win.webContents
  contents.on('did-finish-load', () => {
    contents.setZoomFactor(1)
    if (typeof contents.setVisualZoomLevelLimits === 'function') {
      contents.setVisualZoomLevelLimits(1, 1).catch(() => {})
    }
    if (typeof contents.setLayoutZoomLevelLimits === 'function') {
      contents.setLayoutZoomLevelLimits(0, 0).catch(() => {})
    }
  })
}

function attachWindowDiagnostics(win, name) {
  const contents = win.webContents

  contents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${name}] level=${level} ${sourceId}:${line} ${message}`)
  })

  contents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.log(
      `[renderer:${name}] did-fail-load code=${errorCode} url=${validatedURL} error=${errorDescription}`
    )
  })

  contents.on('render-process-gone', (_event, details) => {
    console.log(`[renderer:${name}] render-process-gone reason=${details.reason}`)
  })
}

function createVideo() {
  const frame = !isMac

  videoWindow = new BrowserWindow(
    baseWindowOptions({
      width: 478,
      height: 28,
      maximizable: false,
      minimizable: false,
      transparent: true,
      resizable: true,
      frame
    })
  )

  lockZoom(videoWindow)
  attachWindowDiagnostics(videoWindow, 'video')
  loadWindowRoute(videoWindow, 'video')
  videoWindow.setOpacity(1)
  videoWindow.setAlwaysOnTop(true)
  videoWindow.setSkipTaskbar(true)
  videoWindow.on('closed', () => {
    videoWindow = null
  })
}

function createPdf() {
  const frame = !isMac

  pdfWindow = new BrowserWindow(
    baseWindowOptions({
      width: 478,
      height: 28,
      maximizable: false,
      minimizable: false,
      transparent: true,
      resizable: true,
      frame
    })
  )

  lockZoom(pdfWindow)
  attachWindowDiagnostics(pdfWindow, 'pdf')
  loadWindowRoute(pdfWindow, 'pdf')
  pdfWindow.setOpacity(1)
  pdfWindow.setAlwaysOnTop(true)
  pdfWindow.setSkipTaskbar(true)
  pdfWindow.on('closed', () => {
    pdfWindow = null
  })
}

function createWeb() {
  const frame = !isMac

  webWindow = new BrowserWindow(
    baseWindowOptions({
      width: 478,
      height: 28,
      maximizable: false,
      minimizable: false,
      transparent: true,
      resizable: true,
      frame,
      webPreferences: {
        preload: assetPath('electron', 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webviewTag: true
      }
    })
  )

  lockZoom(webWindow)
  attachWindowDiagnostics(webWindow, 'web')
  loadWindowRoute(webWindow, 'web')
  webWindow.setOpacity(1)
  webWindow.setAlwaysOnTop(true)
  webWindow.setSkipTaskbar(true)
  webWindow.on('closed', () => {
    webWindow = null
  })
}

function createSoSetting() {
  soWindow = new BrowserWindow(
    baseWindowOptions({
      title: '搜 索',
      width: 334,
      height: 540,
      maximizable: false,
      minimizable: false
    })
  )

  lockZoom(soWindow)
  attachWindowDiagnostics(soWindow, 'so')
  loadWindowRoute(soWindow, 'so')
  soWindow.on('closed', () => {
    soWindow = null
  })
}

function createWindowSetting() {
  settingWindow = new BrowserWindow(
    baseWindowOptions({
      title: '设 置',
      width: 715,
      height: 660,
      resizable: false,
      maximizable: false,
      minimizable: false
    })
  )

  lockZoom(settingWindow)
  attachWindowDiagnostics(settingWindow, 'setting')
  loadWindowRoute(settingWindow, 'setting')
  settingWindow.on('closed', () => {
    settingWindow = null
  })
}

function createWindowDesktop() {
  let width = 856
  let height = 47
  let x = 356
  let y = 429

  const desktopWh = String(db.get('desktop_wh') || '')
  const desktopWz = String(db.get('desktop_wz') || '')
  const arrWh = desktopWh.split(',')
  const arrWz = desktopWz.split(',')

  if (arrWh.length === 2) {
    width = parseInt(arrWh[0], 10)
    height = parseInt(arrWh[1], 10)
  }

  if (arrWz.length === 2) {
    x = parseInt(arrWz[0], 10)
    y = parseInt(arrWz[1], 10)
  }

  desktopWindow = new BrowserWindow(
    baseWindowOptions({
      width,
      height,
      resizable: true,
      frame: false,
      transparent: true,
      hasShadow: false,
      x,
      y
    })
  )

  lockZoom(desktopWindow)
  attachWindowDiagnostics(desktopWindow, 'desktop')
  loadWindowRoute(desktopWindow, 'desktop')
  desktopWindow.setAlwaysOnTop(true)
  desktopWindow.setSkipTaskbar(true)
  desktopWindow.setTouchBar(createTouchBarButton())
  desktopWindow.on('closed', () => {
    desktopWindow = null
  })
  desktopWindow.on('resize', () => {
    const size = desktopWindow.getSize()
    db.set('desktop_wh', `${size[0]},${size[1]}`)
  })
  desktopWindow.on('move', () => {
    const position = desktopWindow.getPosition()
    db.set('desktop_wz', `${position[0]},${position[1]}`)
  })
}

function createWindowBarDesktop() {
  desktopBarWindow = new BrowserWindow(
    baseWindowOptions({
      width: 88,
      height: 23,
      resizable: true,
      frame: false,
      transparent: true
    })
  )

  desktopBarWindow.setTouchBar(createTouchBarText())
  lockZoom(desktopBarWindow)
  attachWindowDiagnostics(desktopBarWindow, 'desktop-bar')
  loadWindowRoute(desktopBarWindow, 'desktop')
  desktopBarWindow.setAlwaysOnTop(true)
  desktopBarWindow.setSkipTaskbar(true)
  desktopBarWindow.on('closed', () => {
    desktopBarWindow = null
  })
}

function setText(text) {
  textState = { text }
}

function notifyDesktop(channel, payload) {
  if (desktopWindow && !desktopWindow.isDestroyed()) {
    desktopWindow.webContents.send(channel, payload)
  }
  if (desktopBarWindow && !desktopBarWindow.isDestroyed()) {
    desktopBarWindow.webContents.send(channel, payload)
  }
}

function MouseModel(event) {
  if (!desktopWindow) {
    return
  }

  db.set('is_mouse', event.checked ? '1' : '0')
  desktopWindow.reload()

  setTimeout(() => {
    const text = db.get('moyu_text')
    setText(text)
    desktopWindow.webContents.send('text', 'boss')
  }, 1000)
}

function AutoPage() {
  if (db.get('auto_page') === '1') {
    clearInterval(autoPageTime)
    db.set('auto_page', '0')
    const second = Number(db.get('second') || 5)
    autoPageTime = setInterval(() => {
      NextPage()
    }, second * 1000)
  } else {
    db.set('auto_page', '1')
    clearInterval(autoPageTime)
  }
}

function AutoStock() {
  const displayModel = db.get('display_model')
  const displaySharesList = db.get('display_shares_list')

  if (displayModel === '2') {
    clearInterval(autoStockTime)
    autoStockTime = setInterval(async () => {
      const text = await stock.getData(displaySharesList)
      updateText(text)
    }, 5000)
  } else {
    clearInterval(autoStockTime)
  }
}

function updateText(text) {
  const currModel = db.get('curr_model')

  if (currModel === '1') {
    tray?.setTitle(text)
  } else if (currModel === '2') {
    tray?.setTitle('')
    setText(text)
    notifyDesktop('text', 'ping')
  } else if (currModel === '3') {
    tray?.setTitle('')

    if (desktopBarWindow) {
      setText(osUtil.getCpu())
      desktopBarWindow.webContents.send('text', 'ping')
    }

    if (touchBarText) {
      touchBarText.label = text
    }
  }
}

async function NextPage() {
  const displayModel = db.get('display_model')
  const displaySharesList = db.get('display_shares_list')

  if (displayModel === '2') {
    const text = await stock.getData(displaySharesList)
    updateText(text)
    return
  }

  updateText(book.getNextPage())
}

async function PreviousPage() {
  const displayModel = db.get('display_model')
  const displaySharesList = db.get('display_shares_list')

  if (displayModel === '2') {
    const text = await stock.getData(displaySharesList)
    updateText(text)
    return
  }

  updateText(book.getPreviousPage())
}

async function BossKey(type = 1) {
  const text = db.get('moyu_text')
  const currModel = db.get('curr_model')
  const isAd = db.get('is_ad')

  async function resolveBossText() {
    const now = Date.now()
    if (!isAd || now - Number(isAd) >= 28800000) {
      const result = await ad.getAd()
      if (result !== 'err') {
        db.set('is_ad', now)
        return result
      }
    }
    return text
  }

  if (currModel === '1') {
    tray?.setTitle(await resolveBossText())
  } else if (currModel === '2') {
    tray?.setTitle('')
    setText(await resolveBossText())

    if (desktopWindow) {
      if (type === 1) {
        desktopWindow.webContents.send('text', 'boss')
      } else if (type === 2) {
        desktopWindow.isVisible() ? desktopWindow.hide() : desktopWindow.show()
      }
    }
  } else if (currModel === '3') {
    tray?.setTitle('')
    if (desktopBarWindow) {
      setText(osUtil.getCpu())
      desktopBarWindow.webContents.send('text', 'ping')
    }
    if (touchBarText) {
      touchBarText.label = '🚄=[😘🐶🐱🐭🐹🐸🐯🐵🐙🐼🐨🐮🐥🦉🐍🦞🦙🐉🦂🦀🦐🐍🐢🐄🦍🦏🐓🐇🐷]'
    }
  }

  ;[webWindow, pdfWindow, videoWindow].forEach(win => {
    if (win) {
      win.isVisible() ? win.hide() : win.show()
    }
  })
}

async function checkUpdate() {
  const logo = assetPath('static', 'icon.png')
  const image = nativeImage.createFromPath(logo)

  try {
    const response = await axios.get('https://gitee.com/lauix/public_version/raw/master/version.txt', {
      responseType: 'text',
      transformResponse: value => value
    })

    const newVersion = parseFloat(response.data)
    const currVersion = 4.01

    if (newVersion > currVersion) {
      const { response: index } = await dialog.showMessageBox({
        type: 'info',
        title: '检查更新',
        message: '发现新版本，是否更新？',
        buttons: ['是', '否'],
        icon: image
      })

      if (index === 0) {
        shell.openExternal('https://github.com/cteamx/Thief/releases')
      }
      return
    }

    await dialog.showMessageBox({
      type: 'info',
      title: '检查更新',
      message: '当前为最新版本',
      buttons: ['确认'],
      icon: image
    })
  } catch {
    await dialog.showMessageBox({
      type: 'warning',
      title: '检查更新',
      message: '检查更新失败，请稍后重试',
      buttons: ['确认'],
      icon: image
    })
  }
}

function Exit() {
  app.quit()
}

function unregisterShortcut(previousValue) {
  if (previousValue) {
    globalShortcut.unregister(previousValue)
  }
}

function createKey() {
  try {
    const previous = db.get('key_previous')
    if (!previous || previous.indexOf('+') < 0) {
      return
    }
    unregisterShortcut(keyPreviousRegistered)
    keyPreviousRegistered = previous
    globalShortcut.register(previous, () => PreviousPage())

    const next = db.get('key_next')
    if (!next || next.indexOf('+') < 0) {
      return
    }
    unregisterShortcut(keyNextRegistered)
    keyNextRegistered = next
    globalShortcut.register(next, () => NextPage())

    const boss = db.get('key_boss')
    if (!boss || boss.indexOf('+') < 0) {
      return
    }
    unregisterShortcut(keyBossRegistered)
    keyBossRegistered = boss
    globalShortcut.register(boss, () => BossKey(2))

    const auto = db.get('key_auto')
    if (!auto || auto.indexOf('+') < 0) {
      return
    }
    unregisterShortcut(keyAutoRegistered)
    keyAutoRegistered = auto
    globalShortcut.register(auto, () => AutoPage())
  } catch {
    dialog
      .showMessageBox({
        type: 'info',
        title: '快捷键异常',
        message: '设置快捷键错误，请看文档异常汇总。',
        buttons: ['打开文档', '否'],
        icon: nativeImage.createFromPath(assetPath('static', 'icon.png'))
      })
      .then(({ response }) => {
        if (response === 0) {
          shell.openExternal('https://thief.im/#/use?id=%e5%bc%82%e5%b8%b8%e6%b1%87%e6%80%bb')
        }
        Exit()
      })
  }

  globalShortcut.register('CommandOrControl+Alt+X', () => Exit())
}

function createTray() {
  const menubarLogo = assetPath('static', 'mac.png')

  const menuList = [
    {
      label: '关于',
      click() {
        dialog.showMessageBox({
          type: 'info',
          title: '关于',
          message: 'Thief 是一款真正的创新摸鱼神器\n\n版本：4.0.1\n\n作者：三斤\n\n邮箱：lauixData@gmail.com',
          buttons: ['确认'],
          icon: nativeImage.createFromPath(assetPath('static', 'icon.png'))
        })
      }
    },
    {
      label: 'Thief官网',
      click() {
        shell.openExternal('https://thief.im')
      }
    },
    {
      label: '使用文档',
      click() {
        shell.openExternal('https://thief.im/docs')
      }
    },
    {
      label: '检查更新',
      click() {
        checkUpdate()
      }
    },
    {
      type: 'separator'
    },
    {
      label: '任务栏模式',
      type: 'radio',
      checked: db.get('curr_model') === '1',
      click() {
        db.set('curr_model', '1')
        desktopWindow?.close()
        desktopBarWindow?.close()
        BossKey(1)
      }
    },
    {
      label: '桌面模式',
      type: 'radio',
      checked: db.get('curr_model') === '2',
      click() {
        db.set('curr_model', '2')
        desktopBarWindow?.close()

        if (!desktopWindow) {
          createWindowDesktop()
        } else {
          desktopWindow.show()
        }

        setTimeout(() => {
          BossKey(1)
        }, 1000)
      }
    },
    {
      label: 'TouchBar模式',
      type: 'radio',
      checked: db.get('curr_model') === '3',
      click() {
        db.set('curr_model', '3')
        desktopWindow?.close()

        if (!desktopBarWindow) {
          createWindowBarDesktop()
        } else {
          desktopBarWindow.show()
        }

        setTimeout(() => {
          BossKey(2)
        }, 1000)
      }
    },
    {
      type: 'separator'
    },
    {
      label: '小说摸鱼',
      type: 'radio',
      checked: db.get('display_model') === '1',
      click() {
        clearInterval(autoStockTime)
        db.set('display_model', '1')
        BossKey(1)
      }
    },
    {
      label: '股票摸鱼',
      type: 'radio',
      checked: db.get('display_model') === '2',
      async click() {
        db.set('display_model', '2')
        const text = await stock.getData(db.get('display_shares_list'))
        updateText(text)
        AutoStock()
      }
    },
    {
      type: 'separator'
    },
    {
      label: '网页摸鱼',
      click() {
        if (!webWindow) createWeb()
        else webWindow.show()
      }
    },
    {
      label: '视频摸鱼',
      click() {
        if (!videoWindow) createVideo()
        else videoWindow.show()
      }
    },
    {
      label: 'PDF摸鱼',
      click() {
        if (!pdfWindow) createPdf()
        else pdfWindow.show()
      }
    },
    {
      type: 'separator'
    },
    {
      label: '鼠标翻页',
      type: 'checkbox',
      click(event) {
        MouseModel(event)
      }
    },
    {
      label: '自动翻页',
      type: 'checkbox',
      accelerator: db.get('key_auto'),
      checked: db.get('auto_page') === '1',
      click() {
        AutoPage()
      }
    },
    {
      label: '上一页',
      accelerator: db.get('key_previous'),
      click() {
        PreviousPage()
      }
    },
    {
      label: '下一页',
      accelerator: db.get('key_next'),
      click() {
        NextPage()
      }
    },
    {
      label: '老板键',
      accelerator: db.get('key_boss'),
      click() {
        BossKey(2)
      }
    },
    {
      type: 'separator'
    },
    {
      label: '搜索内容',
      click() {
        if (!soWindow) createSoSetting()
        else soWindow.show()
      }
    },
    {
      label: '设置',
      click() {
        if (!settingWindow) createWindowSetting()
        else settingWindow.show()
      }
    },
    {
      type: 'separator'
    },
    {
      accelerator: 'CommandOrControl+Alt+X',
      label: '退出',
      click() {
        Exit()
      }
    }
  ]

  tray = new Tray(menubarLogo)
  tray.setContextMenu(Menu.buildFromTemplate(menuList))
  BossKey()
}

function createSetting() {
  app.dock.hide()
}

function resizeOverlayWindow(win) {
  if (!win) {
    return
  }

  const size = win.getSize()
  if (size[1] <= 100) {
    win.setSize(715, 500)
    win.center()
  }
}

function registerIpc() {
  ipcMain.on('db:get', (event, key) => {
    event.returnValue = db.get(key)
  })

  ipcMain.on('db:set', (event, payload) => {
    event.returnValue = db.set(payload.key, payload.value)
  })

  ipcMain.on('db:getMany', (event, keys) => {
    event.returnValue = db.getMany(keys)
  })

  ipcMain.on('db:setMany', (event, payload) => {
    event.returnValue = db.setMany(payload)
  })

  ipcMain.on('book:search', (event, term) => {
    event.returnValue = book.search(term)
  })

  ipcMain.on('dialog:openText', event => {
    event.returnValue = dialog.showOpenDialogSync({
      title: '请选择要打开的文件',
      filters: [
        { name: 'TXT', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'showHiddenFiles']
    }) || []
  })

  ipcMain.on('dialog:openVideo', event => {
    event.returnValue = dialog.showOpenDialogSync({
      title: '请选择要打开的文件',
      filters: [
        { name: 'MP4', extensions: ['mp4'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'showHiddenFiles']
    }) || []
  })

  ipcMain.on('dialog:openPdf', event => {
    event.returnValue = dialog.showOpenDialogSync({
      title: '请选择要打开的文件',
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'showHiddenFiles']
    }) || []
  })

  ipcMain.on('state:getText', event => {
    event.returnValue = textState
  })

  ipcMain.on('app:openExternal', (_event, url) => {
    shell.openExternal(url)
  })

  ipcMain.on('bg_text_color', () => {
    tray?.destroy()
    createKey()
    createTray()
    notifyDesktop('bg_text_color', 'ping')
  })

  ipcMain.on('jump_page', () => {
    NextPage()
  })

  ipcMain.on('MouseAction', (_event, value) => {
    if (!desktopWindow) {
      return
    }

    if (value === '1') {
      NextPage()
    } else if (value === '2') {
      PreviousPage()
    } else if (value === '4') {
      BossKey(2)
    }
  })

  ipcMain.on('webOpacity', (_event, value) => {
    if (!webWindow) {
      return
    }

    const num = webWindow.getOpacity()
    if (value === '-') {
      webWindow.setOpacity(num <= 0.2 ? 0.1 : num - 0.1)
    } else if (value === '+') {
      webWindow.setOpacity(num >= 1 ? 1 : num + 0.1)
    } else if (value === 'exit') {
      webWindow.close()
    } else if (value === 'change') {
      resizeOverlayWindow(webWindow)
    }
  })

  ipcMain.on('pdfOpacity', (_event, value) => {
    if (!pdfWindow) {
      return
    }

    const num = pdfWindow.getOpacity()
    if (value === '-') {
      pdfWindow.setOpacity(num <= 0.2 ? 0.1 : num - 0.1)
    } else if (value === '+') {
      pdfWindow.setOpacity(num >= 1 ? 1 : num + 0.1)
    } else if (value === 'exit') {
      pdfWindow.close()
    } else if (value === 'change') {
      resizeOverlayWindow(pdfWindow)
    }
  })

  ipcMain.on('videoOpacity', (_event, value) => {
    if (!videoWindow) {
      return
    }

    const num = videoWindow.getOpacity()
    if (value === '-') {
      videoWindow.setOpacity(num <= 0.2 ? 0.1 : num - 0.1)
    } else if (value === '+') {
      videoWindow.setOpacity(num >= 1 ? 1 : num + 0.1)
    } else if (value === 'exit') {
      videoWindow.close()
    } else if (value === 'change') {
      resizeOverlayWindow(videoWindow)
    }
  })
}

function init() {
  Menu.setApplicationMenu(null)
  db.init(app)
  db.set('auto_page', '0')
  db.set('is_mouse', '0')
  registerIpc()
  createSetting()
  createWindowSetting()

  if (db.get('curr_model') === '2') {
    createWindowDesktop()
    setTimeout(() => {
      BossKey(1)
    }, 1000)
  } else if (db.get('curr_model') === '3') {
    db.set('curr_model', '1')
  }

  createKey()
  createTray()
}

app.whenReady().then(init)

app.on('window-all-closed', () => {
  db.set('auto_page', '0')
  db.set('is_mouse', '0')
  db.set('curr_model', '1')
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
