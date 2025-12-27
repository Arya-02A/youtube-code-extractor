# YouTube Code Extractor 🎯

A **developer-focused Chrome extension** that lets you **select, extract, review, and copy code directly from YouTube videos**.

Unlike generic OCR tools, this extension is built **specifically for developers** watching coding tutorials.

---

## 🚀 Features

- 🔍 Select any code region directly from a YouTube video
- 🧠 OCR-powered code extraction
- 🧹 Code-specific cleanup (operators, spacing, indentation)
- 👀 Preview extracted code before copying
- 🌐 Language modes:
  - Plain Text
  - Python
  - JavaScript
- 📋 Copy code as a **Markdown code block**
- 🎥 Designed specifically for **YouTube coding tutorials**

---

## 🤔 Why Not Just Use Copyfish?

Copyfish is a **general-purpose OCR tool**.

This extension is different:
- Optimized for **code**, not paragraphs
- Developer-first UX
- Language-aware formatting
- Edit-before-copy workflow
- Minimal and distraction-free

---

## 🛠️ Tech Stack

- JavaScript
- Chrome Extensions (Manifest v3)
- OCR.space API
- HTML / CSS

---

## 📦 Installation (Local)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/youtube-code-extractor.git

2. Open Chrome and go to:
   ```bash
   chrome://extensions

3. Enable Developer Mode

4. Click Load unpacked

5. Select the project folder

---

### ⚠️ You must add your own OCR.space API key in content.js.

---

## 🧪 How to Use

1. Open a YouTube coding video
2. Pause the video
3. Click the extension → Select text from video
4. Drag over the code
5. Choose language mode (optional)
6. Review extracted code
7. Click Copy

## 🧠 Lessons Learned

- Chrome Extension architecture (MV3)
- Screen capture & region selection
- OCR integration via external APIs
- Code-aware text cleanup
- Developer-centric UX design
- Debugging async browser systems

## 🔮 Future Improvements

- Auto-detect programming language
- Support for more languages (C++, Java)
- Keyboard shortcuts
- Timestamped code snippets
- Chrome Web Store release

---

## 🧠 Development Philosophy

This project was **vibe-coded** — built iteratively by following intuition, rapid experimentation, and continuous refinement rather than a rigid upfront specification.

The focus was on:
- Solving a real developer pain point
- Shipping a working MVP quickly
- Improving the product through hands-on testing and iteration
- Making pragmatic engineering decisions (e.g., choosing an OCR API over local OCR for reliability)

Vibe coding here does **not** mean careless coding — it means building with momentum, learning through implementation, and refining the solution based on real usage and feedback.

---

## Developer 😃

- Arya Madiwale
