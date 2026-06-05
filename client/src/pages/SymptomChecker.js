import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaRobot, FaStethoscope, FaExclamationTriangle, FaCheckCircle,
  FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaKeyboard,
  FaArrowRight, FaRedo, FaHeartbeat
} from 'react-icons/fa';

/**
 * SymptomChecker — AI-powered symptom analysis with voice input.
 *
 * Voice feature is designed for elderly/rural users who may not be
 * comfortable typing. Uses the Web Speech API (SpeechRecognition) for
 * voice-to-text and SpeechSynthesis to speak back the result.
 * Supports English, Hindi, and Tamil.
 */

const LANG_OPTIONS = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'ta-IN', label: 'தமிழ்' },
];

const WELCOME = {
  'en-IN': 'Hello! Please describe your symptoms clearly. For example: I have fever and headache since two days.',
  'hi-IN': 'नमस्ते! कृपया अपने लक्षण बताएं। जैसे: मुझे दो दिन से बुखार और सिर दर्द है।',
  'ta-IN': 'வணக்கம்! உங்கள் அறிகுறிகளை தெளிவாக சொல்லுங்கள். உதாரணம்: எனக்கு இரண்டு நாளாக காய்ச்சல் மற்றும் தலைவலி உள்ளது.',
};

// Rule-based AI analysis engine
const analyzeSymptoms = (text, age) => {
  const t = text.toLowerCase();
  const num = parseInt(age) || 30;

  const rules = [
    {
      match: ['chest pain', 'heart pain', 'breathless', 'shortness of breath', 'seene mein dard', 'dil dard', 'maarbadiyil vali'],
      conditions: ['Angina Pectoris', 'Acute Coronary Syndrome', 'Hypertensive Crisis'],
      specialist: 'Cardiologist', urgency: 'urgent', color: 'red',
      advice: 'Chest pain can indicate a cardiac emergency. Seek immediate medical attention.',
      steps: ['Call 108 emergency immediately', 'Sit or lie down and rest', 'Do not eat or drink anything', 'Loosen tight clothing'],
    },
    {
      match: ['stroke', 'face drooping', 'arm weakness', 'speech difficulty', 'sudden numbness', 'paralysis'],
      conditions: ['Ischemic Stroke', 'TIA (Mini Stroke)', 'Brain Haemorrhage'],
      specialist: 'Neurologist', urgency: 'urgent', color: 'red',
      advice: 'These are signs of a stroke. Every minute counts — call emergency services immediately.',
      steps: ['Call 108 immediately', 'Do not give food or water', 'Note the time symptoms started', 'Keep patient calm and still'],
    },
    {
      match: ['fever', 'bukhar', 'temperature', 'kaichal', 'hot body', 'body heat'],
      conditions: num > 50
        ? ['Viral Fever', 'Malaria', 'Typhoid', 'Dengue']
        : ['Viral Fever', 'Common Flu', 'Dengue'],
      specialist: 'General Physician', urgency: 'moderate', color: 'yellow',
      advice: 'Fever lasting more than 2 days needs medical evaluation. Stay hydrated.',
      steps: ['Drink plenty of water and ORS', 'Take paracetamol for fever above 101°F', 'Avoid self-medication for antibiotics', 'Consult doctor if fever persists beyond 2 days'],
    },
    {
      match: ['cough', 'khansi', `khaansi`, 'cold', 'sardi', 'throat pain', 'gale mein dard', 'tonsil'],
      conditions: ['Upper Respiratory Tract Infection', 'Pharyngitis', 'Bronchitis'],
      specialist: 'General Physician', urgency: 'normal', color: 'green',
      advice: 'Respiratory symptoms are common. Seek care if breathing becomes difficult.',
      steps: ['Drink warm water with honey and ginger', 'Take steam inhalation twice daily', 'Avoid cold drinks and ice cream', 'Consult if cough persists beyond 7 days'],
    },
    {
      match: ['headache', 'sir dard', 'talaivali', 'migraine', 'dizzy', 'chakkar', 'vertigo'],
      conditions: ['Tension Headache', 'Migraine', 'Cervicogenic Headache'],
      specialist: 'Neurologist', urgency: 'normal', color: 'yellow',
      advice: 'Persistent or severe headaches should be evaluated by a neurologist.',
      steps: ['Rest in a quiet, dark room', 'Apply cold or warm compress on forehead', 'Stay hydrated', 'Consult if headache is sudden and severe'],
    },
    {
      match: ['stomach pain', 'pet dard', 'vayiru vali', 'diarrhea', 'loose motion', 'vomiting', 'ulti', 'nausea'],
      conditions: ['Gastroenteritis', 'Irritable Bowel Syndrome', 'Food Poisoning'],
      specialist: 'General Physician', urgency: 'moderate', color: 'yellow',
      advice: 'Stomach issues can cause dehydration. Seek care if symptoms are severe.',
      steps: ['Drink ORS solution frequently', 'Eat light food like khichdi or rice', 'Avoid spicy and oily food', 'Consult if blood in stool or severe pain'],
    },
    {
      match: ['rash', 'skin', 'itching', 'khujli', 'allergy', 'eczema', 'acne', 'fungal'],
      conditions: ['Allergic Dermatitis', 'Eczema', 'Fungal Infection', 'Urticaria'],
      specialist: 'Dermatologist', urgency: 'normal', color: 'green',
      advice: 'Skin conditions are treatable. Avoid scratching and keep the area clean.',
      steps: ['Keep affected area clean and dry', 'Avoid scratching to prevent infection', 'Use mild soap only', 'Consult dermatologist for prescription cream'],
    },
    {
      match: ['joint pain', 'bone pain', 'ghutne dard', 'knee pain', 'back pain', 'kamar dard', 'arthritis', 'fracture', 'swelling in joint'],
      conditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Musculoskeletal Strain'],
      specialist: 'Orthopedic', urgency: 'normal', color: 'yellow',
      advice: 'Joint and bone pain needs proper evaluation to rule out serious conditions.',
      steps: ['Apply ice pack for 15 minutes', 'Avoid heavy lifting', 'Do gentle stretching exercises', 'Consult orthopedic for X-ray if needed'],
    },
    {
      match: ['depression', 'anxiety', 'stress', 'tension', 'mental', 'sad', 'sleep problem', 'neend nahi', 'panic'],
      conditions: ['Generalised Anxiety Disorder', 'Depression', 'Insomnia'],
      specialist: 'Psychiatrist', urgency: 'normal', color: 'green',
      advice: 'Mental health is as important as physical health. Seeking help is a sign of strength.',
      steps: ['Talk to a trusted family member or friend', 'Practice deep breathing for 10 minutes daily', 'Maintain a regular sleep schedule', 'Consult a psychiatrist — it is completely confidential'],
    },
    {
      match: ['pregnancy', 'pregnant', 'garbhavati', 'periods', 'irregular periods', 'pcos', 'white discharge', 'vaginal'],
      conditions: ['Gynaecological Consultation Required', 'PCOS', 'Hormonal Imbalance'],
      specialist: 'Gynecologist', urgency: 'normal', color: 'green',
      advice: 'Women\'s health concerns need specialist attention. Regular checkups are important.',
      steps: ['Schedule a gynaecology consultation', 'Maintain a menstrual cycle diary', 'Take folic acid if planning pregnancy', 'Avoid self-medication'],
    },
    {
      match: ['child', 'baby', 'infant', 'bachcha', 'kuzhanthai', 'vaccination', 'growth'],
      conditions: ['Paediatric Consultation Required'],
      specialist: 'Pediatrician', urgency: 'normal', color: 'green',
      advice: 'Children need specialist paediatric care for accurate diagnosis.',
      steps: ['Note the child\'s temperature and symptoms', 'Ensure adequate fluid intake', 'Do not give adult medicines to children', 'Consult paediatrician promptly'],
    },
    {
      match: ['sugar', 'diabetes', 'madhumeh', 'blood sugar', 'thirst', 'frequent urination', 'weight loss'],
      conditions: ['Type 2 Diabetes Mellitus', 'Pre-Diabetes', 'Diabetes Insipidus'],
      specialist: 'General Physician', urgency: 'moderate', color: 'yellow',
      advice: 'Diabetes symptoms need prompt evaluation. Early detection prevents complications.',
      steps: ['Get fasting blood sugar test done', 'Reduce sugar and refined carbohydrate intake', 'Exercise for 30 minutes daily', 'Consult doctor for HbA1c test'],
    },
    {
      match: ['blood pressure', 'bp high', 'hypertension', 'uchcha raktachap', 'dizziness with headache'],
      conditions: ['Hypertension (High BP)', 'Secondary Hypertension'],
      specialist: 'Cardiologist', urgency: 'moderate', color: 'yellow',
      advice: 'High blood pressure is a silent killer. Regular monitoring is essential.',
      steps: ['Measure BP twice daily and record it', 'Reduce salt intake', 'Avoid stress and smoking', 'Take prescribed medicines regularly without skipping'],
    },
  ];

  for (const rule of rules) {
    if (rule.match.some(keyword => t.includes(keyword))) {
      return {
        possibleConditions: rule.conditions,
        recommendedSpecialist: rule.specialist,
        urgency: rule.urgency,
        color: rule.color,
        advice: rule.advice,
        steps: rule.steps,
      };
    }
  }

  return {
    possibleConditions: ['General Health Concern'],
    recommendedSpecialist: 'General Physician',
    urgency: 'normal',
    color: 'green',
    advice: 'Please consult a General Physician for a thorough evaluation.',
    steps: ['Note down all your symptoms with duration', 'Bring any previous medical reports', 'Mention all current medications', 'Follow the doctor\'s advice strictly'],
  };
};

const URGENCY_STYLE = {
  urgent:   { bar: 'border-red-500 bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',    icon: 'text-red-500' },
  moderate: { bar: 'border-yellow-500 bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-500' },
  normal:   { bar: 'border-emerald-500 bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-500' },
};

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('text'); // 'text' | 'voice'
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lang, setLang] = useState('en-IN');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const voiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Setup speech recognition
  useEffect(() => {
    if (!voiceSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (final += t) : (interim += t);
      }
      setSymptoms(final || interim);
    };

    rec.onend = () => {
      setIsListening(false);
      setVoiceStatus('Voice captured. Click Analyze to get results.');
    };

    rec.onerror = (e) => {
      setIsListening(false);
      setVoiceStatus(e.error === 'not-allowed'
        ? 'Microphone access denied. Please allow microphone in browser settings.'
        : 'Could not hear clearly. Please try again.');
    };

    recognitionRef.current = rec;
  }, [voiceSupported]);

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.85;
    synthRef.current.speak(utt);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setSymptoms('');
    setResult(null);
    setVoiceStatus('Listening... Speak your symptoms clearly.');
    recognitionRef.current.lang = lang;
    recognitionRef.current.start();
    setIsListening(true);
    speak(WELCOME[lang]);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate processing
    const res = analyzeSymptoms(symptoms, age);
    setResult(res);
    setLoading(false);
    // Speak result for voice mode / elderly users
    if (mode === 'voice') {
      speak(`Analysis complete. You may have ${res.possibleConditions[0]}. ${res.advice} I recommend consulting a ${res.recommendedSpecialist}.`);
    }
  };

  const reset = () => {
    setSymptoms('');
    setAge('');
    setGender('');
    setResult(null);
    setVoiceStatus('');
    synthRef.current?.cancel();
  };

  const urgencyStyle = result ? (URGENCY_STYLE[result.urgency] || URGENCY_STYLE.normal) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaRobot className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">AI Symptom Checker</h1>
          <p className="text-gray-500 text-sm">Type or speak your symptoms — get instant health guidance</p>
        </div>

        {!result ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Mode Toggle */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => { setMode('text'); reset(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                  ${mode === 'text' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <FaKeyboard /> Type Symptoms
              </button>
              <button
                onClick={() => { setMode('voice'); reset(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                  ${mode === 'voice' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <FaMicrophone /> Voice Input
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">For Elderly</span>
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Language Selector — shown in voice mode */}
              {mode === 'voice' && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Language / भाषा चुनें / மொழி தேர்வு</p>
                  <div className="flex gap-2">
                    {LANG_OPTIONS.map(l => (
                      <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
                          ${lang === l.code ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Input UI */}
              {mode === 'voice' && (
                <div className="text-center py-4">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={!voiceSupported || loading}
                    className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center shadow-lg transition-all mb-4
                      ${isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700'}
                      ${!voiceSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isListening
                      ? <FaMicrophoneSlash className="text-white text-4xl" />
                      : <FaMicrophone className="text-white text-4xl" />}
                  </button>
                  <p className="text-sm font-semibold text-gray-700">
                    {isListening ? 'Listening... Tap to stop' : 'Tap mic to speak'}
                  </p>
                  {voiceStatus && (
                    <p className="text-xs text-emerald-600 mt-1">{voiceStatus}</p>
                  )}
                  {!voiceSupported && (
                    <p className="text-xs text-red-500 mt-1">Voice not supported in this browser. Please use Chrome.</p>
                  )}
                  <button
                    onClick={() => speak(WELCOME[lang])}
                    className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 mx-auto"
                  >
                    <FaVolumeUp /> Hear instructions
                  </button>
                </div>
              )}

              {/* Symptoms Text Area — shown in both modes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {mode === 'voice' ? 'Captured Symptoms (you can also edit)' : 'Describe Your Symptoms'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  rows={4}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="e.g. I have chest pain and shortness of breath since yesterday..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
                  <input
                    type="number" min="1" max="120"
                    value={age} onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select
                    value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                <strong>Disclaimer:</strong> This is an AI-powered preliminary assessment only. It is not a substitute for professional medical advice. Always consult a qualified doctor for diagnosis and treatment.
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !symptoms.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analysing Symptoms...
                  </>
                ) : (
                  <><FaStethoscope /> Analyse Symptoms</>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Result Card */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
              <FaCheckCircle className="text-4xl mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Analysis Complete</h2>
              <p className="text-emerald-100 text-sm mt-1">Based on your reported symptoms</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Symptoms recap */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Symptoms</p>
                <p className="text-gray-800 text-sm">{symptoms}</p>
              </div>

              {/* Urgency */}
              <div className={`border-l-4 rounded-r-xl p-4 ${urgencyStyle.bar}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FaExclamationTriangle className={urgencyStyle.icon} />
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${urgencyStyle.badge}`}>
                    {result.urgency === 'urgent' ? '🚨 Urgent' : result.urgency === 'moderate' ? '⚠️ Moderate' : '✅ Normal'}
                  </span>
                </div>
                <p className={`text-sm font-medium ${urgencyStyle.text}`}>{result.advice}</p>
              </div>

              {/* Possible Conditions */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaHeartbeat className="text-emerald-500" /> Possible Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.possibleConditions.map((c, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Specialist */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Specialist</p>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{result.recommendedSpecialist}</p>
                </div>
                <FaStethoscope className="text-emerald-400 text-3xl" />
              </div>

              {/* Next Steps */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">What to do next</p>
                <div className="space-y-2">
                  {result.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice read result button */}
              <button
                onClick={() => speak(`${result.advice} Consult a ${result.recommendedSpecialist}.`)}
                className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
              >
                <FaVolumeUp /> Read Result Aloud
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/patient/doctors', { state: { filterSpecialization: result.recommendedSpecialist } })}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Book Appointment <FaArrowRight />
                </button>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  <FaRedo /> Check Again
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                This is a preliminary AI assessment. Always consult a qualified doctor for accurate diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
