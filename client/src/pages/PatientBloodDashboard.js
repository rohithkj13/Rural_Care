import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAmbulance, FaHistory, FaUserAlt, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaComments, FaPaperPlane, FaTimes, FaWhatsapp, FaEnvelope, FaPhoneAlt, FaTint, FaMap } from 'react-icons/fa';
import { bloodAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const initialRequest = { bloodGroup: 'O+', location: '', units: 1, purpose: '', emergency: false, hospitalName: '', patientCondition: '', contactPerson: '', deadline: '', emergencyLevel: 'medium' };
const initialDonor = { bloodGroup: 'O+', age: '', weight: '', location: '', phone: '', availability: 'available', medicalStatus: '', lastDonationDate: '', recentIllness: false };

export default function PatientBloodDashboard() {
  const { user, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('raise'); // raise, history, optin
  const [myRequests, setMyRequests] = useState([]);
  const [requestForm, setRequestForm] = useState(initialRequest);
  const [donorForm, setDonorForm] = useState(initialDonor);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  // Chat State
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await bloodAPI.getMyRequests();
      setMyRequests(res.data.data || []);
      // Sync user context in case donor status changed natively
      fetchUser();
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  useEffect(() => {
    socket.on('receive-message', (data) => setMessages(prev => [...prev, data]));
    socket.on('blood-request-updated', (updatedReq) => {
      setMyRequests(prev => {
        const isMine = prev.some(r => r._id === updatedReq._id);
        if (isMine) {
          if (updatedReq.status === 'accepted') notify("🔔 A donor has accepted your blood request!");
          else if (updatedReq.status === 'completed') notify("🎉 Your blood donation request has been successfully completed!");
          return prev.map(r => r._id === updatedReq._id ? updatedReq : r);
        }
        return prev;
      });
    });
    return () => {
      socket.off('receive-message');
      socket.off('blood-request-updated');
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const openChat = (request) => {
    const roomId = `blood_request_${request._id}`;
    socket.emit('join-room', roomId);
    setActiveChat({
      roomId,
      title: `Chat with ${request.donor?.name || 'Donor'} regarding ${request.bloodGroup}`,
      recipientName: request.donor?.name || 'Donor'
    });
    setMessages([]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    const msgData = {
      roomId: activeChat.roomId, text: messageInput, sender: 'me',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    socket.emit('send-message', { ...msgData, sender: 'them' });
    setMessages(prev => [...prev, msgData]);
    setMessageInput('');
  };

  const createRequest = async (e) => {
    e.preventDefault();
    try {
      await bloodAPI.createRequest({ ...requestForm, units: Number(requestForm.units) });
      setRequestForm(initialRequest);
      notify('Blood request submitted successfully!');
      loadData();
      setActiveTab('history');
    } catch (error) {
       notify(error.response?.data?.message || 'Failed to submit request.');
    }
  };

  const handleDonorRegister = async (e) => {
    e.preventDefault();
    try {
      await bloodAPI.registerDonor({ ...donorForm, name: user.name, age: Number(donorForm.age) });
      notify('Application submitted! Pending Admin Approval.');
      await fetchUser(); // Updates user.donorStatus
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to submit donor application.');
    }
  };

  const TabBtn = ({ id, icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`px-4 py-3 font-semibold text-sm rounded-t-xl border-b-2 flex items-center gap-2 transition-colors ${
        activeTab === id ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'
      }`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <FaCheckCircle className="text-emerald-400" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Chat window */}
      {activeChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-t-xl rounded-bl-xl shadow-2xl z-50 flex flex-col overflow-hidden h-[400px]">
          <div className="bg-gray-900 text-white p-3 flex justify-between items-center z-10 shadow-md">
            <div>
              <p className="font-bold text-sm">Chat with Donor</p>
              <p className="text-[10px] text-gray-300">{activeChat.recipientName}</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
          </div>
          <div className="flex-1 p-3 bg-gray-50 overflow-y-auto space-y-3">
            {messages.length === 0 && <p className="text-xs text-center text-gray-400 mt-4">Start chatting...</p>}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`px-3 py-2 text-sm shadow-sm ${m.sender === 'me' ? 'bg-red-600 text-white rounded-2xl rounded-br-none' : 'bg-white border text-gray-800 rounded-2xl rounded-bl-none'}`}>{m.text}</div>
                <span className="text-[10px] text-gray-400 mt-0.5">{m.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-2 border-t flex bg-white">
            <input value={messageInput} onChange={e=>setMessageInput(e.target.value)} placeholder="Type..." className="flex-1 bg-gray-100 px-3 py-2 rounded-l-xl text-sm focus:outline-none" />
            <button className="bg-red-600 text-white px-4 py-2 rounded-r-xl"><FaPaperPlane size={12} /></button>
          </form>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white rounded-3xl p-8 overflow-hidden shadow-xl">
          <FaTint className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-8 -translate-y-8" size={200} />
          <div className="relative z-10 flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-extrabold flex items-center gap-3">Patient Blood Network</h1>
               <p className="text-red-100 mt-2 max-w-lg">Raise emergency requests and get matched with highly verified donors.</p>
             </div>
             <Link to="/patient/dashboard" className="bg-white text-red-600 px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-gray-50 transition">Dashboard</Link>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
           <TabBtn id="raise" icon={<FaAmbulance />} label="Raise Request" />
           <TabBtn id="history" icon={<FaHistory />} label="My Requests" />
           <TabBtn id="optin" icon={<FaUserAlt />} label="Become a Donor" />
        </div>

        <div className="bg-white rounded-3xl rounded-tl-none shadow border border-gray-200 p-6 md:p-8 min-h-[500px]">
           {loading ? <div className="text-center py-10 font-bold text-gray-400 animate-pulse">Loading data...</div> : 
           activeTab === 'raise' ? (
             <form onSubmit={createRequest} className="bg-red-50 p-6 md:p-8 rounded-3xl border border-red-100 shadow-sm space-y-6 max-w-2xl mx-auto">
                <div className="text-center border-b border-red-200 pb-4">
                   <h2 className="text-2xl font-extrabold text-red-900 flex justify-center items-center gap-2"><FaExclamationTriangle /> Urgent Request</h2>
                   <p className="text-sm text-red-700 mt-1">Donors belonging to the matching blood group will be instantly notified.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full border-red-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-red-500 font-bold" value={requestForm.bloodGroup} onChange={(e) => setRequestForm((f) => ({ ...f, bloodGroup: e.target.value }))}>{GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
                  <input className="w-full border-red-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-red-500 font-medium" type="number" min="1" placeholder="Units required" value={requestForm.units} onChange={(e) => setRequestForm((f) => ({ ...f, units: e.target.value }))} />
                </div>
                <input className="w-full border-red-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-red-500 font-medium" placeholder="Hospital & City" value={requestForm.hospitalName} onChange={(e) => setRequestForm((f) => ({ ...f, hospitalName: e.target.value, location: e.target.value }))} required />
                <input className="w-full border-red-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-red-500 font-medium" placeholder="Patient condition (e.g. Surgery)" value={requestForm.patientCondition} onChange={(e) => setRequestForm((f) => ({ ...f, patientCondition: e.target.value, purpose: e.target.value }))} required />
                <input className="w-full border-red-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-red-500 font-medium" placeholder="Contact Person Phone" value={requestForm.contactPerson} onChange={(e) => setRequestForm((f) => ({ ...f, contactPerson: e.target.value }))} required />
                
                <label className="flex items-center gap-3 text-sm font-bold text-red-900 bg-white p-4 rounded-xl border border-red-200 cursor-pointer shadow-sm">
                  <input type="checkbox" className="w-5 h-5 text-red-600 rounded ring-0" checked={requestForm.emergency} onChange={(e) => setRequestForm((f) => ({ ...f, emergency: e.target.checked }))} />
                  Mark as Critical Emergency Broadcast
                </label>
                
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-4 rounded-xl font-bold shadow-lg transition uppercase tracking-wide">Submit Emergency Alert</button>
             </form>
           ) : activeTab === 'history' ? (
             <div className="space-y-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-extrabold text-gray-900 border-b border-gray-200 pb-4">My Requests History</h2>
                <div className="space-y-4">
                  {myRequests.map((r) => (
                    <div key={r._id} className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-6 justify-between transition shadow-sm hover:shadow-md ${r.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200'}`}>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-black text-2xl text-gray-900">{r.bloodGroup}</span>
                            <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                              r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              r.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              r.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'
                            }`}>Status: {r.status}</span>
                            {r.emergency && <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">Emergency</span>}
                          </div>
                          <p className="text-sm font-bold text-gray-800">{r.hospitalName || r.location}</p>
                          <p className="text-sm text-gray-500 mt-1">{r.units} Units Required</p>
                          
                          <div className="mt-4 bg-gray-50 border border-gray-100 p-3 rounded-xl space-y-1 inline-block min-w-[200px]">
                            <p className="text-xs text-gray-500 font-medium flex justify-between gap-4"><strong>Created:</strong> {new Date(r.createdAt).toLocaleDateString()}</p>
                            {r.acceptedAt && <p className="text-xs text-blue-600 font-medium flex justify-between gap-4"><strong>Accepted:</strong> {new Date(r.acceptedAt).toLocaleDateString()}</p>}
                            {r.completedAt && <p className="text-xs text-emerald-600 font-medium flex justify-between gap-4"><strong>Completed:</strong> {new Date(r.completedAt).toLocaleDateString()}</p>}
                          </div>
                       </div>
                       <div className="shrink-0 md:w-64 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                          {r.status === 'accepted' && r.donor ? (
                             <div className="space-y-2">
                               <p className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1.5"><FaCheckCircle/> Donor Secured</p>
                               <p className="font-bold text-gray-900 text-sm">{r.donor.name}</p>
                               <div className="flex flex-col gap-2 pt-2">
                                 <a href={`tel:${r.donor.phone}`} className="flex items-center justify-center gap-2 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg transition"><FaPhoneAlt /> Call Donor</a>
                                 <button onClick={() => openChat(r)} className="flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black py-2 rounded-lg text-xs font-bold transition shadow-md"><FaComments /> Secure Chat</button>
                               </div>
                             </div>
                          ) : r.status === 'completed' && r.donor ? (
                             <div className="text-center text-gray-400">
                               <FaCheckCircle className="mx-auto text-2xl text-emerald-400 mb-2" />
                               <p className="font-bold text-sm text-gray-700">Donation Complete</p>
                               <p className="text-xs">Thanks to {r.donor.name}!</p>
                             </div>
                          ) : (
                             <div className="text-center text-gray-400">
                               <FaUserAlt className="mx-auto text-2xl mb-2 opacity-30 text-amber-500" />
                               <p className="text-xs font-bold text-amber-600 uppercase mb-1">Status: Pending</p>
                               <p className="text-xs font-medium">Auto-broadcasting to Donors</p>
                             </div>
                          )}
                       </div>
                    </div>
                  ))}
                  {myRequests.length === 0 && <div className="text-center py-10 text-gray-500 border border-gray-100 rounded-3xl bg-gray-50">You have no requests.</div>}
                </div>
             </div>
           ) : activeTab === 'optin' ? (
             <div className="max-w-2xl mx-auto text-center space-y-6">
                <div>
                   <h2 className="text-2xl font-extrabold text-gray-900">Become a Donor</h2>
                   <p className="text-gray-500 text-sm mt-2">Verified donors unlock an exclusive dashboard and receive live SOS broadcasts.</p>
                </div>
                
                {user?.isDonor || user?.donorStatus === 'approved' ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-emerald-800">
                     <FaCheckCircle className="mx-auto text-4xl mb-4 text-emerald-500" />
                     <h3 className="text-xl font-bold mb-2">You are an Approved Donor</h3>
                     <p className="mb-6">Thank you for your commitment to saving lives.</p>
                     <Link to="/donor/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition">Access Donor Dashboard</Link>
                  </div>
                ) : user?.donorStatus === 'pending' ? (
                  <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl text-amber-800">
                     <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent mx-auto rounded-full animate-spin mb-4" />
                     <h3 className="text-xl font-bold mb-2">Application Pending Review</h3>
                     <p>An admin is currently verifying your medical eligibility. Check back here soon!</p>
                  </div>
                ) : user?.donorStatus === 'rejected' ? (
                  <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-red-800">
                     <FaTimes className="mx-auto text-4xl mb-4 text-red-500" />
                     <h3 className="text-xl font-bold mb-2">Application Rejected</h3>
                     <p>Unfortunately, your application did not meet our strict medical criteria.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDonorRegister} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5 text-left">
                     <div className="grid grid-cols-2 gap-4">
                       <select className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500" value={donorForm.bloodGroup} onChange={e=>setDonorForm(f=>({...f, bloodGroup: e.target.value}))}>{GROUPS.map(g=><option key={g}>{g}</option>)}</select>
                       <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" type="number" min="18" placeholder="Age (>18)" value={donorForm.age} onChange={e=>setDonorForm(f=>({...f, age: e.target.value}))} required />
                     </div>
                     <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" type="number" min="50" placeholder="Weight in kg (>50kg)" value={donorForm.weight} onChange={e=>setDonorForm(f=>({...f, weight: e.target.value}))} required />
                     <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" placeholder="City" value={donorForm.location} onChange={e=>setDonorForm(f=>({...f, location: e.target.value}))} required />
                     <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Contact Phone" value={donorForm.phone} onChange={e=>setDonorForm(f=>({...f, phone: e.target.value}))} required />
                     
                     <label className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-red-50 p-4 rounded-xl border border-red-100 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-red-600 rounded" checked={donorForm.recentIllness} onChange={e=>setDonorForm(f=>({...f, recentIllness: e.target.checked}))} />
                        Severe illness / surgery in the last 30 days?
                     </label>

                     <button className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition shadow-lg mt-2">Submit Medical Profile for Approval</button>
                  </form>
                )}
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
}
