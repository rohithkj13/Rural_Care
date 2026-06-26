import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { bloodAPI } from '../services/api';
import { FaTint, FaTrash, FaCheck, FaTimes, FaAmbulance, FaUserSlash, FaSearch, FaExclamationCircle, FaDownload } from 'react-icons/fa';

export default function AdminBloodDonors() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, r] = await Promise.all([
        bloodAPI.getAllDonorsAdmin(),
        bloodAPI.getAllRequestsAdmin()
      ]);
      setDonors(d.data.data || []);
      setRequests(r.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeDonor = async (id) => {
    if (!window.confirm('Are you sure you want to completely remove this donor?')) return;
    try {
      await bloodAPI.deleteDonor(id);
      load();
    } catch (err) { }
  };

  const updateDonorStatus = async (id, status) => {
    try {
      await bloodAPI.updateDonor(id, { status });
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to update donor status. Please try again.');
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await bloodAPI.updateRequestStatus(id, { status });
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to update request status. Please try again.');
    }
  };

  const filteredDonors = donors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.bloodGroup.includes(search));

  const downloadCSV = () => {
    let csv = 'Name,Blood Group,Location,Phone,Age,Availability,Points,Badges,Last Donation Date\n';
    donors.forEach(d => {
      csv += `"${d.name}","${d.bloodGroup}","${d.location}","${d.phone}","${d.age}","${d.availability}","${d.points || 0}","${(d.badges || []).join(';')}","${d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'Never'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood_donors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <FaTint className="text-red-500" /> Blood Network Control
            </h1>
            <p className="text-gray-500 mt-2">Manage all registered blood donors, intercept emergency requests, and clear inactive profiles.</p>
          </div>
          <button onClick={downloadCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2">
            <FaDownload /> Download Report (CSV)
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-blue-500">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Donors</p><p className="text-3xl font-black text-gray-900 mt-1">{donors.length}</p></div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><FaUserSlash size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">System Requests</p><p className="text-3xl font-black text-gray-900 mt-1">{requests.length}</p></div>
            <div className="p-3 bg-red-50 rounded-xl text-red-500"><FaAmbulance size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Active Supply</p><p className="text-3xl font-black text-gray-900 mt-1">{donors.filter(d => d.availability === 'available').length}</p></div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500"><FaCheck size={24} /></div>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-8">

          {/* Donors Panel */}
          <div className="bg-white border text-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-extrabold flex items-center gap-2"><FaUserSlash className="text-gray-400" /> Registered Donors</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or group" className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? <div className="p-4 text-center text-gray-400 animate-pulse font-bold">Loading records...</div> : filteredDonors.map((d) => (
                <div key={d._id} className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-xl border border-red-100">{d.bloodGroup}</div>
                    <div>
                      <div className="font-bold text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{d.phone} • {d.location}</div>
                      <div className={`text-[10px] font-bold uppercase mt-1 ${d.status === 'approved' ? 'text-emerald-500' :
                          d.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                        }`}>Status: {d.status}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {d.status === 'pending' && (
                      <>
                        <button onClick={() => updateDonorStatus(d._id, 'approved')} className="text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition border border-emerald-200"><FaCheck className="inline mr-1" /> Approve</button>
                        <button onClick={() => updateDonorStatus(d._id, 'rejected')} className="text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white px-3 py-1.5 rounded-lg transition border border-gray-200"><FaTimes className="inline mr-1" /> Reject</button>
                      </>
                    )}
                    <button onClick={() => removeDonor(d._id)} className="text-red-400 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition shadow-sm border border-red-50 text-xs font-bold" title="Remove Profile"><FaTrash className="inline mr-1" /> Delete</button>
                  </div>
                </div>
              ))}
              {filteredDonors.length === 0 && !loading && <div className="text-center py-10 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">No active donors found matching criteria.</div>}
            </div>
          </div>

          {/* Requests Panel */}
          <div className="bg-white border text-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-extrabold flex items-center gap-2"><FaAmbulance className="text-gray-400" /> System Blood Requests</h2>
              <p className="text-xs text-gray-500 mt-1">Monitor lifecycle from Pending to Completed.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? <div className="p-4 text-center text-gray-400 animate-pulse font-bold">Loading records...</div> : requests.map((r) => (
                <div key={r._id} className={`border rounded-2xl p-4 border-gray-100 shadow-sm relative overflow-hidden transition ${r.emergency ? 'bg-red-50/50 hover:bg-red-50 border-red-100' : 'bg-white hover:bg-gray-50'}`}>
                  {r.emergency && <div className="absolute top-4 right-4 text-red-500 animate-pulse"><FaExclamationCircle size={20} /></div>}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-black text-lg text-gray-900 bg-gray-100 px-2 rounded mr-2">{r.bloodGroup}</span>
                      <span className={`text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            r.status === 'cancelled' ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'
                        }`}>{r.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-bold text-gray-800">{r.hospitalName || r.location} — {r.units} Units</p>
                    <p className="text-xs text-gray-500"><span className="font-bold">Requested By:</span> {r.requestedBy?.name || 'Unknown'}</p>
                    {r.donor && <p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">Accepted By: {r.donor.name}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {r.status === 'pending' || r.status === 'open' ? (
                      <>
                        {/* Force Accept or Cancel */}
                        <button onClick={() => updateRequestStatus(r._id, 'accepted')} className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition border border-blue-200"><FaCheck className="inline mr-1" /> Force Accept</button>
                        <button onClick={() => updateRequestStatus(r._id, 'cancelled')} className="text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white px-3 py-1.5 rounded-lg transition border border-gray-200"><FaTimes className="inline mr-1" /> Cancel</button>
                      </>
                    ) : r.status === 'accepted' ? (
                      <>
                        <button onClick={() => updateRequestStatus(r._id, 'completed')} className="text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition border border-emerald-200"><FaCheck className="inline mr-1" /> Mark Completed</button>
                        <button onClick={() => updateRequestStatus(r._id, 'cancelled')} className="text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white px-3 py-1.5 rounded-lg transition border border-gray-200"><FaTimes className="inline mr-1" /> Cancel</button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Admin Actions Available</div>
                    )}
                  </div>
                </div>
              ))}
              {requests.length === 0 && !loading && <div className="text-center py-10 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">System is clear. No requests in server.</div>}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
