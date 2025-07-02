// File: extensions/authorsNote/plugin.js

(function () {
  const PLUGIN_ID = "authorsNote";
  const SETTINGS_KEY = "authorsNoteSettings";

  let settings = {
    note: "",
    enabled: true,
    level: "system", // 'system', 'user', or 'assistant'
  };

  // Load saved settings
  function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) settings = JSON.parse(saved);
  }

  // Save settings
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // Inject the author's note at the appropriate prompt level
  function injectAuthorNote(data) {
    if (!settings.enabled || !settings.note.trim()) return;

    const note = `\n[Author's Note]: ${settings.note.trim()}\n`;

    switch (settings.level) {
      case "system":
        data.system_prompt = (data.system_prompt || "") + note;
        break;
      case "user":
        data.user_input = (data.user_input || "") + note;
        break;
      case "assistant":
        data.history_final += note;
        break;
    }
  }

  // Register plugin
  window.registerPlugin(PLUGIN_ID, {
    init() {
      loadSettings();
      console.log("Author's Note plugin loaded");
    },

    // UI for plugin settings
    ui() {
      return `
        <div class="extension-area">
          <label><strong>Author's Note</strong></label><br>
          <textarea rows="3" style="width: 100%" onchange="window.plugins['${PLUGIN_ID}'].updateNote(this.value)">${settings.note}</textarea>
          <br><br>
          <label>Injection Level:</label>
          <select onchange="window.plugins['${PLUGIN_ID}'].updateLevel(this.value)">
            <option value="system" ${settings.level === "system" ? "selected" : ""}>System</option>
            <option value="user" ${settings.level === "user" ? "selected" : ""}>User</option>
            <option value="assistant" ${settings.level === "assistant" ? "selected" : ""}>Assistant</option>
          </select>
          <br><br>
          <label><input type="checkbox" ${settings.enabled ? "checked" : ""} onchange="window.plugins['${PLUGIN_ID}'].toggleEnabled(this.checked)"> Enable</label>
        </div>
      `;
    },

    // Called before the message is sent
    prepareInput(data) {
      injectAuthorNote(data);
    },

    updateNote(newNote) {
      settings.note = newNote;
      saveSettings();
    },

    updateLevel(newLevel) {
      settings.level = newLevel;
      saveSettings();
    },

    toggleEnabled(isEnabled) {
      settings.enabled = isEnabled;
      saveSettings();
    },
  });
})();
