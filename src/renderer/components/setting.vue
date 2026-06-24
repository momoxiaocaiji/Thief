<template>
  <div class="settings-page">
    <section class="panel main-panel">
      <div class="panel-head">
        <div>
          <h1>摸鱼设置</h1>
        </div>
        <el-button type="primary" size="small" @click="onSubmit">保存设置</el-button>
      </div>

      <el-form class="settings-form" :model="form" label-position="top" size="small">
        <div class="field wide">
          <el-form-item label="小说路径">
            <div class="file-row">
              <el-input v-model="form.file_path" placeholder="请选择小说路径">
                <template #prepend>
                  <el-checkbox v-model="form.errCodeChecked">乱码模式</el-checkbox>
                </template>
              </el-input>
              <el-button type="primary" plain size="small" @click="openTxt">选择文件</el-button>
            </div>
          </el-form-item>
        </div>

        <div class="field">
          <el-form-item label="当前页数">
            <el-input-number v-model="form.curr_page" :min="1" :max="999999999" controls-position="right" />
          </el-form-item>
        </div>

        <div class="field">
          <el-form-item label="每页数量">
            <el-input-number v-model="form.page_size" :min="5" controls-position="right" />
          </el-form-item>
        </div>

        <div class="field">
          <el-form-item label="是否英文">
            <el-switch v-model="form.is_english" />
          </el-form-item>
        </div>

        <div class="field">
          <el-form-item label="换行符号">
            <el-input v-model="form.line_break" maxlength="5" placeholder="换行符号" />
          </el-form-item>
        </div>

        <div class="field">
          <el-form-item label="字体大小">
            <el-input-number v-model="form.font_size" :min="12" :max="100" controls-position="right" />
          </el-form-item>
        </div>

        <div class="field">
          <el-form-item label="自动翻页（秒）">
            <el-input-number v-model="form.second" :min="1" :max="60" controls-position="right" />
          </el-form-item>
        </div>

        <div class="field wide color-stack">
          <div class="color-card">
            <span class="inline-label">背景色</span>
            <div class="color-actions">
              <el-color-picker v-model="form.bg_color" show-alpha />
              <el-button size="small" @click="pickColor('bg_color')">取色</el-button>
            </div>
          </div>

          <div class="color-card">
            <span class="inline-label">文字色</span>
            <div class="color-actions">
              <el-color-picker v-model="form.txt_color" show-alpha />
              <el-button size="small" @click="pickColor('txt_color')">取色</el-button>
            </div>
          </div>
        </div>

        <div class="field">
          <el-form-item label="显示分页">
            <el-switch v-model="is_display_page" />
          </el-form-item>
        </div>

        <div class="field wide">
          <el-form-item label="股票代码">
            <el-input v-model="stock_code" placeholder="如 sh000001,sz399001" />
          </el-form-item>
        </div>

        <div class="field wide">
          <el-form-item label="摸鱼文字">
            <el-input v-model="moyu_text" maxlength="100" placeholder="请输入摸鱼文字" />
          </el-form-item>
        </div>

        <div class="field wide">
          <div class="hotkey-grid">
            <div class="hotkey-row">
              <span class="hotkey-label">上一页</span>
              <el-select v-model="keyPrevious" placeholder="组合键">
                <el-option label="Alt" value="Alt" />
                <el-option label="CmdOrCtrl" value="CmdOrCtrl" />
                <el-option label="CmdOrCtrl+Alt" value="CmdOrCtrl+Alt" />
              </el-select>
              <span class="hotkey-plus">+</span>
              <el-input
                v-model="keyPreviousX"
                maxlength="100"
                placeholder="按键"
                readonly
                @focus="onPreviousFocus"
                @blur="onPreviousBlur"
                @keydown="captureHotkey($event, 'keyPreviousX')"
              />
            </div>

            <div class="hotkey-row">
              <span class="hotkey-label">下一页</span>
              <el-select v-model="keyNext" placeholder="组合键">
                <el-option label="Alt" value="Alt" />
                <el-option label="CmdOrCtrl" value="CmdOrCtrl" />
                <el-option label="CmdOrCtrl+Alt" value="CmdOrCtrl+Alt" />
              </el-select>
              <span class="hotkey-plus">+</span>
              <el-input
                v-model="keyNextX"
                maxlength="100"
                placeholder="按键"
                readonly
                @focus="onNextFocus"
                @blur="onNextBlur"
                @keydown="captureHotkey($event, 'keyNextX')"
              />
            </div>

            <div class="hotkey-row">
              <span class="hotkey-label">老板键</span>
              <el-select v-model="keyBoss" placeholder="组合键">
                <el-option label="Alt" value="Alt" />
                <el-option label="CmdOrCtrl" value="CmdOrCtrl" />
                <el-option label="CmdOrCtrl+Alt" value="CmdOrCtrl+Alt" />
              </el-select>
              <span class="hotkey-plus">+</span>
              <el-input
                v-model="keyBossX"
                maxlength="100"
                placeholder="按键"
                readonly
                @focus="onBossFocus"
                @blur="onBossBlur"
                @keydown="captureHotkey($event, 'keyBossX')"
              />
            </div>

            <div class="hotkey-row">
              <span class="hotkey-label">自动翻页</span>
              <el-select v-model="keyAuto" placeholder="组合键">
                <el-option label="Alt" value="Alt" />
                <el-option label="CmdOrCtrl" value="CmdOrCtrl" />
                <el-option label="CmdOrCtrl+Alt" value="CmdOrCtrl+Alt" />
              </el-select>
              <span class="hotkey-plus">+</span>
              <el-input
                v-model="keyAutoX"
                maxlength="100"
                placeholder="按键"
                readonly
                @focus="onAutoFocus"
                @blur="onAutoBlur"
                @keydown="captureHotkey($event, 'keyAutoX')"
              />
            </div>
          </div>
        </div>
      </el-form>
    </section>

    <aside class="panel side-panel">
      <div class="preview-card">
        <div class="preview-head">
          <span>预览</span>
          <el-button text size="small" @click="openUrl">C.TEAM</el-button>
        </div>
        <div class="preview-surface" :style="previewStyle">
          <span>{{ moyu_text || "摸鱼预览" }}</span>
        </div>
      </div>

      <div class="tip-card">
        <p>屏幕取色优先读取桌面颜色，不支持时可直接使用颜色面板。</p>
        <code>{{ form.bg_color }}</code>
        <code>{{ form.txt_color }}</code>
      </div>
    </aside>
  </div>
</template>

<script>
import db from "../utils/db";
import dialog from "../utils/dialog";
import { ipcRenderer, shell } from "../utils/electron";

export default {
  name: "setting",
  data() {
    return {
      form: {
        file_path: "",
        curr_page: 1,
        page_size: 5,
        is_english: false,
        line_break: " ",
        bg_color: "rgba(0, 0, 0, 0.5)",
        txt_color: "#ffffff",
        font_size: 14,
        second: 5,
        errCodeChecked: false,
        curr_model: "1",
        key_previous: "",
        key_next: "",
        key_boss: "",
        key_auto: ""
      },
      is_display_page: true,
      stock_code: "",
      moyu_text: "",
      keyPrevious: "CmdOrCtrl+Alt",
      keyPreviousX: "",
      keyNext: "CmdOrCtrl+Alt",
      keyNextX: "",
      keyBoss: "CmdOrCtrl+Alt",
      keyBossX: "",
      keyAuto: "CmdOrCtrl+Alt",
      keyAutoX: ""
    };
  },
  computed: {
    previewStyle() {
      return {
        background: this.form.bg_color,
        color: this.form.txt_color,
        fontSize: `${this.form.font_size}px`
      };
    }
  },
  created() {
    this.onLoad();
  },
  methods: {
    captureHotkey(event, field) {
      if (!event || typeof event.key !== "string") {
        return;
      }

      event.preventDefault();

      if (event.key === "Backspace" || event.key === "Delete") {
        this[field] = "";
        return;
      }

      if (
        event.key === "Control" ||
        event.key === "Meta" ||
        event.key === "Alt" ||
        event.key === "Shift" ||
        event.key === "CapsLock" ||
        event.key === "Enter" ||
        event.key === "Tab" ||
        event.key === "Escape" ||
        event.key === "NumLock" ||
        event.key === "F5"
      ) {
        return;
      }

      let keyx = event.key;

      if (event.key === "ArrowLeft") keyx = "Left";
      else if (event.key === "ArrowUp") keyx = "Up";
      else if (event.key === "ArrowDown") keyx = "Down";
      else if (event.key === "ArrowRight") keyx = "Right";
      else if (event.key.trim() === "") keyx = "不能为空格,请删掉重新输入";

      this[field] = keyx;
    },
    async pickColor(target) {
      if (typeof window.EyeDropper !== "function") {
        this.$message({
          message: "当前环境不支持屏幕取色，请使用旁边的颜色面板。",
          type: "warning",
          showClose: true
        });
        return;
      }

      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          this.form[target] = result.sRGBHex;
        }
      } catch (error) {
        if (error && error.name !== "AbortError") {
          this.$message({
            message: "屏幕取色失败，请改用颜色面板。",
            type: "error",
            showClose: true
          });
        }
      }
    },
    openUrl() {
      shell.openExternal("https://c.team");
    },
    onPreviousFocus() {
      this.keyPreviousX = "";
    },
    onNextFocus() {
      this.keyNextX = "";
    },
    onBossFocus() {
      this.keyBossX = "";
    },
    onAutoFocus() {
      this.keyAutoX = "";
    },
    onPreviousBlur() {},
    onNextBlur() {},
    onBossBlur() {},
    onAutoBlur() {},
    onLoad() {
      this.form.curr_page = db.get("current_page");
      this.form.page_size = db.get("page_size");
      this.form.is_english = db.get("is_english");
      this.form.line_break = db.get("line_break");
      this.form.file_path = db.get("current_file_path");
      this.form.bg_color = db.get("bg_color");
      this.form.txt_color = db.get("txt_color");
      this.form.curr_model = db.get("curr_model");
      this.form.font_size = Number(db.get("font_size"));
      this.form.second = Number(db.get("second"));
      this.form.errCodeChecked = db.get("errCodeChecked");

      const splitHotkey = value => {
        const arr = String(value || "").split("+");
        if (arr.length === 2) return [arr[0], arr[1]];
        if (arr.length === 3) return [`${arr[0]}+${arr[1]}`, arr[2]];
        return ["CmdOrCtrl+Alt", ""];
      };

      [this.keyPrevious, this.keyPreviousX] = splitHotkey(db.get("key_previous"));
      [this.keyNext, this.keyNextX] = splitHotkey(db.get("key_next"));
      [this.keyBoss, this.keyBossX] = splitHotkey(db.get("key_boss"));
      [this.keyAuto, this.keyAutoX] = splitHotkey(db.get("key_auto"));

      this.is_display_page = db.get("is_display_page");
      this.stock_code = db.get("display_shares_list");
      this.moyu_text = db.get("moyu_text");
    },
    openTxt() {
      dialog.showOpenFile(filePaths => {
        this.form.file_path = filePaths[0];
      });
    },
    onSubmit() {
      db.set("current_page", this.form.curr_page);
      db.set("page_size", this.form.page_size);
      db.set("is_english", this.form.is_english);
      db.set("line_break", this.form.line_break);
      db.set("current_file_path", this.form.file_path);
      db.set("bg_color", this.form.bg_color);
      db.set("txt_color", this.form.txt_color);
      db.set("font_size", String(this.form.font_size));
      db.set("second", String(this.form.second));
      db.set("key_previous", `${this.keyPrevious}+${this.keyPreviousX}`);
      db.set("key_next", `${this.keyNext}+${this.keyNextX}`);
      db.set("key_boss", `${this.keyBoss}+${this.keyBossX}`);
      db.set("key_auto", `${this.keyAuto}+${this.keyAutoX}`);
      db.set("errCodeChecked", this.form.errCodeChecked);
      db.set("is_display_page", this.is_display_page);
      db.set("display_shares_list", this.stock_code);
      db.set("moyu_text", this.moyu_text);

      ipcRenderer.send("bg_text_color", "ping");

      this.$message({
        message: "保存成功，请尽情的摸鱼吧！",
        type: "success",
        showClose: true
      });
    }
  }
};
</script>

<style scoped lang="scss">
.settings-page {
  height: 100%;
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 208px;
  align-items: start;
  gap: 12px;
  overflow: hidden;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%);
}

.panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(122, 138, 153, 0.16);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(24, 39, 75, 0.06);
}

.main-panel {
  padding: 12px 14px;
}

.side-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;

  h1 {
    margin: 0;
    font-size: 18px;
    line-height: 1.1;
    color: #18212b;
  }
}

.settings-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
}

.field {
  min-width: 0;
}

.field.wide {
  grid-column: 1 / -1;
}

.file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.color-stack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.color-card,
.preview-card,
.tip-card {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(242, 246, 251, 0.96));
  border: 1px solid rgba(152, 166, 181, 0.18);
  border-radius: 10px;
  padding: 10px;
}

.color-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.inline-label {
  font-size: 12px;
  font-weight: 600;
  color: #23303d;
}

.color-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hotkey-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}

.hotkey-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 16px minmax(0, 1fr);
  gap: 6px;
  align-items: center;
}

.hotkey-label {
  font-size: 12px;
  font-weight: 600;
  color: #33404d;
}

.hotkey-plus {
  text-align: center;
  color: #6c7a89;
  font-weight: 700;
}

.preview-surface {
  min-height: 92px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #33404d;
}

.tip-card p {
  color: #5f6d7a;
  line-height: 1.5;
  margin: 0 0 8px;
  font-size: 12px;
}

.tip-card code {
  display: block;
  font-size: 11px;
  color: #627181;
  line-height: 1.5;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  color: #33404d;
  font-weight: 600;
  line-height: 1.2;
  font-size: 12px;
}

:deep(.el-input-number),
:deep(.el-select),
:deep(.el-input) {
  width: 100%;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper),
:deep(.el-select__wrapper) {
  padding-top: 2px;
  padding-bottom: 2px;
}

@media (max-width: 680px) {
  .settings-page {
    grid-template-columns: 1fr;
    height: auto;
    overflow-y: auto;
  }

  .settings-form,
  .color-stack,
  .hotkey-grid {
    grid-template-columns: 1fr;
  }

  .hotkey-row {
    grid-template-columns: 1fr;
  }

  .hotkey-plus {
    display: none;
  }

  .panel-head,
  .color-card,
  .file-row {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
