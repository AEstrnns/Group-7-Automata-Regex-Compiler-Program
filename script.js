document.addEventListener('DOMContentLoaded', () => {

  // --- Initial States and Core Configurations ---
  let currentMachine = 'DFA';
  let isRegexModeOn = false; 
  let selectedInput = 1;
  let network = null; 
  let nodesDataSet = null; 
  let edgesDataSet = null;

  const REGEX_OFF_STR = '(bab + bbb) a* b* (a* + b*) (ba)* (aba) (bab + aba)* bb (a + b)* (bab + aba) (a+b)*';
  const REGEX_ON_STR = '(1 + 0)* 1* 0* (101 + 01 + 000) (1 + 0)* (101 + 00)* (111 + 00 + 101) (1 + 0)*';
  
  const regexOffValidator = /^(bab|bbb)a*b*(a*|b*)(ba)*(aba)(bab|aba)*bb(a|b)*(bab|aba)(a|b)*$/;
  const regexOnValidator = /^(1|0)*1*0*(101|01|000)(1|0)*(101|00)*(111|00|101)(1|0)*$/;

  const screenDisplay = document.getElementById('screen-display');
  const dfaBtn = document.getElementById('btn-dfa');
  const cfgBtn = document.getElementById('btn-cfg');
  const pdaBtn = document.getElementById('btn-pda');
  const regexSwitch = document.getElementById('regex-switch');
  const regexDisplay = document.getElementById('regex-display');
  const validateBtn = document.getElementById('validate-btn');
  const simulateBtn = document.getElementById('simulate-btn');
  const speakerGrillsContainer = document.getElementById('speaker-grills');

  // Decorative Grills
  for (let i = 0; i < 14; i++) {
    const grill = document.createElement('div');
    grill.className = 'grill';
    speakerGrillsContainer.appendChild(grill);
  }

  // =====================================================================
  // DFA 1: REGEX OFF (a, b)
  // =====================================================================
  const dfaOffTransitions = {
    'Start':   { 'a': 'Trap1', 'b': 'q1'   },
    'q1':      { 'a': 'q2', 'b': 'q2' },
    'q2':      { 'b': 'q3', 'a': 'Trap1' },
    'q3':      { 'a': 'q4', 'b': 'q6' },
    'q4':      { 'a': 'q4', 'b': 'q5' },
    'q5':      { 'a': 'q9', 'b': 'q6' }, 
    'q6':      { 'a': 'q7', 'b': 'q6' },
    'q7':      { 'a': 'q7', 'b': 'q8' },
    'q8':      { 'a': 'q9', 'b': 'Trap2' },
    'q9':      { 'a': 'q11', 'b': 'q12' }, 
    'q10':     { 'a': 'q12', 'b': 'Trap3' },
    'q11':     { 'a': 'Trap2', 'b': 'q8', }, 
    'q12':     { 'a': 'q10', 'b': 'q13' },
    'q13':     { 'a': 'q14', 'b': 'q15' },
    'q14':     { 'a': 'q14', 'b': 'q16' },
    'q15':     { 'a': 'q17', 'b': 'q15' },
    'q16':     { 'a': 'Accept', 'b': 'q15' },
    'q17':     { 'a': 'q14', 'b': 'Accept' },
    'Accept':  { 'a': 'Accept', 'b': 'Accept' },
    'Trap1':   { 'a': 'Trap1', 'b': 'Trap1' },
    'Trap2':   { 'a': 'Trap2', 'b': 'Trap2' },
    'Trap3':   { 'a': 'Trap3', 'b': 'Trap3' }
  };

  // =====================================================================
  // DFA 2: REGEX ON (0, 1) - AS PER BLUEPRINT
  // =====================================================================
  const dfaOnTransitions = {
    'Start2':   { '0': 'e2', '1': 'e1', },
    'e1':       { '0': 'e3', '1': 'e1', },
    'e2':       { '0': 'e4', '1': 'e5' },
    'e3':       { '0': 'e4', '1': 'e5' },
    'e4':       { '0': 'e5', '1': 'e5' },
    'e5':       { '0': 'e7', '1': 'e6',},
    'e6':       { '0': 'e9', '1': 'e8' },
    'e7':       { '0': 'Accept2', '1': 'e6', },
    'e8':       { '0': 'e9', '1': 'Accept2' },
    'e9':       { '0': 'Accept2', '1': 'Accept2' },
    'Accept2':  { '0': 'Accept2', '1': 'Accept2' }
  };

  // --- Dynamic Visual Topology Builder ---
  function drawDFA() {
    const loopSmooth = { type: 'curvedCW', roundness: 0.5 };
    
    let nodesArray = [];
    let edgesArray = [];

    if (!isRegexModeOn) {
      // BUILD DFA 1 - Coordinates & Nodes
      nodesArray = [
        { id: 'Start', label: '-', shape: 'circle', x: -700, y: 0 },
        { id: 'q1', label: 'q1', shape: 'circle', x: -600, y: 0 },
        { id: 'q2', label: 'q2', shape: 'circle', x: -500, y: 0 },
        { id: 'q3', label: 'q3', shape: 'circle', x: -400, y: 0 },
        { id: 'Trap1', label: 'T', shape: 'circle', x: -550, y: 120, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'q4', label: 'q4', shape: 'circle', x: -300, y: 0 }, 
        { id: 'q5', label: 'q5', shape: 'circle', x: -200, y: 0 },
        { id: 'q6', label: 'q6', shape: 'circle', x: -300, y: 80 },
        { id: 'q7', label: 'q7', shape: 'circle', x: -300, y: 160 },
        { id: 'q8', label: 'q8', shape: 'circle', x: -150, y: 160 },
        { id: 'q9', label: 'q9', shape: 'circle', x: -100, y: 0 },
        { id: 'q10', label: 'q10', shape: 'circle', x: -25, y: -100 }, 
        { id: 'q11', label: 'q11', shape: 'circle', x: 50, y: 100 }, 
        { id: 'q12', label: 'q12', shape: 'circle', x: 50, y: 0 },
        { id: 'q13', label: 'q13', shape: 'circle', x: 150, y: 0 },
        { id: 'Trap3', label: 'T', shape: 'circle', x: 200, y: -150, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'Trap2', label: 'T', shape: 'circle', x: 200, y: 160, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'q14', label: 'q14', shape: 'circle', x: 250, y: -60 },
        { id: 'q15', label: 'q15', shape: 'circle', x: 250, y: 60 },
        { id: 'q16', label: 'q16', shape: 'circle', x: 350, y: -60 },
        { id: 'q17', label: 'q17', shape: 'circle', x: 350, y: 60 },
        { id: 'Accept', label: '+', shape: 'circle', x: 450, y: 0, borderWidth: 4 }
      ];

      edgesArray = [
        { id: 'e1', from: 'Start', to: 'q1', label: 'b', smooth: false },
        { id: 'e2', from: 'Start', to: 'Trap1', label: 'a', smooth: false },
        { id: 'e3', from: 'q1', to: 'q2', label: 'b,a', smooth: false },
        { id: 'e4', from: 'q2', to: 'q3', label: 'b', smooth: false },
        { id: 'e5', from: 'q2', to: 'Trap1', label: 'a', smooth: false },
        { id: 'e6', from: 'q3', to: 'q4', label: 'a', smooth: false },
        { id: 'e7', from: 'q3', to: 'q6', label: 'b', smooth: false },
        { id: 'e8', from: 'q4', to: 'q4', label: 'a', smooth: loopSmooth },
        { id: 'e9', from: 'q4', to: 'q5', label: 'b', smooth: false },
        { id: 'e10', from: 'q5', to: 'q9', label: 'a', smooth: false },
        { id: 'e11', from: 'q5', to: 'q6', label: 'b', smooth: false },
        { id: 'e12', from: 'q6', to: 'q6', label: 'b', smooth: loopSmooth },
        { id: 'e13', from: 'q6', to: 'q7', label: 'a', smooth: false },
        { id: 'e14', from: 'q7', to: 'q7', label: 'a', smooth: loopSmooth },
        { id: 'e15', from: 'q7', to: 'q8', label: 'b', smooth: false },
        { id: 'e16', from: 'q8', to: 'q9', label: 'a', smooth: false },
        { id: 'e17', from: 'q8', to: 'Trap2', label: 'b', smooth: false },
        { id: 'e18', from: 'q9', to: 'q12', label: 'b', smooth: false }, 
        { id: 'e19', from: 'q10', to: 'q9', label: 'b', smooth: false }, 
        { id: 'e20', from: 'q9', to: 'q11', label: 'a', smooth: false }, 
        { id: 'e21', from: 'q12', to: 'q10', label: 'a', smooth: false }, 
        { id: 'e22', from: 'q10', to: 'Trap3', label: 'a', smooth: false }, 
        { id: 'e23', from: 'q11', to: 'q8', label: 'b', smooth: false }, 
        { id: 'e24', from: 'q11', to: 'Trap2', label: 'a', smooth: false },  
        { id: 'e25', from: 'q12', to: 'qMid1', label: 'b', smooth: false },
        { id: 'e26', from: 'q12', to: 'q13', label: 'b', smooth: false },
        { id: 'e31', from: 'q13', to: 'q14', label: 'a', smooth: false },
        { id: 'e32', from: 'q13', to: 'q15', label: 'b', smooth: false },
        { id: 'e33', from: 'q14', to: 'q14', label: 'a', smooth: loopSmooth },
        { id: 'e34', from: 'q14', to: 'q16', label: 'b', smooth: false },
        { id: 'e35', from: 'q15', to: 'q15', label: 'b', smooth: loopSmooth },
        { id: 'e36', from: 'q15', to: 'q17', label: 'a', smooth: false },
        { id: 'e37', from: 'q16', to: 'Accept', label: 'a', smooth: false },
        { id: 'e38', from: 'q16', to: 'q15', label: 'a', smooth: false },
        { id: 'e39', from: 'q17', to: 'Accept', label: 'b', smooth: false },
        { id: 'e40', from: 'q17', to: 'q14', label: 'b', smooth: false },
        { id: 'e41', from: 'Accept', to: 'Accept', label: 'a,b', smooth: loopSmooth },
        { id: 'e42', from: 'Trap1', to: 'Trap1', label: 'b,a', smooth: loopSmooth },
        { id: 'e43', from: 'Trap2', to: 'Trap2', label: 'b,a', smooth: loopSmooth },
        { id: 'e44', from: 'Trap3', to: 'Trap3', label: 'b,a', smooth: loopSmooth }
      ];

    } else {
      // BUILD DFA 2 - Structured Matrix Coordinates
      nodesArray = [
        { id: 'Start2', label: '-', shape: 'circle', x: -450, y: 100 },
        { id: 'e1', label: 'e1', shape: 'circle', x: -350, y: -100 },
        { id: 'e2', label: 'e2', shape: 'circle', x: -300, y: 100 },
        { id: 'e3', label: 'e3', shape: 'circle', x: -100, y: -100 },
        { id: 'e4', label: 'e4', shape: 'circle', x: -150, y: 100 },
        { id: 'e5', label: 'e5', shape: 'circle', x: 50, y: 100 },
        { id: 'e6', label: 'e6', shape: 'circle', x: 200, y: -100 },
        { id: 'e7', label: 'e7', shape: 'circle', x: 200, y: 100 },
        { id: 'e8', label: 'e8', shape: 'circle', x: 300, y: 0 },
        { id: 'e9', label: 'e9', shape: 'circle', x: 400, y: -100 },
        { id: 'Accept2', label: '+', shape: 'circle', x: 400, y: 100, borderWidth: 4 }
      ];

      edgesArray = [
        { id: 'e1', from: 'Start2', to: 'e1', label: '1', smooth: false },
        { id: 'e2', from: 'Start2', to: 'e2', label: '0', smooth: false },
        { id: 'e3', from: 'e1', to: 'e1', label: '1', smooth: loopSmooth },
        { id: 'e4', from: 'e1', to: 'e3', label: '0', smooth: false },
        { id: 'e5', from: 'e2', to: 'e4', label: '0', smooth: false },
        { id: 'e6', from: 'e2', to: 'e5', label: '1', smooth: { type: 'curvedCW', roundness: 0.3 } },
        { id: 'e7', from: 'e3', to: 'e4', label: '0', smooth: false },
        { id: 'e8', from: 'e3', to: 'e5', label: '1', smooth: false },
        { id: 'e9', from: 'e4', to: 'e5', label: '0,1', smooth: false },
        { id: 'e10', from: 'e5', to: 'e6', label: '1', smooth: false },
        { id: 'e11', from: 'e5', to: 'e7', label: '0', smooth: false },
        { id: 'e12', from: 'e7', to: 'e6', label: '1', smooth: false },
        { id: 'e13', from: 'e7', to: 'Accept2', label: '0', smooth: false },
        { id: 'e14', from: 'e6', to: 'e9', label: '0', smooth: false },
        { id: 'e15', from: 'e6', to: 'e8', label: '1', smooth: false },
        { id: 'e16', from: 'e8', to: 'e9', label: '0', smooth: false },
        { id: 'e17', from: 'e8', to: 'Accept2', label: '1', smooth: false },
        { id: 'e18', from: 'e9', to: 'Accept2', label: '0,1', smooth: false },
        { id: 'Accept2', from: 'Accept2', to: 'Accept2', label: '0,1', smooth: loopSmooth }
      ];
    }

    nodesDataSet = new vis.DataSet(nodesArray);
    edgesDataSet = new vis.DataSet(edgesArray);

    const data = { nodes: nodesDataSet, edges: edgesDataSet };
    
    const options = {
      autoResize: false,
      nodes: {
        color: { background: '#0a1620', border: '#5293b6' },
        font: { color: '#bedef5', size: 14, face: 'monospace' },
        size: 24,
        borderWidth: 2
      },
      edges: {
        color: { color: '#25485e', highlight: '#5293b6' },
        font: { color: '#bedef5', size: 12, face: 'monospace', strokeWidth: 0, align: 'top' },
        arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        width: 3.5 
      },
      physics: { enabled: false }, 
      interaction: { dragNodes: true, zoomView: true, dragView: true }
    };

    network = new vis.Network(screenDisplay, data, options);
  }

  // Initial build invocation
  drawDFA();

  function resetVisuals() {
    if (!nodesDataSet || !edgesDataSet) return;
    
    const allNodes = nodesDataSet.get();
    allNodes.forEach(node => {
      if (node.id.startsWith('Trap')) {
        node.color = { background: '#0a1620', border: '#ff3333' };
      } else {
        node.color = { background: '#0a1620', border: '#5293b6' };
      }
    });
    nodesDataSet.update(allNodes);

    const allEdges = edgesDataSet.get();
    allEdges.forEach(edge => {
      edge.color = { color: '#25485e' };
      edge.width = 3.5;
    });
    edgesDataSet.update(allEdges);
  }

  // --- Channel Routing Matrix ---
  function updateMachineSelection(machine) {
    currentMachine = machine;
    dfaBtn.className = machine === 'DFA' ? 'btn-machine active' : 'btn-machine inactive';
    cfgBtn.className = machine === 'CFG' ? 'btn-machine active' : 'btn-machine inactive';
    pdaBtn.className = machine === 'PDA' ? 'btn-machine active' : 'btn-machine inactive';

    if (machine === 'DFA') {
      screenDisplay.innerHTML = '';
      drawDFA();
    } else {
      if (network) { network.destroy(); network = null; }
      screenDisplay.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#405663; text-transform:uppercase; text-align:center; font-family:sans-serif;">${machine} Channel Active<br><br>Awaiting Simulation Backend...</div>`;
    }
  }

  dfaBtn.addEventListener('click', () => updateMachineSelection('DFA'));
  cfgBtn.addEventListener('click', () => updateMachineSelection('CFG'));
  pdaBtn.addEventListener('click', () => updateMachineSelection('PDA'));

  // --- Regex Channel Toggle ---
  regexSwitch.addEventListener('click', () => {
    isRegexModeOn = !isRegexModeOn;
    regexDisplay.textContent = isRegexModeOn ? REGEX_ON_STR : REGEX_OFF_STR;
    regexSwitch.className = isRegexModeOn ? 'toggle-switch on' : 'toggle-switch off';
    document.querySelectorAll('.indicator-light').forEach(l => l.className = 'indicator-light');
    updateMachineSelection(currentMachine);
  });

  document.querySelectorAll('.radio-btn').forEach(radio => {
    radio.addEventListener('click', () => {
      selectedInput = parseInt(radio.getAttribute('data-val'));
      document.querySelectorAll('.radio-btn').forEach(r => {
        r.className = parseInt(r.getAttribute('data-val')) === selectedInput ? 'radio-btn active' : 'radio-btn inactive';
      });
    });
  });

  // --- Core Regex Validator Matrix ---
  validateBtn.addEventListener('click', () => {
    const activeRegex = isRegexModeOn ? regexOnValidator : regexOffValidator;
    for (let i = 1; i <= 5; i++) {
      const inputVal = document.getElementById(`input-${i}`).value.trim();
      const light = document.getElementById(`input-${i}`).nextElementSibling; 
      light.className = 'indicator-light';
      
      if (inputVal === "") continue; 
      light.classList.add(activeRegex.test(inputVal) ? 'valid' : 'invalid');
    }
  });

  // --- Pure Mathematical Traversal Simulation ---
  simulateBtn.addEventListener('click', () => {
    if (currentMachine !== 'DFA') {
      alert(`Simulation visuals for ${currentMachine} channel are currently unmapped.`);
      return;
    }

    const targetValue = document.getElementById(`input-${selectedInput}`).value.trim();
    if (targetValue === "") { alert("Please enter a string to simulate."); return; }

    resetVisuals();
    
    // Dynamic assignments matching active channel matrix parameters
    const activeTransitions = isRegexModeOn ? dfaOnTransitions : dfaOffTransitions;
    const activeValidChars = isRegexModeOn ? ['0', '1'] : ['a', 'b'];
    const acceptStateName = isRegexModeOn ? 'Accept2' : 'Accept';
    let currentState = isRegexModeOn ? 'Start2' : 'Start';
    let delay = 0;

    function animateTraversalStep(nodeId, bgColor, borderColor) {
      setTimeout(() => {
        if (nodesDataSet.get(nodeId)) {
          nodesDataSet.update({ id: nodeId, color: { background: bgColor, border: borderColor } });
          if (network) network.focus(nodeId, { scale: 1.0, animation: { duration: 150 } });
        }
      }, delay);
    }

    function animatePathStep(fromNode, toNode, colorHex) {
      setTimeout(() => {
        const edge = edgesDataSet.get({
          filter: (e) => e.from === fromNode && e.to === toNode
        })[0];
        if (edge) {
          edgesDataSet.update({ id: edge.id, color: { color: colorHex }, width: 6.5 }); 
        }
      }, delay);
    }

    // Illuminate Origin Position
    animateTraversalStep(currentState, '#1a384d', '#5293b6'); 

    for (let i = 0; i < targetValue.length; i++) {
      const char = targetValue[i];
      const previousState = currentState;
      
      delay += 800; 

      if (!activeValidChars.includes(char)) {
        setTimeout(() => alert(`Sigma execution trace fault: Character '${char}' rejected.`), delay);
        return;
      }

      currentState = activeTransitions[currentState][char];
      
      animatePathStep(previousState, currentState, '#00ffcc');
      animateTraversalStep(currentState, '#00ffcc', '#ffffff');
    }

    // Termination analysis sequence configuration
    delay += 800;
    setTimeout(() => {
      const finalStateColor = (currentState === acceptStateName) ? '#00ffcc' : '#ff3333';
      nodesDataSet.update({ id: currentState, color: { background: finalStateColor, border: '#ffffff' } });
    }, delay);
  });

});