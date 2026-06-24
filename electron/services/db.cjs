const fs = require('node:fs')
const path = require('node:path')

const defaults = {
  current_page: 1,
  page_size: 20,
  is_english: false,
  line_break: ' ',
  current_file_path: '',
  bg_color: 'rgba(0, 0, 0, 0.5)',
  txt_color: '#fff',
  font_size: '14',
  second: '5',
  auto_page: '0',
  key_next: 'CmdOrCtrl+Alt+.',
  key_previous: 'CmdOrCtrl+Alt+,',
  key_boss: 'CmdOrCtrl+Alt+M',
  key_auto: 'CmdOrCtrl+Alt+P',
  errCodeChecked: false,
  is_mouse: '0',
  is_display_page: true,
  display_model: '1',
  display_shares_list: '',
  moyu_text: 'Hello',
  desktop_wh: '',
  desktop_wz: '',
  is_ad: '',
  curr_model: '1'
}

let storePath = ''

function ensureStore() {
  if (!storePath) {
    throw new Error('DB store path is not initialized')
  }

  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(defaults, null, 2))
    return { ...defaults }
  }

  try {
    const raw = fs.readFileSync(storePath, 'utf8')
    const parsed = raw ? JSON.parse(raw) : {}
    const merged = { ...defaults, ...parsed }

    if (JSON.stringify(parsed) !== JSON.stringify(merged)) {
      fs.writeFileSync(storePath, JSON.stringify(merged, null, 2))
    }

    return merged
  } catch {
    fs.writeFileSync(storePath, JSON.stringify(defaults, null, 2))
    return { ...defaults }
  }
}

function writeStore(data) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2))
}

module.exports = {
  init(app) {
    storePath = path.join(app.getPath('userData'), 'thief_data.json')
    ensureStore()
  },
  get(key) {
    const data = ensureStore()
    return data[key]
  },
  set(key, value) {
    const data = ensureStore()
    data[key] = value
    writeStore(data)
    return value
  },
  getMany(keys) {
    const data = ensureStore()
    return keys.reduce((result, key) => {
      result[key] = data[key]
      return result
    }, {})
  },
  setMany(payload) {
    const data = ensureStore()

    Object.entries(payload).forEach(([key, value]) => {
      data[key] = value
    })

    writeStore(data)
    return true
  }
}
