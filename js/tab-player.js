/* ═══════════════════════════════════════════════════════════════
   tab-player.js  —  jojozelan Tools / Tab Player
   AlphaTab 1.3.0  (loaded synchronously in <head>)

   Issues fixed in this version:
   - Track switching via api.renderTracks works correctly
   - No transpose functionality
   - Count-in reads time sig from current playback bar (not always bar 0)
   - Count-in overlay covers full viewport
   - Metro volume slider (GainNode)
   - TAB vs SCORE are truly exclusive (correct StaveProfile enum)
   - .gp files supported (same accept list)
   - Visual row separator between R1 and R2
   - Loop hint & loop range display
   - Chips removed from R2 — only the popover button
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const AT_CDN = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.0/dist/';

/* ─── State ──────────────────────────────────────────────── */
let api             = null;
let score           = null;
let isPlaying       = false;
let baseBpm         = 120;
let speedRatio      = 1.0;

// Tracks
let activeTrackIdx  = null;   // null = all
let trackStates     = [];     // { muted, soloed, vol }

// Loop
let loopOn          = false;
let loopSelMode     = false;
let loopBarA        = -1;
let loopBarB        = -1;

// Metro
let metroOn         = false;
let metroAC         = null;
let metroGain       = null;
let metroRAF        = null;
let metroNext       = 0;
let metroBeatIdx    = 0;
let currentBarBeats = 0;   // 0 = no file loaded yet; updated live as bar changes

// Count-in
let countInOn       = false;
let countInBusy     = false;

/* ─── DOM helpers ────────────────────────────────────────── */
const el  = id  => document.getElementById(id);
const qsa = sel => document.querySelectorAll(sel);

const esc = s => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ─── BOOT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    if (typeof alphaTab === 'undefined') {
        fatalError('AlphaTab não carregou. Verifique sua conexão e recarregue a página.');
        return;
    }

    /* File inputs */
    el('file-input').addEventListener('change',   e => { loadFile(e.target.files[0]); e.target.value=''; });
    el('file-input-2').addEventListener('change', e => { loadFile(e.target.files[0]); e.target.value=''; });

    /* Drag-and-drop */
    const zone = el('upload-zone');
    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });

    /* Transport */
    el('btn-stop').addEventListener('click', doStop);
    el('btn-play').addEventListener('click', doPlayPause);

    /* Count-in toggle */
    el('btn-cin').addEventListener('click', () => {
        countInOn = !countInOn;
        el('btn-cin').classList.toggle('on', countInOn);
    });

    /* Speed / BPM slider */
    el('speed-sl').addEventListener('input', onSpeedInput);

    /* Loop */
    el('btn-loop').addEventListener('click',     toggleLoop);
    el('btn-loop-sel').addEventListener('click', enterLoopSel);
    el('btn-loop-clr').addEventListener('click', clearLoop);

    /* Metro */
    el('btn-metro').addEventListener('click', toggleMetro);
    el('metro-vol').addEventListener('input', onMetroVol);

    /* View mode */
    qsa('.vb').forEach(b => b.addEventListener('click', () => {
        qsa('.vb').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        setViewMode(b.dataset.mode);
    }));

    /* Track popover */
    el('btn-tsel').addEventListener('click', e => { e.stopPropagation(); togglePop(); });
    el('btn-tall').addEventListener('click', e => { e.stopPropagation(); selectAll(); });
    document.addEventListener('click', e => {
        if (!el('tpop').classList.contains('tp-hidden') && !e.target.closest('.tsel-wrap'))
            closePop();
    });

    /* Keyboard */
    document.addEventListener('keydown', e => {
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault(); doPlayPause();
        }
        if (e.key === 'Escape') { cancelLoopSel(); closePop(); }
    });
});

/* ─── FILE LOADING ───────────────────────────────────────── */
function loadFile(file) {
    if (!file) return;

    const rawName = file.name.replace(/\.[^/.]+$/, '');
    el('hdr-title').textContent = rawName.replace(/_/g,' ').replace(/-/g,' ').toUpperCase();

    const reader = new FileReader();
    reader.onload = ev => {
        el('upload-zone').classList.add('tp-hidden');
        el('at-viewport').classList.remove('tp-hidden');
        el('ctrl-bar').classList.remove('tp-hidden');
        showOverlay('Carregando soundfont e renderizando…');

        if (!api) buildApi();
        else       resetAll();

        // First build needs ~400ms for the worker to init
        setTimeout(() => api.load(ev.target.result), api._firstLoad ? 0 : 500);
        api._firstLoad = true;
    };
    reader.readAsArrayBuffer(file);
}

/* ─── ALPHATAB API BUILD ─────────────────────────────────── */
function buildApi() {
    const settings = new alphaTab.Settings();

    settings.core.scriptFile   = AT_CDN + 'alphaTab.min.js';
    settings.core.fontDirectory = AT_CDN + 'font/';

    // Start in TAB mode (tab only, no notation staff)
    settings.display.layoutMode  = alphaTab.LayoutMode.Page;
    settings.display.staveProfile = getStaveProfile('tab');
    settings.display.scale        = 1.0;

    // Dark-background colour palette
    const c = (r,g,b,a=255) => new alphaTab.model.Color(r,g,b,a);
    const r = settings.display.resources;
    r.staffLineColor      = c(220,220,220, 95);
    r.barSeparatorColor   = c(220,220,220, 85);
    r.mainGlyphColor      = c(245,245,245,230);
    r.secondaryGlyphColor = c(200,200,200,180);
    r.scoreInfoColor      = c(215,215,215,200);
    r.barNumberColor      = c(190,190,190,170);
    r.wordsFontColor      = c(210,210,210,185);
    r.tabNoteColor        = c(245,245,245,230);
    r.fingeringColor      = c(200,200,200,170);

    settings.player.enablePlayer              = true;
    settings.player.enableCursor             = true;
    settings.player.enableAnimatedBeatCursor = true;
    settings.player.soundFont = AT_CDN + 'soundfont/sonivox.sf2';
    settings.player.scrollElement   = el('at-viewport');
    settings.player.scrollOffsetY   = -10;

    api = new alphaTab.AlphaTabApi(el('at-element'), settings);

    /* Events */
    api.renderStarted.on(()  => showOverlay('Renderizando…'));
    api.renderFinished.on(() => {
        hideOverlay();
        // Hook beat-click for loop selection (only once)
        if (!api._loopHooked) {
            api._loopHooked = true;
            api.beatMouseDown.on(beat => { if (loopSelMode) onLoopBeatClick(beat); });
        }
    });

    // playerReady fires when soundfont is loaded.
    // We just track it so startMetro knows the real BPM.
    api.playerReady.on(() => {
        el('btn-play').disabled = false;
        el('btn-play').style.opacity = '';
    });

    api.scoreLoaded.on(s => {
        score = s;
        onScoreLoaded(s);
    });

    api.playerStateChanged.on(args => {
        isPlaying = (args.state === alphaTab.synth.PlayerState.Playing);
        el('btn-play').innerHTML = isPlaying
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';

        if (isPlaying && metroOn) startMetro();
        if (!isPlaying)           pauseMetro();
    });

    api.playerPositionChanged.on(args => {
        // Update clock
        const s = Math.floor(args.currentTime / 1000);
        el('tp-pos').textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

        // Detect bar change and update metro dots to match that bar's time sig
        const tick = args.currentTick ?? 0;
        const bar  = barAtTick(tick);
        if (bar) {
            const num = bar.timeSignatureNumerator ?? 4;
            if (num !== currentBarBeats) {
                currentBarBeats = num;
                rebuildMetroDots(num);
                // If metro is running, reset beat index to stay aligned
                metroBeatIdx = 0;
            }
        }
    });
}

/* ─── SCORE LOADED ───────────────────────────────────────── */
function onScoreLoaded(s) {
    baseBpm = s.tempo || 120;
    syncBpmDisplay();
    buildTrackUI(s);

    // Metro starts EMPTY — dots appear only when playback begins
    // and update dynamically as bars change.
    currentBarBeats = 0;
    rebuildMetroDots(0);   // 0 = empty
}

/* ─── PLAYBACK ───────────────────────────────────────────── */
function doPlayPause() {
    if (!api) return;
    ensureAC();

    if (countInOn && !isPlaying && !countInBusy) {
        runCountIn(() => {
            if (api) {
                api.play();
                // .gp files sometimes need a tiny delay for synth init
                setTimeout(() => { if (!isPlaying && api) api.play(); }, 300);
            }
        });
        return;
    }

    api.playPause();
    // Safety retry: if still not playing after 350ms, try once more.
    // This covers .gp files where the synth init races the first call.
    if (!isPlaying) {
        setTimeout(() => {
            if (!isPlaying && api) api.play();
        }, 350);
    }
}

function doStop() {
    if (!api) return;
    countInBusy = false;
    el('count-overlay').classList.add('tp-hidden');
    api.stop();
    pauseMetro(); metroBeatIdx = 0; clearDots();
}

/* ─── COUNT-IN ───────────────────────────────────────────── */
/*
   Reads the time signature of the bar the playback cursor is
   currently at — not necessarily bar 0.
   When looping, that will be the loop-start bar.
*/
function runCountIn(callback) {
    ensureAC();
    countInBusy = true;

    // Find the bar at the current tick position
    const tick    = tryGetTick();
    const barNow  = barAtTick(tick);
    const beats   = barNow?.timeSignatureNumerator ?? 4;
    const effBpm  = baseBpm * speedRatio;
    const secBeat = 60 / effBpm;

    const overlay = el('count-overlay');
    const numEl   = el('count-num');
    overlay.classList.remove('tp-hidden');

    let beat = beats;

    const tick_ = () => {
        if (!countInBusy) { overlay.classList.add('tp-hidden'); return; }

        numEl.textContent = beat;
        // re-trigger CSS animation
        numEl.style.animation = 'none';
        void numEl.offsetHeight;
        numEl.style.animation = '';

        playClick(beat === beats, metroAC.currentTime);

        beat--;
        if (beat <= 0) {
            setTimeout(() => {
                overlay.classList.add('tp-hidden');
                countInBusy = false;
                callback();
            }, secBeat * 1000);
        } else {
            setTimeout(tick_, secBeat * 1000);
        }
    };
    tick_();
}

function tryGetTick() {
    try { return api?.tickPosition ?? 0; }
    catch(_) { return 0; }
}

function barAtTick(tick) {
    if (!score?.masterBars) return null;
    for (let i = score.masterBars.length - 1; i >= 0; i--) {
        if (score.masterBars[i].start <= tick) return score.masterBars[i];
    }
    return score.masterBars[0];
}

/* ─── SPEED / BPM ────────────────────────────────────────── */
function onSpeedInput() {
    speedRatio = parseInt(el('speed-sl').value) / 100;
    syncBpmDisplay();
    if (api) api.playbackSpeed = speedRatio;
}

function syncBpmDisplay() {
    const eff = Math.round(baseBpm * speedRatio);
    el('bpm-val').textContent   = eff;
    el('speed-pct').textContent = Math.round(speedRatio * 100) + '%';
}

/* ─── VIEW MODE ──────────────────────────────────────────── */
function setViewMode(mode) {
    if (!api) return;
    api.settings.display.staveProfile = getStaveProfile(mode);
    api.updateSettings();
    api.render();
}

/*
   AlphaTab 1.3 StaveProfile values — use named enum when available,
   fall back to integers if the enum shape differs.

   TAB only  → StaveProfile.Tab   = shows fret numbers, no notation staff
   SCORE only → StaveProfile.Score = shows notation, no tab
*/
function getStaveProfile(mode) {
    try {
        const sp = alphaTab.StaveProfile;
        if (mode === 'score') {
            // Score = standard notation only, no tab staff
            return sp.Score !== undefined ? sp.Score : 1;
        } else {
            // Tab = guitar/bass tab lines only, no notation
            return sp.Tab !== undefined ? sp.Tab : 3;
        }
    } catch(_) {
        return mode === 'score' ? 1 : 3;
    }
}

/* ─── LOOP ───────────────────────────────────────────────── */
function toggleLoop() {
    loopOn = !loopOn;
    if (api) api.isLooping = loopOn;
    el('btn-loop').classList.toggle('on', loopOn);
}

function enterLoopSel() {
    if (!score) return;
    loopSelMode = true; loopBarA = loopBarB = -1;
    el('loop-hint').classList.remove('tp-hidden');
    el('loop-hint-txt').textContent = 'Clique no compasso INICIAL do loop';
}

function cancelLoopSel() {
    loopSelMode = false;
    el('loop-hint').classList.add('tp-hidden');
}

function onLoopBeatClick(beat) {
    let barIdx = 0;
    try { barIdx = beat.voice.bar.index ?? 0; } catch(_) {}

    if (loopBarA === -1) {
        loopBarA = barIdx;
        el('loop-hint-txt').textContent = `Início: c.${barIdx+1} — clique no compasso FINAL`;
    } else {
        loopBarB = Math.max(loopBarA, barIdx);
        applyLoop(loopBarA, loopBarB);
        cancelLoopSel();
    }
}

function applyLoop(a, b) {
    if (!score?.masterBars) return;
    const mb = score.masterBars;
    if (!mb[a] || !mb[b]) return;

    const startTick = mb[a].start;
    const endTick   = b + 1 < mb.length
        ? mb[b+1].start
        : mb[b].start + (mb[b].calculateDuration?.() ?? 3840);

    api.playbackRange = { startTick, endTick };
    api.isLooping     = true;
    loopOn = true;
    el('btn-loop').classList.add('on');
    el('loop-lbl').textContent = `c.${a+1}→${b+1}`;
    el('loop-lbl').classList.remove('tp-hidden');
    el('btn-loop-clr').classList.remove('tp-hidden');
}

function clearLoop() {
    if (api) api.playbackRange = null;
    loopBarA = loopBarB = -1;
    el('loop-lbl').classList.add('tp-hidden');
    el('btn-loop-clr').classList.add('tp-hidden');
}

/* ─── TRACK UI ───────────────────────────────────────────── */
const IMAP = [
    ['drum','🥁'],['bass','🎸'],['guitar','🎸'],['piano','🎹'],
    ['key','🎹'],['vocal','🎤'],['voice','🎤'],['violin','🎻'],
    ['string','🎻'],['cello','🎻'],['trumpet','🎺'],['brass','🎺'],
    ['synth','🎹'],['organ','🎹'],['choir','🎤'],['perc','🪘'],
];
function iconFor(n) {
    const lo = (n||'').toLowerCase();
    for (const [k,v] of IMAP) if (lo.includes(k)) return v;
    return '🎵';
}
function shorten(n, max=16) { return n.length > max ? n.slice(0,max-1)+'…' : n; }

function buildTrackUI(s) {
    const list = el('tpop-list');
    list.innerHTML = '';
    trackStates = s.tracks.map(() => ({ muted:false, soloed:false, vol:100 }));

    s.tracks.forEach((track, i) => {
        const row = document.createElement('div');
        row.className = 'trow' + (i === 0 ? ' sel' : '');
        row.innerHTML = `
            <span class="trow-ico">${iconFor(track.name)}</span>
            <span class="trow-name" title="${esc(track.name)}">${esc(shorten(track.name))}</span>
            <div class="trow-ms">
                <button class="tms tm" title="Mute">M</button>
                <button class="tms ts" title="Solo">S</button>
            </div>
            <input type="range" class="trow-vol" min="0" max="100" value="100" title="Volume">
        `;

        /* Select track → render it */
        row.addEventListener('click', e => {
            if (e.target.closest('.trow-ms,.trow-vol')) return;
            pickTrack(i, track);
            closePop();
        });

        /* Mute */
        row.querySelector('.tm').addEventListener('click', e => {
            e.stopPropagation();
            trackStates[i].muted = !trackStates[i].muted;
            e.target.classList.toggle('m-on', trackStates[i].muted);
            try { api.changeTrackMute([track], trackStates[i].muted); } catch(_) {}
        });

        /* Solo */
        row.querySelector('.ts').addEventListener('click', e => {
            e.stopPropagation();
            trackStates[i].soloed = !trackStates[i].soloed;
            e.target.classList.toggle('s-on', trackStates[i].soloed);
            try { api.changeTrackSolo([track], trackStates[i].soloed); } catch(_) {}
        });

        /* Volume */
        row.querySelector('.trow-vol').addEventListener('input', function(e) {
            e.stopPropagation();
            trackStates[i].vol = parseInt(this.value);
            try { api.changeTrackVolume([track], trackStates[i].vol / 100); } catch(_) {}
        });

        list.appendChild(row);
    });

    // Auto-select first track
    pickTrack(0, s.tracks[0]);
}

function pickTrack(idx, track) {
    activeTrackIdx = idx;

    // Always use the live score reference
    const liveTrack = score?.tracks[idx] ?? track;

    // Update popover highlight
    qsa('.trow').forEach((r, i) => r.classList.toggle('sel', i === idx));

    // Update button label + icon
    el('tsel-icon').textContent = iconFor(liveTrack?.name || '');
    el('tsel-name').textContent = liveTrack?.name ? shorten(liveTrack.name, 22) : 'Todos';

    // Set renderTracks — AlphaTab's setter triggers render automatically.
    // Do NOT call api.render() after this; it cancels the track filter.
    if (api && liveTrack) {
        api.renderTracks = [liveTrack];
    }
}

function selectAll() {
    activeTrackIdx = null;
    qsa('.trow').forEach(r => r.classList.remove('sel'));
    el('tsel-icon').textContent = '🎵';
    el('tsel-name').textContent = 'Todos os instrumentos';
    // Setting renderTracks triggers the re-render automatically
    if (api && score) api.renderTracks = score.tracks;
    closePop();
}

function togglePop() {
    const pop = el('tpop');
    const open = pop.classList.contains('tp-hidden');
    pop.classList.toggle('tp-hidden', !open);
    el('btn-tsel').classList.toggle('open', open);
}
function closePop() {
    el('tpop').classList.add('tp-hidden');
    el('btn-tsel').classList.remove('open');
}

/* ─── METRONOME ──────────────────────────────────────────── */
function toggleMetro() {
    metroOn = !metroOn;
    el('btn-metro').classList.toggle('on', metroOn);
    if (metroOn && isPlaying) startMetro();
    else if (!metroOn) { pauseMetro(); clearDots(); }
}

function onMetroVol() {
    const v = parseInt(el('metro-vol').value) / 100;
    if (metroGain) metroGain.gain.setTargetAtTime(v, metroAC.currentTime, 0.01);
}

function ensureAC() {
    if (!metroAC) {
        metroAC  = new (window.AudioContext || window.webkitAudioContext)();
        metroGain = metroAC.createGain();
        metroGain.gain.value = parseInt(el('metro-vol').value) / 100;
        metroGain.connect(metroAC.destination);
    }
    if (metroAC.state === 'suspended') metroAC.resume();
}

function startMetro() {
    ensureAC();
    pauseMetro();

    const effBpm  = baseBpm * speedRatio;
    const secBeat = 60 / effBpm;
    // Use live bar beats — updated by playerPositionChanged
    // Fall back to first bar if not yet tracking
    const getBeats = () => currentBarBeats > 0
        ? currentBarBeats
        : (score?.masterBars?.[0]?.timeSignatureNumerator ?? 4);

    metroBeatIdx = 0;
    metroNext    = metroAC.currentTime + 0.05;

    const loop = () => {
        while (metroNext < metroAC.currentTime + 0.12) {
            const beats  = getBeats();
            const bi     = metroBeatIdx % beats;
            const accent = bi === 0;
            playClick(accent, metroNext);
            const delay = Math.max(0, (metroNext - metroAC.currentTime) * 1000);
            const cap = bi;
            const cap_beats = beats;
            setTimeout(() => {
                clearDots();
                const dots = qsa('.md');
                if (dots[cap]) dots[cap].classList.add('lit');
            }, delay);
            metroNext += secBeat;
            metroBeatIdx++;
        }
        metroRAF = requestAnimationFrame(loop);
    };
    loop();
}

function pauseMetro() {
    if (metroRAF) { cancelAnimationFrame(metroRAF); metroRAF = null; }
}

function clearDots() { qsa('.md').forEach(d => d.classList.remove('lit')); }

function playClick(accent, time) {
    if (!metroAC || !metroGain) return;
    const osc  = metroAC.createOscillator();
    const gain = metroAC.createGain();
    osc.frequency.value = accent ? 900 : 550;
    osc.type = 'sine';
    const vol = accent ? 1.0 : 0.5;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.065);
    osc.connect(gain);
    gain.connect(metroGain);   // routed through metro volume GainNode
    osc.start(time);
    osc.stop(time + 0.07);
}

/* rebuildMetroDots(n): n=0 → show placeholder dashes; n>0 → show n dots */
function rebuildMetroDots(n) {
    const wrap = el('metro-dots');
    wrap.innerHTML = '';
    if (!n || n <= 0) {
        // Empty state — show small dash to indicate "waiting"
        const dash = document.createElement('span');
        dash.style.cssText = 'font-size:0.6rem;color:rgba(255,255,255,0.18);letter-spacing:2px;';
        dash.textContent = '— — —';
        wrap.appendChild(dash);
        return;
    }
    for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        d.className = 'md' + (i === 0 ? ' accent' : '');
        wrap.appendChild(d);
    }
}

/* ─── RESET on new file ──────────────────────────────────── */
function resetAll() {
    loopOn = false; loopSelMode = false; loopBarA = loopBarB = -1;
    el('btn-loop').classList.remove('on');
    el('loop-lbl').classList.add('tp-hidden');
    el('btn-loop-clr').classList.add('tp-hidden');
    try { if (api) { api.isLooping = false; api.playbackRange = null; } } catch(_) {}

    countInBusy = false;
    el('count-overlay').classList.add('tp-hidden');
    pauseMetro(); metroBeatIdx = 0; clearDots();

    // Reset metro display to empty state
    currentBarBeats = 0;
    rebuildMetroDots(0);

    speedRatio = parseInt(el('speed-sl').value) / 100;
}

/* ─── OVERLAY HELPERS ────────────────────────────────────── */
function showOverlay(msg) {
    el('at-overlay-msg').textContent = msg;
    el('at-overlay').style.display  = 'flex';
}
function hideOverlay() {
    el('at-overlay').style.display = 'none';
}

/* ─── FATAL ERROR ────────────────────────────────────────── */
function fatalError(msg) {
    const z = el('upload-zone');
    if (!z) return;
    const card = z.querySelector('.upload-card') || z;
    card.innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
        <p style="color:rgba(255,120,120,0.9);font-size:0.88rem;margin:0 0 10px">${esc(msg)}</p>
        <a onclick="location.reload()" href=""
           style="color:rgba(255,255,255,0.38);font-size:0.76rem">Recarregar página</a>
    `;
}