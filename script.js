const bgMusic = new Audio('falloutfire.mp3');
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.2;

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', () => {
    bgMusic.play().catch(e => console.log("Music play blocked:", e));
  }, { once: true });

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
    'Start': { 'a': 'Trap1', 'b': 'q1' },
    'q1': { 'a': 'q2', 'b': 'q2' },
    'q2': { 'b': 'q3', 'a': 'Trap1' },
    'q3': { 'a': 'q4', 'b': 'q6' },
    'q4': { 'a': 'q4', 'b': 'q5' },
    'q5': { 'a': 'q9', 'b': 'q6' },
    'q6': { 'a': 'q7', 'b': 'q6' },
    'q7': { 'a': 'q7', 'b': 'q8' },
    'q8': { 'a': 'q9', 'b': 'Trap2' },
    'q9': { 'a': 'q11', 'b': 'q12' },
    'q10': { 'a': 'Trap3', 'b': 'q9' },
    'q11': { 'a': 'Trap2', 'b': 'q8' },
    'q12': { 'a': 'q10', 'b': 'q13' },
    'q13': { 'a': 'q14', 'b': 'q15' },
    'q14': { 'a': 'q14', 'b': 'q16' },
    'q15': { 'a': 'q17', 'b': 'q15' },
    'q16': { 'a': 'Accept', 'b': 'q15' },
    'q17': { 'a': 'q14', 'b': 'Accept' },
    'Accept': { 'a': 'Accept', 'b': 'Accept' },
    'Trap1': { 'a': 'Trap1', 'b': 'Trap1' },
    'Trap2': { 'a': 'Trap2', 'b': 'Trap2' },
    'Trap3': { 'a': 'Trap3', 'b': 'Trap3' }
  };

  // =====================================================================
  // DFA 2: REGEX ON (0, 1)
  // =====================================================================
  const dfaOnTransitions = {
    'Start2': { '0': 'e2', '1': 'e1', },
    'e1': { '0': 'e3', '1': 'e1', },
    'e2': { '0': 'e4', '1': 'e5' },
    'e3': { '0': 'e4', '1': 'e5' },
    'e4': { '0': 'e5', '1': 'e5' },
    'e5': { '0': 'e7', '1': 'e6', },
    'e6': { '0': 'e9', '1': 'e8' },
    'e7': { '0': 'Accept2', '1': 'e6', },
    'e8': { '0': 'e9', '1': 'Accept2' },
    'e9': { '0': 'Accept2', '1': 'Accept2' },
    'Accept2': { '0': 'Accept2', '1': 'Accept2' }
  };

  // --- DFA Builder ---
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
        { id: 'e26', from: 'q12', to: 'q13', label: 'b', smooth: false },
        { id: 'e31', from: 'q13', to: 'q14', label: 'a', smooth: false },
        { id: 'e32', from: 'q13', to: 'q15', label: 'b', smooth: false },
        { id: 'e33', from: 'q14', to: 'q14', label: 'a', smooth: loopSmooth },
        { id: 'e34', from: 'q14', to: 'q16', label: 'b', smooth: false },
        { id: 'e35', from: 'q15', to: 'q15', label: 'b', smooth: loopSmooth },
        { id: 'e36', from: 'q15', to: 'q17', label: 'a', smooth: false },
        { id: 'e37', from: 'q16', to: 'Accept', label: 'a', smooth: false },
        { id: 'e38', from: 'q16', to: 'q15', label: 'b', smooth: false },
        { id: 'e39', from: 'q17', to: 'Accept', label: 'b', smooth: false },
        { id: 'e40', from: 'q17', to: 'q14', label: 'a', smooth: false },
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

  // =====================================================================
  // CFG
  // =====================================================================
  function drawCFG() {
    // =====================================================================
    // CFG 1: REGEX OFF (a, b)
    // =====================================================================
    const cfgOffHtml = `
      <div id="rule-S" class="cfg-rule">S -> Q R T U V aba W bb X Y X</div>
      <div id="rule-Q" class="cfg-rule">Q -> bab | bbb</div>
      <div id="rule-R" class="cfg-rule">R -> aR | ^</div>
      <div id="rule-T" class="cfg-rule">T -> bT | ^</div>
      <div id="rule-U" class="cfg-rule">U -> R | T</div>
      <div id="rule-V" class="cfg-rule">V -> baV | ^</div>
      <div id="rule-W" class="cfg-rule">W -> babW | abaW | ^</div>
      <div id="rule-X" class="cfg-rule">X -> aX | bX | ^</div>
      <div id="rule-Y" class="cfg-rule">Y -> bab | aba</div>
    `;

    // =====================================================================
    // CFG 2: REGEX ON (0, 1)
    // =====================================================================
    const cfgOnHtml = `
      <div id="rule-S" class="cfg-rule">S -> Q R T U Q V W Q</div>
      <div id="rule-Q" class="cfg-rule">Q -> 1Q | 0Q | ^</div>
      <div id="rule-R" class="cfg-rule">R -> 1R | ^</div>
      <div id="rule-T" class="cfg-rule">T -> 0T | ^</div>
      <div id="rule-U" class="cfg-rule">U -> 101 | 01 | 000</div>
      <div id="rule-V" class="cfg-rule">V -> 101V | 00V | ^</div>
      <div id="rule-W" class="cfg-rule">W -> 111 | 00 | 101</div>
    `;

    screenDisplay.innerHTML = `
      <div id="cfg-wrapper" style="width:100%; height:100%; display:flex; flex-direction:column; padding: 2rem; font-family: monospace; font-size: clamp(0.9rem, 1.5vw, 1.2rem); color: #bedef5; overflow-y: auto; box-sizing: border-box; text-align: left; line-height: 1.6;">
         <div id="cfg-rules" style="flex: 1;">
            ${isRegexModeOn ? cfgOnHtml : cfgOffHtml}
         </div>
         <div style="border-top: 2px dashed #346282; margin: 0.5rem 0;">-</div>
         <div id="cfg-simulation" style="min-height: 120px;">
            <div>Chosen Input: <span id="cfg-target-str" style="color: #fff;">..</span></div>
            <div style="margin-top:0.5rem;">Checking: <span id="cfg-typing-str" style="color:#00ffcc;"></span><span class="cursor" style="animation: blink 1s step-end infinite;">_</span></div>
            <div id="cfg-result-str" style="margin-top:1rem; font-weight:bold; font-size: 1.2em;"></div>
         </div>
      </div>
      <style>
        @keyframes blink { 50% { opacity: 0; } }
        .cfg-rule { transition: color 0.1s ease; }
      </style>
    `;
  }

  // =====================================================================
  // PDA
  // =====================================================================
  // PDA 1: REGEX OFF (a, b) - Transition Matrix
  const pdaOffTransitions = {
    'w1': { 'a': ['REJ1'], 'b': ['w2'] },
    'w2': { 'a': ['w3'], 'b': ['w3'] },
    'w3': { 'a': ['REJ2'], 'b': ['w4'] },
    'w4': { 'a': ['w7'], 'b': ['w5'] },
    'w5': { 'a': ['w6'], 'b': ['w5'] },
    'w6': { 'a': ['w6'], 'b': ['w8'] },
    'w7': { 'a': ['w7'], 'b': ['w9'] },
    'w8': { 'a': ['w11'], 'b': ['REJ5'] },
    'w9': { 'a': ['w11'], 'b': ['w5'] },
    'w10': { 'a': ['REJ3'], 'b': ['w8'] },
    'w11': { 'a': ['w10'], 'b': ['w12'] },
    'w12': { 'a': ['w13'], 'b': ['w14'] },
    'w13': { 'a': ['REJ4'], 'b': ['w11'] },
    'w14': { 'a': ['w15'], 'b': ['w17'] },
    'w15': { 'a': ['w15'], 'b': ['w16'] },
    'w16': { 'a': ['ACC1'], 'b': ['w17'] },
    'w17': { 'a': ['w18'], 'b': ['w17'] },
    'w18': { 'a': ['w15'], 'b': ['ACC2'] },
    'REJ1': {}, 'REJ2': {}, 'REJ3': {}, 'REJ4': {}, 'REJ5': {},
    'ACC1': {}, 'ACC2': {}
  };
  // =====================================================================
  // PDA 2: REGEX ON (0, 1) - Transition Matrix
  // =====================================================================
  const pdaOnTransitions = {
    'y1': { '0': ['y4'], '1': ['y2'] },
    'y2': { '0': ['y3'], '1': ['y2'] },
    'y3': { '0': ['y5'], '1': ['y6'] },
    'y4': { '0': ['y5'], '1': ['y6'] },
    'y5': { '0': ['y6'], '1': ['y6'] },
    'y6': { '0': ['y7'], '1': ['y8'] },
    'y7': { '0': ['2ACC1'], '1': ['y8'] },
    'y8': { '0': ['y10'], '1': ['y9'] },
    'y9': { '0': ['y10'], '1': ['2ACC2'] },
    'y10': { '0': ['2ACC3'], '1': ['2ACC3'] },
    '2ACC1': {}, '2ACC2': {}, '2ACC3': {}
  };

  function drawPDA() {
    const loopSmooth = { type: 'curvedCW', roundness: 0.5 };

    let nodesArray = [];
    let edgesArray = [];

    if (!isRegexModeOn) {
      // BUILD PDA 1 - Coordinates & Nodes
      nodesArray = [
        { id: 'Start', label: 'Start', shape: 'ellipse', x: 0, y: -250, font: { color: '#bedef5' } },
        { id: 'w1', label: 'READ1', shape: 'diamond', x: 0, y: -150 },
        { id: 'REJ1', label: 'REJECT', shape: 'ellipse', x: -300, y: -150, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'w2', label: 'READ2', shape: 'diamond', x: 150, y: -150 },
        { id: 'w3', label: 'READ3', shape: 'diamond', x: 150, y: 0 },
        { id: 'REJ2', label: 'REJECT', shape: 'ellipse', x: 300, y: 0, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'w4', label: 'READ4', shape: 'diamond', x: 0, y: 0 },
        { id: 'w5', label: 'READ5', shape: 'diamond', x: -150, y: 0 },
        { id: 'w6', label: 'READ6', shape: 'diamond', x: -150, y: 150 },
        { id: 'w7', label: 'READ7', shape: 'diamond', x: 0, y: 150 },
        { id: 'w8', label: 'READ8', shape: 'diamond', x: -150, y: 300 },
        { id: 'w9', label: 'READ9', shape: 'diamond', x: 0, y: 300 },
        { id: 'w10', label: 'READ10', shape: 'diamond', x: -150, y: 450 },
        { id: 'REJ3', label: 'REJECT', shape: 'ellipse', x: -300, y: 450, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'REJ5', label: 'REJECT', shape: 'ellipse', x: -300, y: 300, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'w11', label: 'READ11', shape: 'diamond', x: 0, y: 450 },
        { id: 'w12', label: 'READ12', shape: 'diamond', x: 150, y: 450 },
        { id: 'w13', label: 'READ13', shape: 'diamond', x: 150, y: 300 },
        { id: 'w14', label: 'READ14', shape: 'diamond', x: 300, y: 450 },
        { id: 'w15', label: 'READ15', shape: 'diamond', x: 300, y: 300 },
        { id: 'REJ4', label: 'REJECT', shape: 'ellipse', x: 150, y: 150, font: { color: '#ff3333' }, color: { border: '#ff3333' } },
        { id: 'w16', label: 'READ16', shape: 'diamond', x: 300, y: 150 },
        { id: 'ACC1', label: 'ACCEPT', shape: 'ellipse', x: 450, y: 150, font: { color: '#00ffcc' }, color: { border: '#00ffcc' } },
        { id: 'w17', label: 'READ17', shape: 'diamond', x: 450, y: 450 },
        { id: 'w18', label: 'READ18', shape: 'diamond', x: 600, y: 450 },
        { id: 'ACC2', label: 'ACCEPT', shape: 'ellipse', x: 750, y: 450, font: { color: '#00ffcc' }, color: { border: '#00ffcc' } }
      ];

      edgesArray = [
        { id: '1e1', from: 'Start', to: 'w1', label: '', smooth: false },
        { id: '1e2', from: 'w1', to: 'REJ1', label: 'a', smooth: false },
        { id: '1e3', from: 'w1', to: 'w2', label: 'b', smooth: false },
        { id: '1e4', from: 'w2', to: 'w3', label: 'a,b', smooth: false },
        { id: '1e5', from: 'w3', to: 'REJ2', label: 'a', smooth: false },
        { id: '1e6', from: 'w3', to: 'w4', label: 'b', smooth: false },
        { id: '1e7', from: 'w4', to: 'w7', label: 'a', smooth: false },
        { id: '1e8', from: 'w4', to: 'w5', label: 'b', smooth: false },
        { id: '1e9', from: 'w5', to: 'w5', label: 'b', smooth: loopSmooth },
        { id: '1e10', from: 'w5', to: 'w6', label: 'a', smooth: false },
        { id: '1e11', from: 'w6', to: 'w6', label: 'a', smooth: loopSmooth },
        { id: '1e12', from: 'w6', to: 'w8', label: 'b', smooth: false },
        { id: '1e13', from: 'w7', to: 'w7', label: 'a', smooth: loopSmooth },
        { id: '1e14', from: 'w7', to: 'w9', label: 'b', smooth: false },
        { id: '1e16', from: 'w9', to: 'w5', label: 'b', smooth: { type: 'curvedCCW', roundness: 0.2 } },
        { id: '1e17', from: 'w8', to: 'w11', label: 'a', smooth: { type: 'curvedCCW', roundness: 0.3 } },
        { id: '1e18', from: 'w10', to: 'w8', label: 'b', smooth: false },
        { id: '1e19', from: 'w8', to: 'REJ5', label: 'b', smooth: false },
        { id: '1e20', from: 'w10', to: 'REJ3', label: 'a', smooth: false },
        { id: '1e21', from: 'w11', to: 'w10', label: 'a', smooth: false },
        { id: '1e22', from: 'w9', to: 'w11', label: 'a', smooth: false },
        { id: '1e23', from: 'w11', to: 'w12', label: 'b', smooth: false },
        { id: '1e24', from: 'w12', to: 'w13', label: 'a', smooth: false },
        { id: '1e25', from: 'w13', to: 'REJ4', label: 'a', smooth: false },
        { id: '1e26', from: 'w13', to: 'w11', label: 'b', smooth: { type: 'curvedCW', roundness: 0.4 } },
        { id: '1e27', from: 'w12', to: 'w14', label: 'b', smooth: false },
        { id: '1e28', from: 'w17', to: 'w17', label: 'b', smooth: loopSmooth },
        { id: '1e29', from: 'w14', to: 'w15', label: 'a', smooth: false },
        { id: '1e30', from: 'w15', to: 'w15', label: 'a', smooth: loopSmooth },
        { id: '1e31', from: 'w15', to: 'w16', label: 'b', smooth: false },
        { id: '1e32', from: 'w16', to: 'ACC1', label: 'a', smooth: false },
        { id: '1e33', from: 'w16', to: 'w17', label: 'b', smooth: { type: 'curvedCW', roundness: 0.3 } },
        { id: '1e34', from: 'w14', to: 'w17', label: 'b', smooth: false },
        { id: '1e35', from: 'w17', to: 'w18', label: 'a', smooth: false },
        { id: '1e36', from: 'w18', to: 'w15', label: 'a', smooth: { type: 'curvedCCW', roundness: 0.5 } },
        { id: '1e37', from: 'w18', to: 'ACC2', label: 'b', smooth: false }
      ];

    } else {
      // BUILD PDA 2
      nodesArray = [
        { id: 'Start2', label: 'Start', shape: 'ellipse', x: 0, y: -250, font: { color: '#bedef5' } },
        { id: 'y1', label: 'READ1', shape: 'diamond', x: 0, y: -150 },
        { id: 'y2', label: 'READ2', shape: 'diamond', x: 150, y: -150 },
        { id: 'y3', label: 'READ3', shape: 'diamond', x: 300, y: -150 },
        { id: 'y4', label: 'READ4', shape: 'diamond', x: 0, y: 0 },
        { id: 'y5', label: 'READ5', shape: 'diamond', x: 150, y: 0 },
        { id: 'y6', label: 'READ6', shape: 'diamond', x: 150, y: 150 },
        { id: 'y7', label: 'READ7', shape: 'diamond', x: 300, y: 150 },
        { id: 'y8', label: 'READ8', shape: 'diamond', x: 150, y: 300 },
        { id: 'y9', label: 'READ9', shape: 'diamond', x: 300, y: 300 },
        { id: 'y10', label: 'READ10', shape: 'diamond', x: 150, y: 450 },
        { id: '2ACC1', label: 'ACCEPT', shape: 'ellipse', x: 450, y: 150, font: { color: '#00ffcc' }, color: { border: '#00ffcc' } },
        { id: '2ACC2', label: 'ACCEPT', shape: 'ellipse', x: 450, y: 300, font: { color: '#00ffcc' }, color: { border: '#00ffcc' } },
        { id: '2ACC3', label: 'ACCEPT', shape: 'ellipse', x: 300, y: 450, font: { color: '#00ffcc' }, color: { border: '#00ffcc' } }
      ];

      edgesArray = [
        { id: '2e1', from: 'Start2', to: 'y1', label: '', smooth: false },
        { id: '2e2', from: 'y1', to: 'y2', label: '1', smooth: false },
        { id: '2e3', from: 'y2', to: 'y2', label: '1', smooth: loopSmooth },
        { id: '2e4', from: 'y1', to: 'y4', label: '0', smooth: false },
        { id: '2e5', from: 'y2', to: 'y3', label: '0', smooth: false },
        { id: '2e6', from: 'y3', to: 'y5', label: '0', smooth: { type: 'curvedCW', roundness: 0.2 } },
        { id: '2e7', from: 'y3', to: 'y6', label: '1', smooth: { type: 'curvedCW', roundness: 0.2 } },
        { id: '2e8', from: 'y4', to: 'y5', label: '0', smooth: false },
        { id: '2e9', from: 'y4', to: 'y6', label: '1', smooth: { type: 'curvedCW', roundness: 0.3 } },
        { id: '2e10', from: 'y5', to: 'y6', label: '0,1', smooth: false },
        { id: '2e11', from: 'y6', to: 'y7', label: '0', smooth: false },
        { id: '2e12', from: 'y6', to: 'y8', label: '1', smooth: false },
        { id: '2e13', from: 'y7', to: '2ACC1', label: '0', smooth: false },
        { id: '2e14', from: 'y7', to: 'y8', label: '1', smooth: false },
        { id: '2e15', from: 'y8', to: 'y9', label: '1', smooth: false },
        { id: '2e16', from: 'y8', to: 'y10', label: '0', smooth: false },
        { id: '2e17', from: 'y9', to: '2ACC2', label: '1', smooth: false },
        { id: '2e18', from: 'y9', to: 'y10', label: '0', smooth: false },
        { id: '2e19', from: 'y10', to: '2ACC3', label: '0,1', smooth: false }
      ];
    }

    nodesDataSet = new vis.DataSet(nodesArray);
    edgesDataSet = new vis.DataSet(edgesArray);

    const data = { nodes: nodesDataSet, edges: edgesDataSet };

    const options = {
      autoResize: false,
      nodes: {
        color: { background: '#0a1620', border: '#5293b6' },
        font: { color: '#bedef5', size: 12, face: 'monospace' },
        size: 26,
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

    if (network) {
      network.destroy();
      network = null;
    }

    if (machine === 'DFA') {
      screenDisplay.innerHTML = '';
      drawDFA();
    } else if (machine === 'CFG') {
      drawCFG();
    } else if (machine === 'PDA') {
      screenDisplay.innerHTML = '';
      drawPDA();
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
    for (let i = 1; i <= 5; i++) {
      const inputVal = document.getElementById(`input-${i}`).value.trim();
      const light = document.getElementById(`input-${i}`).nextElementSibling;
      light.className = 'indicator-light';

      if (inputVal === "") continue;

      let isValid = false;

      if (!isRegexModeOn) {
        // Evaluate strictly through DFA 1 transition table
        let currentState = 'Start';
        for (let char of inputVal) {
          if (dfaOffTransitions[currentState] && dfaOffTransitions[currentState][char]) {
            currentState = dfaOffTransitions[currentState][char];
          } else {
            currentState = 'Trap1';
            break;
          }
        }
        // Accepts only if it lands safely in the final Accept state
        isValid = (currentState === 'Accept');
      } else {
        // Evaluate strictly through DFA 2 transition table
        let currentState = 'Start2';
        for (let char of inputVal) {
          if (dfaOnTransitions[currentState] && dfaOnTransitions[currentState][char]) {
            currentState = dfaOnTransitions[currentState][char];
          } else {
            break;
          }
        }
        // Accepts only if it lands safely in the final Accept2 state
        isValid = (currentState === 'Accept2');
      }

      light.classList.add(isValid ? 'valid' : 'invalid');
    }
  });

  // --- Hybrid Traversal Simulation (Isolated to chosen Channel) ---
  simulateBtn.addEventListener('click', () => {
    const targetValue = document.getElementById(`input-${selectedInput}`).value.trim();
    if (targetValue === "") { alert("Please enter a string to simulate."); return; }

    const isStringValid = (!isRegexModeOn) ? regexOffValidator.test(targetValue) : regexOnValidator.test(targetValue);

    // =====================================================================
    // DFA SIMULATION
    // =====================================================================
    if (currentMachine === 'DFA') {
      resetVisuals();

      const activeTransitions = isRegexModeOn ? dfaOnTransitions : dfaOffTransitions;
      const activeValidChars = isRegexModeOn ? ['0', '1'] : ['a', 'b'];
      const acceptStateName = isRegexModeOn ? 'Accept2' : 'Accept';
      let currentState = isRegexModeOn ? 'Start2' : 'Start';
      let delay = 0;

      function animateTraversalStep(nodeId, bgColor, borderColor, shouldFocus = false) {
        setTimeout(() => {
          if (nodesDataSet.get(nodeId)) {
            nodesDataSet.update({ id: nodeId, color: { background: bgColor, border: borderColor } });
            if (shouldFocus && network) {
              network.focus(nodeId, { scale: 1.0, animation: { duration: 150 } });
            }
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

      animateTraversalStep(currentState, '#1a384d', '#5293b6');

      for (let i = 0; i < targetValue.length; i++) {
        const char = targetValue[i];
        const previousState = currentState;
        const previousEdgeId = edgesDataSet.get().find(e => e.from === previousState && e.to === activeTransitions[previousState][char])?.id;

        delay += 800;

        currentState = activeTransitions[currentState][char];

        animateTraversalStep(previousState, '#00332a', '#005544', false);
        if (previousEdgeId) animatePathStep(previousState, currentState, '#005544', 8);
        delay += 500;

        animatePathStep(previousState, currentState, '#00ffcc', 5);
        animateTraversalStep(currentState, '#00ffcc', '#ffffff', true);
      }

      delay += 800;
      setTimeout(() => {
        const isAccepted = (currentState === acceptStateName);
        const finalStateColor = isAccepted ? '#00ffcc' : '#ff3333';
        nodesDataSet.update({ id: currentState, color: { background: finalStateColor, border: '#ffffff' } });

        isAccepted ? correctSound.play() : wrongSound.play();
      }, delay);
    }
    // =====================================================================
    // CFG SIMULATION
    // =====================================================================
    else if (currentMachine === 'CFG') {
      const targetEl = document.getElementById('cfg-target-str');
      const typingEl = document.getElementById('cfg-typing-str');
      const resultEl = document.getElementById('cfg-result-str');

      targetEl.textContent = targetValue;
      typingEl.textContent = "";
      resultEl.textContent = "";
      document.querySelectorAll('.cfg-rule').forEach(el => el.style.color = '#bedef5');

      let delay = 0;

      if (isStringValid) {
        const activeCaptureRegex = isRegexModeOn ?
          /^((?:1|0)*)(1*)(0*)(101|01|000)((?:1|0)*)((?:101|00)*)(111|00|101)((?:1|0)*)$/ :
          /^(bab|bbb)(a*)(b*)(a*|b*)((?:ba)*)(aba)((?:bab|aba)*)(bb)((?:a|b)*)(bab|aba)((?:a|b)*)$/;

        const match = targetValue.match(activeCaptureRegex);

        const parts = isRegexModeOn ?
          [{ rule: 'Q', str: match[1] }, { rule: 'R', str: match[2] }, { rule: 'T', str: match[3] }, { rule: 'U', str: match[4] }, { rule: 'Q', str: match[5] }, { rule: 'V', str: match[6] }, { rule: 'W', str: match[7] }, { rule: 'Q', str: match[8] }] :
          [{ rule: 'Q', str: match[1] }, { rule: 'R', str: match[2] }, { rule: 'T', str: match[3] }, { rule: 'U', str: match[4] }, { rule: 'V', str: match[5] }, { rule: 'S', str: match[6] }, { rule: 'W', str: match[7] }, { rule: 'S', str: match[8] }, { rule: 'X', str: match[9] }, { rule: 'Y', str: match[10] }, { rule: 'X', str: match[11] }];

        parts.forEach(part => {
          if (!part.str) return;

          for (let i = 0; i < part.str.length; i++) {
            const char = part.str[i];
            delay += 300;
            setTimeout(() => {
              document.querySelectorAll('.cfg-rule').forEach(el => el.style.color = '#bedef5');
              const ruleEl = document.getElementById(`rule-${part.rule}`);
              if (ruleEl) ruleEl.style.color = '#00ffcc';
              typingEl.textContent += char;
            }, delay);

          }
        });

        delay += 500;
        setTimeout(() => {
          document.querySelectorAll('.cfg-rule').forEach(el => el.style.color = '#bedef5');
          resultEl.style.color = '#00ffcc';
          resultEl.textContent = "String VALID";
          correctSound.play(); // Play success sound
        }, delay);

      } else {
        for (let i = 0; i < targetValue.length; i++) {
          delay += 300;
          setTimeout(() => {
            typingEl.textContent += targetValue[i];
          }, delay);
        }
        delay += 500;
        setTimeout(() => {
          resultEl.style.color = '#ff3333';
          resultEl.textContent = "String INVALID";
          wrongSound.play(); // Play failure sound
        }, delay);
      }
    }

    // =====================================================================
    // ISOLATED PDA SIMULATION SECTION
    // =====================================================================
    else if (currentMachine === 'PDA') {
      resetVisuals();

      const activeTransitions = isRegexModeOn ? pdaOnTransitions : pdaOffTransitions;
      const activeValidChars = isRegexModeOn ? ['0', '1'] : ['a', 'b'];
      const acceptStateNames = isRegexModeOn ? ['2ACC1', '2ACC2', '2ACC3'] : ['ACC1', 'ACC2'];
      let startState = isRegexModeOn ? 'Start2' : 'Start';
      let delay = 0;

      function animateTraversalStep(nodeId, bgColor, borderColor, shouldFocus = false) {
        setTimeout(() => {
          if (nodesDataSet.get(nodeId)) {
            nodesDataSet.update({ id: nodeId, color: { background: bgColor, border: borderColor } });
            if (shouldFocus && network) {
              network.focus(nodeId, { scale: 1.0, animation: { duration: 150 } });
            }
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

      for (let char of targetValue) {
        if (!activeValidChars.includes(char)) {
          alert(`Sigma execution trace fault: Character '${char}' rejected.`);
          return;
        }
      }

      let foundPath = null;
      function search(currState, idx, pathArr) {
        if (foundPath) return;
        if (idx === targetValue.length) {
          if (acceptStateNames.includes(currState)) {
            foundPath = [...pathArr];
          }
          return;
        }
        const char = targetValue[idx];
        let nextOptions = [];

        if (activeTransitions[currState] && activeTransitions[currState][char]) {
          nextOptions.push(...activeTransitions[currState][char]);
        }
        if (activeTransitions[currState]) {
          for (const key in activeTransitions[currState]) {
            if (key.includes(char) && key.length > 1) {
              nextOptions.push(...activeTransitions[currState][key]);
            }
          }
        }

        for (const nxt of nextOptions) {
          pathArr.push(nxt);
          search(nxt, idx + 1, pathArr);
          pathArr.pop();
        }
      }

      let initialPathState = !isRegexModeOn ? 'w1' : 'y1';
      search(initialPathState, 0, [startState, initialPathState]);

      let finalRenderPath = foundPath;

      if (!foundPath) {
        finalRenderPath = [startState, initialPathState];
        let curr = initialPathState;
        for (let i = 0; i < targetValue.length; i++) {
          const char = targetValue[i];
          let nxt = null;
          if (activeTransitions[curr] && activeTransitions[curr][char] && activeTransitions[curr][char].length > 0) {
            nxt = activeTransitions[curr][char][0];
          } else if (activeTransitions[curr]) {
            for (const key in activeTransitions[curr]) {
              if (key.includes(char) && activeTransitions[curr][key].length > 0) {
                nxt = activeTransitions[curr][key][0];
                break;
              }
            }
          }
          if (nxt) {
            finalRenderPath.push(nxt);
            curr = nxt;
          } else {
            break;
          }
        }
      }

      animateTraversalStep(finalRenderPath[0], '#1a384d', '#5293b6');

      for (let i = 1; i < finalRenderPath.length; i++) {
        const previousState = finalRenderPath[i - 1];
        const currentState = finalRenderPath[i];
        const previousEdgeId = edgesDataSet.get().find(e => e.from === previousState && e.to === currentState)?.id;

        delay += 800;

        animateTraversalStep(previousState, '#00332a', '#00aa88', false);
        if (previousEdgeId) animatePathStep(previousState, currentState, '#00aa88', 8);
        delay += 500;

        animatePathStep(previousState, currentState, '#00ffcc', 5);
        animateTraversalStep(currentState, '#00ffcc', '#ffffff', true);
      }

      delay += 800;
      setTimeout(() => {
        const finalState = finalRenderPath[finalRenderPath.length - 1];
        const isAccepted = acceptStateNames.includes(finalState);
        const finalStateColor = isAccepted ? '#00ffcc' : '#ff3333';
        nodesDataSet.update({ id: finalState, color: { background: finalStateColor, border: '#ffffff' } });

        // Audio Trigger
        isAccepted ? correctSound.play() : wrongSound.play();
      }, delay);
    }
  });

});
