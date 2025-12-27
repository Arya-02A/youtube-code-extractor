console.log("YouTube Text Copier loaded");

const OCR_API_KEY = "YOUR_API_KEY_HERE"; // Replace with your OCR.space API key

let overlay = null;
let selectionBox = null;
let startX = 0;
let startY = 0;
let isSelecting = false;
let confirmationBox = null;
let statusBox = null;
let selectedLanguage = "plaintext";

/* ===============================
   MESSAGE FROM POPUP
================================ */
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "START_SELECTION") {
    startSelectionMode();
  }
});

/* ===============================
   SELECTION OVERLAY
================================ */
function startSelectionMode() {
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.15)";
  overlay.style.cursor = "crosshair";
  overlay.style.zIndex = "999999";

  document.body.appendChild(overlay);

  overlay.addEventListener("mousedown", onMouseDown);
  overlay.addEventListener("mousemove", onMouseMove);
  overlay.addEventListener("mouseup", onMouseUp);
  document.addEventListener("keydown", onKeyDown);
}

function onMouseDown(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px dashed #00ffcc";
  selectionBox.style.background = "rgba(0,255,204,0.1)";
  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  selectionBox.style.zIndex = "1000000";

  overlay.appendChild(selectionBox);
}

function onMouseMove(e) {
  if (!isSelecting || !selectionBox) return;

  selectionBox.style.width = `${Math.abs(e.clientX - startX)}px`;
  selectionBox.style.height = `${Math.abs(e.clientY - startY)}px`;
  selectionBox.style.left = `${Math.min(e.clientX, startX)}px`;
  selectionBox.style.top = `${Math.min(e.clientY, startY)}px`;
}

function onMouseUp(e) {
  isSelecting = false;

  const area = {
    x: Math.min(startX, e.clientX),
    y: Math.min(startY, e.clientY),
    width: Math.abs(e.clientX - startX),
    height: Math.abs(e.clientY - startY)
  };

  showConfirmationMessage(area);
}

function onKeyDown(e) {
  if (e.key === "Escape") cleanup();
}

/* ===============================
   CONFIRMATION
================================ */
function showConfirmationMessage(area) {
  confirmationBox = document.createElement("div");
  confirmationBox.style.position = "fixed";
  confirmationBox.style.bottom = "30px";
  confirmationBox.style.left = "50%";
  confirmationBox.style.transform = "translateX(-50%)";
  confirmationBox.style.background = "#111";
  confirmationBox.style.color = "#fff";
  confirmationBox.style.padding = "12px 16px";
  confirmationBox.style.borderRadius = "8px";
  confirmationBox.style.fontSize = "14px";
  confirmationBox.style.zIndex = "1000001";
  confirmationBox.innerHTML =
    "<strong>Area selected</strong><br/>Press <b>Enter</b> to confirm or <b>Esc</b> to retry";

  document.body.appendChild(confirmationBox);

  document.addEventListener(
    "keydown",
    (e) => handleConfirmationKeys(e, area),
    { once: true }
  );
}

function handleConfirmationKeys(e, area) {
  confirmationBox?.remove();

  if (e.key === "Enter") captureSelectedArea(area);
  if (e.key === "Escape") {
    cleanup();
    startSelectionMode();
  }
}

/* ===============================
   SCREEN CAPTURE
================================ */
function captureSelectedArea(area) {
  chrome.runtime.sendMessage({ action: "CAPTURE_SCREEN" }, (response) => {
    if (!response?.image) {
      showStatus("Capture failed ❌", true);
      cleanup();
      return;
    }
    cropImage(response.image, area);
  });
}

/* ===============================
   CROP IMAGE
================================ */
function cropImage(imageDataUrl, area) {
  const img = new Image();
  img.src = imageDataUrl;

  img.onload = () => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = area.width * dpr;
    canvas.height = area.height * dpr;

    ctx.drawImage(
      img,
      area.x * dpr,
      area.y * dpr,
      area.width * dpr,
      area.height * dpr,
      0,
      0,
      area.width * dpr,
      area.height * dpr
    );

    cleanup();
    runOCR(canvas.toDataURL("image/png"));
  };
}

/* ===============================
   OCR.SPACE API
================================ */
async function runOCR(imageDataUrl) {
  showStatus("Extracting text…");

  try {
    const body = new URLSearchParams();
    body.append("apikey", OCR_API_KEY);
    body.append("base64Image", imageDataUrl);
    body.append("language", "eng");
    body.append("OCREngine", "2");

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    const data = await res.json();

    const rawText = data?.ParsedResults?.[0]?.ParsedText || "";
    const cleanedText = cleanText(rawText);

    // Show preview editor instead of auto-copy
    showPreviewEditor(cleanedText);



  } catch (err) {
    console.error(err);
    showStatus("OCR failed ❌", true);
  }
}

function showPreviewEditor(code) {
  selectedLanguage = "plaintext";

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10%";
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.width = "600px";
  container.style.maxWidth = "90vw";
  container.style.background = "#0f172a";
  container.style.color = "#e5e7eb";
  container.style.borderRadius = "10px";
  container.style.padding = "12px";
  container.style.zIndex = "1000004";
  container.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)";

  /* -------- Language selector -------- */
  const languageSelect = document.createElement("select");
  languageSelect.style.marginBottom = "8px";
  languageSelect.style.padding = "6px";
  languageSelect.style.background = "#020617";
  languageSelect.style.color = "#e5e7eb";
  languageSelect.style.border = "1px solid #334155";
  languageSelect.style.borderRadius = "6px";

  ["plaintext", "python", "javascript"].forEach(lang => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang.toUpperCase();
    languageSelect.appendChild(option);
  });

  /* -------- Textarea -------- */
  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "260px";
  textarea.style.background = "#020617";
  textarea.style.color = "#e5e7eb";
  textarea.style.border = "1px solid #334155";
  textarea.style.borderRadius = "6px";
  textarea.style.padding = "10px";
  textarea.style.fontFamily = "monospace";
  textarea.style.fontSize = "13px";
  textarea.style.resize = "vertical";

  // initial render
  textarea.value = formatAsCodeBlock(code, selectedLanguage);

  /* -------- Language change logic -------- */
  languageSelect.onchange = () => {
    selectedLanguage = languageSelect.value;

    const cleaned = cleanText(code);
    textarea.value = formatAsCodeBlock(cleaned, selectedLanguage);
  };

  /* -------- Buttons -------- */
  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.justifyContent = "flex-end";
  btnRow.style.marginTop = "10px";
  btnRow.style.gap = "10px";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.style.padding = "6px 12px";
  copyBtn.style.cursor = "pointer";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.padding = "6px 12px";
  cancelBtn.style.cursor = "pointer";

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(copyBtn);

  /* -------- Assemble UI -------- */
  container.appendChild(languageSelect);
  container.appendChild(textarea);
  container.appendChild(btnRow);
  document.body.appendChild(container);

  /* -------- Actions -------- */
  copyBtn.onclick = () => {
    copyToClipboard(textarea.value);
    container.remove();
    showStatus("Code copied ✅", true);
  };

  cancelBtn.onclick = () => container.remove();
}



/* ===============================
   HELPERS
================================ */
function cleanText(text) {
  let cleaned = text
    // remove non-ASCII junk
    .replace(/[^\x00-\x7F]/g, "")

    // remove UI words
    .replace(/\b(Output|Terminal|Console|Run|Copy|Subscribe)\b/gi, "")

    // common operator fixes
    .replace(/\s*=\s*=\s*/g, "==")
    .replace(/\s*!\s*=\s*/g, "!=")
    .replace(/\s*<\s*=\s*/g, "<=")
    .replace(/\s*>\s*=\s*/g, ">=")
    .replace(/\s*=\s*>\s*/g, "=>")

    // normalize tabs
    .replace(/\t/g, "  ")

    // trim lines
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  cleaned = fixCommonOCRMistakes(cleaned);

  // 🔥 Language-specific rules
  if (selectedLanguage === "python") {
    cleaned = cleaned
      .replace(/;$/gm, "")        // remove semicolons
      .replace(/\s*:\s*/g, ": "); // fix colon spacing
  }

  if (selectedLanguage === "javascript") {
    cleaned = cleaned
      .replace(/;?$/gm, ";")      // enforce semicolons
      .replace(/\s*:\s*/g, ": "); // objects / ternary
  }

  return cleaned;
}


function fixCommonOCRMistakes(text) {
  return text
    // These are contextual, so we keep them conservative
    .replace(/\bO\b/g, "0")      // capital O mistaken for zero
    .replace(/\bl\b/g, "1")      // lowercase L mistaken for one
    .replace(/\|/g, "");         // stray pipe characters
}


function formatAsCodeBlock(code, language = "plaintext") {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function showStatus(msg, autoHide = false) {
  statusBox?.remove();

  statusBox = document.createElement("div");
  statusBox.style.position = "fixed";
  statusBox.style.top = "20px";
  statusBox.style.right = "20px";
  statusBox.style.background = "#111";
  statusBox.style.color = "#fff";
  statusBox.style.padding = "10px 14px";
  statusBox.style.borderRadius = "6px";
  statusBox.style.zIndex = "1000003";
  statusBox.textContent = msg;

  document.body.appendChild(statusBox);

  if (autoHide) setTimeout(() => statusBox.remove(), 3000);
}

function cleanup() {
  overlay?.remove();
  confirmationBox?.remove();
  overlay = null;
  selectionBox = null;
  confirmationBox = null;
  isSelecting = false;
  document.removeEventListener("keydown", onKeyDown);
}
