export const users = [
  { username: 'fatima', password: '1223' },
  { username: 'hawra', password: '1122' },
  { username: 'wala', password: '1199' },
  { username: 'fatimah', password: '1124' },
  { username: 'zahra', password: '2211' },
  { username: 'raghad', password: '3344' },
];

export const pillInteractions = {
  Aldactone: '(Spironolactone) Interacts with Panadol Extra and Solpadeine.',
  Clarinase: 'No known interactions.',
  Solpadeine: 'Interacts with Aldactone.',
  'Panadol Extra': 'Interacts with Aldactone.',
  Ticanase: 'Interacts with Ketoconazole.',
  Ketoconazole: 'Interacts with Ticanase, Solpadeine, and Panadol Extra.',
  Aspirin: 'Interacts with Klavox.',
  Ventolin: 'No interactions.',
  Klavox: 'Interacts with Aspirin.',
  'Vitamin C': 'No interactions.',
  Paracetamol: 'Generally safe with most pills, avoid alcohol.',
  Ibuprofen: 'Can interact with blood pressure medications.',
  Metformin: 'No common interactions with listed pills.',
  Amoxicillin: 'No common interactions in this list.',
  Celecoxib: 'Avoid if taking blood thinners or aspirin.',
  Omeprazole: 'Used for acid reflux, generally safe with listed pills.',
  Amlodipine: 'Blood pressure medication; avoid with some painkillers.',
  Atorvastatin: 'No major interactions with the current list.',
  Hydrochlorothiazide: 'Blood pressure pill; check with doctor when combining with NSAIDs.',
};

export const interactionPairs = {
  Aldactone: ['Panadol Extra', 'Solpadeine'],
  Solpadeine: ['Aldactone', 'Ketoconazole'],
  'Panadol Extra': ['Aldactone', 'Ketoconazole'],
  Ticanase: ['Ketoconazole'],
  Ketoconazole: ['Ticanase', 'Solpadeine', 'Panadol Extra'],
  Aspirin: ['Klavox', 'Ibuprofen'],
  Klavox: ['Aspirin'],
  Ibuprofen: ['Amlodipine', 'Hydrochlorothiazide', 'Aspirin'],
  Hydrochlorothiazide: ['Ibuprofen'],
  Celecoxib: ['Aspirin', 'Ibuprofen'],
};

export const medicineSuggestions = [
  'Aldactone',
  'Clarinase',
  'Solpadeine',
  'Panadol Extra',
  'Ticanase',
  'Ketoconazole',
  'Aspirin',
  'Ventolin',
  'Klavox',
  'Vitamin C',
  'Paracetamol',
  'Ibuprofen',
  'Metformin',
  'Amoxicillin',
  'Celecoxib',
  'Omeprazole',
  'Amlodipine',
  'Atorvastatin',
  'Hydrochlorothiazide',
];

export const medicineInstructions = {
  Aldactone: {
    meal: 'Take with food to reduce stomach upset.',
    sideEffects: 'Dizziness, headache, stomach cramps.',
    storage: 'Store at room temperature away from moisture and heat.',
  },
  Clarinase: {
    meal: 'Take after a meal to avoid nausea.',
    sideEffects: 'Dry mouth, drowsiness, headache.',
    storage: 'Keep in a cool, dry place.',
  },
  Solpadeine: {
    meal: 'Take with food or milk.',
    sideEffects: 'Drowsiness, lightheadedness, upset stomach.',
    storage: 'Store at room temperature away from sunlight.',
  },
  'Panadol Extra': {
    meal: 'Can be taken with or without food.',
    sideEffects: 'Nausea, allergic reaction, dizziness.',
    storage: 'Keep tightly closed and dry.',
  },
  Ticanase: {
    meal: 'Usually taken after meals.',
    sideEffects: 'Nausea, headache, diarrhea.',
    storage: 'Keep in a cool, dry place.',
  },
  Ketoconazole: {
    meal: 'Take with food to increase absorption.',
    sideEffects: 'Stomach pain, headache, rash.',
    storage: 'Store at room temperature and avoid direct sunlight.',
  },
  Aspirin: {
    meal: 'Take with food to protect your stomach.',
    sideEffects: 'Stomach pain, heartburn, bleeding.',
    storage: 'Keep in a cool, dry place away from children.',
  },
  Ventolin: {
    meal: 'No food requirement.',
    sideEffects: 'Tremors, headache, rapid heartbeat.',
    storage: 'Store below 30°C and keep inhaler upright.',
  },
  Klavox: {
    meal: 'Take at the start of a meal.',
    sideEffects: 'Diarrhea, nausea, skin rash.',
    storage: 'Keep at room temperature away from moisture.',
  },
  'Vitamin C': {
    meal: 'Best taken with food.',
    sideEffects: 'Stomach upset, diarrhea in high doses.',
    storage: 'Store in a cool, dry place.',
  },
  Paracetamol: {
    meal: 'Can be taken with or without food.',
    sideEffects: 'Nausea, allergic reaction.',
    storage: 'Keep dry and at room temperature.',
  },
  Ibuprofen: {
    meal: 'Take with food or milk to reduce stomach upset.',
    sideEffects: 'Upset stomach, headache, dizziness.',
    storage: 'Store in a cool, dry place.',
  },
  Metformin: {
    meal: 'Take with food to reduce stomach upset.',
    sideEffects: 'Nausea, diarrhea, metallic taste.',
    storage: 'Keep at room temperature.',
  },
  Amoxicillin: {
    meal: 'Can be taken with or without food.',
    sideEffects: 'Diarrhea, nausea, rash.',
    storage: 'Store in a dry place.',
  },
  Celecoxib: {
    meal: 'Take with food to reduce stomach irritation.',
    sideEffects: 'Stomach pain, headache, swelling.',
    storage: 'Keep in a cool, dry place.',
  },
  Omeprazole: {
    meal: 'Take before breakfast.',
    sideEffects: 'Headache, nausea, abdominal pain.',
    storage: 'Store in a dry place at room temperature.',
  },
  Amlodipine: {
    meal: 'Take with or without food.',
    sideEffects: 'Swelling, fatigue, abdominal pain.',
    storage: 'Store at room temperature.',
  },
  Atorvastatin: {
    meal: 'Take in the evening with food.',
    sideEffects: 'Muscle pain, headache, upset stomach.',
    storage: 'Keep away from heat and moisture.',
  },
  Hydrochlorothiazide: {
    meal: 'Take in the morning with food.',
    sideEffects: 'Dizziness, increased urination.',
    storage: 'Store in a cool, dry place.',
  },
};

export const healthTips = [
  'Drink a full glass of water with each pill unless told otherwise.',
  'Keep a list of your medications and share it with your doctor.',
  'Take your pills at the same time every day to build a routine.',
  'If a pill causes stomach upset, take it with food unless instructed otherwise.',
  'Store medications in a cool, dry place away from direct sunlight.',
  'Always read the medication label for special storage instructions.',
  'Check your refill date weekly so you do not run out unexpectedly.',
  'Never mix medications without confirming possible interactions first.',
];

export const emergencyContact = {
  name: 'Emergency Services',
  phone: '911',
};

export const getPillInteraction = (pillName) => {
  return pillInteractions[pillName] || 'No known interactions for this medicine.';
};

export const getInstruction = (pillName) => {
  return medicineInstructions[pillName] || {
    meal: 'Follow your doctor\'s advice.',
    sideEffects: 'Consult your physician for side effects.',
    storage: 'Store in a cool, dry place.',
  };
};

export const getHealthTip = (activePills = []) => {
  if (!activePills || activePills.length === 0) {
    return healthTips[0];
  }

  const matchingTip = healthTips.find((tip) =>
    activePills.some((pill) => tip.toLowerCase().includes(pill.toLowerCase()))
  );

  return matchingTip || healthTips[Math.floor(Math.random() * healthTips.length)];
};

export const checkInteractions = (pillName, activeList = []) => {
  const warnings = [];
  const newPill = pillName.trim();

  if (!newPill) return warnings;

  activeList.forEach((existing) => {
    const existingName = existing.trim();
    if (!existingName || existingName === newPill) return;

    const existingWarnings = interactionPairs[existingName] || [];
    const newWarnings = interactionPairs[newPill] || [];

    if (existingWarnings.includes(newPill) || newWarnings.includes(existingName)) {
      warnings.push(`${newPill} may interact with ${existingName}.`);
    }
  });

  return [...new Set(warnings)];
};

export const calculateAdherenceRate = (pills = []) => {
  if (!Array.isArray(pills) || pills.length === 0) return 0;

  const totalPills = pills.reduce((sum, pill) => sum + (pill.quantity || 0), 0);
  const takenPills = pills.reduce((sum, pill) => sum + ((pill.quantity || 0) - (pill.remaining || 0)), 0);

  return totalPills > 0 ? Math.round((takenPills / totalPills) * 100) : 0;
};

export const getMissedDoses = (pills = []) => {
  return Array.isArray(pills)
    ? pills.filter((pill) => pill.status === 'missed').map((p) => p.name)
    : [];
};

export const getUpcomingPills = (pills = []) => {
  if (!Array.isArray(pills)) return [];

  const now = new Date();
  return pills
    .filter((pill) => pill.status === 'active')
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3);
};

export const generateHealthReport = (pills = [], tasks = []) => {
  const adherenceRate = calculateAdherenceRate(pills);
  const missedDoses = getMissedDoses(pills);
  const totalMedicines = new Set([...tasks, ...pills.map((p) => p.name)]).size;

  return {
    adherenceRate,
    missedDoses,
    missedCount: missedDoses.length,
    totalMedicines,
    activePills: Array.isArray(pills) ? pills.filter((p) => p.status === 'active').length : 0,
    finishedPills: Array.isArray(pills) ? pills.filter((p) => p.status === 'finished').length : 0,
    reportDate: new Date().toISOString(),
  };
};

export const suggestDoctorVisit = (adherenceRate, missedCount) => {
  if (adherenceRate < 50 || missedCount > 5) {
    return 'Adherence is low. Consider visiting your doctor.';
  }
  if (missedCount > 3) {
    return 'You have missed several doses. Keep track better.';
  }
  return 'Great job! Keep up your medication routine.';
};

export const trackSideEffects = (sideEffects = []) => {
  return {
    count: sideEffects.length,
    list: sideEffects,
    severity: sideEffects.length > 2 ? 'High' : sideEffects.length > 0 ? 'Medium' : 'None',
  };
};

export const createPillSchedule = (pills = []) => {
  if (!Array.isArray(pills)) return {};

  const schedule = {};
  pills.forEach((pill) => {
    if (!schedule[pill.time]) {
      schedule[pill.time] = [];
    }
    schedule[pill.time].push(pill.name);
  });

  return schedule;
};

export const getDailyReminders = (pills = []) => {
  const schedule = createPillSchedule(pills);
  return Object.entries(schedule).map(([time, medicines]) => ({
    time,
    medicines,
    count: medicines.length,
  }));
};

export const calculateRefillDates = (pills = []) => {
  return Array.isArray(pills)
    ? pills
        .filter((pill) => pill.remaining > 0)
        .map((pill) => ({
          name: pill.name,
          remaining: pill.remaining,
          daysLeft: Math.ceil(pill.remaining / 1),
          refillDate: new Date(pill.dueDate).toLocaleDateString('en-GB'),
        }))
    : [];
};

export const getHealthScore = (pills = [], tasks = []) => {
  const report = generateHealthReport(pills, tasks);
  const adherenceScore = report.adherenceRate;
  const medicineScore = Math.min(report.totalMedicines * 10, 30);
  const consistencyScore = Math.max(30 - report.missedCount * 5, 0);

  const totalScore = adherenceScore * 0.5 + (medicineScore + consistencyScore) / 2;

  return {
    score: Math.round(totalScore),
    adherenceScore: adherenceScore,
    medicineScore: Math.round(medicineScore),
    consistencyScore: consistencyScore,
    level: totalScore >= 75 ? 'Excellent' : totalScore >= 50 ? 'Good' : 'Needs Improvement',
  };
};

export const preventMedicineDoubleIntake = (pills = [], selectedPill) => {
  if (!Array.isArray(pills)) return true;

  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const alreadyTaken = pills.some((pill) => pill.name === selectedPill && pill.time === currentTime && pill.alerted);

  return !alreadyTaken;
};