import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fitnessAPI } from '../services/api';
import {
  FaStethoscope, FaFire, FaWalking, FaTint, FaWeight, FaRulerVertical,
  FaPlus, FaTrash, FaChartLine, FaAppleAlt, FaArrowLeft, FaCheckCircle,
  FaBell, FaSignOutAlt, FaBullseye, FaDumbbell, FaTrophy, FaHeartbeat, FaRunning, FaBed, FaBicycle, FaSearch, FaMoon
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_COLORS = { breakfast: 'text-yellow-600 bg-yellow-50', lunch: 'text-green-600 bg-green-50', dinner: 'text-blue-600 bg-blue-50', snack: 'text-purple-600 bg-purple-50' };

const FOOD_DB = [
  { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, vitC: 0, iron: 10, calcium: 2 },
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3, vitC: 0, iron: 5, calcium: 1 },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0, vitC: 14, iron: 1, calcium: 1 },
  { name: 'Eggs', calories: 70, protein: 6, carbs: 0, fat: 5, vitC: 0, iron: 5, calcium: 2 },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, vitC: 17, iron: 1, calcium: 0 },
  { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 12, vitC: 0, iron: 4, calcium: 1 }
];

const Ring = ({ value, max, color, size = 90 }) => {
  const pct = Math.min(value / (max || 1), 1);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
    </svg>
  );
};

export default function FitnessTracker() {
  const { user, logout } = useContext(AuthContext);
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('dashboard');
  
  const [foodForm, setFoodForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'snack' });
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  
  const [activityForm, setActivityForm] = useState({});
  const [workoutForm, setWorkoutForm] = useState({ type: 'Running', duration: '', caloriesBurned: '', textNotes: '', distance: '' });
  const [setsForm, setSetsForm] = useState([{ reps: '', weight: '' }]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [heightCm, setHeightCm] = useState(() => localStorage.getItem('patientHeight') || '');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todayRes, histRes] = await Promise.all([fitnessAPI.getToday(), fitnessAPI.getHistory(7)]);
      const todayLog = todayRes.data.data;
      setLog(todayLog);
      setActivityForm({
        steps: todayLog.steps || 0,
        caloriesBurned: todayLog.caloriesBurned || 0,
        activeMinutes: todayLog.activeMinutes || 0,
        distance: todayLog.distance || 0,
        weight: todayLog.weight || '',
        sleepHours: todayLog.sleepHours || '',
        sleepQuality: todayLog.sleepQuality || 'fair',
        mood: todayLog.mood || 'okay'
      });
      setHistory(histRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const calculateBMI = (w, h) => w && h ? (w / Math.pow(h / 100, 2)).toFixed(1) : 0;
  const getBMICategory = (bmi) => {
    if (!bmi) return { label: 'Not calculated', bg: 'bg-gray-100 text-gray-500' };
    if (bmi < 18.5) return { label: 'Underweight', bg: 'bg-blue-100 text-blue-600' };
    if (bmi < 25) return { label: 'Normal Weight', bg: 'bg-emerald-100 text-emerald-600' };
    if (bmi < 30) return { label: 'Overweight', bg: 'bg-orange-100 text-orange-600' };
    return { label: 'Obese', bg: 'bg-red-100 text-red-600' };
  };

  const saveActivity = async () => {
    setSaving(true);
    try {
      const dataToSave = { ...activityForm };
      if (heightCm && activityForm.weight) {
        localStorage.setItem('patientHeight', heightCm);
        dataToSave.bmi = Number(calculateBMI(activityForm.weight, heightCm));
      }
      const res = await fitnessAPI.updateToday(dataToSave);
      setLog(res.data.data);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const addWater = async () => {
    const newVal = (log?.waterIntake || 0) + 1;
    setLog(l => ({ ...l, waterIntake: newVal }));
    setActivityForm(f => ({ ...f, waterIntake: newVal }));
    await fitnessAPI.updateToday({ waterIntake: newVal });
  };

  const addFood = async (e) => {
    e.preventDefault();
    try {
      const entry = { ...foodForm, calories: Number(foodForm.calories), protein: Number(foodForm.protein || 0), carbs: Number(foodForm.carbs || 0), fat: Number(foodForm.fat || 0) };
      const res = await fitnessAPI.addFood(entry);
      setLog(res.data.data);
      setFoodForm({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'snack' });
      setShowFoodForm(false);
      setFoodSearch('');
    } catch (err) { console.error(err); }
  };
  const removeFood = async (idx) => {
    try {
      const res = await fitnessAPI.removeFood(idx);
      setLog(res.data.data);
    } catch (err) { console.error(err); }
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    try {
      let advancedNotes = { text: workoutForm.textNotes };
      if (['Weightlifting', 'Gym'].includes(workoutForm.type)) advancedNotes.sets = setsForm;
      else if (['Running', 'Cycling'].includes(workoutForm.type)) advancedNotes.distance = workoutForm.distance;
      
      const entry = { type: workoutForm.type, duration: Number(workoutForm.duration), caloriesBurned: Number(workoutForm.caloriesBurned || 0), notes: JSON.stringify(advancedNotes) };
      const res = await fitnessAPI.addWorkout(entry);
      setLog(res.data.data);
      setWorkoutForm({ type: 'Running', duration: '', caloriesBurned: '', textNotes: '', distance: '' });
      setSetsForm([{ reps: '', weight: '' }]);
      setShowWorkoutForm(false);
    } catch (err) { console.error(err); }
  };
  const removeWorkout = async (idx) => {
    try {
      const res = await fitnessAPI.removeWorkout(idx);
      setLog(res.data.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const goals = log?.goals || { steps: 10000, calories: 2000, water: 8 };
  const getGoalPct = (val, g) => Math.min(((val || 0) / g) * 100, 100).toFixed(0);
  
  const currentBmi = log?.bmi || (heightCm && log?.weight ? calculateBMI(log.weight, heightCm) : 0);
  const bmiCat = getBMICategory(Number(currentBmi));

  const sleepStages = [
    { name: 'Awake', value: (log?.sleepHours || 0) * 0.1, color: '#fca5a5' },
    { name: 'Light', value: (log?.sleepHours || 0) * 0.5, color: '#93c5fd' },
    { name: 'Deep', value: (log?.sleepHours || 0) * 0.2, color: '#3b82f6' },
    { name: 'REM', value: (log?.sleepHours || 0) * 0.2, color: '#8b5cf6' }
  ];

  const chartData = [...history].reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    steps: h.steps || 0,
    caloriesIn: h.totalCaloriesConsumed || 0,
    caloriesOut: h.caloriesBurned || 0,
    sleep: h.sleepHours || 0
  }));

  const parseJson = (str) => {
    try { const p = JSON.parse(str); return typeof p === 'object' ? p : { text: str }; } 
    catch { return { text: str }; }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/patient/dashboard" className="p-2.5 text-gray-500 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-all"><FaArrowLeft /></Link>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg"><FaHeartbeat className="text-white text-xl animate-pulse" /></div>
              <span className="font-extrabold text-gray-900 text-xl tracking-tight">Fitness Plus Pro</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
            { id: 'workouts', label: 'Workouts', icon: FaDumbbell },
            { id: 'diet', label: 'Nutrition', icon: FaAppleAlt },
            { id: 'history', label: 'Progress', icon: FaTrophy }
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                tab === t.id ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg translate-y-[-2px]' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}>
              <t.icon className={tab === t.id ? 'text-gray-300' : 'text-gray-400'} />{t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Steps', value: log?.steps || 0, goal: goals.steps, pct: getGoalPct(log?.steps, goals.steps), color: '#10b981', icon: FaWalking, u: 'steps' },
                { label: 'Calories', value: log?.totalCaloriesConsumed || 0, goal: goals.calories, pct: getGoalPct(log?.totalCaloriesConsumed, goals.calories), color: '#f59e0b', icon: FaFire, u: 'kcal' },
                { label: 'Water', value: log?.waterIntake || 0, goal: goals.water, pct: getGoalPct(log?.waterIntake, goals.water), color: '#3b82f6', icon: FaTint, u: 'fl' },
                { label: 'Active Min', value: log?.activeMinutes || 0, goal: 60, pct: getGoalPct(log?.activeMinutes, 60), color: '#8b5cf6', icon: FaHeartbeat, u: 'min' },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-gray-100 opacity-50 text-5xl"><m.icon /></div>
                  <div className="relative mb-3"><Ring value={m.value} max={m.goal} color={m.color} size={100} /><div className="absolute inset-0 flex items-center justify-center"><m.icon style={{ color: m.color }} className="text-2xl drop-shadow-sm" /></div></div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full mb-1 uppercase tracking-wider" style={{ backgroundColor: `${m.color}15`, color: m.color }}>{m.pct}% Goal</span>
                  <p className="font-extrabold text-gray-900 text-2xl tracking-tight">{m.value.toLocaleString()} <span className="text-sm text-gray-400">{m.u}</span></p>
                  <p className="text-xs text-gray-400 font-bold tracking-wide uppercase mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><span className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center"><FaCheckCircle /></span> Daily Planner</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'steps', label: 'Steps', icon: FaWalking, color: 'text-emerald-500', step: 100 },
                    { key: 'activeMinutes', label: 'Act. Min', icon: FaHeartbeat, color: 'text-rose-500', step: 5 },
                    { key: 'distance', label: 'Dist (km)', icon: FaBullseye, color: 'text-blue-500', step: 0.1 },
                    { key: 'caloriesBurned', label: 'Cal Burn', icon: FaFire, color: 'text-orange-500', step: 10 },
                  ].map((f) => (
                    <div key={f.key} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 border-b-2 hover:border-gray-300 transition-colors">
                      <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5"><f.icon className={f.color} /> {f.label}</label>
                      <input type="number" step={f.step} value={activityForm[f.key] || ''} onChange={e => setActivityForm(a => ({ ...a, [f.key]: e.target.value }))} className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none" placeholder="0" />
                    </div>
                  ))}
                  <div className="bg-emerald-50 rounded-2xl p-4 border-b-2 border-emerald-100 col-span-2 sm:col-span-2">
                    <label className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5"><FaWeight /> Weight (kg)</label>
                    <input type="number" step="0.1" value={activityForm.weight || ''} onChange={e => setActivityForm(a => ({ ...a, weight: e.target.value }))} className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder-emerald-200" placeholder="65.0" />
                  </div>
                  <div className="bg-teal-50 rounded-2xl p-4 border-b-2 border-teal-100 col-span-2 sm:col-span-2">
                    <label className="text-[10px] text-teal-600 font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5"><FaRulerVertical /> Height (cm)</label>
                    <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder-teal-200" placeholder="170" />
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-4 border-b-2 border-indigo-100 col-span-2 sm:col-span-2 flex flex-col justify-center">
                    <label className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5"><FaBed /> Sleep (hrs) & Quality</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.5" value={activityForm.sleepHours || ''} onChange={e => setActivityForm(a => ({ ...a, sleepHours: e.target.value }))} className="w-1/2 bg-transparent text-xl font-bold text-gray-900 outline-none border-r border-indigo-200" placeholder="8.0" />
                      <select value={activityForm.sleepQuality || 'fair'} onChange={e => setActivityForm(a => ({ ...a, sleepQuality: e.target.value }))} className="w-1/2 bg-transparent text-sm font-bold text-gray-900 outline-none capitalize">
                        {['poor', 'fair', 'good', 'excellent'].map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 border-b-2 border-purple-100 col-span-2 sm:col-span-2">
                    <label className="text-[10px] text-purple-600 font-bold tracking-widest uppercase mb-2">Mood Sync</label>
                    <div className="flex justify-between">
                      {[{v:'terrible',e:'😫'},{v:'bad',e:'🙁'},{v:'okay',e:'😐'},{v:'good',e:'🙂'},{v:'great',e:'🤩'}].map(m => (
                        <button key={m.v} onClick={() => setActivityForm(a => ({ ...a, mood: m.v }))} className={`text-2xl transition-all ${activityForm.mood === m.v ? 'scale-125 filter drop-shadow-md' : 'opacity-40 grayscale hover:grayscale-0'}`}>{m.e}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={saveActivity} disabled={saving} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 transition-colors">
                    {saving ? 'Saving...' : 'Sync Data'}
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center h-48 relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-gray-400 font-bold text-[10px] tracking-widest uppercase mb-2">Body Mass Index</h3>
                  <div className="text-5xl font-extrabold text-gray-900 mb-3">{currentBmi > 0 ? currentBmi : '--'}</div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${bmiCat.bg}`}>{bmiCat.label}</span>
                </div>
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl shadow-xl shadow-indigo-500/20 p-6 text-white relative overflow-hidden min-h-[192px]">
                  <h3 className="font-bold flex items-center gap-2 text-sm"><FaMoon className="text-indigo-300" /> Sleep Stages</h3>
                  {log?.sleepHours > 0 ? (
                    <div className="mt-4">
                      <div className="flex w-full h-4 rounded-full overflow-hidden mb-3">
                        {sleepStages.map(s => <div key={s.name} style={{ width: `${(s.value/log.sleepHours)*100}%`, backgroundColor: s.color }} className="h-full border-r border-indigo-900 last:border-0" />)}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {sleepStages.map(s => (
                          <div key={s.name}>
                            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: s.color }}></div>
                            <div className="text-[9px] text-indigo-200 uppercase tracking-wider">{s.name}</div>
                            <div className="text-xs font-bold">{((s.value/log.sleepHours)*100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-indigo-300 text-xs mt-6 text-center">Log your sleep hours to see stages analysis.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'workouts' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-gray-900">Training Log</h2>
              <button onClick={() => setShowWorkoutForm(!showWorkoutForm)} className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2"><FaPlus /> New Activity</button>
            </div>
            
            {showWorkoutForm && (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4">
                <form onSubmit={addWorkout}>
                  <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4 overflow-x-auto">
                    {['Running', 'Cycling', 'Weightlifting', 'Yoga', 'Swimming'].map(t => (
                      <button key={t} type="button" onClick={() => setWorkoutForm(f => ({ ...f, type: t }))} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${workoutForm.type === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t}</button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Duration (min)</label>
                      <input required type="number" value={workoutForm.duration} onChange={e => setWorkoutForm(f => ({ ...f, duration: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. 45" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Calories Burned</label>
                      <input type="number" value={workoutForm.caloriesBurned} onChange={e => setWorkoutForm(f => ({ ...f, caloriesBurned: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. 300" />
                    </div>
                  </div>

                  {['Running', 'Cycling'].includes(workoutForm.type) && (
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Distance (km)</label>
                      <input type="number" step="0.01" value={workoutForm.distance} onChange={e => setWorkoutForm(f => ({ ...f, distance: e.target.value }))} className="w-full bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-blue-900" placeholder="e.g. 5.0" />
                    </div>
                  )}

                  {['Weightlifting'].includes(workoutForm.type) && (
                    <div className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Structured Sets</label>
                      {setsForm.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex-1 flex items-center justify-between"><span className="text-xs font-bold text-gray-400">Set {i+1}</span></div>
                          <input type="number" placeholder="kg" value={s.weight} onChange={e => { const ns = [...setsForm]; ns[i].weight = e.target.value; setSetsForm(ns); }} className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold outline-none" />
                          <input type="number" placeholder="reps" value={s.reps} onChange={e => { const ns = [...setsForm]; ns[i].reps = e.target.value; setSetsForm(ns); }} className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold outline-none" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setSetsForm([...setsForm, {reps:'', weight:''}])} className="text-xs font-bold text-blue-600 mt-2 hover:underline">+ Add Set</button>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Activity Notes</label>
                    <input value={workoutForm.textNotes} onChange={e => setWorkoutForm(f => ({ ...f, textNotes: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-normal focus:ring-2 focus:ring-gray-900 outline-none" placeholder="Feeling strong..." />
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setShowWorkoutForm(false)} className="px-5 py-2.5 text-gray-500 font-bold text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors">Post Activity</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {log?.workouts?.length > 0 ? log.workouts.map((w, i) => {
                const data = parseJson(w.notes);
                const isCardio = ['Running', 'Cycling'].includes(w.type);
                const PaceBlock = () => {
                  if (isCardio && data.distance) {
                    const pace = (w.duration / data.distance).toFixed(2);
                    return (
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                        <div><p className="text-[10px] text-gray-400 font-bold uppercase">Distance</p><p className="font-extrabold text-gray-900">{data.distance} km</p></div>
                        <div><p className="text-[10px] text-gray-400 font-bold uppercase">Pace</p><p className="font-extrabold text-gray-900">{pace} /km</p></div>
                        <div><p className="text-[10px] text-gray-400 font-bold uppercase">Time</p><p className="font-extrabold text-gray-900">{w.duration}m</p></div>
                      </div>
                    );
                  }
                  return null;
                };
                
                return (
                  <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
                    <button onClick={() => removeWorkout(i)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors bg-white z-10"><FaTrash className="text-xs" /></button>
                    {isCardio && data.distance && (
                      <div className="h-32 bg-blue-50 relative w-full overflow-hidden flex items-center justify-center">
                        <svg viewBox="0 0 400 150" className="absolute w-full h-full stroke-orange-500 fill-transparent stroke-[4px] opacity-70 drop-shadow-md"><path d="M 0 100 Q 100 50 200 80 T 400 50" /></svg>
                        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100 z-10 flex items-center gap-1.5"><FaRunning className="text-orange-500" /> GPS Track Recorded</div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg">{w.type === 'Weightlifting' ? <FaDumbbell/> : w.type === 'Cycling' ? <FaBicycle/> : <FaRunning/>}</div>
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{w.type === 'Weightlifting' ? 'Strength Training' : w.type === 'Cycling' ? 'Morning Ride' : 'Run'}</h3>
                          <p className="text-xs text-gray-500 font-medium">Today • {w.caloriesBurned} kcal burnt</p>
                        </div>
                      </div>
                      
                      {data.sets && data.sets.length > 0 && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4">
                          <table className="w-full text-sm text-center">
                            <thead className="text-[10px] font-bold uppercase text-gray-400 border-b border-gray-200">
                              <tr><th className="pb-2 text-left">Set</th><th className="pb-2">kg</th><th className="pb-2">Reps</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {data.sets.map((s, idx) => (
                                <tr key={idx}><td className="py-2.5 font-bold text-gray-900 text-left">{idx+1}</td><td className="py-2.5 font-medium">{s.weight}</td><td className="py-2.5 font-medium">{s.reps}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      <PaceBlock />
                      
                      {data.text && <p className="mt-4 text-sm text-gray-600 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100/50 italic border-l-4 border-l-emerald-400">"{data.text}"</p>}
                    </div>
                  </div>
                );
              }) : (
                <div className="bg-white border text-center border-dashed border-gray-200 rounded-3xl p-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-3 text-2xl"><FaDumbbell /></div>
                  <h3 className="text-gray-900 font-bold mb-1">No activities logged</h3>
                  <p className="text-gray-500 text-sm">Record a run, ride, or gym session to see it here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'diet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Nutrition & Macros</h2>
                <button onClick={() => setShowFoodForm(!showFoodForm)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:bg-emerald-700 transition-colors"><FaPlus /> Add Food</button>
              </div>

              {showFoodForm && (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 relative overflow-visible z-10">
                  <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Smart Add Food</h3>
                  <div className="mb-5 relative">
                    <div className="relative">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={foodSearch} onChange={e => setFoodSearch(e.target.value)} placeholder="Search database (e.g. Oatmeal, Apple)..." className="w-full bg-blue-50/50 border border-blue-100 pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    {foodSearch && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto z-50">
                        {FOOD_DB.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).map((f, i) => (
                          <div key={i} onClick={() => { setFoodForm({ ...foodForm, ...f, mealType: foodForm.mealType }); setFoodSearch(''); }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                            <p className="font-bold text-gray-900 text-sm">{f.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{f.calories} kcal • P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <form onSubmit={addFood}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2"><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name</label><input required value={foodForm.name} onChange={e => setFoodForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none font-bold" /></div>
                      <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Meal</label><select value={foodForm.mealType} onChange={e => setFoodForm(f => ({ ...f, mealType: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none font-bold capitalize cursor-pointer">{MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calories</label><input required type="number" value={foodForm.calories} onChange={e => setFoodForm(f => ({ ...f, calories: e.target.value }))} className="w-full bg-orange-50 border border-orange-100 text-orange-900 px-4 py-2.5 rounded-xl text-sm outline-none font-bold" /></div>
                      <div><label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Protein</label><input type="number" value={foodForm.protein} onChange={e => setFoodForm(f => ({ ...f, protein: e.target.value }))} className="w-full bg-blue-50 border border-blue-100 text-blue-900 px-4 py-2.5 rounded-xl text-sm outline-none font-bold" /></div>
                      <div><label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Carbs</label><input type="number" value={foodForm.carbs} onChange={e => setFoodForm(f => ({ ...f, carbs: e.target.value }))} className="w-full bg-emerald-50 border border-emerald-100 text-emerald-900 px-4 py-2.5 rounded-xl text-sm outline-none font-bold" /></div>
                      <div className="col-span-2"><label className="block text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Fat</label><input type="number" value={foodForm.fat} onChange={e => setFoodForm(f => ({ ...f, fat: e.target.value }))} className="w-full bg-purple-50 border border-purple-100 text-purple-900 px-4 py-2.5 rounded-xl text-sm outline-none font-bold" /></div>
                    </div>
                    <div className="flex gap-3 justify-end mt-5">
                      <button type="button" onClick={() => setShowFoodForm(false)} className="px-5 py-2.5 text-gray-500 font-bold text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-lg transition-colors">Log Entry</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {MEAL_TYPES.map(meal => {
                  const items = (log?.foodEntries || []).filter(f => f.mealType === meal);
                  if (!items.length) return null;
                  return (
                    <div key={meal} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                      <div className={`px-5 py-4 flex items-center justify-between border-b border-gray-50 ${MEAL_COLORS[meal].replace('text','bg').replace('bg-','bg-opacity-20 ')}`}>
                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${MEAL_COLORS[meal]}`}>{meal}</span>
                        <span className="text-gray-900 font-extrabold">{items.reduce((s, f) => s + f.calories, 0)} <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">kcal</span></span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {items.map((food, i) => {
                          const realIdx = (log?.foodEntries || []).indexOf(food);
                          return (
                            <div key={i} className="px-6 py-4 flex items-center justify-between group">
                              <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">{food.name}</p>
                                <div className="flex gap-3 text-[10px] font-extrabold uppercase tracking-wide">
                                  <span className="text-orange-500">{food.calories} kcal</span>
                                  <span className="text-gray-200">|</span>
                                  <span className="text-blue-500">P {food.protein}g</span>
                                  <span className="text-emerald-500">C {food.carbs}g</span>
                                  <span className="text-purple-500">F {food.fat}g</span>
                                </div>
                              </div>
                              <button onClick={() => removeFood(realIdx)} className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><FaTrash className="text-xs" /></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-5 pb-4 border-b border-gray-50">Macronutrients</h3>
                {['Protein', 'Carbs', 'Fat'].map((label, idx) => {
                  const val = (log?.foodEntries || []).reduce((s, f) => s + (f[label.toLowerCase()] || 0), 0);
                  const max = [150, 250, 80][idx];
                  const c = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500'][idx];
                  const bg = ['bg-blue-50', 'bg-emerald-50', 'bg-purple-50'][idx];
                  const pct = Math.min((val / max) * 100, 100);
                  return (
                    <div key={label} className="mb-5 last:mb-0">
                      <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase tracking-widest"><span className="text-gray-500">{label}</span><span className="text-gray-900">{val}g <span className="text-gray-400">/ {max}g</span></span></div>
                      <div className={`h-2.5 rounded-full ${bg} overflow-hidden`}><div className={`h-full rounded-full ${c} transition-all duration-1000`} style={{ width: `${pct}%` }}></div></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Analytics & Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6 text-sm uppercase tracking-wider"><FaWalking className="text-emerald-500" /> Activity Over Time</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer><BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /><Bar dataKey="steps" fill="#10b981" radius={[6, 6, 6, 6]} barSize={24} /></BarChart></ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6 text-sm uppercase tracking-wider"><FaFire className="text-orange-500" /> Caloric Balance</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer><AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /><Area type="monotone" dataKey="caloriesIn" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={3} /><Area type="monotone" dataKey="caloriesOut" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={3} /></AreaChart></ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
