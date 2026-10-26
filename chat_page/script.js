import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// ========================================================
// 1. GLOBAL VARIABLE AND DOM ELEMENT SELECTION
// ========================================================
const resizer = document.getElementById('dragMe');
const leftPanel = document.querySelector('.left-panel');
const container = document.querySelector('.split-container');
const reload_button = document.getElementById('reload_button');
const google_doc = document.getElementById('doc');
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Aligned variable configurations to resolve your application script freeze
const file = document.getElementById('file_button'); 
const previewContainer = document.getElementById('preview-container');

const text_link = document.getElementById('link');
const button_link = document.getElementById('linkbutton');

let conversationHistory = [];
let selectedFilesList = []; // Tracks multiple uploaded image files at once

// ========================================================
// 2. YOUR EXACT PANEL SLIDER FUNCTIONS (SAFEGUARDED)
// ========================================================
let x = 0;
let leftWidth = 0;

const mousedownHandler = function (e) {
  x = e.clientX;
  leftWidth = leftPanel.getBoundingClientRect().width;
  document.addEventListener('mousemove', mousemoveHandler);
  document.addEventListener('mouseup', mouseupHandler);
};

const mousemoveHandler = function (e) {
  const dx = e.clientX - x;
  const newWidth = ((leftWidth + dx) * 100) / container.getBoundingClientRect().width;
  
  if (newWidth > 10 && newWidth < 90) {
    leftPanel.style.width = `${newWidth}%`;
  }
};

const mouseupHandler = function () {
  document.removeEventListener('mousemove', mousemoveHandler);
  document.removeEventListener('mouseup', mouseupHandler);
};

// Only attach slider handlers if the layout elements exist on the screen
if (resizer && leftPanel && container) {
  resizer.addEventListener('mousedown', mousedownHandler);
  resizer.addEventListener("dblclick", () => {
    leftPanel.style.width = "50%";
  });
}

// ========================================================
// 3. REFRESH & GOOGLE DOC LINK UPDATER FUNCTIONS
// ========================================================
if (reload_button) {
  reload_button.addEventListener('click', () => {
    if (google_doc) google_doc.src = google_doc.src;
  });
}

window.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && event.ctrlKey) {
    if (google_doc) google_doc.src = google_doc.src;
  }
});

if (button_link) {
  button_link.addEventListener('click', function() {
    let newlink = text_link.value;
    if (!newlink) return;
    let spliter = newlink.split('?');
    google_doc.src = spliter + "?rm=minimal";
  });
}

// ========================================================
// 4. MULTI-IMAGE ATTACHMENT MANAGER & PREVIEW GENERATOR
// ========================================================
if (file) {
  file.addEventListener('change', function(e) {
    if (!e.target.files) return;

    // Convert incoming files to a native list array and append to master tracker
    const newFiles = Array.from(e.target.files);
    selectedFilesList = selectedFilesList.concat(newFiles);

    // Redraw the thumbnail elements on screen inside our tray container
    renderPreviews();

    // Clear input value pointer so same files can be re-uploaded if removed
    this.value = '';
  });
}

function renderPreviews() {
  if (!previewContainer) return;
  previewContainer.innerHTML = ''; // Clear out the thumbnail layout view

  selectedFilesList.forEach((fileObj, index) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(fileObj); // Creates local temporary URL location mapping
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '5px';
    img.style.border = '1px solid #ccc';

    // Build custom functional close/remove box indicator overlay over thumbnails
    const removeBtn = document.createElement('button');
    removeBtn.innerText = '×';
    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '-5px';
    removeBtn.style.right = '-5px';
    removeBtn.style.background = 'red';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.width = '18px';
    removeBtn.style.height = '18px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '12px';
    removeBtn.style.lineHeight = '1';
    removeBtn.style.display = 'flex';
    removeBtn.style.alignItems = 'center';
    removeBtn.style.justifyContent = 'center';

    removeBtn.addEventListener('click', () => {
      URL.revokeObjectURL(img.src); // Free memory performance cache allocation
      selectedFilesList.splice(index, 1);
      renderPreviews(); // Refresh layouts instantly
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    previewContainer.appendChild(wrapper);
  });
}

function fileToBase64(fileObj) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileObj);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ========================================================
// 5. AI CHAT ACTIONS & MULTIMODAL API PAYLOADS
// ========================================================
async function sendMessage() {
  console.log("Send button clicked! Input value is:", userInput.value);

  const text = userInput.value.trim();
  if (!text && selectedFilesList.length === 0) return;

  // Snapshot active blob pointers for interface message bubble logs
  const localBlobUrls = selectedFilesList.map(f => URL.createObjectURL(f));

  appendMessage(text, 'user', localBlobUrls);
  userInput.value = '';

  let messageContent = [];
  if (text) {
    messageContent.push({ type: 'text', text: text });
  }

  if (selectedFilesList.length > 0) {
    try {
      const base64Strings = await Promise.all(selectedFilesList.map(f => fileToBase64(f)));
      base64Strings.forEach(base64Str => {
        messageContent.push({
          type: 'image_url',
          image_url: { url: base64Str }
        });
      });
    } catch (err) {
      console.error("Base64 string conversion breakdown encountered:", err);
    }
  }

  conversationHistory.push({ role: 'user', content: messageContent });

  // Clear background trackers upon message dispatch
  selectedFilesList = [];
  if (previewContainer) previewContainer.innerHTML = '';

  // Render temporary loader text block states
  const aiMessageDiv = appendMessage('Thinking...', 'ai');

  try {
    const response = await fetch('http://10.132.16.96:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemma-4-e2b',
        messages: conversationHistory,
        stream: false
      })
    });

    if (!response.ok) throw new Error('Could not establish backend server connection.');

    const data = await response.json();
    const aiReply = data.choices.message.content;

    aiMessageDiv.innerText = aiReply;
    conversationHistory.push({ role: 'assistant', content: aiReply });

  } catch (error) {
    aiMessageDiv.innerText = 'Error: Make sure your local server environment is running and accessible.';
    console.error("Tracing diagnostic log:", error);
  }
}

function appendMessage(text, sender, imageUrlArray = []) {
  if (!chatBox) return null;
  
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);

  if (imageUrlArray && imageUrlArray.length > 0) {
    const imagesWrapper = document.createElement('div');
    imagesWrapper.style.display = 'flex';
    imagesWrapper.style.flexWrap = 'wrap';
    imagesWrapper.style.gap = '5px';
    imagesWrapper.style.marginBottom = '5px';

    imageUrlArray.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '120px';
      img.style.maxHeight = '120px';
      img.style.borderRadius = '5px';
      img.style.objectFit = 'cover';
      imagesWrapper.appendChild(img);
    });
    msgDiv.appendChild(imagesWrapper);
  }

  if (text) {
    const textSpan = document.createElement('span');
    textSpan.innerText = text;
    msgDiv.appendChild(textSpan);
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight; 
  return msgDiv;
}

// Bind chat actions only if chat components are running on the active webpage context
if (sendBtn && userInput) {
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
}
