//BASIC AUDIO SETUP
let audioCtx; 
let isPlaying = false; 
let nextNoteTimeA = 0.0; 
let nextNoteTimeB = 0.0; 
let timerID = null;

//COUNTERS FOR VISUALS
let beatCountA = 0;
let beatCountB = 0;

//JQUERY SELECTORS FOR UI ELEMENTS
const $beatA = $('#beat-a');
const $beatB = $('#beat-b');
const $bpm = $('#bpm');
const $playBtn = $('#play-btn');
const $svgCanvas = $('#poly-svg'); 

// --- THEME ENGINE ---
const themes = [
    {   // Palette 1: Earthy
        bgStart: '#af8c62', bgEnd: '#6f4f43',
        glassBg: 'rgba(37, 34, 38, 0.5)', 
        btnBg: 'rgba(79, 64, 70, 0.9)',
        accentA: '#596361', accentB: '#d6b89c'
    },
    {   // Palette 2: Winter/Dove
        bgStart: '#c0bab3', bgEnd: '#52423d',
        glassBg: 'rgba(22, 15, 12, 0.6)', 
        btnBg: 'rgba(57, 18, 20, 0.8)',
        accentA: '#e0e0e0', accentB: '#160f0c'
    },
    {   // Palette 3: Pine Forest
        bgStart: '#1c2c3b', bgEnd: '#192a34',
        glassBg: 'rgba(255, 255, 255, 0.05)', 
        btnBg: 'rgba(68, 93, 99, 0.8)',
        accentA: '#718d99', accentB: '#b3c6d0'
    },
    {   // Palette 4: Royal Purple
        bgStart: '#959bb5', bgEnd: '#3a3e6c',
        glassBg: 'rgba(10, 17, 35, 0.6)', 
        btnBg: 'rgba(58, 62, 108, 0.8)',
        accentA: '#8387c3', accentB: '#ffffff'
    }
];

function changeTheme(index) {
    const t = themes[index];
    const root = document.documentElement;

    root.style.setProperty('--bg-start', t.bgStart);
    root.style.setProperty('--bg-end', t.bgEnd);
    root.style.setProperty('--glass-bg', t.glassBg);
    root.style.setProperty('--btn-bg', t.btnBg);
    root.style.setProperty('--accent-a', t.accentA);
    root.style.setProperty('--accent-b', t.accentB);

    drawShapes();
}

//VISUAL SHAPE GENERATOR
function drawShapes() {
    $svgCanvas.empty();
    
    const countA = parseInt($beatA.val()) || 3; 
    const countB = parseInt($beatB.val()) || 4; 
    
    createPolygon(countA, 80, 'shape-a', 'shape-a-line', 'shape-a-dot'); 
    createPolygon(countB, 130, 'shape-b', 'shape-b-line', 'shape-b-dot');
}

function createPolygon(sides, radius, idPrefix, lineClass, dotClass) {
    const cx = 200; 
    const cy = 200; 
    let points = "";
    
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        
        points += `${x},${y} `;
        
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 6); 
        dot.setAttribute("class", `poly-dot ${dotClass}`); 
        dot.setAttribute("id", `${idPrefix}-dot-${i}`);
        
        $svgCanvas.append(dot);
    }

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points);
    polygon.setAttribute("class", `poly-shape ${lineClass}`);
    polygon.setAttribute("opacity", "0.6"); 
    
    $svgCanvas.prepend(polygon); 
}

// --- JQUERY EVENT LISTENERS ---

// 1. Redraw on change
$('#beat-a, #beat-b').on('change', drawShapes);

// 2. STOP Metronome immediately on mousedown/touchstart on inputs
$('#beat-a, #beat-b, #bpm').on('mousedown touchstart', stopMetronome);

// Initial Draw
drawShapes();


// --- AUDIO ENGINE ---

function stopMetronome() {
    if (isPlaying) {
        isPlaying = false;
        $playBtn.text("START");
        cancelAnimationFrame(timerID);
    }
}

function playTone(freq, time, type, currentBeatIndex){
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.value = freq;
    osc.type = 'sine';

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.1);

    const timeUntilNote = (time - audioCtx.currentTime) * 1000;
    setTimeout(() => {
        if (isPlaying) {
            highlightDot(type, currentBeatIndex);
        }
    }, timeUntilNote);
}

function highlightDot(type, index) {
    const idPrefix = type === 'A' ? 'shape-a' : 'shape-b';
    const totalBeats = type === 'A' ? parseInt($beatA.val()) : parseInt($beatB.val());
    
    const safeIndex = index % (totalBeats || 1); 

    // Reset dots
    for(let i=0; i<totalBeats; i++) {
        $(`#${idPrefix}-dot-${i}`).removeClass('active').css('fill', '');
    }

    // Highlight current
    $(`#${idPrefix}-dot-${safeIndex}`).addClass('active');
}

function scheduler(){
    while(nextNoteTimeA < audioCtx.currentTime + 0.1){
        scheduleNote('A');
    }
    while(nextNoteTimeB < audioCtx.currentTime + 0.1){
        scheduleNote('B');
    }

    if(isPlaying){
        timerID = requestAnimationFrame(scheduler)
    }
}

function scheduleNote(track){
    const beatsA = parseInt($beatA.val()) || 1; 
    const beatsB = parseInt($beatB.val()) || 1;
    const bpm = parseInt($bpm.val()) || 60;

    const cycleDuration = (60 / bpm) * 4; 

    if(track === 'A'){
        playTone(440, nextNoteTimeA, 'A', beatCountA); 
        nextNoteTimeA += cycleDuration / beatsA;
        beatCountA++;
    }else{
        playTone(330, nextNoteTimeB, 'B', beatCountB); 
        nextNoteTimeB += cycleDuration / beatsB;
        beatCountB++;
    }
}

$playBtn.on('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if(audioCtx.state === 'suspended'){
        audioCtx.resume();
    }

    if(!isPlaying){
        isPlaying = true;
        $playBtn.text("STOP");
        
        nextNoteTimeA = audioCtx.currentTime + 0.1;
        nextNoteTimeB = audioCtx.currentTime + 0.1;
        
        beatCountA = 0;
        beatCountB = 0;
        
        scheduler();
    }else{
        stopMetronome();
    }
});

// --- INITIALIZATION ---
changeTheme(0);