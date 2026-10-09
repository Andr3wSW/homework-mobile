const DEFAULT_THEME = '#4f8cff';

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

function mix(hex1, hex2, amount) {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);

  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}

function applyTheme(color) {
  const root = document.documentElement;
  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-2', mix(color, '#000000', 0.28));
  root.style.setProperty('--border', mix(color, '#151923', 0.65));
}

async function saveTheme(color) {
  await chrome.storage.local.set({ themeColor: color });
}

document.getElementById('themeColor').addEventListener('input', async (event) => {
  const color = event.target.value;
  applyTheme(color);
  await saveTheme(color);
});

document.getElementById('run').onclick = async () => {
  const out = document.getElementById('out');
  const apiKeyInput = document.getElementById('apiKey');
  const promptInput = document.getElementById('prompt');

  const key = apiKeyInput.value.trim();
  const userPrompt = promptInput.value.trim();

  if (!key) {
    out.innerText = '❌ Please enter your Gemini API key.';
    return;
  }

  if (!userPrompt) {
    out.innerText = '❌ Please enter a prompt.';
    return;
  }

  out.innerText = '📸 Capturing screen...';

  try {
    await chrome.storage.local.set({
      geminiApiKey: key,
      userPrompt
    });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab || !tab.windowId) {
      throw new Error('Could not find the active tab.');
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png'
    });

    const base64 = dataUrl.split(',')[1];

    out.innerText = '🧠 Sending screen + prompt to Gemini...';

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt
              },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    const aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response received.';

    out.innerHTML = marked.parse(aiResponse);
  } catch (err) {
    console.error(err);
    out.innerText = '❌ Error: ' + err.message;
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  const saved = await chrome.storage.local.get([
    'geminiApiKey',
    'userPrompt',
    'themeColor'
  ]);

  if (saved.geminiApiKey) {
    document.getElementById('apiKey').value = saved.geminiApiKey;
  }

  if (saved.userPrompt) {
    document.getElementById('prompt').value = saved.userPrompt;
  }

  const theme = saved.themeColor || DEFAULT_THEME;
  document.getElementById('themeColor').value = theme;
  applyTheme(theme);
});