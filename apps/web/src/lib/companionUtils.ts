export interface Companion {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
  gamesPlayed: number;
  achievements: number;
  hoursPlayed: number;
  specialties: string[];
  bio: string;
  experience: string;
  pricePerHour: number;
  lastSeen: string;
}

// Register a new companion
export const registerCompanion = (userData: {
  username: string;
  email: string;
  gamesPlayed?: number;
  achievements?: number;
  hoursPlayed?: number;
  specialties?: string[];
  bio?: string;
  experience?: string;
  pricePerHour?: number;
}) => {
  const companions = getAllCompanions();
  
  const newCompanion: Companion = {
    id: generateId(),
    username: userData.username,
    email: userData.email,
    isOnline: true,
    gamesPlayed: userData.gamesPlayed || 156,
    achievements: userData.achievements || 89,
    hoursPlayed: userData.hoursPlayed || 1247,
    specialties: userData.specialties || ['FPS', 'RPG', 'Strategy'],
    bio: userData.bio || 'Passionate gamer looking for teammates!',
    experience: userData.experience || 'intermediate',
    pricePerHour: userData.pricePerHour || 10,
    lastSeen: new Date().toISOString()
  };
  
  // Check if companion already exists
  const existingIndex = companions.findIndex(c => c.email === userData.email);
  if (existingIndex >= 0) {
    companions[existingIndex] = { ...companions[existingIndex], ...newCompanion };
  } else {
    companions.push(newCompanion);
  }
  
  localStorage.setItem('companions', JSON.stringify(companions));
  return newCompanion;
};

// Update companion online status
export const updateCompanionStatus = (email: string, isOnline: boolean) => {
  const companions = getAllCompanions();
  const companionIndex = companions.findIndex(c => c.email === email);
  
  if (companionIndex >= 0) {
    companions[companionIndex].isOnline = isOnline;
    companions[companionIndex].lastSeen = new Date().toISOString();
    localStorage.setItem('companions', JSON.stringify(companions));
  }
};

// Remove companion
export const removeCompanion = (email: string) => {
  const companions = getAllCompanions();
  const filteredCompanions = companions.filter(c => c.email !== email);
  localStorage.setItem('companions', JSON.stringify(filteredCompanions));
};

// Get all companions
export const getAllCompanions = (): Companion[] => {
  try {
    const data = localStorage.getItem('companions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading companions:', error);
    return [];
  }
};

// Get online companions only
export const getOnlineCompanions = (): Companion[] => {
  return getAllCompanions().filter(c => c.isOnline);
};

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Clean up old companions (offline for more than 24 hours)
export const cleanupOldCompanions = () => {
  const companions = getAllCompanions();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const activeCompanions = companions.filter(companion => {
    const lastSeen = new Date(companion.lastSeen);
    return companion.isOnline || lastSeen > oneDayAgo;
  });
  
  localStorage.setItem('companions', JSON.stringify(activeCompanions));
}; 