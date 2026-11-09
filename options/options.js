// options.js
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleVisibilityBtn = document.getElementById('toggleVisibility');
  const modelSelect = document.getElementById('modelSelect');
  const maxItemsInput = document.getElementById('maxItems');
  const autoEnableCheckbox = document.getElementById('autoEnable');
  const showWebThumbnailsCheckbox = document.getElementById('showWebThumbnails');
  const fallbackEnabledCheckbox = document.getElementById('fallbackEnabled');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMessage = document.getElementById('statusMessage');

  // 保存済みの設定をロード
  chrome.storage.sync.get({
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    maxItemsPerCategory: 8,
    autoEnable: true,
    showWebThumbnails: true,
    fallbackEnabled: true
  }, (items) => {
    apiKeyInput.value = items.geminiApiKey;
    modelSelect.value = items.geminiModel;
    maxItemsInput.value = items.maxItemsPerCategory;
    autoEnableCheckbox.checked = items.autoEnable;
    showWebThumbnailsCheckbox.checked = items.showWebThumbnails;
    fallbackEnabledCheckbox.checked = items.fallbackEnabled;
  });

  // APIキーの表示・非表示切り替え
  toggleVisibilityBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleVisibilityBtn.textContent = '非表示';
    } else {
      apiKeyInput.type = 'password';
      toggleVisibilityBtn.textContent = '表示';
    }
  });

  // 設定の保存
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const maxItems = Math.min(15, Math.max(3, parseInt(maxItemsInput.value, 10) || 8));
    const autoEnable = autoEnableCheckbox.checked;
    const showWebThumbnails = showWebThumbnailsCheckbox.checked;
    const fallbackEnabled = fallbackEnabledCheckbox.checked;

    chrome.storage.sync.set({
      geminiApiKey: apiKey,
      geminiModel: model,
      maxItemsPerCategory: maxItems,
      autoEnable: autoEnable,
      showWebThumbnails: showWebThumbnails,
      fallbackEnabled: fallbackEnabled
    }, () => {
      showStatus('設定を保存しました。', 'success');
    });
  });

  // APIキー接続テスト
  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;

    if (!apiKey) {
      showStatus('APIキーを入力してください。', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'テスト中...';
    showStatus('Gemini APIに接続しています...', 'normal');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping' }] }]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
      }

      showStatus('✅ 接続テストに成功しました！APIキーは有効です。', 'success');
    } catch (err) {
      showStatus(`❌ 接続失敗: ${err.message}`, 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '接続テスト';
    }
  });

  function showStatus(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-msg ${type}`;
    statusMessage.style.display = 'block';
  }
});
