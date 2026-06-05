const BloodDonor = require('../models/BloodDonor');
const BloodRequest = require('../models/BloodRequest');

exports.registerDonor = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user) payload.userId = req.user.id;

    if (Number(payload.age) < 18 || Number(payload.weight) < 50 || payload.recentIllness === true || payload.recentIllness === 'true') {
      payload.availability = 'unavailable';
      payload.medicalStatus = payload.medicalStatus || 'Flagged ineligible: age < 18, weight < 50kg, or recent illness.';
    }

    const donor = await BloodDonor.create(payload);

    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { isDonor: true, donorStatus: 'approved' });
    }

    res.status(201).json({ success: true, data: donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDonors = async (req, res) => {
  try {
    const { bloodGroup, location, search } = req.query;
    const query = { isActive: true };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    const donors = await BloodDonor.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyDonorProfile = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ userId: req.user.id });
    res.json({ success: true, data: donor || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMyDonorProfile = async (req, res) => {
  try {
    const donor = await BloodDonor.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });
    res.json({ success: true, data: donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDonor = async (req, res) => {
  try {
    const donor = await BloodDonor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    if (req.body.status && donor.userId) {
      const User = require('../models/User');
      const isDonor = req.body.status === 'approved';
      await User.findByIdAndUpdate(donor.userId, { isDonor, donorStatus: req.body.status });
    }

    res.json({ success: true, data: donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const donor = await BloodDonor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, message: 'Donor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBloodStats = async (req, res) => {
  try {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const stats = await Promise.all(
      groups.map(async (g) => ({
        group: g,
        count: await BloodDonor.countDocuments({ bloodGroup: g, isActive: true, availability: 'available' })
      }))
    );
    const emergencyToday = await BloodRequest.countDocuments({
      emergency: true,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const totalDonors = await BloodDonor.countDocuments({ isActive: true });
    res.json({ success: true, data: { stats, emergencyToday, totalDonors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const data = { ...req.body, requestedBy: req.user.id };
    // Sync location from hospitalName if location not provided separately
    if (!data.location && data.hospitalName) data.location = data.hospitalName;
    const request = await BloodRequest.create(data);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.id })
      .populate('donor', 'name bloodGroup location phone availability')
      .sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const query = {};
    if (req.query.emergency === 'true') query.emergency = true;
    if (req.query.status) query.status = req.query.status;
    const requests = await BloodRequest.find(query)
      .populate('requestedBy', 'name phone')
      .populate('donor', 'name bloodGroup location phone')
      .sort({ emergency: -1, createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, donorId } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (status === 'accepted' && !isAdmin) {
      // Patient/donor eligibility check
      const donorQuery = donorId ? { _id: donorId } : { userId: req.user.id };
      const donor = await BloodDonor.findOne(donorQuery);

      if (!donor) {
        return res.status(400).json({
          success: false,
          message: 'You must register as a donor first before accepting a request.'
        });
      }
      if (donor.availability !== 'available') {
        return res.status(400).json({ success: false, message: 'Your availability must be set to "available" to accept requests.' });
      }
      if (donor.lastDonationDate) {
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24));
        if (diffDays < 90) {
          return res.status(400).json({ success: false, message: `You donated ${diffDays} days ago. Must wait 90 days between donations.` });
        }
      }

      const update = { status, donor: donor._id, acceptedAt: new Date() };
      const request = await BloodRequest.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('donor', 'name bloodGroup location phone');
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
      if (req.io) req.io.emit('blood-request-updated', request);
      return res.json({ success: true, data: request });
    }

    // Admin or non-accepted status: direct update, no eligibility check
    const update = { status };
    if (status === 'accepted') update.acceptedAt = new Date();
    if (status === 'completed') update.completedAt = new Date();

    const request = await BloodRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('donor', 'name bloodGroup location phone');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Gamification on completion
    if (status === 'completed' && request.donor) {
      const donorDoc = await BloodDonor.findById(request.donor._id || request.donor);
      if (donorDoc) {
        donorDoc.points = (donorDoc.points || 0) + 10;
        donorDoc.donationCount = (donorDoc.donationCount || 0) + 1;
        donorDoc.lastDonationDate = new Date();
        if (donorDoc.donationCount >= 3 && !donorDoc.badges.includes('Hero Donor')) donorDoc.badges.push('Hero Donor');
        if (donorDoc.donationCount >= 5 && !donorDoc.badges.includes('Life Saver')) donorDoc.badges.push('Life Saver');
        if (request.emergency && !donorDoc.badges.includes('Emergency Responder')) donorDoc.badges.push('Emergency Responder');
        await donorDoc.save();
      }
    }

    if (req.io) req.io.emit('blood-request-updated', request);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRequestsAdmin = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requestedBy', 'name email phone')
      .populate('donor', 'name bloodGroup location phone')
      .sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDonorsAdmin = async (req, res) => {
  try {
    const donors = await BloodDonor.find()
      .populate('userId', 'email isDonor donorStatus')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
