// --- State ---
let isRegexMode = false;
let currentChannel = 'static';

// --- Initialize DOM generation dynamically ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Generate Static Noise
  const staticContainer = document.getElementById('static-noise');
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.style.position = 'absolute';
    dot.style.backgroundColor = 'white';
    dot.style.width = (Math.random() * 3) + 'px';
    dot.style.height = (Math.random() * 3) + 'px';
    dot.style.left = (Math.random() * 100) + '%';
    dot.style.top = (Math.random() * 100) + '%';
    dot.style.animation = `flicker ${Math.random() * 0.3 + 0.1}s infinite`;
    staticContainer.appendChild(dot);
  }

  // 2. Generate Retro Waves
  const wavesContainer = document.getElementById('retro-waves');
  for (let i = 0; i < 12; i++) {
    const wave = document.createElement('div');
    wave.style.position = 'absolute';
    wave.style.width = '100%';
    wave.style.height = '128px';
    wave.style.background = 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)';
    wave.style.top = `${i * 40}px`;
    wave.style.animation = `wave ${3 + i * 0.5}s ease-in-out infinite`;
    wave.style.animationDelay = `${i * 0.2}s`;
    wavesContainer.appendChild(wave);
  }

  // 3. Generate 5 Input Fields
  const inputsContainer = document.getElementById('inputs-container');
  for (let i = 1; i <= 5; i++) {
    const fieldHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <label style="color: #c5dce9; min-width: 80px; font-size: 1.125rem; font-weight: bold;">Input ${i}:</label>
        <input type="text" id="field${i}" class="input-field" placeholder="Enter value ${i}" style="flex: 1;">
      </div>
    `;
    inputsContainer.insertAdjacentHTML('beforeend', fieldHTML);
  }

  // 4. Generate Speaker Grills
  const speakerContainer = document.getElementById('speaker-grills');
  for (let i = 0; i < 14; i++) {
    const grill = document.createElement('div');
    grill.className = 'speaker-grill';
    speakerContainer.appendChild(grill);
  }
});


// --- Functions ---

function setChannel(channel) {
  currentChannel = channel;
  
  // Hide all screens
  document.getElementById('channel-static').classList.add('hidden');
  document.getElementById('channel-color-bars').classList.add('hidden');
  document.getElementById('channel-retro-pattern').classList.add('hidden');
  
  // Show active screen
  document.getElementById(`channel-${channel}`).classList.remove('hidden');

  // Update button styles
  const btnMap = {
    'static': document.getElementById('btn-ch1'),
    'color-bars': document.getElementById('btn-ch2'),
    'retro-pattern': document.getElementById('btn-ch3')
  };

  // Apply classes accordingly
  Object.keys(btnMap).forEach(key => {
    if (key === channel) {
      btnMap[key].classList.add('ch-btn-active');
    } else {
      btnMap[key].classList.remove('ch-btn-active');
    }
  });
}

function toggleRegex() {
  isRegexMode = !isRegexMode;
  
  const switchBg = document.getElementById('regex-switch');
  const knob = document.getElementById('regex-knob');
  const display = document.getElementById('regex-display');

  if (isRegexMode) {
    switchBg.classList.add('active');
    display.textContent = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/';
  } else {
    switchBg.classList.remove('active');
    display.textContent = '/^[a-zA-Z0-9_]+$/';
  }
}

function handleValidate() {
  const formData = {};
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById(`field${i}`);
    formData[`field${i}`] = input.value;
  }
  
  console.log('Validating:', formData);
  alert(`Data validated!\nActive RegEx: ${document.getElementById('regex-display').textContent}\nCheck console for form values.`);
}