const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], default: 'snack' }
}, { _id: false });

const fitnessLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },

  // Activity
  steps: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  activeMinutes: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }, // km

  // Diet
  foodEntries: [foodEntrySchema],
  totalCaloriesConsumed: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 }, // glasses

  // Body
  weight: { type: Number }, // kg
  bmi: { type: Number },

  // Goals (set by doctor or patient)
  goals: {
    steps: { type: Number, default: 10000 },
    calories: { type: Number, default: 2000 },
    water: { type: Number, default: 8 },
    sleep: { type: Number, default: 8 },
    weight: { type: Number }
  },

  // Sleep
  sleepHours: { type: Number, default: 0 },
  sleepQuality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'], default: 'fair' },

  // Mood
  mood: { type: String, enum: ['terrible', 'bad', 'okay', 'good', 'great'], default: 'okay' },

  // Workouts
  workouts: [{
    type: { type: String },
    duration: { type: Number },
    caloriesBurned: { type: Number, default: 0 },
    notes: { type: String }
  }],

  // Streak
  streak: { type: Number, default: 0 },

  notes: { type: String },
  doctorNotes: { type: String }
}, { timestamps: true });

// One log per patient per day
fitnessLogSchema.index({ patient: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FitnessLog', fitnessLogSchema);
