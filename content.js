let ws;
let subtitleDiv;
let subtitleWrapper;
let audioContext;
let workletNode;
let source;
let hideSubtitleTimer;

function createSubtitleOverlay() {
  subtitleWrapper = document.createElement("div");
  Object.assign(subtitleWrapper.style, {
    position: "fixed",
    bottom: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    fontSize: "24px",
    padding: "10px 20px",
    borderRadius: "8px",
    zIndex: 9999,
    cursor: "move",
    userSelect: "none",
    height: "60px",
    overflow: "hidden",
    maxWidth: "80%",
    boxSizing: "content-box",
    width: "auto",
  });

  subtitleDiv = document.createElement("div");
  Object.assign(subtitleDiv.style, {
    height: "60px",
    lineHeight: "32px",
    overflowY: "auto",
    overflowX: "hidden",
    wordBreak: "break-word",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  });

  const style = document.createElement("style");
  style.textContent = `
    div::-webkit-scrollbar {
      width: 0 !important;
      background: transparent !important;
    }
  `;
  document.head.appendChild(style);

  subtitleWrapper.appendChild(subtitleDiv);
  document.body.appendChild(subtitleWrapper);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  subtitleWrapper.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    offsetX = e.clientX - subtitleWrapper.getBoundingClientRect().left;
    offsetY = e.clientY - subtitleWrapper.getBoundingClientRect().top;
    subtitleWrapper.style.transform = "none";
    subtitleWrapper.style.bottom = "auto";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;
    subtitleWrapper.style.left = `${Math.max(0, newLeft)}px`;
    subtitleWrapper.style.top = `${Math.max(0, newTop)}px`;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function connectWebSocket() {
  ws = new WebSocket("wss://rapsubbackend-production.up.railway.app");
  ws.binaryType = "arraybuffer";

  ws.onopen = () => startStreamingFromVideo();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.text && subtitleDiv) {
        subtitleDiv.innerText = data.text;
        subtitleDiv.scrollTop = subtitleDiv.scrollHeight;
        if (data.final) {
          clearTimeout(hideSubtitleTimer);
          hideSubtitleTimer = setTimeout(() => {
            subtitleDiv.innerText = "";
          }, 1000);
        }
      }
    } catch {}
  };

  ws.onclose = () => {
    stopStreaming();
    if (subtitleWrapper?.parentNode) {
      subtitleWrapper.parentNode.removeChild(subtitleWrapper);
      subtitleWrapper = null;
      subtitleDiv = null;
    }
    clearTimeout(hideSubtitleTimer);
  };

  ws.onerror = () => {};
}

function createAudioContextIfNeeded(video) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000,
    });
  }
  if (!source) {
    source = audioContext.createMediaElementSource(video);
  }
}

async function startStreamingFromVideo() {
  const video = document.querySelector("video");
  if (!video) return;

  createAudioContextIfNeeded(video);

  if (!audioContext.audioWorklet.modulesLoaded) {
    await audioContext.audioWorklet.addModule(
      chrome.runtime.getURL("audioProcessor.js")
    );
    audioContext.audioWorklet.modulesLoaded = true;
  }

  if (workletNode) return;

  workletNode = new AudioWorkletNode(audioContext, "my-audio-processor");

  source.disconnect();
  source.connect(workletNode);
  workletNode.connect(audioContext.destination);

  workletNode.port.onmessage = (event) => {
    const float32Array = event.data;
    const buffer = convertFloat32ToInt16(float32Array);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(buffer);
    }
  };
}

function stopStreaming() {
  workletNode?.disconnect();
  workletNode = null;

  if (source && audioContext) {
    source.disconnect();
    source.connect(audioContext.destination);
  }

  clearTimeout(hideSubtitleTimer);
}

function convertFloat32ToInt16(buffer) {
  const result = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return result.buffer;
}

window.addEventListener("START_SUBTITLE", () => {
  if (window.__SUBTITLE_RUNNING__) return;
  window.__SUBTITLE_RUNNING__ = true;
  createSubtitleOverlay();
  connectWebSocket();
});

window.addEventListener("STOP_SUBTITLE", () => {
  window.__SUBTITLE_RUNNING__ = false;
  ws?.close();
  stopStreaming();
  if (subtitleWrapper?.parentNode) {
    subtitleWrapper.parentNode.removeChild(subtitleWrapper);
    subtitleWrapper = null;
    subtitleDiv = null;
  }
  clearTimeout(hideSubtitleTimer);
});

chrome.storage.local.get(["toggleSubtitle"], (result) => {
  const video = document.querySelector("video");
  if (result.toggleSubtitle && video) {
    window.dispatchEvent(new Event("START_SUBTITLE"));
  }
});
