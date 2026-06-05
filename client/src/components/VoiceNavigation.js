import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaTimes, FaRobot } from 'react-icons/fa';

/**
 * VoiceNavigation — floating mic button (bottom-right).
 * Clicking the button slides up a compact popup panel from the bottom.
 * Supports English, Hindi, Tamil voice commands for navigation.
 */
const COMMANDS = [
  { label: 'Book appointment',    hint: '"Book appointment"' },
  { label: 'Find doctors',        hint: '"Find doctors"' },
  { label: 'My appointments',     hint: '"My appointments"' },
  { label: 'Prescriptions',       hint: '"Prescriptions"' },
  { label: 'Symptom checker',     hint: '"Symptom checker"' },
  { label: 'Medicine reminders',  hint: '"Medicine reminders"' },
  { label: 'Dashboard',           hint: '"Dashboard"' },
];

const VoiceNavigation = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('');
  const [lang, setLang] = useState('en-US');
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Build recognition instance whenever lang changes
  useEffect(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;

    rec.onresult = (e) => {
      const cmd = e.results[0][0].transcript.toLowerCase();
      setTranscript(cmd);
      handleCommand(cmd);
    };
    rec.onerror = (e) => {
      setIsListening(false);
      setStatus(e.error === 'not-allowed'
        ? 'Microphone access denied.'
        : 'Could not hear. Try again.');
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
  }, [lang]); // eslint-disable-line

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
    setTranscript('');
    setStatus('Listening...');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setStatus('Already listening. Please wait.');
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('');
  };

  const handleCommand = (cmd) => {
    const go = (msg, path) => {
      speak(msg);
      setStatus(msg);
      setTimeout(() => { navigate(path); setOpen(false); }, 1200);
    };

    if (cmd.includes('book') && cmd.includes('appointment'))
      return go('Opening appointment booking', '/patient/book-appointment');
    if (cmd.includes('find') || (cmd.includes('doctor') && !cmd.includes('dashboard')))
      return go('Opening doctors list', '/patient/doctors');
    if (cmd.includes('my') && cmd.includes('appointment'))
      return go('Opening your appointments', '/patient/appointments');
    if (cmd.includes('prescription'))
      return go('Opening prescriptions', '/patient/prescriptions');
    if (cmd.includes('report') || cmd.includes('medical report'))
      return go('Opening medical reports', '/patient/reports');
    if (cmd.includes('medicine') || cmd.includes('reminder'))
      return go('Opening medicine reminders', '/patient/reminders');
    if (cmd.includes('symptom') || cmd.includes('checker'))
      return go('Opening symptom checker', '/patient/symptom-checker');
    if (cmd.includes('lab') || cmd.includes('test'))
      return go('Opening lab tests', '/patient/lab-tests');
    if (cmd.includes('health feed') || cmd.includes('article'))
      return go('Opening health feed', '/patient/health-feed');
    if (cmd.includes('dashboard') || cmd.includes('home'))
      return go('Going to dashboard', '/patient/dashboard');
    if (cmd.includes('help')) {
      speak('You can say: book appointment, find doctors, my appointments, prescriptions, symptom checker, medicine reminders, or dashboard.');
      setStatus('Commands spoken aloud.');
      return;
    }

    speak('Sorry, I did not understand. Say help for available commands.');
    setStatus('Command not recognised. Say "help".');
  };

  const toggleOpen = () => {
    setOpen(o => !o);
    if (open) {
      stopListening();
      setTranscript('');
      setStatus('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Slide-up Popup Panel ── */}
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden
          transition-all duration-300 ease-out origin-bottom-right
          ${open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
      >
        {/* Panel Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRobot className="text-white text-lg" />
            <span className="text-white font-bold text-sm">Voice Assistant</span>
          </div>
          <button
            onClick={toggleOpen}
            className="text-white text-opacity-80 hover:text-opacity-100 p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* Language Selector */}
          <div className="flex gap-1.5">
            {[
              { code: 'en-US', label: 'EN' },
              { code: 'hi-IN', label: 'हि' },
              { code: 'ta-IN', label: 'த' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all
                  ${lang === l.code
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Transcript / Status Box */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 min-h-[52px] border border-gray-100">
            {transcript ? (
              <p className="text-sm text-gray-800">"{transcript}"</p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {isListening ? '🎙 Listening...' : status || 'Tap the mic and speak a command'}
              </p>
            )}
            {status && !isListening && transcript && (
              <p className="text-xs text-emerald-600 mt-1">{status}</p>
            )}
          </div>

          {/* Mic Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!supported}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
              ${isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
              ${!supported ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening
              ? <><FaMicrophoneSlash /> Stop Listening</>
              : <><FaMicrophone /> Start Voice Command</>}
          </button>

          {!supported && (
            <p className="text-xs text-red-500 text-center">Voice not supported. Use Chrome browser.</p>
          )}

          {/* Quick Commands List */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Try saying</p>
            <div className="space-y-1">
              {COMMANDS.map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500">{c.hint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Speak Help Button */}
          <button
            onClick={() => speak('You can say: book appointment, find doctors, my appointments, prescriptions, symptom checker, medicine reminders, or dashboard.')}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-emerald-600 py-2 border border-gray-100 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <FaVolumeUp /> Hear available commands
          </button>
        </div>
      </div>

      {/* ── Floating Trigger Button ── */}
      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
          ${open
            ? 'bg-gray-700 hover:bg-gray-800 rotate-0'
            : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-110'}
          ${isListening ? 'animate-pulse ring-4 ring-emerald-300' : ''}`}
        title="Voice Assistant"
      >
        {open
          ? <FaTimes className="text-white text-xl" />
          : <FaMicrophone className="text-white text-xl" />}
      </button>
    </div>
  );
};

export default VoiceNavigation;
