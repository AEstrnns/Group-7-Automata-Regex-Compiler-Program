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

  // Generate 14 Decorative Grills
  for (let i = 0; i < 14; i++) {
    const grill = document.createElement('div');
    grill.className = 'grill';
    speakerGrillsContainer.appendChild(grill);
  }

  // =====================================================================
  // DFA 1: REGEX OFF (a, b) - UNCHANGED
  // =====================================================================
  const dfaOffTransitions = {
    'Start':      { 'b': 'q1', 'a': 'Trap1' },
    'q1':         { 'a': 'q2', 'b': 'q2' },
    'q2':         { 'b': 'q3', 'a': 'Trap1' },
    'q3':         { 'a': 'qTop1', 'b': 'qBot1' },
    'qTop1':      { 'a': 'qTop1', 'b': 'qMerge' },
    'qBot1':      { 'b': 'qBot1', 'a': 'qBot2' },
    'qBot2':      { 'a': 'qBot2', 'b': 'qBot3' },
    'qBot3':      { 'a': 'qMerge', 'b': 'Trap2' },
    'qMerge':     { 'a': 'qTop2', 'b': 'qBaLoop' },
    'qBaLoop':    { 'a': 'qMerge', 'b': 'Trap2' },
    'qTop2':      { 'b': 'qMid1', 'a': 'Trap3' },
    'qMid1':      { 'a': 'qMid2', 'b': 'Trap2' },
    'qMid2':      { 'b': 'qMid3', 'a': 'Trap3' },
    'qMid3':      { 'a': 'qCrossTop1', 'b': 'qCrossBot1' },
    'qCrossTop1': { 'a': 'qCrossTop1', 'b': 'qCrossTop2' },
    'qCrossBot1': { 'b': 'qCrossBot1', 'a': 'qCrossBot2' },
    'qCrossTop2': { 'b': 'Accept', 'a': 'qCrossBot1' },
    'qCrossBot2': { 'a': 'Accept', 'b': 'qCrossTop1' },
    'Accept':     { 'a': 'Accept', 'b': 'Accept' },
    'Trap1':      { 'a': 'Trap1', 'b': 'Trap1' },
    'Trap2':      { 'a': 'Trap2', 'b': 'Trap2' },
    'Trap3':      { 'a': 'Trap3', 'b': 'Trap3' }
  };

  // =====================================================================
  // DFA 2: REGEX ON (0, 1) - AS PER BLUEPRINT
  // =====================================================================
  const dfaOnTransitions = {
    'Start2':  { '1': 'N1_Top', '0': 'N1_Bot' },
    'N1_Top':  { '1': 'N1_Top', '0': 'N2_Top' },
    'N1_Bot':  { '0': 'N2_Bot', '1': 'N_Merge' },
    'N2_Top':  { '0': 'N2_Bot', '1': 'N_Merge' },
    'N2_Bot':  { '0': 'N_Merge', '1': 'N_Merge' },
    'N_Merge': { '1': 'N3_Top', '0': 'N3_Bot' },
    'N3_Top':  { '0': 'N4_Top', '1': 'N_Mid' },
    'N3_Bot':  { '1': 'N3_Top', '0': 'Accept2' },
    'N_Mid':   { '0': 'N4_Top', '1': 'Accept2' },
    'N4_Top':  { '0': 'Accept2', '1': 'Accept2' },
    'Accept2': { '0': 'Accept2', '1': 'Accept2' }
  };

  // --- Dynamic Visual Topology Builder ---
  function drawDFA() {
    const loopSmooth = { type: 'curvedCW', roundness: 0.5 };
    
    let nodesArray = [];
    let edgesArray = [];

    if (!isRegexModeOn) {
      // BUILD DFA 1 - Coordinates & Nodes Unchanged
      nodesArray = [
        { id: 'Start', label: '-', shape: 'circle', x: -700, y: 0 },
        { id: 'q1', label: '', shape: 'circle', x: -600, y: 0 },
        { id: 'q2', label: '', shape: 'circle', x: -500, y: 0 },
        { id: 'q3', label: '', shape: 'circle', x: -400, y: 0 },
        { id: 'Trap1', label: 'T', shape: 'circle', x: -550, y: 120, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'qTop1', label: '', shape: 'circle', x: -300, y: 0 },
        { id: 'qBot1', label: '', shape: 'circle', x: -300, y: 80 },
        { id: 'qBot2', label: '', shape: 'circle', x: -300, y: 160 },
        { id: 'qBot3', label: '', shape: 'circle', x: -150, y: 160 },
        { id: 'qMerge', label: '', shape: 'circle', x: -100, y: 0 },
        { id: 'qBaLoop', label: '', shape: 'circle', x: 50, y: 100 }, 
        { id: 'qTop2', label: '', shape: 'circle', x: 50, y: 0 },
        { id: 'qMid1', label: '', shape: 'circle', x: 150, y: 0 },
        { id: 'qMid2', label: '', shape: 'circle', x: 250, y: 0 },
        { id: 'qMid3', label: '', shape: 'circle', x: 350, y: 0 },
        { id: 'Trap3', label: 'T', shape: 'circle', x: 200, y: -150, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'Trap2', label: 'T', shape: 'circle', x: 200, y: 180, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'qCrossTop1', label: '', shape: 'circle', x: 450, y: -60 },
        { id: 'qCrossBot1', label: '', shape: 'circle', x: 450, y: 60 },
        { id: 'qCrossTop2', label: '', shape: 'circle', x: 550, y: -60 },
        { id: 'qCrossBot2', label: '', shape: 'circle', x: 550, y: 60 },
        { id: 'Accept', label: '+', shape: 'circle', x: 650, y: 0, borderWidth: 4 }
      ];

      edgesArray = [
        { id: 'e1', from: 'Start', to: 'q1', label: 'b', smooth: false },
        { id: 'e2', from: 'Start', to: 'Trap1', label: 'a', smooth: false },
        { id: 'e3', from: 'q1', to: 'q2', label: 'b,a', smooth: false },
        { id: 'e4', from: 'q2', to: 'q3', label: 'b', smooth: false },
        { id: 'e5', from: 'q2', to: 'Trap1', label: 'a', smooth: false },
        { id: 'e6', from: 'q3', to: 'qTop1', label: 'a', smooth: false },
        { id: 'e7', from: 'q3', to: 'qBot1', label: 'b', smooth: false },
        { id: 'e8', from: 'qTop1', to: 'qTop1', label: 'a', smooth: loopSmooth },
        { id: 'e9', from: 'qTop1', to: 'qMerge', label: 'b', smooth: false },
        { id: 'e10', from: 'qBot1', to: 'qBot1', label: 'b', smooth: loopSmooth },
        { id: 'e11', from: 'qBot1', to: 'qBot2', label: 'a', smooth: false },
        { id: 'e12', from: 'qBot2', to: 'qBot2', label: 'a', smooth: loopSmooth },
        { id: 'e13', from: 'qBot2', to: 'qBot3', label: 'b', smooth: false },
        { id: 'e14', from: 'qBot3', to: 'qMerge', label: 'a', smooth: false },
        { id: 'e15', from: 'qBot3', to: 'Trap2', label: 'b', smooth: false },
        { id: 'e16', from: 'qMerge', to: 'qTop2', label: 'a', smooth: false },
        { id: 'e17', from: 'qMerge', to: 'qBaLoop', label: 'b', smooth: false },
        { id: 'e18', from: 'qBaLoop', to: 'qMerge', label: 'a', smooth: false },
        { id: 'e19', from: 'qBaLoop', to: 'Trap2', label: 'b', smooth: false },
        { id: 'e20', from: 'qTop2', to: 'qMid1', label: 'b', smooth: false },
        { id: 'e21', from: 'qTop2', to: 'Trap3', label: 'a', smooth: false },
        { id: 'e22', from: 'qMid1', to: 'qMid2', label: 'a', smooth: false },
        { id: 'e23', from: 'qMid1', to: 'Trap2', label: 'b', smooth: false },
        { id: 'e24', from: 'qMid2', to: 'qMid3', label: 'b', smooth: false },
        { id: 'e25', from: 'qMid2', to: 'Trap3', label: 'a', smooth: false },
        { id: 'e26', from: 'qMid3', to: 'qCrossTop1', label: 'a', smooth: false },
        { id: 'e27', from: 'qMid3', to: 'qCrossBot1', label: 'b', smooth: false },
        { id: 'e28', from: 'qCrossTop1', to: 'qCrossTop1', label: 'a', smooth: loopSmooth },
        { id: 'e29', from: 'qCrossTop1', to: 'qCrossTop2', label: 'b', smooth: false },
        { id: 'e30', from: 'qCrossBot1', to: 'qCrossBot1', label: 'b', smooth: loopSmooth },
        { id: 'e31', from: 'qCrossBot1', to: 'qCrossBot2', label: 'a', smooth: false },
        { id: 'e32', from: 'qCrossTop2', to: 'Accept', label: 'b', smooth: false },
        { id: 'e33', from: 'qCrossTop2', to: 'qCrossBot1', label: 'a', smooth: false },
        { id: 'e34', from: 'qCrossBot2', to: 'Accept', label: 'a', smooth: false },
        { id: 'e35', from: 'qCrossBot2', to: 'qCrossTop1', label: 'b', smooth: false },
        { id: 'e36', from: 'Accept', to: 'Accept', label: 'a,b', smooth: loopSmooth },
        { id: 'e37', from: 'Trap1', to: 'Trap1', label: 'b,a', smooth: loopSmooth },
        { id: 'e38', from: 'Trap2', to: 'Trap2', label: 'b,a', smooth: loopSmooth },
        { id: 'e39', from: 'Trap3', to: 'Trap3', label: 'b,a', smooth: loopSmooth }
      ];

    } else {
      // BUILD DFA 2 - Structured Matrix Coordinates
      nodesArray = [
        { id: 'Start2', label: '-', shape: 'circle', x: -450, y: 100 },
        { id: 'N1_Top', label: '', shape: 'circle', x: -350, y: -100 },
        { id: 'N1_Bot', label: '', shape: 'circle', x: -300, y: 100 },
        { id: 'N2_Top', label: '', shape: 'circle', x: -100, y: -100 },
        { id: 'N2_Bot', label: '', shape: 'circle', x: -150, y: 100 },
        { id: 'N_Merge', label: '', shape: 'circle', x: 50, y: 100 },
        { id: 'N3_Top', label: '', shape: 'circle', x: 200, y: -100 },
        { id: 'N3_Bot', label: '', shape: 'circle', x: 200, y: 100 },
        { id: 'N_Mid', label: '', shape: 'circle', x: 300, y: 0 },
        { id: 'N4_Top', label: '', shape: 'circle', x: 400, y: -100 },
        { id: 'Accept2', label: '+', shape: 'circle', x: 400, y: 100, borderWidth: 4 }
      ];

      edgesArray = [
        { id: 'e1', from: 'Start2', to: 'N1_Top', label: '1', smooth: false },
        { id: 'e2', from: 'Start2', to: 'N1_Bot', label: '0', smooth: false },
        { id: 'e3', from: 'N1_Top', to: 'N1_Top', label: '1', smooth: loopSmooth },
        { id: 'e4', from: 'N1_Top', to: 'N2_Top', label: '0', smooth: false },
        { id: 'e5', from: 'N1_Bot', to: 'N2_Bot', label: '0', smooth: false },
        { id: 'e6', from: 'N1_Bot', to: 'N_Merge', label: '1', smooth: { type: 'curvedCW', roundness: 0.3 } },
        { id: 'e7', from: 'N2_Top', to: 'N2_Bot', label: '0', smooth: false },
        { id: 'e8', from: 'N2_Top', to: 'N_Merge', label: '1', smooth: false },
        { id: 'e9', from: 'N2_Bot', to: 'N_Merge', label: '0,1', smooth: false },
        { id: 'e10', from: 'N_Merge', to: 'N3_Top', label: '1', smooth: false },
        { id: 'e11', from: 'N_Merge', to: 'N3_Bot', label: '0', smooth: false },
        { id: 'e12', from: 'N3_Bot', to: 'N3_Top', label: '1', smooth: false },
        { id: 'e13', from: 'N3_Bot', to: 'Accept2', label: '0', smooth: false },
        { id: 'e14', from: 'N3_Top', to: 'N4_Top', label: '0', smooth: false },
        { id: 'e15', from: 'N3_Top', to: 'N_Mid', label: '1', smooth: false },
        { id: 'e16', from: 'N_Mid', to: 'N4_Top', label: '0', smooth: false },
        { id: 'e17', from: 'N_Mid', to: 'Accept2', label: '1', smooth: false },
        { id: 'e18', from: 'N4_Top', to: 'Accept2', label: '0,1', smooth: false },
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
      
      animatePathStep(previousState, currentState, '#ffaa00');
      animateTraversalStep(currentState, '#ffaa00', '#ffffff');
    }

    // Termination analysis sequence configuration
    delay += 800;
    setTimeout(() => {
      const finalStateColor = (currentState === acceptStateName) ? '#00ffcc' : '#ff3333';
      nodesDataSet.update({ id: currentState, color: { background: finalStateColor, border: '#ffffff' } });
    }, delay);
  });

});