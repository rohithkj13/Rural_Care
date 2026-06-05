import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaRobot, FaVolumeUp, FaStethoscope } from 'react-icons/fa';

const VoiceSymptomChecker = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Speech Recognition Setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        console.log('Voice symptom checker started');
        speak(getWelcomeMessage());
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          console.log('Final transcript:', finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          speak('Please allow microphone access to continue');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript) {
          analyzeVoiceSymptoms(transcript);
        }
      };

      setRecognition(recognitionInstance);
    }

    // Speech Synthesis Setup
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, [language, transcript]);

  const getWelcomeMessage = () => {
    const messages = {
      'en-US': 'Hello! I am your AI health assistant. Please describe your symptoms in detail. For example, say: I have fever and headache since 2 days.',
      'hi-IN': 'नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। कृपया अपने लक्षणों का विस्तार से वर्णन करें।',
      'ta-IN': 'வணக்கம்! நான் உங்கள் AI சுகாதார உதவியாளர். தயவுசெய்து உங்கள் அறிகுறிகளை விரிவாக விவரிக்கவும்.'
    };
    return messages[language] || messages['en-US'];
  };

  const speak = (text) => {
    if (synthesis) {
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      setTimeout(() => {
        synthesis.speak(utterance);
      }, 100);
    }
  };

  const startListening = () => {
    if (recognition) {
      try {
        recognition.lang = language;
        recognition.start();
        setIsListening(true);
        setTranscript('');
        setAnalysis(null);
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Please allow microphone access and try again');
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const analyzeVoiceSymptoms = async (symptoms) => {
    setIsAnalyzing(true);
    speak('Analyzing your symptoms. Please wait...');
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const symptomsLower = symptoms.toLowerCase();
    let result = {
      symptoms: symptoms,
      possibleConditions: [],
      recommendedSpecialist: '',
      urgencyLevel: 'normal',
      advice: '',
      color: 'green',
      nextSteps: []
    };

    // Enhanced AI Analysis for Rural Context
    if (symptomsLower.includes('chest pain') || symptomsLower.includes('heart') || symptomsLower.includes('breathless') || symptomsLower.includes('chest hurt')) {
      result.possibleConditions = ['Heart Disease', 'Angina', 'High Blood Pressure'];
      result.recommendedSpecialist = 'Cardiologist';
      result.urgencyLevel = 'urgent';
      result.advice = 'Chest pain can be serious. You need immediate medical attention.';
      result.color = 'red';
      result.nextSteps = ['Go to nearest hospital immediately', 'Call emergency number 108', 'Take rest and avoid physical activity'];
    }
    else if (symptomsLower.includes('fever') || symptomsLower.includes('temperature') || symptomsLower.includes('hot body')) {
      if (symptomsLower.includes('headache') || symptomsLower.includes('body pain') || symptomsLower.includes('weakness')) {
        result.possibleConditions = ['Viral Fever', 'Malaria', 'Dengue', 'Typhoid'];
        result.recommendedSpecialist = 'General Physician';
        result.urgencyLevel = 'moderate';
        result.advice = 'Fever with other symptoms needs medical attention within 24 hours.';
        result.color = 'yellow';
        result.nextSteps = ['Drink plenty of water', 'Take paracetamol for fever', 'Consult doctor if fever persists', 'Get blood test done'];
      } else {
        result.possibleConditions = ['Common Fever', 'Viral Infection'];
        result.recommendedSpecialist = 'General Physician';
        result.urgencyLevel = 'normal';
        result.advice = 'Simple fever can be managed with proper care.';
        result.color = 'green';
        result.nextSteps = ['Take rest', 'Drink fluids', 'Monitor temperature', 'Consult if fever increases'];
      }
    }
    else if (symptomsLower.includes('stomach') || symptomsLower.includes('belly') || symptomsLower.includes('diarrhea') || symptomsLower.includes('vomit')) {
      result.possibleConditions = ['Gastroenteritis', 'Food Poisoning', 'Stomach Infection'];
      result.recommendedSpecialist = 'General Physician';
      result.urgencyLevel = 'moderate';
      result.advice = 'Stomach problems can lead to dehydration. Seek medical care.';
      result.color = 'yellow';
      result.nextSteps = ['Drink ORS solution', 'Eat light food', 'Avoid spicy food', 'Consult doctor if severe'];
    }
    else if (symptomsLower.includes('cough') || symptomsLower.includes('cold') || symptomsLower.includes('throat')) {
      result.possibleConditions = ['Common Cold', 'Throat Infection', 'Respiratory Infection'];
      result.recommendedSpecialist = 'General Physician';
      result.urgencyLevel = 'normal';
      result.advice = 'Respiratory symptoms are common but need attention if severe.';
      result.color = 'green';
      result.nextSteps = ['Drink warm water', 'Take steam inhalation', 'Rest your voice', 'Consult if breathing difficulty'];
    }
    else if (symptomsLower.includes('skin') || symptomsLower.includes('rash') || symptomsLower.includes('itching') || symptomsLower.includes('allergy')) {
      result.possibleConditions = ['Skin Allergy', 'Dermatitis', 'Fungal Infection'];
      result.recommendedSpecialist = 'Dermatologist';
      result.urgencyLevel = 'normal';
      result.advice = 'Skin conditions are usually treatable with proper medication.';
      result.color = 'green';
      result.nextSteps = ['Keep area clean and dry', 'Avoid scratching', 'Use mild soap', 'Consult dermatologist'];
    }
    else if (symptomsLower.includes('headache') || symptomsLower.includes('head pain') || symptomsLower.includes('migraine')) {
      result.possibleConditions = ['Tension Headache', 'Migraine', 'Stress Headache'];
      result.recommendedSpecialist = 'General Physician';
      result.urgencyLevel = 'normal';
      result.advice = 'Headaches are common but persistent ones need medical attention.';
      result.color = 'green';
      result.nextSteps = ['Take rest in dark room', 'Apply cold compress', 'Stay hydrated', 'Consult if severe or frequent'];
    }
    else if (symptomsLower.includes('pregnancy') || symptomsLower.includes('pregnant') || symptomsLower.includes('baby')) {
      result.possibleConditions = ['Pregnancy Related Consultation'];
      result.recommendedSpecialist = 'Gynecologist';
      result.urgencyLevel = 'normal';
      result.advice = 'Pregnancy requires regular medical checkups for mother and baby health.';
      result.color = 'green';
      result.nextSteps = ['Regular checkups', 'Take folic acid', 'Eat healthy food', 'Avoid smoking/alcohol'];
    }
    else {
      result.possibleConditions = ['General Health Concern'];
      result.recommendedSpecialist = 'General Physician';
      result.urgencyLevel = 'normal';
      result.advice = 'Please consult a doctor for proper diagnosis and treatment.';
      result.color = 'green';
      result.nextSteps = ['Book appointment with doctor', 'Prepare list of symptoms', 'Bring any previous reports', 'Follow doctor advice'];
    }

    setAnalysis(result);
    setIsAnalyzing(false);
    
    // Speak the result
    const spokenResult = `Based on your symptoms, you may have ${result.possibleConditions[0]}. I recommend consulting a ${result.recommendedSpecialist}. ${result.advice}`;
    speak(spokenResult);
  };

  const bookAppointment = () => {
    speak('Taking you to book appointment with recommended specialist');
    setTimeout(() => {
      navigate('/patient/doctors', { 
        state: { filterSpecialization: analysis.recommendedSpecialist } 
      });
    }, 2000);
  };

  const startOver = () => {
    setTranscript('');
    setAnalysis(null);
    speak('Let me help you again. Please describe your symptoms.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <FaRobot className="text-6xl text-primary mr-4" />
              <FaVolumeUp className="text-4xl text-secondary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">AI Voice Health Assistant</h1>
            <p className="text-gray-600 mb-4">Speak your symptoms in your language - I'll help you understand and find the right doctor</p>
            
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setLanguage('en-US')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  language === 'en-US' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi-IN')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  language === 'hi-IN' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('ta-IN')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  language === 'ta-IN' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {!analysis ? (
              <>
                <div className="text-center mb-6">
                  <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    isListening ? 'bg-red-100 animate-pulse' : 'bg-green-100'
                  }`}>
                    {isListening ? (
                      <FaMicrophoneSlash className="text-6xl text-red-500" />
                    ) : (
                      <FaMicrophone className="text-6xl text-green-500" />
                    )}
                  </div>
                  
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isAnalyzing}
                    className={`px-8 py-4 rounded-lg text-xl font-bold transition-all ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-primary hover:bg-green-600 text-white'
                    } disabled:bg-gray-400`}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                        Analyzing...
                      </span>
                    ) : isListening ? (
                      'Stop & Analyze'
                    ) : (
                      'Start Speaking'
                    )}
                  </button>
                </div>

                {transcript && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                    <h3 className="font-bold mb-2">What you said:</h3>
                    <p className="text-gray-700 text-lg">{transcript}</p>
                  </div>
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="text-yellow-700 text-sm">
                    <strong>How to use:</strong> Click "Start Speaking" and describe your symptoms clearly. 
                    For example: "I have fever and headache since 2 days" or "मुझे बुखार और सिर दर्द है"
                  </p>
                </div>
              </>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <FaStethoscope className="text-6xl text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">AI Analysis Complete</h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-2">Your Symptoms:</h3>
                  <p className="text-gray-700 text-lg">{analysis.symptoms}</p>
                </div>

                <div className={`border-l-4 p-6 mb-6 ${
                  analysis.urgencyLevel === 'urgent' ? 'border-red-500 bg-red-50' :
                  analysis.urgencyLevel === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <h3 className="text-xl font-bold mb-2">
                    Urgency: {analysis.urgencyLevel.toUpperCase()}
                  </h3>
                  <p className={`text-lg ${
                    analysis.urgencyLevel === 'urgent' ? 'text-red-700' :
                    analysis.urgencyLevel === 'moderate' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>{analysis.advice}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-3">Possible Conditions:</h3>
                    <ul className="space-y-2">
                      {analysis.possibleConditions.map((condition, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          <span className="font-semibold">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-3">Recommended Specialist:</h3>
                    <p className="text-2xl font-bold text-primary">{analysis.recommendedSpecialist}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">What to do next:</h3>
                  <ul className="space-y-2">
                    {analysis.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={bookAppointment}
                    className="bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Book Appointment with {analysis.recommendedSpecialist}
                  </button>
                  <button
                    onClick={startOver}
                    className="bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Check Another Symptom
                  </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>This is an AI-powered preliminary assessment. Please consult a doctor for accurate diagnosis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSymptomChecker;