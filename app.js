/**
 * IronLevel - Gym & Running Tracker with Level Up System
 * Rule: 2 hours of training = 1 point
 */

// --- HAPTIC FEEDBACK (Vibration for Mobile Phones) ---
function triggerHaptic(type = "light") {
  if (!navigator.vibrate) return;
  try {
    if (type === "light") navigator.vibrate(30);
    else if (type === "medium") navigator.vibrate(55);
    else if (type === "success") navigator.vibrate([40, 30, 80]);
    else if (type === "levelup") navigator.vibrate([100, 50, 100, 50, 200]);
  } catch (e) {}
}

// --- AUDIO SYNTHESIZER (Web Audio API - Offline & Instant) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playBeep(freq = 600, duration = 0.15) {
    triggerHaptic("medium");
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  playCheck() {
    triggerHaptic("success");
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.12);
  }
  playLevelUp() {
    triggerHaptic("levelup");
    this.init();
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      }, idx * 110);
    });
  }
}
const sfx = new SoundEffects();

// --- LEVEL DEFINITIONS ---
const LEVELS = [
  { level: 1, name: "Novato de Ferro", badge: "🥉", rank: "Iniciando a Jornada", minPoints: 0, maxPoints: 1.5 },
  { level: 2, name: "Iniciado Focado", badge: "🥈", rank: "Criando o Hábito", minPoints: 1.5, maxPoints: 4.0 },
  { level: 3, name: "Rato de Academia", badge: "🥇", rank: "Disciplina de Aço", minPoints: 4.0, maxPoints: 8.0 },
  { level: 4, name: "Atleta Dedicado", badge: "💎", rank: "Ritmo Imparável", minPoints: 8.0, maxPoints: 15.0 },
  { level: 5, name: "Monstro da Maromba", badge: "🦁", rank: "Físico em Construção", minPoints: 15.0, maxPoints: 25.0 },
  { level: 6, name: "Titã dos Pesos", badge: "⚡", rank: "Força Brutal", minPoints: 25.0, maxPoints: 40.0 },
  { level: 7, name: "Lenda Suprema", badge: "👑", rank: "Inspiração Total", minPoints: 40.0, maxPoints: 60.0 },
  { level: 8, name: "Deus do Olimpo", badge: "🌌", rank: "Transcendeu os Limites", minPoints: 60.0, maxPoints: 9999 }
];

// --- DEFAULT WORKOUT ROUTINES (7 DAYS) ---
const DEFAULT_WORKOUT_ROUTINES = {
  0: { // Segunda
    dayName: "Segunda-feira",
    title: "Peito & Tríceps",
    exercises: [
      { id: "e1", name: "Supino Reto com Barra", sets: 4, reps: "8-10", weight: 40, rest: 60, notes: "Cadência controlada", done: false },
      { id: "e2", name: "Supino Inclinado com Halteres", sets: 4, reps: "10-12", weight: 18, rest: 60, notes: "Amplitude máxima", done: false },
      { id: "e3", name: "Crucifixo na Polia (Crossover)", sets: 3, reps: "12-15", weight: 15, rest: 45, notes: "Aperte 1s no pico", done: false },
      { id: "e4", name: "Tríceps Corda na Polia", sets: 4, reps: "12-15", weight: 20, rest: 45, notes: "Abra a corda no final", done: false },
      { id: "e5", name: "Tríceps Francês Halter", sets: 3, reps: "10-12", weight: 14, rest: 60, notes: "Cotovelos fechados", done: false }
    ]
  },
  1: { // Terça
    dayName: "Terça-feira",
    title: "Costas & Bíceps",
    exercises: [
      { id: "e6", name: "Puxada Frontal Alta", sets: 4, reps: "8-10", weight: 45, rest: 60, notes: "Puxe até o peitoral", done: false },
      { id: "e7", name: "Remada Baixa Triângulo", sets: 4, reps: "10-12", weight: 40, rest: 60, notes: "Costas retas", done: false },
      { id: "e8", name: "Remada Curvada com Barra", sets: 3, reps: "8-10", weight: 35, rest: 90, notes: "Pegada pronada", done: false },
      { id: "e9", name: "Rosca Direta com Barra W", sets: 4, reps: "10-12", weight: 20, rest: 60, notes: "Sem roubar com a coluna", done: false },
      { id: "e10", name: "Rosca Martelo Halteres", sets: 3, reps: "12-15", weight: 12, rest: 45, notes: "Foco no braquial", done: false }
    ]
  },
  2: { // Quarta
    dayName: "Quarta-feira",
    title: "Pernas Completo & Panturrilha",
    exercises: [
      { id: "e11", name: "Agachamento Livre", sets: 4, reps: "8-10", weight: 50, rest: 90, notes: "Desça até 90 graus ou mais", done: false },
      { id: "e12", name: "Leg Press 45°", sets: 4, reps: "10-12", weight: 120, rest: 90, notes: "Pés na largura dos ombros", done: false },
      { id: "e13", name: "Cadeira Extensora", sets: 3, reps: "12-15", weight: 35, rest: 45, notes: "Segura 1s em cima", done: false },
      { id: "e14", name: "Mesa Flexora", sets: 4, reps: "10-12", weight: 30, rest: 60, notes: "Posterior de coxa", done: false },
      { id: "e15", name: "Panturrilha em Pé", sets: 4, reps: "15-20", weight: 40, rest: 45, notes: "Alongamento completo", done: false }
    ]
  },
  3: { // Quinta
    dayName: "Quinta-feira",
    title: "Ombros & Trapézio",
    exercises: [
      { id: "e16", name: "Desenvolvimento com Halteres", sets: 4, reps: "8-10", weight: 16, rest: 60, notes: "Controle na descida", done: false },
      { id: "e17", name: "Elevação Lateral com Halteres", sets: 4, reps: "12-15", weight: 8, rest: 45, notes: "Cotovelos levemente flexionados", done: false },
      { id: "e18", name: "Crucifixo Invertido", sets: 3, reps: "12-15", weight: 6, rest: 45, notes: "Deltoide posterior", done: false },
      { id: "e19", name: "Encolhimento com Barra", sets: 4, reps: "12-15", weight: 50, rest: 45, notes: "Trapézio alto", done: false }
    ]
  },
  4: { // Sexta
    dayName: "Sexta-feira",
    title: "Braços & Abdômen",
    exercises: [
      { id: "e20", name: "Rosca Scott na Máquina", sets: 3, reps: "10-12", weight: 25, rest: 60, notes: "Isolamento de bíceps", done: false },
      { id: "e21", name: "Tríceps Testa com Halteres", sets: 3, reps: "10-12", weight: 10, rest: 60, notes: "Estabilidade dos braços", done: false },
      { id: "e22", name: "Rosca Concentrada", sets: 3, reps: "12", weight: 10, rest: 45, notes: "Pico de bíceps", done: false },
      { id: "e23", name: "Abdominal Infra no Banco", sets: 4, reps: "15-20", weight: 0, rest: 45, notes: "Pernas estendidas", done: false },
      { id: "e24", name: "Prancha Abdominal", sets: 3, reps: "45 seg", weight: 0, rest: 45, notes: "Abdômen contraído", done: false }
    ]
  },
  5: { // Sábado
    dayName: "Sábado",
    title: "Cardio & Funcional",
    exercises: [
      { id: "e25", name: "Corrida na Esteira ou Rua", sets: 1, reps: "30-40 min", weight: 0, rest: 0, notes: "Manter ritmo constante", done: false },
      { id: "e26", name: "Polichinelos & Pular Corda", sets: 3, reps: "2 min", weight: 0, rest: 60, notes: "Aquecimento aeróbico", done: false },
      { id: "e27", name: "Burpees", sets: 3, reps: "12", weight: 0, rest: 60, notes: "Explosão muscular", done: false }
    ]
  },
  6: { // Domingo
    dayName: "Domingo",
    title: "Descanso Ativo / Recuperação",
    exercises: [
      { id: "e28", name: "Caminhada Leve ao Ar Livre", sets: 1, reps: "30-45 min", weight: 0, rest: 0, notes: "Recuperação ativa", done: false },
      { id: "e29", name: "Alongamento e Mobilidade", sets: 1, reps: "15 min", weight: 0, rest: 0, notes: "Articulações e músculos", done: false }
    ]
  }
};

// --- BADGES DEFINITION ---
const BADGES = [
  { id: "first_workout", name: "Primeiro Treino", icon: "🌱", desc: "Completou seu 1º treino", unlocked: false },
  { id: "streak_3", name: "Fogo Aceso", icon: "🔥", desc: "Sequência de 3 dias de treino", unlocked: false },
  { id: "streak_7", name: "Semana Blindada", icon: "🛡️", desc: "7 dias consecutivos treinando", unlocked: false },
  { id: "first_run", name: "Passada Firme", icon: "👟", desc: "Primeira corrida registrada", unlocked: false },
  { id: "run_5k", name: "5K Club", icon: "🏃‍♂️", desc: "Correu 5 km em uma única sessão", unlocked: false },
  { id: "hours_10", name: "10 Horas de Aço", icon: "⏱️", desc: "Acumulou 10 horas de treino", unlocked: false },
  { id: "double_workout", name: "Treino Duplo", icon: "⚡", desc: "Fez 2 sessões no mesmo dia", unlocked: false },
  { id: "points_10", name: "Dezena de Ouro", icon: "⭐", desc: "Alcançou 10 pontos totais", unlocked: false }
];

// --- APP STATE ---
const STATE = {
  user: {
    name: "Guerreiro",
    goal: "Hipertrofia",
    avatar: "G",
    photo: null,
    theme: "green"
  },
  // All-time totals:
  totalMinutes: 0, // Minutes trained (2h = 120min = 1 point)
  totalPoints: 0.0,
  currentLevel: 1,
  streakDays: 1,
  lastTrainedDate: null, // 'YYYY-MM-DD'
  
  // Daily Tracking:
  todayDate: null,
  todaySessions: [], // [{ id, type, durationMin, timeStr, pointsEarned }]
  todayRuns: [],     // [{ id, km, minutes, pace, timeStr }]
  
  // Daily Challenge:
  dailyChallenge: {
    date: null,
    title: "Treine pelo menos 40 minutos hoje!",
    targetMinutes: 40,
    completed: false
  },
  
  // Workouts routines:
  routines: DEFAULT_WORKOUT_ROUTINES,
  activeDayIndex: 0, // 0: Seg ... 6: Dom
  
  // Running history (All runs):
  runningHistory: [],
  
  // Badges:
  badges: BADGES
};

// --- STORAGE SYSTEM ---
const STORAGE_KEY = "ironlevel_gym_data_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(STATE.user, parsed.user || {});
      STATE.totalMinutes = parsed.totalMinutes || 0;
      STATE.totalPoints = parsed.totalPoints || 0;
      STATE.currentLevel = parsed.currentLevel || 1;
      STATE.streakDays = parsed.streakDays || 1;
      STATE.lastTrainedDate = parsed.lastTrainedDate || null;
      STATE.todayDate = parsed.todayDate || null;
      STATE.todaySessions = parsed.todaySessions || [];
      STATE.todayRuns = parsed.todayRuns || [];
      STATE.dailyChallenge = parsed.dailyChallenge || STATE.dailyChallenge;
      STATE.routines = parsed.routines || DEFAULT_WORKOUT_ROUTINES;
      STATE.runningHistory = parsed.runningHistory || [];
      if (parsed.badges) {
        STATE.badges.forEach(b => {
          const found = parsed.badges.find(pb => pb.id === b.id);
          if (found) b.unlocked = found.unlocked;
        });
      }
    }
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  } catch (err) {
    console.error("Erro ao salvar dados:", err);
  }
}

// --- DATE HELPERS ---
function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFormattedDayMonth() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentDayOfWeekIndex() {
  // JavaScript getDay(): 0 is Sunday, 1 is Monday...
  // We want: 0 = Segunda, 1 = Terça ... 5 = Sábado, 6 = Domingo
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

// Check for date turnover (new day resets today's sessions and checks streak)
function checkDateTurnover() {
  const today = getTodayDateStr();
  if (STATE.todayDate !== today) {
    // Check streak
    if (STATE.lastTrainedDate) {
      const last = new Date(STATE.lastTrainedDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        // trained yesterday, streak keeps going
      } else if (diffDays > 1) {
        // missed day, reset streak to 0
        STATE.streakDays = 0;
      }
    } else {
      STATE.streakDays = 0;
    }
    
    STATE.todayDate = today;
    STATE.todaySessions = [];
    STATE.todayRuns = [];
    
    // Generate new daily challenge
    const challengesList = [
      { title: "Treine pelo menos 40 minutos hoje!", targetMinutes: 40 },
      { title: "Bata 45 min de treino pesado!", targetMinutes: 45 },
      { title: "Corra ou faça cardio de pelo menos 20 min!", targetMinutes: 20 },
      { title: "Desafio 1 Hora: Treine 60 minutos hoje!", targetMinutes: 60 },
      { title: "Faça pelo menos 30 min e complete seus exercícios!", targetMinutes: 30 }
    ];
    const picked = challengesList[new Date().getDay() % challengesList.length];
    STATE.dailyChallenge = {
      date: today,
      title: picked.title,
      targetMinutes: picked.targetMinutes,
      completed: false
    };

    // Reset exercise checkboxes for the new day
    Object.keys(STATE.routines).forEach(d => {
      STATE.routines[d].exercises.forEach(e => e.done = false);
    });

    saveState();
  }
}

// --- POINTS & LEVEL CALCULATIONS ---
// Rule: 2 hours (120 minutes) = 1 point!
function calculatePoints(minutes) {
  return parseFloat((minutes / 120).toFixed(2));
}

function getLevelForPoints(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

function updateLevelAndPoints() {
  const oldLevel = STATE.currentLevel;
  STATE.totalPoints = calculatePoints(STATE.totalMinutes);
  const currentLevelObj = getLevelForPoints(STATE.totalPoints);
  STATE.currentLevel = currentLevelObj.level;

  // Check if leveled up!
  if (STATE.currentLevel > oldLevel) {
    triggerLevelUpModal(currentLevelObj);
  }
  
  checkBadges();
  saveState();
  renderAll();
}

function addTrainingMinutes(mins, type = "Treino") {
  STATE.totalMinutes += mins;
  const today = getTodayDateStr();
  
  // Update streak if first workout of the day
  if (STATE.lastTrainedDate !== today) {
    STATE.streakDays = (STATE.streakDays || 0) + 1;
    STATE.lastTrainedDate = today;
  }
  
  // Record session
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const pointsEarned = parseFloat((mins / 120).toFixed(2));
  
  STATE.todaySessions.push({
    id: "s_" + Date.now(),
    type: type,
    durationMin: mins,
    timeStr: timeStr,
    pointsEarned: pointsEarned
  });

  // Check daily challenge
  const todayTotalMin = STATE.todaySessions.reduce((acc, s) => acc + s.durationMin, 0);
  if (!STATE.dailyChallenge.completed && todayTotalMin >= STATE.dailyChallenge.targetMinutes) {
    STATE.dailyChallenge.completed = true;
  }

  updateLevelAndPoints();
}

// --- BADGES CHECKER ---
function checkBadges() {
  // 1st workout
  if (STATE.todaySessions.length > 0 || STATE.totalMinutes > 0) {
    unlockBadge("first_workout");
  }
  // Streak 3
  if (STATE.streakDays >= 3) {
    unlockBadge("streak_3");
  }
  // Streak 7
  if (STATE.streakDays >= 7) {
    unlockBadge("streak_7");
  }
  // First run
  if (STATE.runningHistory.length > 0) {
    unlockBadge("first_run");
  }
  // 5K run
  if (STATE.runningHistory.some(r => r.km >= 5)) {
    unlockBadge("run_5k");
  }
  // 10 hours of training
  if (STATE.totalMinutes >= 600) {
    unlockBadge("hours_10");
  }
  // Double workout
  if (STATE.todaySessions.length >= 2) {
    unlockBadge("double_workout");
  }
  // 10 points
  if (STATE.totalPoints >= 10) {
    unlockBadge("points_10");
  }
}

function unlockBadge(id) {
  const badge = STATE.badges.find(b => b.id === id);
  if (badge && !badge.unlocked) {
    badge.unlocked = true;
    sfx.playCheck();
  }
}

// --- WORKOUT LIVE TIMER ---
// --- SCREEN WAKE LOCK (Keep mobile screen ON during workouts) ---
let screenWakeLock = null;
async function requestScreenWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      screenWakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {}
  }
}
function releaseScreenWakeLock() {
  if (screenWakeLock !== null) {
    screenWakeLock.release().then(() => { screenWakeLock = null; }).catch(() => {});
  }
}

let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function formatSeconds(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function toggleWorkoutTimer() {
  sfx.init();
  triggerHaptic("medium");
  if (!timerRunning) {
    timerRunning = true;
    requestScreenWakeLock();
    document.getElementById("btnTimerStart").style.display = "none";
    document.getElementById("btnTimerPause").style.display = "inline-flex";
    document.getElementById("btnTimerFinish").style.display = "inline-flex";
    document.getElementById("btnTimerReset").style.display = "inline-flex";
    
    timerInterval = setInterval(() => {
      timerSeconds++;
      document.getElementById("liveTimerDisplay").innerText = formatSeconds(timerSeconds);
      const estPoints = (timerSeconds / 7200).toFixed(2);
      document.getElementById("timerPointsEstimate").innerText = `+${estPoints} pt`;
    }, 1000);
  }
}

function pauseWorkoutTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    releaseScreenWakeLock();
    document.getElementById("btnTimerStart").style.display = "inline-flex";
    document.getElementById("btnTimerStart").innerText = "▶ Continuar";
    document.getElementById("btnTimerPause").style.display = "none";
  }
}

function finishWorkoutTimer() {
  pauseWorkoutTimer();
  releaseScreenWakeLock();
  const minutes = Math.max(1, Math.round(timerSeconds / 60));
  const dayRoutine = STATE.routines[STATE.activeDayIndex];
  const typeName = dayRoutine ? dayRoutine.title : "Musculação";
  
  if (confirm(`Parabéns pelo treino! Duração: ${minutes} minutos. Registrar e somar pontos?`)) {
    addTrainingMinutes(minutes, typeName);
    sfx.playLevelUp();
    resetWorkoutTimer();
    switchTab('home');
  }
}

function resetWorkoutTimer() {
  clearInterval(timerInterval);
  releaseScreenWakeLock();
  timerRunning = false;
  timerSeconds = 0;
  document.getElementById("liveTimerDisplay").innerText = "00:00:00";
  document.getElementById("timerPointsEstimate").innerText = "+0.0 pt";
  document.getElementById("btnTimerStart").style.display = "inline-flex";
  document.getElementById("btnTimerStart").innerText = "▶ Iniciar";
  document.getElementById("btnTimerPause").style.display = "none";
  document.getElementById("btnTimerFinish").style.display = "none";
  document.getElementById("btnTimerReset").style.display = "none";
}

// --- REST TIMER ---
let restInterval = null;
let restRemaining = 0;

function startRestTimer(seconds) {
  sfx.playBeep(520, 0.1);
  clearInterval(restInterval);
  restRemaining = seconds;
  const pill = document.getElementById("restTimerPill");
  pill.classList.add("active");
  document.getElementById("restTimerDisplay").innerText = `00:${String(restRemaining).padStart(2, '0')}`;
  
  restInterval = setInterval(() => {
    restRemaining--;
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      pill.classList.remove("active");
      // Triple beep alert!
      sfx.playBeep(880, 0.2);
      setTimeout(() => sfx.playBeep(880, 0.2), 250);
      setTimeout(() => sfx.playBeep(1100, 0.4), 500);
    } else {
      const m = Math.floor(restRemaining / 60);
      const s = restRemaining % 60;
      document.getElementById("restTimerDisplay").innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }, 1000);
}

function cancelRestTimer() {
  clearInterval(restInterval);
  document.getElementById("restTimerPill").classList.remove("active");
}

// --- RUNNING TRACKER & STRAVA-STYLE GPS ENGINE ---
let currentRunSubtab = 'gps';
let leafletMap = null;
let mapStreetLayer = null;
let mapSatLayer = null;
let isSatellite = true;
let routePolyline = null;
let currentPosMarker = null;
let startPosMarker = null;

// GPS Tracking State
let gpsTracking = false;
let gpsPaused = false;
let gpsWatchId = null;
let gpsTimerInterval = null;
let gpsElapsedSeconds = 0;
let gpsTotalKm = 0;
let gpsRoutePoints = [];
let lastGpsPoint = null;

// Route Viewer Modal State
let routeModalMap = null;
let routeModalPolyline = null;

function switchRunSubtab(subtab) {
  triggerHaptic('light');
  currentRunSubtab = subtab;

  const gpsBtn = document.getElementById("subtab-gps-btn");
  const manualBtn = document.getElementById("subtab-manual-btn");
  const gpsView = document.getElementById("runGpsView");
  const manualView = document.getElementById("runManualView");

  if (subtab === 'gps') {
    if (gpsBtn) gpsBtn.classList.add("active");
    if (manualBtn) manualBtn.classList.remove("active");
    if (gpsView) gpsView.style.display = "block";
    if (manualView) manualView.style.display = "none";
    initRunMapIfNeeded();
  } else {
    if (gpsBtn) gpsBtn.classList.remove("active");
    if (manualBtn) manualBtn.classList.add("active");
    if (gpsView) gpsView.style.display = "none";
    if (manualView) manualView.style.display = "block";
  }
}

function initRunMapIfNeeded() {
  if (typeof L === 'undefined') return;

  const mapContainer = document.getElementById("runMap");
  if (!mapContainer) return;

  if (!leafletMap) {
    // Default center (ex: Brasil central or fallback)
    leafletMap = L.map('runMap', { zoomControl: false }).setView([-23.5505, -46.6333], 15);
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    // Street layer (OpenStreetMap)
    mapStreetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    // Satellite layer (Esri World Imagery - identical to Strava)
    mapSatLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri Satellite'
    });

    // Default to Satellite view!
    mapSatLayer.addTo(leafletMap);
    isSatellite = true;

    // Orange Route Polyline (Strava orange #ff5722)
    routePolyline = L.polyline([], {
      color: '#ff5722',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(leafletMap);

    // Initial position fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (leafletMap) {
            leafletMap.setView([lat, lng], 16);
            updateCurrentPosMarker(lat, lng);
          }
        },
        (err) => {
          console.log("GPS inicial:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }

  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize();
  }, 200);
}

function toggleMapTiles() {
  triggerHaptic('light');
  if (!leafletMap) return;
  const btn = document.getElementById("btnToggleMapLayer");
  if (isSatellite) {
    leafletMap.removeLayer(mapSatLayer);
    mapStreetLayer.addTo(leafletMap);
    isSatellite = false;
    if (btn) btn.innerText = "🗺️ Ruas";
  } else {
    leafletMap.removeLayer(mapStreetLayer);
    mapSatLayer.addTo(leafletMap);
    isSatellite = true;
    if (btn) btn.innerText = "🛰️ Satélite";
  }
}

function centerMapOnCurrentPos() {
  triggerHaptic('light');
  if (lastGpsPoint && leafletMap) {
    leafletMap.setView([lastGpsPoint.lat, lastGpsPoint.lng], 17);
  } else if (navigator.geolocation && leafletMap) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      leafletMap.setView([lat, lng], 17);
      updateCurrentPosMarker(lat, lng);
    });
  }
}

function updateCurrentPosMarker(lat, lng) {
  if (!leafletMap || typeof L === 'undefined') return;

  const pulseIcon = L.divIcon({
    className: 'gps-pulse-icon',
    html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 3px solid #fff; box-shadow: 0 0 12px #3b82f6;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  if (!currentPosMarker) {
    currentPosMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(leafletMap);
  } else {
    currentPosMarker.setLatLng([lat, lng]);
  }
}

// Haversine Distance Formula (km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function startGpsRun() {
  if (!navigator.geolocation) {
    alert("Geolocalização GPS não é suportada pelo seu navegador.");
    return;
  }

  sfx.init();
  triggerHaptic('success');
  initRunMapIfNeeded();

  gpsTracking = true;
  gpsPaused = false;
  gpsElapsedSeconds = 0;
  gpsTotalKm = 0;
  gpsRoutePoints = [];
  lastGpsPoint = null;

  if (routePolyline) routePolyline.setLatLngs([]);
  if (startPosMarker && leafletMap) {
    leafletMap.removeLayer(startPosMarker);
    startPosMarker = null;
  }

  // Keep mobile screen on
  requestScreenWakeLock();

  // Update UI buttons
  document.getElementById("btnGpsStart").style.display = "none";
  document.getElementById("btnGpsPause").style.display = "inline-flex";
  document.getElementById("btnGpsFinish").style.display = "inline-flex";
  document.getElementById("btnGpsCancel").style.display = "inline-flex";
  document.getElementById("btnGpsResume").style.display = "none";

  const statusText = document.getElementById("gpsStatusText");
  if (statusText) statusText.innerText = "🔴 Gravando rota GPS ao vivo... Bora correr!";

  // Start Live Timer
  gpsTimerInterval = setInterval(() => {
    if (!gpsPaused) {
      gpsElapsedSeconds++;
      updateGpsHud();
    }
  }, 1000);

  // Start GPS Watch Position
  gpsWatchId = navigator.geolocation.watchPosition(
    handleGpsPosition,
    handleGpsError,
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  );
}

function handleGpsPosition(position) {
  if (!gpsTracking || gpsPaused) return;

  const { latitude, longitude, accuracy } = position.coords;

  // Filter out extreme GPS jitter
  if (accuracy > 40) return;

  const statusText = document.getElementById("gpsStatusText");
  if (statusText) {
    statusText.innerText = `🔴 Gravando • Precisão GPS: ±${Math.round(accuracy)}m`;
  }

  const currentLatLng = [latitude, longitude];

  if (lastGpsPoint) {
    const dKm = calculateDistanceKm(lastGpsPoint.lat, lastGpsPoint.lng, latitude, longitude);
    // Only accumulate if moved at least 2.5 meters
    if (dKm >= 0.0025) {
      gpsTotalKm += dKm;
      lastGpsPoint = { lat: latitude, lng: longitude };
      gpsRoutePoints.push(currentLatLng);
      if (routePolyline) routePolyline.addLatLng(currentLatLng);
    }
  } else {
    // First GPS point (Start)
    lastGpsPoint = { lat: latitude, lng: longitude };
    gpsRoutePoints.push(currentLatLng);
    if (routePolyline) routePolyline.addLatLng(currentLatLng);

    // Add Green Start Flag/Circle
    if (leafletMap && typeof L !== 'undefined') {
      const startIcon = L.divIcon({
        className: 'start-marker-icon',
        html: `<div style="background: #10b981; color: #000; font-weight: 800; font-size: 11px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 0 10px #10b981;">▶</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      startPosMarker = L.marker(currentLatLng, { icon: startIcon }).addTo(leafletMap);
    }
  }

  // Update current pos marker & pan map smoothly
  updateCurrentPosMarker(latitude, longitude);
  if (leafletMap) leafletMap.panTo(currentLatLng);

  updateGpsHud();
}

function handleGpsError(err) {
  console.warn("Erro GPS:", err.message);
  const statusText = document.getElementById("gpsStatusText");
  if (statusText) {
    statusText.innerText = "Aguardando sinal de satélite GPS...";
  }
}

function updateGpsHud() {
  // Time format
  const h = Math.floor(gpsElapsedSeconds / 3600);
  const m = Math.floor((gpsElapsedSeconds % 3600) / 60);
  const s = gpsElapsedSeconds % 60;
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  document.getElementById("gpsLiveTimer").innerText = timeStr;

  // Distance
  document.getElementById("gpsLiveDistance").innerText = gpsTotalKm.toFixed(2);

  // Pace (min/km)
  if (gpsTotalKm > 0.05) {
    const paceDecimal = (gpsElapsedSeconds / 60) / gpsTotalKm;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    if (paceMin < 60) {
      document.getElementById("gpsLivePace").innerText = `${paceMin}'${String(paceSec).padStart(2, '0')}"`;
    } else {
      document.getElementById("gpsLivePace").innerText = "-";
    }

    // Speed km/h
    const speed = (gpsTotalKm / (gpsElapsedSeconds / 3600)).toFixed(1);
    document.getElementById("gpsLiveSpeed").innerText = speed;
  } else {
    document.getElementById("gpsLivePace").innerText = "-";
    document.getElementById("gpsLiveSpeed").innerText = "0.0";
  }
}

function pauseGpsRun() {
  triggerHaptic('medium');
  gpsPaused = true;
  document.getElementById("btnGpsPause").style.display = "none";
  document.getElementById("btnGpsResume").style.display = "inline-flex";
  const statusText = document.getElementById("gpsStatusText");
  if (statusText) statusText.innerText = "⏸ Corrida pausada. Toque em Continuar para retomar.";
}

function resumeGpsRun() {
  triggerHaptic('medium');
  gpsPaused = false;
  document.getElementById("btnGpsResume").style.display = "none";
  document.getElementById("btnGpsPause").style.display = "inline-flex";
  const statusText = document.getElementById("gpsStatusText");
  if (statusText) statusText.innerText = "🔴 Gravando rota GPS ao vivo...";
}

function cancelGpsRun() {
  if (confirm("Deseja realmente cancelar esta corrida? Os dados dela não serão salvos.")) {
    stopGpsTracking();
    resetGpsHud();
  }
}

function stopGpsTracking() {
  gpsTracking = false;
  gpsPaused = false;
  if (gpsWatchId) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
  if (gpsTimerInterval) {
    clearInterval(gpsTimerInterval);
    gpsTimerInterval = null;
  }
  releaseScreenWakeLock();

  document.getElementById("btnGpsStart").style.display = "inline-flex";
  document.getElementById("btnGpsPause").style.display = "none";
  document.getElementById("btnGpsResume").style.display = "none";
  document.getElementById("btnGpsFinish").style.display = "none";
  document.getElementById("btnGpsCancel").style.display = "none";

  const statusText = document.getElementById("gpsStatusText");
  if (statusText) statusText.innerText = "GPS pronto. Toque em Iniciar e comece a correr!";
}

function resetGpsHud() {
  gpsElapsedSeconds = 0;
  gpsTotalKm = 0;
  gpsRoutePoints = [];
  lastGpsPoint = null;
  document.getElementById("gpsLiveTimer").innerText = "00:00:00";
  document.getElementById("gpsLiveDistance").innerText = "0.00";
  document.getElementById("gpsLivePace").innerText = "0'00\"";
  document.getElementById("gpsLiveSpeed").innerText = "0.0";
  if (routePolyline) routePolyline.setLatLngs([]);
}

function finishGpsRun() {
  triggerHaptic('success');
  sfx.playLevelUp();

  const minutes = Math.max(1, Math.round(gpsElapsedSeconds / 60));
  const finalKm = parseFloat(gpsTotalKm.toFixed(2));

  let paceStr = "-";
  if (finalKm > 0) {
    const paceDecimal = minutes / finalKm;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    paceStr = `${paceMin}'${String(paceSec).padStart(2, '0')}"/km`;
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const runItem = {
    id: "run_" + Date.now(),
    date: getTodayDateStr(),
    timeStr: timeStr,
    km: finalKm,
    minutes: minutes,
    pace: paceStr,
    isGps: true,
    earnedMinutes: minutes,
    route: [...gpsRoutePoints] // Save the route for map viewing!
  };

  STATE.todayRuns.push(runItem);
  STATE.runningHistory.unshift(runItem);

  // Add the running minutes to training hours (2h = 1pt rule!)
  addTrainingMinutes(minutes, `Corrida GPS (${finalKm} km)`);

  stopGpsTracking();
  resetGpsHud();
  renderRunningTab();

  alert(`🏁 Corrida finalizada com sucesso!\n\n📏 Distância: ${finalKm} km\n⏱️ Duração: ${minutes} min\n⚡ Ritmo: ${paceStr}\n\nSua rota foi salva no Histórico!`);
}

// --- ROUTE MODAL VIEWER (View saved GPS routes on satellite map) ---
function openRouteModal(runId) {
  triggerHaptic('light');
  const run = STATE.runningHistory.find(r => r.id === runId);
  if (!run || !run.route || run.route.length === 0) {
    alert("Esta corrida foi registrada manualmente e não possui rota de mapa.");
    return;
  }

  document.getElementById("routeModalTitle").innerText = `🗺️ Corrida de ${run.km} km`;
  document.getElementById("routeModalDetails").innerHTML = `
    <strong>Data:</strong> ${run.date} às ${run.timeStr} • <strong>Tempo:</strong> ${run.minutes} min • <strong>Ritmo:</strong> ${run.pace}
  `;

  document.getElementById("routeModal").classList.add("open");

  setTimeout(() => {
    initRouteModalMap(run.route);
  }, 250);
}

function closeRouteModal() {
  triggerHaptic('light');
  document.getElementById("routeModal").classList.remove("open");
}

function initRouteModalMap(routePoints) {
  if (typeof L === 'undefined') return;

  const container = document.getElementById("routeModalMap");
  if (!container) return;

  if (routeModalMap) {
    routeModalMap.remove();
    routeModalMap = null;
  }

  routeModalMap = L.map('routeModalMap', { zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(routeModalMap);

  // Satellite layer (Esri)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri Satellite'
  }).addTo(routeModalMap);

  // Orange route line (Strava style)
  routeModalPolyline = L.polyline(routePoints, {
    color: '#ff5722',
    weight: 6,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(routeModalMap);

  // Fit bounds to route
  if (routePoints.length > 0) {
    routeModalMap.fitBounds(routeModalPolyline.getBounds(), { padding: [30, 30] });

    // Start Pin (Green)
    L.circleMarker(routePoints[0], {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: '#10b981',
      fillOpacity: 1
    }).addTo(routeModalMap).bindPopup("Início da Corrida");

    // End Pin (Red)
    L.circleMarker(routePoints[routePoints.length - 1], {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: '#ef4444',
      fillOpacity: 1
    }).addTo(routeModalMap).bindPopup("Fim da Corrida");
  }
}

// --- MANUAL RUN FORM ---
function calcRunPace() {
  const km = parseFloat(document.getElementById("runInputKm").value) || 0;
  const mins = parseFloat(document.getElementById("runInputMinutes").value) || 0;
  
  const paceEl = document.getElementById("runCalcPace");
  const speedEl = document.getElementById("runCalcSpeed");
  const calEl = document.getElementById("runCalcCalories");
  
  if (km > 0 && mins > 0) {
    const paceDecimal = mins / km;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    paceEl.innerText = `${paceMin}'${String(paceSec).padStart(2, '0')}"/km`;
    
    const speed = (km / (mins / 60)).toFixed(1);
    speedEl.innerText = `${speed} km/h`;
    
    const cals = Math.round(km * 65);
    calEl.innerText = `~${cals} kcal`;
  } else {
    paceEl.innerText = "-";
    speedEl.innerText = "-";
    calEl.innerText = "-";
  }
}

function handleSaveRun(e) {
  e.preventDefault();
  sfx.init();
  const km = parseFloat(document.getElementById("runInputKm").value);
  const minutes = parseInt(document.getElementById("runInputMinutes").value, 10);
  
  if (!km || !minutes) return;

  const paceDecimal = minutes / km;
  const paceMin = Math.floor(paceDecimal);
  const paceSec = Math.round((paceDecimal - paceMin) * 60);
  const paceStr = `${paceMin}'${String(paceSec).padStart(2, '0')}"/km`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const runItem = {
    id: "run_" + Date.now(),
    date: getTodayDateStr(),
    timeStr: timeStr,
    km: km,
    minutes: minutes,
    pace: paceStr,
    isGps: false,
    earnedMinutes: 0, // Manual runs do NOT give level points (GPS anti-cheat rule)
    route: null
  };

  STATE.todayRuns.push(runItem);
  STATE.runningHistory.unshift(runItem);

  // Manual runs do NOT award level points - save state & update UI
  saveState();
  sfx.playCheck();

  document.getElementById("runForm").reset();
  calcRunPace();
  alert(`📝 Corrida manual de ${km} km salva no histórico!\n\n🛡️ Nota: Registros manuais de esteira não pontuam para o Nível/Ranking. Apenas corridas ao vivo rastreadas pelo GPS oficial somam pontos de evolução.`);
  renderRunningTab();
}

// --- EDIT & DELETE RUN FUNCTIONS ---
function openEditRunModal(runId) {
  triggerHaptic('light');
  const run = STATE.runningHistory.find(r => r.id === runId);
  if (!run) return;

  document.getElementById("editRunId").value = runId;
  document.getElementById("editRunNewMinutes").value = run.minutes;

  const isGps = !!(run.isGps || (run.route && run.route.length > 0));
  const infoEl = document.getElementById("editRunInfo");
  infoEl.innerHTML = `
    <div><strong>🏃 Distância:</strong> ${run.km} km</div>
    <div><strong>📅 Data:</strong> ${run.date} às ${run.timeStr}</div>
    <div><strong>⏱️ Tempo Atual:</strong> ${run.minutes} minutos</div>
    <div style="margin-top: 4px;"><strong>Modalidade:</strong> ${isGps ? '<span style="color: var(--accent-green); font-weight:700;">🛰️ GPS Oficial (Pontua)</span>' : '<span style="color: var(--accent-orange); font-weight:700;">📝 Manual / Esteira (Sem Pontos)</span>'}</div>
  `;

  const noteEl = document.getElementById("editRunPointsNote");
  if (isGps) {
    noteEl.innerHTML = `💡 Como esta corrida é <strong>GPS Oficial</strong>, ao alterar os minutos, sua pontuação de nível e horas totais de treino serão <strong>recalculadas automaticamente</strong> (2 horas = 1 ponto).`;
    noteEl.style.color = "var(--accent-green)";
  } else {
    noteEl.innerHTML = `ℹ️ Esta corrida foi registrada <strong>manualmente</strong>. O tempo e ritmo médio serão atualizados, mas não concedem pontos de nível (regra anti-fraude GPS).`;
    noteEl.style.color = "var(--text-muted)";
  }

  document.getElementById("editRunModal").classList.add("open");
}

function closeEditRunModal() {
  triggerHaptic('light');
  const modal = document.getElementById("editRunModal");
  if (modal) modal.classList.remove("open");
}

function handleSaveEditRun(e) {
  e.preventDefault();
  triggerHaptic('light');
  const runId = document.getElementById("editRunId").value;
  const newMinutes = parseInt(document.getElementById("editRunNewMinutes").value, 10);

  if (!newMinutes || newMinutes < 1) {
    alert("Por favor, digite um tempo válido em minutos (mínimo 1 min).");
    return;
  }

  const run = STATE.runningHistory.find(r => r.id === runId);
  if (!run) return;

  const oldMinutes = run.minutes || 0;
  const isGps = !!(run.isGps || (run.route && run.route.length > 0));

  run.minutes = newMinutes;

  // Recalculate pace
  if (run.km > 0) {
    const paceDecimal = newMinutes / run.km;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    run.pace = `${paceMin}'${String(paceSec).padStart(2, '0')}"/km`;
  }

  // Update in todayRuns if present
  const todayRun = (STATE.todayRuns || []).find(r => r.id === runId);
  if (todayRun) {
    todayRun.minutes = newMinutes;
    todayRun.pace = run.pace;
  }

  // Recalculate points if GPS
  if (isGps) {
    const diff = newMinutes - oldMinutes;
    run.isGps = true;
    run.earnedMinutes = (typeof run.earnedMinutes === 'number' ? run.earnedMinutes : oldMinutes) + diff;
    STATE.totalMinutes = Math.max(0, (STATE.totalMinutes || 0) + diff);
    updateLevelAndPoints();
  }

  saveState();
  closeEditRunModal();
  renderRunningTab();
  triggerHaptic('success');
  alert(`✓ Tempo da corrida atualizado para ${newMinutes} minutos com sucesso!`);
}

function deleteRun(runId) {
  triggerHaptic('light');
  const index = STATE.runningHistory.findIndex(r => r.id === runId);
  if (index === -1) return;

  const run = STATE.runningHistory[index];
  const isGps = !!(run.isGps || (run.route && run.route.length > 0));
  
  // Calculate if this run had contributed training minutes to level
  let earnedMinutes = 0;
  if (typeof run.earnedMinutes === 'number') {
    earnedMinutes = run.earnedMinutes;
  } else if (isGps) {
    earnedMinutes = run.minutes || 0;
  } else if (!('isGps' in run)) {
    // Legacy run prior to anti-cheat rule
    earnedMinutes = run.minutes || 0;
  }

  const confirmMsg = earnedMinutes > 0
    ? `Deseja realmente apagar esta corrida de ${run.km} km (${run.minutes} min)?\n\n⚠️ Esta corrida gerou ${earnedMinutes} minutos de treino. Seus pontos e nível serão recalculados automaticamente.`
    : `Deseja realmente apagar esta corrida de ${run.km} km (${run.minutes} min) do seu histórico?`;

  if (!confirm(confirmMsg)) return;

  // Deduct points/minutes if it had earned minutes
  if (earnedMinutes > 0) {
    STATE.totalMinutes = Math.max(0, (STATE.totalMinutes || 0) - earnedMinutes);
    // Also remove from todaySessions / workoutHistory if matched
    STATE.todaySessions = (STATE.todaySessions || []).filter(s => !(s.type && s.type.includes('Corrida') && s.minutes === run.minutes && s.date === run.date));
    STATE.workoutHistory = (STATE.workoutHistory || []).filter(s => !(s.type && s.type.includes('Corrida') && s.minutes === run.minutes && s.date === run.date));
    updateLevelAndPoints();
  }

  // Remove from arrays
  STATE.runningHistory.splice(index, 1);
  STATE.todayRuns = (STATE.todayRuns || []).filter(r => r.id !== runId);

  saveState();
  renderRunningTab();
  triggerHaptic('success');
}

function clearAllRunsHistory() {
  triggerHaptic('light');
  if (!STATE.runningHistory || STATE.runningHistory.length === 0) {
    alert("Seu histórico de corridas já está vazio.");
    return;
  }

  if (!confirm("⚠️ Atenção: Deseja apagar TODO o seu histórico de corridas?\n\nTodas as corridas serão excluídas e os minutos que pontuaram serão descontados do seu nível.")) {
    return;
  }

  // Calculate total minutes to deduct
  let totalDeduction = 0;
  STATE.runningHistory.forEach(run => {
    const isGps = !!(run.isGps || (run.route && run.route.length > 0));
    if (typeof run.earnedMinutes === 'number') {
      totalDeduction += run.earnedMinutes;
    } else if (isGps) {
      totalDeduction += (run.minutes || 0);
    } else if (!('isGps' in run)) {
      totalDeduction += (run.minutes || 0);
    }
  });

  if (totalDeduction > 0) {
    STATE.totalMinutes = Math.max(0, (STATE.totalMinutes || 0) - totalDeduction);
    STATE.todaySessions = (STATE.todaySessions || []).filter(s => !(s.type && s.type.includes('Corrida')));
    STATE.workoutHistory = (STATE.workoutHistory || []).filter(s => !(s.type && s.type.includes('Corrida')));
    updateLevelAndPoints();
  }

  STATE.runningHistory = [];
  STATE.todayRuns = [];

  saveState();
  renderRunningTab();
  triggerHaptic('success');
  alert(`✓ Histórico de corridas apagado com sucesso!${totalDeduction > 0 ? ` (-${totalDeduction} min ajustados)` : ''}`);
}

// --- DAILY CHALLENGE CLAIM ---
function claimDailyChallenge() {
  if (STATE.dailyChallenge.completed) {
    alert("Você já completou o desafio de hoje! Parabéns pela disciplina! 🔥");
    return;
  }
  const todayTotalMin = STATE.todaySessions.reduce((acc, s) => acc + s.durationMin, 0);
  if (todayTotalMin >= STATE.dailyChallenge.targetMinutes) {
    STATE.dailyChallenge.completed = true;
    sfx.playLevelUp();
    saveState();
    renderHomeTab();
    alert("Desafio Diário Concluído com Sucesso! 🏆");
  } else {
    const diff = STATE.dailyChallenge.targetMinutes - todayTotalMin;
    alert(`Faltam ${diff} minutos de treino para bater a meta de hoje! Continue firme!`);
  }
}

// --- WORKOUT BUILDER & EXERCISE MANAGEMENT ---
function setWorkoutDay(dayIndex) {
  STATE.activeDayIndex = dayIndex;
  renderWorkoutTab();
}

function editWorkoutTitle() {
  const current = STATE.routines[STATE.activeDayIndex].title;
  const newTitle = prompt("Novo título para o treino deste dia:", current);
  if (newTitle && newTitle.trim()) {
    STATE.routines[STATE.activeDayIndex].title = newTitle.trim();
    saveState();
    renderWorkoutTab();
  }
}

// --- EXERCISE CATALOG FOR BEGINNERS & QUICK SELECTOR ---
const EXERCISE_CATALOG = [
  // PEITO
  { muscle: "peito", name: "Supino Reto com Barra", sets: 4, reps: "8-10", rest: 60, notes: "Desça a barra no meio do peito com controle, sem bater." },
  { muscle: "peito", name: "Supino Inclinado com Halteres", sets: 4, reps: "10-12", rest: 60, notes: "Banco em 30-45 graus. Foco na porção superior do peitoral." },
  { muscle: "peito", name: "Supino Reto com Halteres", sets: 4, reps: "10-12", rest: 60, notes: "Maior amplitude de movimento e estabilidade para os ombros." },
  { muscle: "peito", name: "Crucifixo na Polia (Crossover)", sets: 3, reps: "12-15", rest: 45, notes: "Aperte 1 segundo no pico de contração no centro." },
  { muscle: "peito", name: "Voador / Peck Deck Máquina", sets: 3, reps: "12-15", rest: 45, notes: "Excelente para novatos aprenderem o isolamento do peitoral." },
  { muscle: "peito", name: "Supino Máquina Articulada", sets: 4, reps: "10-12", rest: 60, notes: "Muito seguro para iniciantes aumentarem a carga com firmeza." },
  { muscle: "peito", name: "Flexão de Braço (Solo)", sets: 3, reps: "10-15", rest: 60, notes: "Corpo em linha reta e abdômen contraído o tempo todo." },

  // COSTAS
  { muscle: "costas", name: "Puxada Frontal Alta na Polia", sets: 4, reps: "8-10", rest: 60, notes: "Puxe a barra até a altura do queixo, estufando o peito." },
  { muscle: "costas", name: "Remada Baixa no Triângulo", sets: 4, reps: "10-12", rest: 60, notes: "Coluna ereta, puxe o triângulo no abdômen sem curvar as costas." },
  { muscle: "costas", name: "Remada Curvada com Barra", sets: 3, reps: "8-10", rest: 90, notes: "Tronco inclinado a 45 graus, puxe a barra rente às pernas." },
  { muscle: "costas", name: "Pulldown na Polia (Corda/Barra)", sets: 3, reps: "12-15", rest: 45, notes: "Braços estendidos, ative as costas (dorsais) sem dobrar cotovelos." },
  { muscle: "costas", name: "Remada Unilateral com Halter (Serrote)", sets: 3, reps: "10-12", rest: 45, notes: "Apoie o joelho no banco e puxe o halter rente ao quadril." },
  { muscle: "costas", name: "Remada Máquina Articulada", sets: 4, reps: "10-12", rest: 60, notes: "Apoio no peito para proteger a lombar do iniciante." },
  { muscle: "costas", name: "Barra Fixa (Graviton ou Livre)", sets: 3, reps: "6-10", rest: 90, notes: "Exercício rei para abrir as costas e ganhar força." },

  // PERNAS (QUADRÍCEPS)
  { muscle: "pernas", name: "Agachamento Livre com Barra", sets: 4, reps: "8-10", rest: 90, notes: "Pés na largura dos ombros, desça até 90 graus ou mais." },
  { muscle: "pernas", name: "Leg Press 45°", sets: 4, reps: "10-12", rest: 90, notes: "Não trave os joelhos no topo, desça bem controlando o peso." },
  { muscle: "pernas", name: "Cadeira Extensora", sets: 4, reps: "12-15", rest: 45, notes: "Segure 1 segundo no topo contraindo a coxa fortemente." },
  { muscle: "pernas", name: "Agachamento no Hack Machine", sets: 4, reps: "10-12", rest: 90, notes: "Encosto apoiado, excelente e seguro para as pernas do novato." },
  { muscle: "pernas", name: "Agachamento Búlgaro com Halteres", sets: 3, reps: "10-12", rest: 60, notes: "Pé de trás apoiado no banco, foco total na perna da frente." },
  { muscle: "pernas", name: "Afundo / Passada com Halteres", sets: 3, reps: "12 passos", rest: 60, notes: "Passo firme mantendo o tronco ereto e equilibrado." },
  { muscle: "pernas", name: "Agachamento Goblet com Halter", sets: 3, reps: "12-15", rest: 60, notes: "Segure o halter junto ao peito, perfeito para aprender a agachar." },

  // POSTERIOR & GLÚTEOS
  { muscle: "posterior", name: "Mesa Flexora", sets: 4, reps: "10-12", rest: 60, notes: "Puxe os calcanhares no glúteo sem tirar o quadril do banco." },
  { muscle: "posterior", name: "Cadeira Flexora", sets: 4, reps: "12-15", rest: 45, notes: "Ajuste o rolo nos tornozelos e flexione as pernas para baixo." },
  { muscle: "posterior", name: "Stiff com Barra ou Halteres", sets: 4, reps: "10-12", rest: 60, notes: "Coluna reta e joelhos semi-flexionados, sinta o posterior alongar." },
  { muscle: "posterior", name: "Elevação Pélvica com Barra/Halter", sets: 4, reps: "10-12", rest: 60, notes: "Apoie as costas no banco e aperte o glúteo 2s no topo." },
  { muscle: "posterior", name: "Cadeira Abdutora", sets: 3, reps: "15-20", rest: 45, notes: "Abra as pernas controlando o movimento, foco no glúteo médio." },
  { muscle: "posterior", name: "Cadeira Adutora", sets: 3, reps: "15-20", rest: 45, notes: "Feche as pernas com força, foco na parte interna da coxa." },

  // OMBROS
  { muscle: "ombros", name: "Desenvolvimento com Halteres", sets: 4, reps: "8-10", rest: 60, notes: "Suba os halteres em arco sem bater em cima, desça a 90 graus." },
  { muscle: "ombros", name: "Elevação Lateral com Halteres", sets: 4, reps: "12-15", rest: 45, notes: "Cotovelos levemente dobrados, erga até a linha do ombro." },
  { muscle: "ombros", name: "Elevação Lateral na Polia", sets: 3, reps: "12-15", rest: 45, notes: "Tensão constante desde o início do movimento." },
  { muscle: "ombros", name: "Crucifixo Invertido na Máquina", sets: 3, reps: "12-15", rest: 45, notes: "Foco no deltoide posterior para desenhar a parte de trás do ombro." },
  { muscle: "ombros", name: "Elevação Frontal com Halteres", sets: 3, reps: "12", rest: 45, notes: "Erga os braços alternados até a altura dos olhos." },
  { muscle: "ombros", name: "Face Pull na Polia com Corda", sets: 3, reps: "15", rest: 45, notes: "Puxe a corda em direção ao rosto com cotovelos bem altos." },

  // BÍCEPS & ANTEBRAÇO
  { muscle: "biceps", name: "Rosca Direta com Barra W", sets: 4, reps: "10-12", rest: 60, notes: "Cotovelos colados ao tronco, suba sem balançar a lombar." },
  { muscle: "biceps", name: "Rosca Martelo com Halteres", sets: 3, reps: "10-12", rest: 45, notes: "Pegada neutra (palmas voltadas para dentro), engrossa o braço." },
  { muscle: "biceps", name: "Rosca Scott na Máquina", sets: 3, reps: "10-12", rest: 60, notes: "Isolamento total do bíceps com apoio seguro nos braços." },
  { muscle: "biceps", name: "Rosca no Banco Inclinado 45°", sets: 3, reps: "10-12", rest: 60, notes: "Alongamento máximo do bíceps, excelente para o pico muscular." },
  { muscle: "biceps", name: "Rosca Concentrada com Halter", sets: 3, reps: "12", rest: 45, notes: "Cotovelo apoiado na parte interna da coxa, foco e contração." },
  { muscle: "biceps", name: "Rosca na Polia Baixa", sets: 3, reps: "12-15", rest: 45, notes: "Cabo puxando constantemente, sem ponto de descanso." },
  { muscle: "biceps", name: "Flexão de Punho para Antebraço", sets: 3, reps: "15-20", rest: 40, notes: "Apoie os antebraços no banco e flexione os punhos para cima." },

  // TRÍCEPS
  { muscle: "triceps", name: "Tríceps Corda na Polia", sets: 4, reps: "12-15", rest: 45, notes: "Abra a corda para fora no final do movimento para contrair tudo." },
  { muscle: "triceps", name: "Tríceps Pulley Barra Reta / V", sets: 4, reps: "10-12", rest: 45, notes: "Cotovelos travados ao lado do corpo, empurre até estender." },
  { muscle: "triceps", name: "Tríceps Francês com Halter", sets: 3, reps: "10-12", rest: 60, notes: "Segure o halter atrás da cabeça mantendo cotovelos fechados." },
  { muscle: "triceps", name: "Tríceps Testa com Barra W", sets: 3, reps: "10-12", rest: 60, notes: "Deitado no banco, desça a barra controlando até a testa." },
  { muscle: "triceps", name: "Mergulho no Banco (Paralelas)", sets: 3, reps: "12-15", rest: 60, notes: "Mãos apoiadas no banco, desça o corpo rente e empurre com os braços." },

  // PANTURRILHA
  { muscle: "panturrilha", name: "Panturrilha em Pé na Máquina / Smith", sets: 4, reps: "15-20", rest: 45, notes: "Alongue bem o calcanhar na descida e suba na ponta máxima dos pés." },
  { muscle: "panturrilha", name: "Panturrilha Sentado (Gêmeos)", sets: 4, reps: "15-20", rest: 45, notes: "Foco no músculo sóleo, faça o movimento completo e cadenciado." },
  { muscle: "panturrilha", name: "Panturrilha no Leg Press", sets: 4, reps: "15-20", rest: 45, notes: "Apoie só as pontas dos pés na base inferior e empurre com os tornozelos." },

  // TRAPÉZIO
  { muscle: "trapezio", name: "Encolhimento com Halteres", sets: 4, reps: "12-15", rest: 45, notes: "Erga os ombros em direção às orelhas, segure 1 segundo no topo." },
  { muscle: "trapezio", name: "Encolhimento com Barra", sets: 4, reps: "12-15", rest: 45, notes: "Movimento puramente vertical para cima, sem girar os ombros." },

  // ABDÔMEN & CORE
  { muscle: "abdomen", name: "Abdominal Supra no Solo", sets: 4, reps: "15-20", rest: 45, notes: "Solte todo o ar ao subir e aperte a musculatura abdominal." },
  { muscle: "abdomen", name: "Prancha Abdominal", sets: 3, reps: "45-60 seg", rest: 45, notes: "Corpo reto como uma tábua, sem deixar o quadril cair." },
  { muscle: "abdomen", name: "Elevação de Pernas na Barra Fixa", sets: 3, reps: "12-15", rest: 45, notes: "Suba os joelhos ou pernas até 90 graus sem balanço." },
  { muscle: "abdomen", name: "Abdominal Infra no Banco", sets: 3, reps: "15-20", rest: 45, notes: "Tire o quadril levemente do banco no final da subida." },
  { muscle: "abdomen", name: "Abdominal na Roda (Ab Wheel)", sets: 3, reps: "8-12", rest: 60, notes: "Role para frente com abdômen travado e retorne com força." }
];

// --- MODELOS DE PLANILHAS PRONTAS DE TREINO ---
const WORKOUT_TEMPLATES = {
  daily_recommended: () => {
    const currentDay = STATE.activeDayIndex;
    const def = DEFAULT_WORKOUT_ROUTINES[currentDay];
    return {
      title: def.title,
      exercises: def.exercises.map(e => ({ ...e, id: "ex_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4), done: false }))
    };
  },
  beginner_adaptation: () => ({
    title: "Adaptação Iniciante / Novato Total",
    exercises: [
      { id: "b1", name: "Leg Press 45°", sets: 3, reps: "12-15", weight: 40, rest: 60, notes: "Movimento controlado, pés firmes", done: false },
      { id: "b2", name: "Puxada Frontal Alta na Polia", sets: 3, reps: "10-12", weight: 25, rest: 60, notes: "Puxe até o peito, costas retas", done: false },
      { id: "b3", name: "Supino Máquina Articulada", sets: 3, reps: "10-12", weight: 20, rest: 60, notes: "Máquina guiada segura para novato", done: false },
      { id: "b4", name: "Cadeira Extensora", sets: 3, reps: "12-15", weight: 20, rest: 45, notes: "Segure 1s em cima", done: false },
      { id: "b5", name: "Abdominal Supra no Solo", sets: 3, reps: "15-20", weight: 0, rest: 45, notes: "Solte o ar na subida", done: false }
    ]
  }),
  push_day: () => ({
    title: "Ficha A: Peito, Tríceps & Ombros (Push)",
    exercises: [
      { id: "p1", name: "Supino Reto com Barra", sets: 4, reps: "8-10", weight: 30, rest: 60, notes: "Desça no meio do peitoral", done: false },
      { id: "p2", name: "Supino Inclinado com Halteres", sets: 4, reps: "10-12", weight: 14, rest: 60, notes: "Foco no peitoral superior", done: false },
      { id: "p3", name: "Crucifixo na Polia (Crossover)", sets: 3, reps: "12-15", weight: 15, rest: 45, notes: "Aperte 1s no meio", done: false },
      { id: "p4", name: "Desenvolvimento com Halteres", sets: 4, reps: "10-12", weight: 12, rest: 60, notes: "Ombros a 90 graus", done: false },
      { id: "p5", name: "Elevação Lateral com Halteres", sets: 4, reps: "12-15", weight: 6, rest: 45, notes: "Sem usar impulso", done: false },
      { id: "p6", name: "Tríceps Corda na Polia", sets: 4, reps: "12-15", weight: 20, rest: 45, notes: "Abra a corda no final", done: false }
    ]
  }),
  pull_day: () => ({
    title: "Ficha B: Costas, Bíceps & Abdômen (Pull)",
    exercises: [
      { id: "pl1", name: "Puxada Frontal Alta na Polia", sets: 4, reps: "8-10", weight: 35, rest: 60, notes: "Puxe até o queixo/peito", done: false },
      { id: "pl2", name: "Remada Baixa no Triângulo", sets: 4, reps: "10-12", weight: 30, rest: 60, notes: "Coluna ereta e peito aberto", done: false },
      { id: "pl3", name: "Remada Curvada com Barra", sets: 3, reps: "8-10", weight: 25, rest: 90, notes: "Tronco inclinado a 45°", done: false },
      { id: "pl4", name: "Rosca Direta com Barra W", sets: 4, reps: "10-12", weight: 16, rest: 60, notes: "Cotovelos colados ao corpo", done: false },
      { id: "pl5", name: "Rosca Martelo com Halteres", sets: 3, reps: "10-12", weight: 10, rest: 45, notes: "Foco no braquial e antebraço", done: false },
      { id: "pl6", name: "Prancha Abdominal", sets: 3, reps: "45 seg", weight: 0, rest: 45, notes: "Corpo reto e travado", done: false }
    ]
  }),
  legs_day: () => ({
    title: "Ficha C: Pernas Completo & Panturrilhas (Legs)",
    exercises: [
      { id: "l1", name: "Agachamento Livre com Barra", sets: 4, reps: "8-10", weight: 40, rest: 90, notes: "Desça até 90 graus", done: false },
      { id: "l2", name: "Leg Press 45°", sets: 4, reps: "10-12", weight: 100, rest: 90, notes: "Amplitude completa sem travar joelho", done: false },
      { id: "l3", name: "Cadeira Extensora", sets: 4, reps: "12-15", weight: 30, rest: 45, notes: "Segura 1s em cima", done: false },
      { id: "l4", name: "Mesa Flexora", sets: 4, reps: "10-12", weight: 25, rest: 60, notes: "Posterior de coxa", done: false },
      { id: "l5", name: "Panturrilha em Pé na Máquina", sets: 4, reps: "15-20", weight: 35, rest: 45, notes: "Alongue e suba no máximo", done: false }
    ]
  }),
  glutes_focus: () => ({
    title: "Ficha D: Glúteos & Posterior (Foco Inferiores)",
    exercises: [
      { id: "g1", name: "Elevação Pélvica com Barra/Halter", sets: 4, reps: "10-12", weight: 30, rest: 60, notes: "Contraia o glúteo 2s no topo", done: false },
      { id: "g2", name: "Agachamento Búlgaro", sets: 3, reps: "10-12", weight: 10, rest: 60, notes: "Foco na perna da frente", done: false },
      { id: "g3", name: "Stiff com Barra ou Halteres", sets: 4, reps: "10-12", weight: 20, rest: 60, notes: "Coluna reta, sinta posterior", done: false },
      { id: "g4", name: "Cadeira Flexora", sets: 4, reps: "12-15", weight: 25, rest: 45, notes: "Descida controlada", done: false },
      { id: "g5", name: "Cadeira Abdutora", sets: 3, reps: "15-20", weight: 30, rest: 45, notes: "Glúteo médio, segure 1s aberta", done: false }
    ]
  })
};

function populateExerciseCatalogSelect(muscleFilter = "all") {
  const select = document.getElementById("exerciseCatalogSelect");
  const datalist = document.getElementById("exerciseDatalist");
  const chipsContainer = document.getElementById("exerciseQuickChips");
  if (!select) return;

  const filtered = (muscleFilter === "all")
    ? EXERCISE_CATALOG
    : EXERCISE_CATALOG.filter(ex => ex.muscle === muscleFilter);

  // 1. Preenche dropdown
  select.innerHTML = '<option value="">👇 Toque para escolher da lista...</option>' + 
    filtered.map(ex => `<option value="${ex.name}">${ex.name} (${ex.sets}x ${ex.reps})</option>`).join('');

  // 2. Preenche Datalist de sugestões
  if (datalist) {
    datalist.innerHTML = EXERCISE_CATALOG.map(ex => `<option value="${ex.name}">`).join('');
  }

  // 3. Preenche Chips rápidos de clique direto
  if (chipsContainer) {
    const chipsToShow = filtered.slice(0, 6);
    chipsContainer.innerHTML = chipsToShow.map(ex => `
      <button type="button" class="quick-chip-btn" onclick="selectCatalogExercise('${ex.name.replace(/'/g, "\\'")}')">
        + ${ex.name.split(' ')[0]} ${ex.name.split(' ')[1] || ''}
      </button>
    `).join('');
  }
}

function filterExercisesByMuscle(muscleGroup) {
  triggerHaptic('light');
  populateExerciseCatalogSelect(muscleGroup);
}

function selectCatalogExercise(exName) {
  if (!exName) return;
  triggerHaptic('light');
  const ex = EXERCISE_CATALOG.find(item => item.name === exName);
  if (!ex) return;

  document.getElementById("exerciseNameInput").value = ex.name;
  document.getElementById("exerciseSetsInput").value = ex.sets;
  document.getElementById("exerciseRepsInput").value = ex.reps;
  document.getElementById("exerciseRestInput").value = ex.rest;
  document.getElementById("exerciseNotesInput").value = ex.notes;

  const tipBox = document.getElementById("exerciseExecutionTipBox");
  if (tipBox) {
    tipBox.style.display = "block";
    tipBox.innerHTML = `💡 <strong>Dica de Execução para Novatos:</strong> ${ex.notes}`;
  }
}

function openAddExerciseModal() {
  triggerHaptic('light');
  document.getElementById("exerciseModalTitle").innerText = "Adicionar Exercício";
  document.getElementById("exerciseId").value = "";
  document.getElementById("exerciseForm").reset();

  const muscleFilter = document.getElementById("exerciseMuscleFilter");
  if (muscleFilter) muscleFilter.value = "all";
  populateExerciseCatalogSelect("all");

  const tipBox = document.getElementById("exerciseExecutionTipBox");
  if (tipBox) {
    tipBox.style.display = "none";
    tipBox.innerText = "";
  }

  document.getElementById("exerciseModal").classList.add("open");
}

function openEditExerciseModal(exId) {
  triggerHaptic('light');
  const dayRoutine = STATE.routines[STATE.activeDayIndex];
  const ex = dayRoutine.exercises.find(e => e.id === exId);
  if (!ex) return;

  document.getElementById("exerciseModalTitle").innerText = "Editar Exercício";
  document.getElementById("exerciseId").value = ex.id;
  document.getElementById("exerciseNameInput").value = ex.name;
  document.getElementById("exerciseSetsInput").value = ex.sets;
  document.getElementById("exerciseRepsInput").value = ex.reps;
  document.getElementById("exerciseWeightInput").value = ex.weight || 0;
  document.getElementById("exerciseRestInput").value = ex.rest || 60;
  document.getElementById("exerciseNotesInput").value = ex.notes || "";

  populateExerciseCatalogSelect("all");

  const tipBox = document.getElementById("exerciseExecutionTipBox");
  if (tipBox) {
    if (ex.notes) {
      tipBox.style.display = "block";
      tipBox.innerHTML = `💡 <strong>Dica / Observação:</strong> ${ex.notes}`;
    } else {
      tipBox.style.display = "none";
    }
  }

  document.getElementById("exerciseModal").classList.add("open");
}

function closeExerciseModal() {
  triggerHaptic('light');
  document.getElementById("exerciseModal").classList.remove("open");
}

function openWorkoutTemplatesModal() {
  triggerHaptic('light');
  const currentDay = STATE.activeDayIndex;
  const routine = STATE.routines[currentDay];
  
  const dailyTitleEl = document.getElementById("templateDailyTitle");
  const dailyDescEl = document.getElementById("templateDailyDesc");
  if (dailyTitleEl) {
    dailyTitleEl.innerText = `⚡ Treino Oficial de Hoje (${routine.dayName}: ${routine.title})`;
  }
  if (dailyDescEl) {
    dailyDescEl.innerText = `Carrega a ficha oficial balanceada de ${routine.title} com 5 a 6 exercícios e cargas sugeridas.`;
  }

  document.getElementById("workoutTemplatesModal").classList.add("open");
}

function closeWorkoutTemplatesModal() {
  triggerHaptic('light');
  document.getElementById("workoutTemplatesModal").classList.remove("open");
}

function loadWorkoutTemplate(templateType) {
  triggerHaptic('success');
  const currentDay = STATE.activeDayIndex;
  const routine = STATE.routines[currentDay];

  if (templateType === 'clear') {
    if (!confirm(`Deseja realmente limpar todos os exercícios de ${routine.dayName}?`)) return;
    routine.exercises = [];
    saveState();
    closeWorkoutTemplatesModal();
    renderWorkoutTab();
    return;
  }

  const templateFn = WORKOUT_TEMPLATES[templateType];
  if (!templateFn) return;

  const result = templateFn();
  if (!confirm(`Deseja carregar a planilha "${result.title}" para ${routine.dayName}?\n\n(A ficha deste dia será preenchida com os exercícios recomendados).`)) {
    return;
  }

  routine.title = result.title;
  routine.exercises = result.exercises;

  saveState();
  closeWorkoutTemplatesModal();
  renderWorkoutTab();
  sfx.playLevelUp();
  alert(`✓ Planilha "${result.title}" montada com sucesso para ${routine.dayName}! Bora treinar! 💪`);
}

function handleSaveExercise(e) {
  e.preventDefault();
  const exId = document.getElementById("exerciseId").value;
  const name = document.getElementById("exerciseNameInput").value.trim();
  const sets = parseInt(document.getElementById("exerciseSetsInput").value, 10);
  const reps = document.getElementById("exerciseRepsInput").value.trim();
  const weight = parseFloat(document.getElementById("exerciseWeightInput").value) || 0;
  const rest = parseInt(document.getElementById("exerciseRestInput").value, 10) || 60;
  const notes = document.getElementById("exerciseNotesInput").value.trim();

  const routine = STATE.routines[STATE.activeDayIndex];

  if (exId) {
    // Edit
    const item = routine.exercises.find(e => e.id === exId);
    if (item) {
      item.name = name;
      item.sets = sets;
      item.reps = reps;
      item.weight = weight;
      item.rest = rest;
      item.notes = notes;
    }
  } else {
    // Add new
    routine.exercises.push({
      id: "ex_" + Date.now(),
      name,
      sets,
      reps,
      weight,
      rest,
      notes,
      done: false
    });
  }

  saveState();
  closeExerciseModal();
  renderWorkoutTab();
  sfx.playCheck();
}

function toggleExerciseDone(exId) {
  const routine = STATE.routines[STATE.activeDayIndex];
  const ex = routine.exercises.find(e => e.id === exId);
  if (ex) {
    ex.done = !ex.done;
    if (ex.done) {
      sfx.playCheck();
      // Auto-trigger rest timer if requested
      if (ex.rest && confirm(`Exercício concluído! Iniciar descanso de ${ex.rest}s?`)) {
        startRestTimer(ex.rest);
      }
    }
    saveState();
    renderWorkoutTab();
  }
}

function deleteExercise(exId) {
  if (confirm("Deseja realmente remover este exercício?")) {
    const routine = STATE.routines[STATE.activeDayIndex];
    routine.exercises = routine.exercises.filter(e => e.id !== exId);
    saveState();
    renderWorkoutTab();
  }
}

// --- QUICK SESSION MODAL ---
function openQuickSessionModal() {
  document.getElementById("quickSessionModal").classList.add("open");
}

function closeQuickSessionModal() {
  document.getElementById("quickSessionModal").classList.remove("open");
}

function handleSaveQuickSession(e) {
  e.preventDefault();
  const type = document.getElementById("quickSessionType").value.trim() || "Treino Rápido";
  const mins = parseInt(document.getElementById("quickSessionDuration").value, 10) || 45;

  addTrainingMinutes(mins, type);
  closeQuickSessionModal();
  sfx.playCheck();
  alert(`Treino de ${mins} min registrado! Pontos atualizados.`);
}

// --- PWA INSTALL ENGINE FOR MOBILE ---
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  const nativeBox = document.getElementById('nativeInstallBox');
  if (nativeBox) nativeBox.style.display = 'block';

  const banner = document.getElementById('installAppBanner');
  if (banner) banner.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const banner = document.getElementById('installAppBanner');
  if (banner) banner.style.display = 'none';
  const headerBtn = document.getElementById('headerInstallBtn');
  if (headerBtn) headerBtn.style.display = 'none';
  triggerHaptic('levelup');
  sfx.playLevelUp();
  alert('🎉 IronLevel instalado com sucesso no seu celular!');
});

function openInstallModal() {
  triggerHaptic('light');
  document.getElementById('installModal').classList.add('open');
}

function closeInstallModal() {
  triggerHaptic('light');
  document.getElementById('installModal').classList.remove('open');
}

async function triggerPwaInstall() {
  triggerHaptic('medium');
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredInstallPrompt = null;
      closeInstallModal();
    }
  } else {
    openInstallModal();
  }
}

function checkStandaloneMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    const banner = document.getElementById('installAppBanner');
    if (banner) banner.style.display = 'none';
    const headerBtn = document.getElementById('headerInstallBtn');
    if (headerBtn) headerBtn.style.display = 'none';
  }
}

// --- AUTO-UPDATE & OPTIMIZATION ENGINE (Executa automaticamente a cada 2 minutos) ---
const AUTO_UPDATE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos (120 segundos)
let lastAutoOptimizedAt = Date.now();

async function runAutoOptimizationAndCheck() {
  try {
    // 1. Aciona checagem de nova versão no Service Worker
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
      }
    }

    // 2. Verifica se uma versão mais recente foi enviada para o GitHub
    const checkRes = await fetch('./sw.js?check=' + Date.now(), { cache: 'no-store' });
    if (checkRes.ok) {
      const swCode = await checkRes.text();
      const match = swCode.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
      if (match && match[1]) {
        const remoteVersion = match[1];
        const localVersion = localStorage.getItem('ironlevel_cache_ver') || 'ironlevel-v6';

        if (remoteVersion !== localVersion) {
          console.log(`[Auto-Update] Nova versão detectada (${remoteVersion}). Atualizando em segundo plano...`);
          localStorage.setItem('ironlevel_cache_ver', remoteVersion);

          // Limpa caches obsoletos para liberar memória e manter o celular otimizado
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter(k => k !== remoteVersion).map(k => caches.delete(k)));
          }

          // Só recarrega se o usuário NÃO estiver cronometrando treino ou gravando GPS
          const isGpsActive = (typeof isGpsTracking !== 'undefined') && isGpsTracking;
          const isStopwatchActive = (typeof stopwatchInterval !== 'undefined') && (stopwatchInterval !== null);

          if (!isGpsActive && !isStopwatchActive) {
            console.log('[Auto-Update] Aplicando versão atualizada automaticamente...');
            const cleanUrl = window.location.href.split('#')[0].split('?')[0];
            window.location.replace(cleanUrl + '?v=' + Date.now());
            return;
          }
        }
      }
    }

    // 3. Otimização de memória e estado (salva integridade e limpa lixo)
    if (typeof saveState === 'function') {
      saveState();
    }
    lastAutoOptimizedAt = Date.now();
    console.log('[IronLevel] Otimização periódica de 2 minutos concluída com sucesso.');
  } catch (err) {
    // Falha silenciosa caso o aparelho esteja temporariamente offline
    console.log('[Auto-Update] Verificação em background silenciosa:', err);
  }
}

function startAutoUpdateEngine() {
  // Primeira checagem após 10 segundos da inicialização
  setTimeout(runAutoOptimizationAndCheck, 10000);
  // Checagem contínua estritamente a cada 2 minutos
  setInterval(runAutoOptimizationAndCheck, AUTO_UPDATE_INTERVAL_MS);

  // Também otimiza sempre que o usuário desbloquear o celular ou voltar para a aba
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const elapsed = Date.now() - lastAutoOptimizedAt;
      if (elapsed >= AUTO_UPDATE_INTERVAL_MS) {
        runAutoOptimizationAndCheck();
      }
    }
  });
}

async function forceUpdateAndClearCache() {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    window.location.replace(baseUrl + '?t=' + Date.now());
  } catch (err) {
    window.location.reload();
  }
}

// --- THEME PICKER & LIVE PREVIEW ---
function applyTheme(themeName) {
  STATE.user.theme = themeName || 'green';
  document.body.dataset.theme = (themeName === 'green' || !themeName) ? '' : themeName;

  const themeIds = ['green', 'orange', 'purple', 'red', 'blue', 'gold', 'shadow'];
  themeIds.forEach(t => {
    const card = document.getElementById(`theme-card-${t}`);
    if (card) {
      if (t === (themeName || 'green')) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
  });

  saveState();
}

function openThemeModal() {
  triggerHaptic('light');
  // Define o novo tema Fogo Azul & Preto (Solo Leveling) como padrão
  if (!STATE.user.theme || STATE.user.theme === 'green') {
    STATE.user.theme = 'shadow';
  }
  applyTheme(STATE.user.theme);
  document.getElementById('themeModal').classList.add('open');
}

function closeThemeModal() {
  triggerHaptic('medium');
  document.getElementById('themeModal').classList.remove('open');
}

function previewAndSelectTheme(themeName) {
  triggerHaptic('success');
  applyTheme(themeName);
}

// --- ABOUT MODAL ---
function openAboutModal() {
  document.getElementById("aboutModal").classList.add("open");
}

function closeAboutModal() {
  document.getElementById("aboutModal").classList.remove("open");
}

// --- PROFILE PHOTO & MODAL LOGIC ---
let tempProfilePhoto = null;
let cachedUserPhotoImg = null;

function updateCachedUserPhoto() {
  if (STATE.user && STATE.user.photo) {
    cachedUserPhotoImg = new Image();
    cachedUserPhotoImg.src = STATE.user.photo;
  } else {
    cachedUserPhotoImg = null;
  }
}

function triggerProfilePhotoInput() {
  triggerHaptic('light');
  const input = document.getElementById('profilePhotoInput');
  if (input) input.click();
}

function updateModalAvatarLetter() {
  const nameInput = document.getElementById("profileNameInput");
  const letterEl = document.getElementById("modalAvatarLetter");
  if (letterEl && !tempProfilePhoto) {
    const letter = (nameInput.value.trim().charAt(0) || "G").toUpperCase();
    letterEl.innerText = letter;
  }
}

function handlePhotoSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert("Por favor, selecione um arquivo de imagem válido.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Redimensiona para max 256x256 mantendo qualidade e economizando espaço no navegador
      const maxDim = 256;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      tempProfilePhoto = canvas.toDataURL('image/jpeg', 0.85);
      renderModalAvatarPreview();
      triggerHaptic('success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeProfilePhoto() {
  triggerHaptic('light');
  tempProfilePhoto = null;
  const input = document.getElementById('profilePhotoInput');
  if (input) input.value = '';
  renderModalAvatarPreview();
}

function renderModalAvatarPreview() {
  const preview = document.getElementById('modalAvatarPreview');
  const removeBtn = document.getElementById('btnRemovePhoto');
  const nameInput = document.getElementById("profileNameInput");
  const currentLetter = (nameInput ? nameInput.value.trim().charAt(0) || "G" : "G").toUpperCase();

  if (tempProfilePhoto) {
    preview.innerHTML = `<img src="${tempProfilePhoto}" alt="Foto de perfil">`;
    if (removeBtn) removeBtn.style.display = 'inline-flex';
  } else {
    preview.innerHTML = `<span id="modalAvatarLetter">${currentLetter}</span>`;
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function openProfileModal() {
  triggerHaptic('light');
  tempProfilePhoto = STATE.user.photo || null;
  document.getElementById("profileNameInput").value = STATE.user.name;
  document.getElementById("profileGoalInput").value = STATE.user.goal;
  renderModalAvatarPreview();
  document.getElementById("profileModal").classList.add("open");
}

function closeProfileModal() {
  triggerHaptic('light');
  tempProfilePhoto = null;
  document.getElementById("profileModal").classList.remove("open");
}

function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById("profileNameInput").value.trim() || "Guerreiro";
  const goal = document.getElementById("profileGoalInput").value;
  STATE.user.name = name;
  STATE.user.goal = goal;
  STATE.user.avatar = name.charAt(0).toUpperCase();
  STATE.user.photo = tempProfilePhoto;
  updateCachedUserPhoto();
  saveState();
  closeProfileModal();
  triggerHaptic('success');
  sfx.playCheck();
  renderAll();
}

// --- LEVEL UP CELEBRATION MODAL & CONFETTI ---
function triggerLevelUpModal(levelObj) {
  sfx.playLevelUp();
  document.getElementById("levelUpIcon").innerText = levelObj.badge;
  document.getElementById("levelUpTitle").innerText = `NÍVEL ${levelObj.level}: ${levelObj.name.toUpperCase()}`;
  document.getElementById("levelUpDesc").innerText = `Você atingiu ${STATE.totalPoints.toFixed(1)} pontos (${Math.floor(STATE.totalMinutes/60)}h ${STATE.totalMinutes%60}m acumulados)! Patente: ${levelObj.rank}`;
  document.getElementById("levelUpModal").classList.add("open");
  launchConfetti();
}

function closeLevelUpModal() {
  document.getElementById("levelUpModal").classList.remove("open");
}

// Simple Canvas Confetti
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#fbbf24"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 16,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frames++;
    if (frames < 120) {
      requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  updateConfetti();
}

// --- TAB SWITCHING ---
function switchTab(tabId) {
  sfx.init();
  const tabs = ['home', 'workout', 'running', 'levels', 'share'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (el) el.classList.remove('active');
    if (navBtn) navBtn.classList.remove('active');
  });

  const activeEl = document.getElementById(`tab-${tabId}`);
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeEl) activeEl.classList.add('active');
  if (activeNav) activeNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'home') renderHomeTab();
  if (tabId === 'workout') renderWorkoutTab();
  if (tabId === 'running') {
    renderRunningTab();
    if (currentRunSubtab === 'gps') {
      setTimeout(initRunMapIfNeeded, 150);
    }
  }
  if (tabId === 'levels') renderLevelsTab();
  if (tabId === 'share') renderShareTab();
}

// --- RENDER FUNCTIONS ---
function renderHeader() {
  const avatarEl = document.getElementById("headerAvatar");
  if (STATE.user && STATE.user.photo) {
    avatarEl.innerHTML = `<img src="${STATE.user.photo}" alt="${STATE.user.name}">`;
  } else {
    avatarEl.innerHTML = (STATE.user && STATE.user.avatar) ? STATE.user.avatar : "G";
  }
  document.getElementById("headerUserName").innerHTML = `${STATE.user.name} <span class="level-tag" id="headerLevelTag">NÍVEL ${STATE.currentLevel}</span>`;
  document.getElementById("headerStreakCount").innerText = STATE.streakDays || 1;
}

function renderHomeTab() {
  renderHeader();
  document.getElementById("todayDateStr").innerText = getFormattedDayMonth();

  const currentLevelObj = getLevelForPoints(STATE.totalPoints);
  const nextLevelObj = LEVELS.find(l => l.level === currentLevelObj.level + 1) || currentLevelObj;

  // Level Hero
  document.getElementById("heroLevelBadge").innerText = currentLevelObj.badge;
  document.getElementById("heroLevelName").innerText = `Nível ${currentLevelObj.level}: ${currentLevelObj.name}`;
  document.getElementById("heroLevelRank").innerText = currentLevelObj.rank;

  // Progress Bar
  const range = nextLevelObj.minPoints - currentLevelObj.minPoints;
  const currentInTier = STATE.totalPoints - currentLevelObj.minPoints;
  const pct = range > 0 ? Math.min(100, Math.max(5, (currentInTier / range) * 100)) : 100;
  document.getElementById("heroLevelProgressBar").style.width = `${pct}%`;

  document.getElementById("heroCurrentPoints").innerText = `${STATE.totalPoints.toFixed(2)} Pontos`;
  document.getElementById("heroNextLevelPoints").innerText = nextLevelObj.level > currentLevelObj.level 
    ? `Próx: Nível ${nextLevelObj.level} (${nextLevelObj.minPoints} pts)` 
    : "Patente Máxima Alcançada! 👑";

  const totalHours = Math.floor(STATE.totalMinutes / 60);
  const totalRemainMins = STATE.totalMinutes % 60;
  document.getElementById("heroTotalHoursDisplay").innerText = `${totalHours}h ${totalRemainMins}m`;

  // Hours until next point:
  const minsInCurrentPoint = STATE.totalMinutes % 120;
  const minsToNextPt = 120 - minsInCurrentPoint;
  const hToNext = Math.floor(minsToNextPt / 60);
  const mToNext = minsToNextPt % 60;
  document.getElementById("hoursToNextPt").innerText = `${hToNext}h ${String(mToNext).padStart(2, '0')}m`;

  // Daily Challenge Card
  document.getElementById("challengeTitle").innerText = STATE.dailyChallenge.title;
  const todayTotalMin = STATE.todaySessions.reduce((acc, s) => acc + s.durationMin, 0);
  const chPct = Math.min(100, Math.round((todayTotalMin / STATE.dailyChallenge.targetMinutes) * 100));
  document.getElementById("challengeProgressBar").style.width = `${chPct}%`;
  document.getElementById("challengeProgressText").innerText = `${todayTotalMin} / ${STATE.dailyChallenge.targetMinutes} min concluídos`;

  const statusBadge = document.getElementById("challengeStatusBadge");
  const btnCh = document.getElementById("btnCompleteChallenge");
  if (STATE.dailyChallenge.completed || todayTotalMin >= STATE.dailyChallenge.targetMinutes) {
    statusBadge.innerText = "Concluído! 🏆";
    statusBadge.style.color = "var(--accent-green)";
    btnCh.innerText = "Concluído ✔";
    btnCh.style.background = "var(--accent-green)";
  } else {
    statusBadge.innerText = "Em Andamento";
    statusBadge.style.color = "var(--accent-orange)";
    btnCh.innerText = "Concluir";
    btnCh.style.background = "var(--accent-orange)";
  }

  // Today Stats Grid
  const sessionCount = STATE.todaySessions.length;
  document.getElementById("todaySessionsCount").innerText = sessionCount;
  document.getElementById("todaySessionsDesc").innerText = sessionCount === 1 ? "1 sessão registrada" : `${sessionCount} sessões hoje`;

  document.getElementById("todayDurationTotal").innerText = `${todayTotalMin} min`;
  const todayPts = (todayTotalMin / 120).toFixed(2);
  document.getElementById("todayPointsGained").innerText = todayPts;

  const todayKm = STATE.todayRuns.reduce((acc, r) => acc + r.km, 0);
  const todayRunMin = STATE.todayRuns.reduce((acc, r) => acc + r.minutes, 0);
  document.getElementById("todayKmTotal").innerText = `${todayKm.toFixed(1)} km`;
  document.getElementById("todayRunTime").innerText = `${todayRunMin} min cardio`;

  document.getElementById("totalPointsSummary").innerText = STATE.totalPoints.toFixed(2);

  // Today Sessions List
  const sessionsListEl = document.getElementById("todaySessionsList");
  document.getElementById("todaySessionsBadge").innerText = `${sessionCount} sessões`;
  if (sessionCount === 0) {
    sessionsListEl.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 12px 0;">
        Você ainda não registrou nenhum treino hoje. Bora treinar! 💪
      </p>
    `;
  } else {
    sessionsListEl.innerHTML = STATE.todaySessions.map((s, idx) => `
      <div class="session-item">
        <div>
          <span style="font-weight: 700; color: #fff;">Sessão #${idx + 1}: ${s.type}</span>
          <div style="font-size: 0.72rem; color: var(--text-muted);">
            Registrado às ${s.timeStr} • Duração: <strong>${s.durationMin} min</strong>
          </div>
        </div>
        <span class="session-badge">+${s.pointsEarned} pt</span>
      </div>
    `).join('');
  }
}

function renderWorkoutTab() {
  const daysBar = document.getElementById("daysBar");
  const dayNamesShort = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

  daysBar.innerHTML = dayNamesShort.map((short, idx) => `
    <button class="day-btn ${idx === STATE.activeDayIndex ? 'active' : ''}" onclick="setWorkoutDay(${idx})">
      <span class="day-short">${short}</span>
      <span class="day-dot"></span>
    </button>
  `).join('');

  const routine = STATE.routines[STATE.activeDayIndex];
  document.getElementById("workoutDayLabel").innerText = routine.dayName;
  document.getElementById("workoutDayTitle").innerText = routine.title;
  document.getElementById("exerciseCountBadge").innerText = routine.exercises.length;

  const container = document.getElementById("exerciseListContainer");
  if (routine.exercises.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">
        Nenhum exercício montado para este dia ainda.<br>
        Clique em <strong>+ Adicionar Exercício</strong> para começar sua ficha!
      </div>
    `;
    return;
  }

  container.innerHTML = routine.exercises.map(ex => `
    <div class="exercise-item ${ex.done ? 'done' : ''}">
      <div class="exercise-left">
        <div class="exercise-checkbox ${ex.done ? 'checked' : ''}" onclick="toggleExerciseDone('${ex.id}')">
          ${ex.done ? '✓' : ''}
        </div>
        <div>
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-details">
            <strong>${ex.sets} séries</strong> × <strong>${ex.reps} reps</strong>
            ${ex.weight > 0 ? ` • Carga: <strong style="color: var(--accent-orange);">${ex.weight} kg</strong>` : ''}
            ${ex.rest ? ` • Descanso: ${ex.rest}s` : ''}
            ${ex.notes ? `<div style="font-size: 0.68rem; color: var(--text-dark); margin-top: 1px;">💡 ${ex.notes}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="exercise-actions">
        <button class="btn-icon" title="Editar" onclick="openEditExerciseModal('${ex.id}')">✏️</button>
        <button class="btn-icon" title="Excluir" onclick="deleteExercise('${ex.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function renderRunningTab() {
  const todayKm = STATE.todayRuns.reduce((acc, r) => acc + (r.km || 0), 0);
  const todayMins = STATE.todayRuns.reduce((acc, r) => acc + (r.minutes || 0), 0);
  const totalGeneralKm = STATE.runningHistory.reduce((acc, r) => acc + (r.km || 0), 0);

  document.getElementById("runHeroKmToday").innerText = todayKm.toFixed(1);
  document.getElementById("runHeroTimeToday").innerText = `${todayMins}m`;
  document.getElementById("runHeroKmTotal").innerText = totalGeneralKm.toFixed(1);

  const historyEl = document.getElementById("runningHistoryList");
  if (STATE.runningHistory.length === 0) {
    historyEl.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 14px 0;">
        Nenhuma corrida registrada ainda. Amarre os tênis e bora! 👟
      </p>
    `;
  } else {
    historyEl.innerHTML = STATE.runningHistory.slice(0, 20).map(r => {
      const isGps = !!(r.isGps || (r.route && r.route.length > 0));
      const points = isGps ? (r.minutes / 120).toFixed(2) : '0.00';
      const badgeStyle = isGps 
        ? 'background: rgba(16,185,129,0.15); color: var(--accent-green); border: 1px solid rgba(16,185,129,0.3); font-weight:700;' 
        : 'background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1);';
      const badgeText = isGps ? `+${points} pt` : `0 pt (Manual)`;
      const typeTag = isGps 
        ? `<span style="font-size: 0.65rem; color: var(--accent-green); background: rgba(16,185,129,0.12); padding: 1px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px;">🛰️ GPS</span>`
        : `<span style="font-size: 0.65rem; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; margin-left: 6px;">📝 Esteira</span>`;

      return `
      <div class="session-item" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
              <strong style="color: #fff; font-size: 0.95rem;">🏃‍♂️ ${r.km} km</strong>
              <span style="color: var(--text-muted); font-size: 0.85rem;">em</span>
              <strong style="color: var(--accent-green); font-size: 0.95rem;">${r.minutes} min</strong>
              ${typeTag}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">
              Data: ${r.date} às ${r.timeStr} • Ritmo: <span style="color: var(--accent-orange); font-weight: 700;">${r.pace}</span>
            </div>
          </div>
          <span class="session-badge" style="${badgeStyle}; white-space: nowrap;">${badgeText}</span>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06);">
          ${(r.route && r.route.length > 0) ? `
            <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.7rem; color: var(--accent-orange); border-color: rgba(245,158,11,0.4); display: inline-flex; align-items: center; gap: 4px;" onclick="openRouteModal('${r.id}')">
              🗺️ Ver Rota
            </button>
          ` : ''}
          <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.7rem; color: #60a5fa; border-color: rgba(96,165,250,0.4); display: inline-flex; align-items: center; gap: 4px;" onclick="openEditRunModal('${r.id}')">
            ✏️ Alterar Tempo
          </button>
          <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.7rem; color: #ef4444; border-color: rgba(239,68,68,0.4); display: inline-flex; align-items: center; gap: 4px; margin-left: auto;" onclick="deleteRun('${r.id}')">
            🗑️ Apagar
          </button>
        </div>
      </div>
      `;
    }).join('');
  }
}

// --- GLOBAL LEADERBOARD & RANKING ENGINE ---
let currentLevelsSubtab = 'ranking';
let currentRankingFilter = 'points';

const GLOBAL_ATHLETES_SEED = [
  { id: "g1", name: "Titan Victor", country: "🇧🇷", level: 7, rank: "Lenda Suprema", badge: "👑", points: 54.0, km: 78.5, streak: 35, avatarBg: "#f59e0b" },
  { id: "g2", name: "Marcus Stone", country: "🇺🇸", level: 6, rank: "Titã dos Pesos", badge: "⚡", points: 38.5, km: 52.0, streak: 22, avatarBg: "#ef4444" },
  { id: "g3", name: "Lucas Viking", country: "🇧🇷", level: 5, rank: "Monstro da Maromba", badge: "🦁", points: 24.0, km: 64.2, streak: 19, avatarBg: "#8b5cf6" },
  { id: "g4", name: "Alexandre Kuro", country: "🇯🇵", level: 5, rank: "Monstro da Maromba", badge: "🦁", points: 18.5, km: 34.0, streak: 14, avatarBg: "#10b981" },
  { id: "g5", name: "Diego Alencar", country: "🇧🇷", level: 4, rank: "Atleta Dedicado", badge: "💎", points: 13.0, km: 28.5, streak: 10, avatarBg: "#3b82f6" },
  { id: "g6", name: "Sarah Iron", country: "🇨🇦", level: 4, rank: "Atleta Dedicado", badge: "💎", points: 10.5, km: 42.0, streak: 12, avatarBg: "#ec4899" },
  { id: "g7", name: "Rodrigo B.", country: "🇧🇷", level: 3, rank: "Rato de Academia", badge: "🥇", points: 7.0, km: 16.5, streak: 7, avatarBg: "#f97316" },
  { id: "g8", name: "Enzo Fitt", country: "🇵🇹", level: 3, rank: "Rato de Academia", badge: "🥇", points: 5.5, km: 14.0, streak: 6, avatarBg: "#06b6d4" },
  { id: "g9", name: "Matheus Silva", country: "🇧🇷", level: 2, rank: "Iniciado Focado", badge: "🥈", points: 3.5, km: 9.0, streak: 4, avatarBg: "#10b981" },
  { id: "g10", name: "Carlos Treino", country: "🇧🇷", level: 2, rank: "Iniciado Focado", badge: "🥈", points: 1.5, km: 4.5, streak: 2, avatarBg: "#64748b" }
];

function switchLevelsSubtab(subtab) {
  triggerHaptic('light');
  currentLevelsSubtab = subtab;
  
  const rankBtn = document.getElementById("subtab-ranking-btn");
  const tiersBtn = document.getElementById("subtab-tiers-btn");
  const rankView = document.getElementById("subtab-ranking-view");
  const tiersView = document.getElementById("subtab-tiers-view");

  if (subtab === 'ranking') {
    if (rankBtn) rankBtn.classList.add("active");
    if (tiersBtn) tiersBtn.classList.remove("active");
    if (rankView) rankView.style.display = "block";
    if (tiersView) tiersView.style.display = "none";
    renderRankingView();
  } else {
    if (rankBtn) rankBtn.classList.remove("active");
    if (tiersBtn) tiersBtn.classList.add("active");
    if (rankView) rankView.style.display = "none";
    if (tiersView) tiersView.style.display = "block";
    renderLevelsTiersView();
  }
}

function setRankingFilter(filter) {
  triggerHaptic('light');
  currentRankingFilter = filter;
  const btnPts = document.getElementById("rankFilterPoints");
  const btnRuns = document.getElementById("rankFilterRuns");
  if (filter === 'points') {
    if (btnPts) {
      btnPts.style.borderColor = "var(--accent-green)";
      btnPts.style.color = "var(--accent-green)";
    }
    if (btnRuns) {
      btnRuns.style.borderColor = "var(--border-color)";
      btnRuns.style.color = "var(--text-muted)";
    }
  } else {
    if (btnRuns) {
      btnRuns.style.borderColor = "var(--accent-green)";
      btnRuns.style.color = "var(--accent-green)";
    }
    if (btnPts) {
      btnPts.style.borderColor = "var(--border-color)";
      btnPts.style.color = "var(--text-muted)";
    }
  }
  renderRankingView();
}

function getGlobalLeaderboardList() {
  const totalKm = (STATE.runningHistory || []).reduce((acc, r) => acc + (r.km || 0), 0);
  const currentLevelObj = getLevelForPoints(STATE.totalPoints);

  const userItem = {
    id: "user_me",
    isUser: true,
    name: STATE.user.name || "Guerreiro",
    country: "🇧🇷",
    level: STATE.currentLevel,
    rank: currentLevelObj.rank,
    badge: currentLevelObj.badge,
    points: STATE.totalPoints,
    km: parseFloat(totalKm.toFixed(1)),
    streak: STATE.streakDays || 1,
    photo: STATE.user.photo || null,
    avatarBg: "var(--accent-green)"
  };

  const list = [...GLOBAL_ATHLETES_SEED, userItem];

  if (currentRankingFilter === 'points') {
    list.sort((a, b) => b.points - a.points);
  } else {
    list.sort((a, b) => b.km - a.km);
  }

  return list;
}

function renderRankingView(animated = false) {
  if (animated) {
    triggerHaptic('success');
    sfx.playCheck();
  }

  const list = getGlobalLeaderboardList();
  document.getElementById("leaderboardCountLabel").innerText = `${list.length} Atletas Conectados`;

  // Render Top 3 Podium
  const top1 = list[0];
  const top2 = list[1];
  const top3 = list[2];

  const renderPodiumAvatar = (item) => {
    if (item.photo) {
      return `<img src="${item.photo}" alt="${item.name}">`;
    }
    const initial = item.name.charAt(0).toUpperCase();
    return `<span style="color: #fff;">${initial}</span>`;
  };

  const podiumEl = document.getElementById("podiumContainer");
  if (podiumEl && top1 && top2 && top3) {
    podiumEl.innerHTML = `
      <!-- 2º LUGAR -->
      <div class="podium-step rank-2">
        <div class="podium-avatar-box">
          <div class="podium-avatar" style="background: ${top2.avatarBg};">
            ${renderPodiumAvatar(top2)}
          </div>
          <div class="podium-badge">🥈</div>
        </div>
        <div class="podium-name">${top2.name} ${top2.isUser ? '(Você)' : ''}</div>
        <div class="podium-pts">${currentRankingFilter === 'points' ? `${top2.points.toFixed(1)} pts` : `${top2.km} km`}</div>
        <div class="podium-block">2</div>
      </div>

      <!-- 1º LUGAR -->
      <div class="podium-step rank-1">
        <div class="podium-avatar-box">
          <div class="podium-crown">👑</div>
          <div class="podium-avatar" style="background: ${top1.avatarBg};">
            ${renderPodiumAvatar(top1)}
          </div>
          <div class="podium-badge">🥇</div>
        </div>
        <div class="podium-name" style="color: #f59e0b; font-size: 0.9rem;">${top1.name} ${top1.isUser ? '(Você)' : ''}</div>
        <div class="podium-pts" style="font-size: 0.8rem; color: #f59e0b;">${currentRankingFilter === 'points' ? `${top1.points.toFixed(1)} pts` : `${top1.km} km`}</div>
        <div class="podium-block">1</div>
      </div>

      <!-- 3º LUGAR -->
      <div class="podium-step rank-3">
        <div class="podium-avatar-box">
          <div class="podium-avatar" style="background: ${top3.avatarBg};">
            ${renderPodiumAvatar(top3)}
          </div>
          <div class="podium-badge">🥉</div>
        </div>
        <div class="podium-name">${top3.name} ${top3.isUser ? '(Você)' : ''}</div>
        <div class="podium-pts">${currentRankingFilter === 'points' ? `${top3.points.toFixed(1)} pts` : `${top3.km} km`}</div>
        <div class="podium-block">3</div>
      </div>
    `;
  }

  // User Sticky Rank
  const userRank = list.findIndex(c => c.isUser) + 1;
  const userItem = list.find(c => c.isUser);
  const userStickyEl = document.getElementById("userStickyRankBox");

  let overtakeInfo = "";
  if (userRank === 1) {
    overtakeInfo = `<span style="color: #f59e0b; font-weight: 800;">👑 VOCÊ É O TOP 1 MUNDIAL!</span>`;
  } else if (userRank > 1) {
    const ahead = list[userRank - 2];
    if (currentRankingFilter === 'points') {
      const diff = (ahead.points - userItem.points) + 0.1;
      const hoursDiff = (diff * 2).toFixed(1);
      overtakeInfo = `Faltam <strong>${diff.toFixed(1)} pts</strong> (~${hoursDiff}h de treino) para ultrapassar <strong>${ahead.name}</strong> (#${userRank - 1})!`;
    } else {
      const diffKm = (ahead.km - userItem.km).toFixed(1);
      overtakeInfo = `Faltam <strong>${diffKm} km</strong> para ultrapassar <strong>${ahead.name}</strong> (#${userRank - 1})!`;
    }
  }

  if (userStickyEl) {
    userStickyEl.innerHTML = `
      <div class="user-rank-card">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 1.4rem; font-weight: 900; color: var(--accent-green); min-width: 32px;">
            #${userRank}
          </div>
          <div class="leader-avatar" style="width: 44px; height: 44px; border-color: var(--accent-green);">
            ${renderPodiumAvatar(userItem)}
          </div>
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #fff;">
              ${userItem.name} <span style="font-size: 0.7rem; color: var(--accent-green); font-weight: 700;">(VOCÊ)</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">
              ${userItem.badge} Nível ${userItem.level} • ${overtakeInfo}
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.15rem; font-weight: 900; color: var(--accent-orange);">
            ${currentRankingFilter === 'points' ? `${userItem.points.toFixed(1)} pts` : `${userItem.km} km`}
          </div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">Sua pontuação</div>
        </div>
      </div>
    `;
  }

  // Leaderboard Full Table
  const listEl = document.getElementById("leaderboardList");
  if (listEl) {
    listEl.innerHTML = list.map((item, idx) => {
      const rankNum = idx + 1;
      let rankDisplay = `#${rankNum}`;
      let rankClass = "";
      if (rankNum === 1) { rankDisplay = "🥇"; rankClass = "top-1"; }
      else if (rankNum === 2) { rankDisplay = "🥈"; rankClass = "top-2"; }
      else if (rankNum === 3) { rankDisplay = "🥉"; rankClass = "top-3"; }

      const isMe = item.isUser;
      const avatarHtml = item.photo 
        ? `<img src="${item.photo}" alt="${item.name}">` 
        : `<span style="color: #fff;">${item.name.charAt(0).toUpperCase()}</span>`;

      return `
        <div class="leader-item ${isMe ? 'is-user' : ''}">
          <div class="leader-rank-col ${rankClass}">${rankDisplay}</div>
          <div class="leader-user-info">
            <div class="leader-avatar" style="background: ${item.avatarBg || 'var(--bg-card)'};">
              ${avatarHtml}
            </div>
            <div>
              <div style="font-weight: 800; font-size: 0.88rem; color: ${isMe ? 'var(--accent-green)' : '#fff'};">
                <span>${item.country}</span> ${item.name} ${isMe ? '<span style="font-size:0.68rem; color: var(--accent-green); font-weight:800;">(VOCÊ)</span>' : ''}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">
                ${item.badge} Nível ${item.level} • ${item.rank}
              </div>
            </div>
          </div>
          <div class="leader-stats-col">
            <div style="font-weight: 800; font-size: 0.95rem; color: var(--accent-orange);">
              ${currentRankingFilter === 'points' ? `${item.points.toFixed(1)} pts` : `${item.km} km`}
            </div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">
              ${currentRankingFilter === 'points' ? `${Math.floor(item.points * 2)}h treino` : `🔥 ${item.streak} dias`}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderLevelsTiersView() {
  const listEl = document.getElementById("levelsHierarchyList");
  if (!listEl) return;
  listEl.innerHTML = LEVELS.map(l => {
    const isCurrent = l.level === STATE.currentLevel;
    const isUnlocked = STATE.totalPoints >= l.minPoints;
    const requiredHours = l.minPoints * 2;

    return `
      <div class="card ${isCurrent ? 'card-highlight' : ''}" style="margin-bottom: 8px; padding: 12px 14px; opacity: ${isUnlocked ? '1' : '0.55'};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.6rem;">${l.badge}</span>
            <div>
              <div style="font-weight: 800; font-size: 0.95rem; color: ${isCurrent ? 'var(--accent-green)' : '#fff'};">
                Nível ${l.level}: ${l.name} ${isCurrent ? '⭐ (VOCÊ ESTÁ AQUI)' : ''}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${l.rank}</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 0.75rem;">
            <div style="font-weight: 700; color: var(--accent-orange);">${l.minPoints} Pontos</div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">(${requiredHours}h de treino)</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Badges Grid
  const badgesGrid = document.getElementById("badgesGrid");
  if (!badgesGrid) return;
  badgesGrid.innerHTML = STATE.badges.map(b => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid ${b.unlocked ? 'var(--accent-green)' : 'var(--border-color)'}; border-radius: var(--radius-sm); padding: 10px; text-align: center; opacity: ${b.unlocked ? '1' : '0.45'};">
      <div style="font-size: 1.8rem; margin-bottom: 4px;">${b.icon}</div>
      <div style="font-size: 0.8rem; font-weight: 800; color: ${b.unlocked ? '#fff' : 'var(--text-muted)'};">${b.name}</div>
      <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">${b.desc}</div>
      <span style="display: inline-block; font-size: 0.62rem; margin-top: 6px; padding: 2px 6px; border-radius: 4px; background: ${b.unlocked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}; color: ${b.unlocked ? 'var(--accent-green)' : 'var(--text-muted)'};">
        ${b.unlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
      </span>
    </div>
  `).join('');
}

function renderLevelsTab() {
  if (currentLevelsSubtab === 'ranking') {
    renderRankingView();
  } else {
    renderLevelsTiersView();
  }
}

// --- SHARE CARD GENERATOR (CANVAS) ---
function generateDailyShareCard() {
  const canvas = document.getElementById("shareCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0d131f");
  gradient.addColorStop(0.5, "#0a0d14");
  gradient.addColorStop(1, "#05080c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle border accent
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Brand Header
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText("⚡ IRONLEVEL APP", 40, 60);

  // Date
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }), 40, 92);

  // User Profile Row
  if (cachedUserPhotoImg && cachedUserPhotoImg.complete && cachedUserPhotoImg.naturalWidth > 0) {
    const avatarX = 40;
    const avatarY = 114;
    const avatarSize = 46;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(cachedUserPhotoImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
    ctx.fillText(STATE.user.name.toUpperCase(), 100, 150);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
    ctx.fillText(STATE.user.name.toUpperCase(), 40, 150);
  }

  const currentLevelObj = getLevelForPoints(STATE.totalPoints);

  // Level Badge Box
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 175, width - 80, 110, 16, true, true);

  ctx.font = "55px system-ui";
  ctx.fillText(currentLevelObj.badge, 65, 252);

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText(`NÍVEL ${currentLevelObj.level}: ${currentLevelObj.name.toUpperCase()}`, 145, 222);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText(`Patente: ${currentLevelObj.rank} • Pontos: ${STATE.totalPoints.toFixed(2)} pts`, 145, 256);

  // Stats Grid 2x2
  const todayTotalMin = STATE.todaySessions.reduce((acc, s) => acc + s.durationMin, 0);
  const todayKm = STATE.todayRuns.reduce((acc, r) => acc + r.km, 0);
  const sessionCount = STATE.todaySessions.length;

  const statBoxes = [
    { label: "SESSÕES HOJE", val: `${sessionCount} treinos`, sub: "Consistência diária", x: 40, y: 310, w: 300, h: 100 },
    { label: "TEMPO TOTAL", val: `${todayTotalMin} min`, sub: `+${(todayTotalMin/120).toFixed(2)} pts acumulados`, x: 380, y: 310, w: 300, h: 100 },
    { label: "CARDIO & CORRIDA", val: `${todayKm.toFixed(1)} km`, sub: "Distância percorrida", x: 40, y: 430, w: 300, h: 100 },
    { label: "SEQUÊNCIA DIÁRIA", val: `🔥 ${STATE.streakDays} dias`, sub: "Foco inabalável", x: 380, y: 430, w: 300, h: 100 }
  ];

  statBoxes.forEach(b => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    roundRect(ctx, b.x, b.y, b.w, b.h, 12, true, true);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
    ctx.fillText(b.label, b.x + 16, b.y + 30);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
    ctx.fillText(b.val, b.x + 16, b.y + 64);

    ctx.fillStyle = "#10b981";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
    ctx.fillText(b.sub, b.x + 16, b.y + 86);
  });

  // Workout Details of Today
  ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
  ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
  roundRect(ctx, 40, 555, width - 80, 225, 16, true, true);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText("📋 RESUMO DAS ATIVIDADES DO DIA", 60, 595);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";

  let startLineY = 635;
  if (STATE.todaySessions.length === 0) {
    ctx.fillText("• Nenhum treino de musculação registrado hoje ainda.", 60, startLineY);
  } else {
    STATE.todaySessions.slice(0, 4).forEach((s, i) => {
      ctx.fillText(`• ${s.type} - ${s.durationMin} min às ${s.timeStr} (+${s.pointsEarned} pt)`, 60, startLineY + (i * 32));
    });
  }

  if (todayKm > 0) {
    ctx.fillStyle = "#ef4444";
    ctx.fillText(`• Corrida: ${todayKm.toFixed(1)} km concluídos com sucesso! 🏃‍♂️`, 60, 745);
  }

  // Footer Motivational Box
  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.textAlign = "center";
  ctx.fillText('"A dor do treino é temporária. O orgulho é para sempre."', width / 2, 835);

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText("Treine todos os dias • 2 Horas = 1 Ponto • Suba de Nível!", width / 2, 875);
  ctx.textAlign = "left"; // reset
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function renderShareTab() {
  generateDailyShareCard();
}

// Download Canvas as PNG
function downloadShareCard() {
  const canvas = document.getElementById("shareCanvas");
  const link = document.createElement("a");
  link.download = `meu-treino-${getTodayDateStr()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Web Share API
async function shareDailyCard() {
  const canvas = document.getElementById("shareCanvas");
  if (navigator.share && canvas.toBlob) {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `treino-${getTodayDateStr()}.png`, { type: 'image/png' });
      const currentLevelObj = getLevelForPoints(STATE.totalPoints);
      const text = `🔥 Treino de hoje concluído no IronLevel!\nNível ${currentLevelObj.level}: ${currentLevelObj.name}\nPontos Acumulados: ${STATE.totalPoints.toFixed(2)} pts\nSequência: ${STATE.streakDays} dias seguidos!`;
      try {
        await navigator.share({
          title: "Meu Treino no IronLevel",
          text: text,
          files: [file]
        });
      } catch (err) {
        // Fallback to text copy or download
        downloadShareCard();
      }
    });
  } else {
    downloadShareCard();
    copyShareText();
    alert("Card baixado em imagem! O resumo em texto também foi copiado para sua área de transferência para enviar no WhatsApp!");
  }
}

// Copy Summary Text
function copyShareText() {
  const currentLevelObj = getLevelForPoints(STATE.totalPoints);
  const todayTotalMin = STATE.todaySessions.reduce((acc, s) => acc + s.durationMin, 0);
  const todayKm = STATE.todayRuns.reduce((acc, r) => acc + r.km, 0);

  const text = `🔥 *TREINO PAGO - IRONLEVEL* 🔥\n` +
    `👤 *Atleta:* ${STATE.user.name}\n` +
    `🏆 *Nível:* ${currentLevelObj.level} - ${currentLevelObj.name}\n` +
    `⭐ *Pontos:* ${STATE.totalPoints.toFixed(2)} pts (2h de treino = 1 pt)\n` +
    `⏱️ *Tempo Hoje:* ${todayTotalMin} minutos\n` +
    (todayKm > 0 ? `🏃‍♂️ *Corrida:* ${todayKm.toFixed(1)} km\n` : '') +
    `🔥 *Sequência:* ${STATE.streakDays} dias seguidos!\n` +
    `Bora pra cima! Rumo ao próximo nível! 💪`;

  navigator.clipboard.writeText(text).then(() => {
    alert("Texto copiado para a área de transferência! Cole no WhatsApp ou Instagram!");
  }).catch(() => {
    prompt("Copie o texto abaixo:", text);
  });
}

function renderAll() {
  renderHomeTab();
  renderWorkoutTab();
  renderRunningTab();
  renderLevelsTab();
}

// --- INIT APP ---
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateCachedUserPhoto();
  // Define o novo tema Fogo Azul & Preto (Solo Leveling) como padrão
  if (!STATE.user.theme || STATE.user.theme === 'green') {
    STATE.user.theme = 'shadow';
  }
  applyTheme(STATE.user.theme);
  checkDateTurnover();
  checkStandaloneMode();
  STATE.activeDayIndex = getCurrentDayOfWeekIndex();
  renderAll();
  startAutoUpdateEngine();
});
