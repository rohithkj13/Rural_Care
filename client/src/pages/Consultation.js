import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI, consultationAPI, prescriptionAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import {
  FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash,
  FaPhoneSlash, FaPaperPlane, FaFileMedical, FaTimes, FaPlus,
  FaUser, FaCircle
} from 'react-icons/fa';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle | waiting | connecting | connected | ended
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
    advice: ''
  });
  const [prescSaving, setPrescSaving] = useState(false);
  const [toast, setToast] = useState('');

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const socketRef = useRef();
  const pcRef = useRef();
  const localStreamRef = useRef();
  const iceCandidateQueue = useRef([]); // queue ICE candidates until remote desc is set
  const messagesEndRef = useRef();

  const isDoctor = user?.role === 'doctor';

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Fetch appointment ──
  useEffect(() => {
    appointmentAPI.getById(appointmentId)
      .then(r => setAppointment(r.data.data))
      .catch(() => notify('Failed to load appointment'));
  }, [appointmentId]);

  // ── Socket setup ──
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.emit('join-room', appointmentId);

    // When the other peer joins the room
    socket.on('user-connected', () => {
      setCallStatus(prev => prev === 'waiting' ? 'connecting' : prev);
      notify('Other participant joined the room');
    });

    // Callee receives offer → create answer
    socket.on('offer', async (offer) => {
      if (!pcRef.current) {
        // Auto-setup peer connection for callee if not done yet
        await setupMedia();
      }
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        // Flush queued ICE candidates
        for (const c of iceCandidateQueue.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        }
        iceCandidateQueue.current = [];
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit('answer', { roomId: appointmentId, answer });
        setCallStatus('connecting');
      } catch (err) {
        console.error('Offer handling error:', err);
        notify('Connection error. Please try again.');
      }
    });

    // Caller receives answer
    socket.on('answer', async (answer) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        // Flush queued ICE candidates
        for (const c of iceCandidateQueue.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        }
        iceCandidateQueue.current = [];
      } catch (err) {
        console.error('Answer handling error:', err);
      }
    });

    // ICE candidates — queue if remote description not set yet
    socket.on('ice-candidate', async (candidate) => {
      if (!pcRef.current) return;
      try {
        if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidateQueue.current.push(candidate);
        }
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    });

    // Chat
    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, { ...data, mine: false }]);
    });

    return () => {
      socket.disconnect();
      endCallCleanup();
    };
  }, [appointmentId]); // eslint-disable-line

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Media + PeerConnection setup ──
  const setupMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setCallStatus('connected');
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit('ice-candidate', { roomId: appointmentId, candidate: e.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setCallStatus('connected');
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setCallStatus('ended');
          notify('Call disconnected');
        }
      };

      return pc;
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        notify('Camera/microphone permission denied. Please allow access.');
      } else {
        notify('Could not access camera/microphone.');
      }
      throw err;
    }
  }, [appointmentId]);

  // ── Start call (caller — typically patient, but either can start) ──
  const startCall = async () => {
    try {
      setCallStatus('waiting');
      const pc = await setupMedia();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', { roomId: appointmentId, offer });
      await consultationAPI.create({ appointmentId }).catch(() => {}); // non-blocking
    } catch (err) {
      setCallStatus('idle');
    }
  };

  // ── Join call (callee — sets up media, waits for offer) ──
  const joinCall = async () => {
    try {
      setCallStatus('waiting');
      await setupMedia();
      notify('Ready! Waiting for the other participant to start the call...');
    } catch {
      setCallStatus('idle');
    }
  };

  // ── End call ──
  const endCallCleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
  };

  const endCall = async () => {
    endCallCleanup();
    setCallStatus('ended');
    if (isDoctor) {
      await appointmentAPI.updateStatus(appointmentId, { status: 'completed' }).catch(() => {});
    }
  };

  // ── Toggle mic ──
  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(m => !m);
  };

  // ── Toggle camera ──
  const toggleCam = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(c => !c);
  };

  // ── Chat ──
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const data = { roomId: appointmentId, message: message.trim(), sender: user?.name || 'You' };
    socketRef.current.emit('send-message', data);
    setMessages(prev => [...prev, { ...data, mine: true }]);
    setMessage('');
  };

  // ── Prescription ──
  const submitPrescription = async () => {
    if (!prescription.diagnosis.trim()) { notify('Please enter a diagnosis'); return; }
    setPrescSaving(true);
    try {
      await prescriptionAPI.create({
        patient: appointment.patient._id,
        appointment: appointmentId,
        ...prescription
      });
      notify('Prescription sent successfully!');
      setShowPrescription(false);
    } catch {
      notify('Failed to send prescription');
    } finally {
      setPrescSaving(false);
    }
  };

  const updateMed = (idx, field, val) => {
    const meds = [...prescription.medicines];
    meds[idx][field] = val;
    setPrescription(p => ({ ...p, medicines: meds }));
  };

  if (!appointment) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const otherPerson = isDoctor ? appointment.patient : appointment.doctor;
  const statusColors = {
    idle: 'text-gray-400', waiting: 'text-yellow-400 animate-pulse',
    connecting: 'text-blue-400 animate-pulse', connected: 'text-emerald-400', ended: 'text-red-400'
  };
  const statusLabels = {
    idle: 'Not started', waiting: 'Waiting for other participant...',
    connecting: 'Connecting...', connected: 'Connected', ended: 'Call ended'
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border border-gray-700">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
            {otherPerson?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{isDoctor ? '' : 'Dr. '}{otherPerson?.name}</p>
            <p className="text-xs text-gray-400">{isDoctor ? appointment.patient?.phone : appointment.doctor?.specialization}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaCircle className={`text-xs ${statusColors[callStatus]}`} />
          <span className={`text-xs font-medium ${statusColors[callStatus]}`}>{statusLabels[callStatus]}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col bg-gray-900 relative">

          {/* Remote Video */}
          <div className="flex-1 relative bg-gray-950 flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {callStatus !== 'connected' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl text-gray-400">
                  <FaUser />
                </div>
                <p className="text-gray-400 text-sm font-medium">{statusLabels[callStatus]}</p>
              </div>
            )}
            {/* Local Video PiP */}
            <div className="absolute bottom-4 right-4 w-36 h-28 rounded-xl overflow-hidden border-2 border-gray-600 shadow-xl bg-gray-800">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {!camOn && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <FaVideoSlash className="text-gray-400 text-xl" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">
            {callStatus === 'idle' && (
              <>
                <button onClick={startCall} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg">
                  <FaVideo /> Start Call
                </button>
                <button onClick={joinCall} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg">
                  <FaVideo /> Join Call
                </button>
              </>
            )}

            {(callStatus === 'waiting' || callStatus === 'connecting' || callStatus === 'connected') && (
              <>
                <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${micOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>
                <button onClick={toggleCam} className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${camOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {camOn ? <FaVideo /> : <FaVideoSlash />}
                </button>
                {isDoctor && (
                  <button onClick={() => setShowPrescription(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-md">
                    <FaFileMedical /> Prescription
                  </button>
                )}
                <button onClick={endCall} className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow-md">
                  <FaPhoneSlash />
                </button>
              </>
            )}

            {callStatus === 'ended' && (
              <div className="flex items-center gap-4">
                <p className="text-gray-400 text-sm">Call has ended</p>
                <button onClick={() => navigate(isDoctor ? '/doctor/appointments' : '/patient/appointments')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">
                  Back to Appointments
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-semibold text-sm">Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-4">No messages yet. Say hello!</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'}`}>
                <p className="text-xs text-gray-500 mb-1">{msg.mine ? 'You' : msg.sender}</p>
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${msg.mine ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-700 flex gap-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white w-9 h-9 rounded-xl flex items-center justify-center transition flex-shrink-0">
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescription && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FaFileMedical className="text-indigo-500" /> Create Prescription</h2>
              <button onClick={() => setShowPrescription(false)} className="text-gray-400 hover:text-gray-600 p-1"><FaTimes /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Patient</label>
                <p className="text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl text-sm">{appointment.patient?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diagnosis <span className="text-red-400">*</span></label>
                <textarea rows={3} value={prescription.diagnosis} onChange={e => setPrescription(p => ({ ...p, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medicines</label>
                <div className="space-y-2">
                  {prescription.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <input placeholder="Medicine name" value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                      <input placeholder="Dosage" value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                      <input placeholder="Duration" value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                      <input placeholder="Instructions" value={med.instructions} onChange={e => updateMed(idx, 'instructions', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                    </div>
                  ))}
                </div>
                <button onClick={() => setPrescription(p => ({ ...p, medicines: [...p.medicines, { name: '', dosage: '', duration: '', instructions: '' }] }))}
                  className="mt-2 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                  <FaPlus className="text-xs" /> Add Medicine
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Advice / Notes</label>
                <textarea rows={3} value={prescription.advice} onChange={e => setPrescription(p => ({ ...p, advice: e.target.value }))}
                  placeholder="Medical advice for patient..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-gray-50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={submitPrescription} disabled={prescSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {prescSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</> : <><FaFileMedical /> Send Prescription</>}
                </button>
                <button onClick={() => setShowPrescription(false)} className="px-6 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
