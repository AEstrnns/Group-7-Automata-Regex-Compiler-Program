document.addEventListener('DOMContentLoaded', () => {

  // --- Initial States and Regex Logic ---
  let currentMachine = 'DFA';
  let isRegexMode = false;
  let selectedInput = 1;

  const REGEX_OFF = '(bab + bbb) a* b* (a* + b*) (ba)* (aba) (bab + aba)* bb (a + b)* (bab + aba) (a+b)';
  const REGEX_ON = '(1 + 0)* 1* 0* (101 + 01 + 000) (1 + 0)* (101 + 00)* (111 + 00 + 101) (1 + 0)';

  // --- Setup DOM Elements ---
  const screenDisplay = document.getElementById('screen-display');
  const dfaBtn = document.getElementById('btn-dfa');
  const cfgBtn = document.getElementById('btn-cfg');
  const pdaBtn = document.getElementById('btn-pda');
  
  const regexSwitch = document.getElementById('regex-switch');
  const regexDisplay = document.getElementById('regex-display');
  
  const radios = document.querySelectorAll('.radio-btn');
  const validateBtn = document.getElementById('validate-btn');
  const speakerGrillsContainer = document.getElementById('speaker-grills');


  // --- Generate 14 Decorative Grills Dynamically ---
  for (let i = 0; i < 14; i++) {
    const grill = document.createElement('div');
    grill.className = 'grill';
    speakerGrillsContainer.appendChild(grill);
  }


  // --- Handle Screen / Machine Mode Swap ---
  function updateMachineSelection(machine) {
    currentMachine = machine;
    screenDisplay.textContent = `${machine} Placeholder Screen`;

    // Apply Active/Inactive Classes to the Machine Buttons
    dfaBtn.className = machine === 'DFA' ? 'btn-machine active' : 'btn-machine inactive';
    cfgBtn.className = machine === 'CFG' ? 'btn-machine active' : 'btn-machine inactive';
    pdaBtn.className = machine === 'PDA' ? 'btn-machine active' : 'btn-machine inactive';
  }

  dfaBtn.addEventListener('click', () => updateMachineSelection('DFA'));
  cfgBtn.addEventListener('click', () => updateMachineSelection('CFG'));
  pdaBtn.addEventListener('click', () => updateMachineSelection('PDA'));


  // --- Handle Active Regex Switch ---
  regexSwitch.addEventListener('click', () => {
    isRegexMode = !isRegexMode;

    if (isRegexMode) {
      regexSwitch.classList.remove('off');
      regexSwitch.classList.add('on');
      regexDisplay.textContent = REGEX_ON;
    } else {
      regexSwitch.classList.remove('on');
      regexSwitch.classList.add('off');
      regexDisplay.textContent = REGEX_OFF;
    }
  });


  // --- Handle Custom Pill Radio Buttons ---
  radios.forEach(radio => {
    radio.addEventListener('click', () => {
      selectedInput = parseInt(radio.getAttribute('data-val'));
      
      radios.forEach(r => {
        if (parseInt(r.getAttribute('data-val')) === selectedInput) {
          r.className = 'radio-btn active';
        } else {
          r.className = 'radio-btn inactive';
        }
      });
    });
  });


  // --- Handle Validate Click Event ---
  validateBtn.addEventListener('click', () => {
    const formData = {};
    for (let i = 1; i <= 5; i++) {
      formData[`field${i}`] = document.getElementById(`input-${i}`).value;
    }
    
    console.log('Validating Request Payload:', formData, '| Target Input:', selectedInput);
    alert(`Data validated for Input ${selectedInput}!\nCheck your browser's console for form values.`);
  });

});