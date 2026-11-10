/**
 * IronLevel - Gym & Running Tracker with Level Up System
 * Rule: 2 hours of training = 1 point
 */

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
    avatar: "G"
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
  if (!timerRunning) {
    timerRunning = true;
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
    document.getElementById("btnTimerStart").style.display = "inline-flex";
    document.getElementById("btnTimerStart").innerText = "▶ Continuar";
    document.getElementById("btnTimerPause").style.display = "none";
  }
}

function finishWorkoutTimer() {
  pauseWorkoutTimer();
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

// --- RUNNING TRACKER ---
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
    
    // Approximate 60-70 kcal per km
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
    pace: paceStr
  };

  STATE.todayRuns.push(runItem);
  STATE.runningHistory.unshift(runItem);

  // Add the running minutes to training hours (2h = 1pt rule!)
  addTrainingMinutes(minutes, `Corrida (${km} km)`);
  sfx.playCheck();

  document.getElementById("runForm").reset();
  calcRunPace();
  alert(`Corrida de ${km} km registrada com sucesso! +${minutes} minutos somados às suas horas de treino.`);
  renderRunningTab();
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

function openAddExerciseModal() {
  document.getElementById("exerciseModalTitle").innerText = "Adicionar Exercício";
  document.getElementById("exerciseId").value = "";
  document.getElementById("exerciseForm").reset();
  document.getElementById("exerciseModal").classList.add("open");
}

function openEditExerciseModal(exId) {
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
  document.getElementById("exerciseModal").classList.add("open");
}

function closeExerciseModal() {
  document.getElementById("exerciseModal").classList.remove("open");
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

// --- ABOUT MODAL ---
function openAboutModal() {
  document.getElementById("aboutModal").classList.add("open");
}

function closeAboutModal() {
  document.getElementById("aboutModal").classList.remove("open");
}

// --- PROFILE MODAL ---
function openProfileModal() {
  document.getElementById("profileNameInput").value = STATE.user.name;
  document.getElementById("profileGoalInput").value = STATE.user.goal;
  document.getElementById("profileModal").classList.add("open");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("open");
}

function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById("profileNameInput").value.trim() || "Guerreiro";
  const goal = document.getElementById("profileGoalInput").value;
  STATE.user.name = name;
  STATE.user.goal = goal;
  STATE.user.avatar = name.charAt(0).toUpperCase();
  saveState();
  closeProfileModal();
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
  if (tabId === 'running') renderRunningTab();
  if (tabId === 'levels') renderLevelsTab();
  if (tabId === 'share') renderShareTab();
}

// --- RENDER FUNCTIONS ---
function renderHeader() {
  document.getElementById("headerAvatar").innerText = STATE.user.avatar || "A";
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
  const todayKm = STATE.todayRuns.reduce((acc, r) => acc + r.km, 0);
  const todayMins = STATE.todayRuns.reduce((acc, r) => acc + r.minutes, 0);
  const totalGeneralKm = STATE.runningHistory.reduce((acc, r) => acc + r.km, 0);

  document.getElementById("runHeroKmToday").innerText = todayKm.toFixed(1);
  document.getElementById("runHeroTimeToday").innerText = `${todayMins}m`;
  document.getElementById("runHeroKmTotal").innerText = totalGeneralKm.toFixed(1);

  const historyEl = document.getElementById("runningHistoryList");
  if (STATE.runningHistory.length === 0) {
    historyEl.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 10px 0;">
        Nenhuma corrida registrada ainda. Amarre os tênis e bora! 👟
      </p>
    `;
  } else {
    historyEl.innerHTML = STATE.runningHistory.slice(0, 10).map(r => `
      <div class="session-item">
        <div>
          <strong style="color: #fff;">🏃‍♂️ ${r.km} km</strong> em <strong>${r.minutes} min</strong>
          <div style="font-size: 0.72rem; color: var(--text-muted);">
            Data: ${r.date} às ${r.timeStr} • Ritmo: <span style="color: var(--accent-orange); font-weight:700;">${r.pace}</span>
          </div>
        </div>
        <span class="session-badge">+${(r.minutes/120).toFixed(2)} pt</span>
      </div>
    `).join('');
  }
}

function renderLevelsTab() {
  const listEl = document.getElementById("levelsHierarchyList");
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
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
  ctx.fillText(STATE.user.name.toUpperCase(), 40, 150);

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
  checkDateTurnover();
  STATE.activeDayIndex = getCurrentDayOfWeekIndex();
  renderAll();
});
