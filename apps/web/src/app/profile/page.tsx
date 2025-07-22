'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { registerCompanion, updateCompanionStatus, removeCompanion } from '@/lib/companionUtils';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';

interface UserData {
  username: string;
  email: string;
}

interface CompanionFormData {
  gamesPlayed: number;
  achievements: number;
  hoursPlayed: number;
  selectedGames: string[];
  bio: string;
  experience: string;
  pricePerHour: number;
}

const availableGames = [
  { id: 'League of Legends', name: 'League of Legends', genre: 'MOBA', description: 'A multiplayer online battle arena video game.' },
  { id: 'Valorant', name: 'Valorant', genre: 'FPS', description: 'A tactical first-person hero shooter game.' },
  { id: 'PUBG', name: 'PUBG', genre: 'Battle Royale', description: 'PlayerUnknown\'s Battlegrounds - a battle royale game.' }
];

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData>({
    username: '',
    email: ''
  });
  const [isCompanion, setIsCompanion] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showCompanionForm, setShowCompanionForm] = useState(false);
  const [companionForm, setCompanionForm] = useState<CompanionFormData>({
    gamesPlayed: 50,
    achievements: 25,
    hoursPlayed: 500,
    selectedGames: [],
    bio: '',
    experience: 'beginner',
    pricePerHour: 10,
  });
  const [voiceSample, setVoiceSample] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const email = localStorage.getItem('userEmail') || '';
    const username = email ? (localStorage.getItem(`username_${email}`) || '') : '';
    const companionStatus = localStorage.getItem('isCompanion') === 'true';
    const onlineStatus = localStorage.getItem('isOnline') === 'true';
    
    setUserData({ username, email });
    setEditedData({ username, email });
    setIsCompanion(companionStatus);
    setIsOnline(onlineStatus);
  }, []);

  useEffect(() => {
    // Load voice sample from localStorage if exists
    if (userData.email) {
      const sample = localStorage.getItem(`voiceSample_${userData.email}`);
      if (sample) setVoiceSample(sample);
    }
    // Load profile image
    if (userData.email) {
      const img = localStorage.getItem(`profileImage_${userData.email}`);
      if (img) setProfileImage(img);
    }
  }, [userData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  const handleCompanionFormChange = (field: keyof CompanionFormData, value: any) => {
    setCompanionForm({
      ...companionForm,
      [field]: value
    });
  };

  const handleGameSelection = (gameId: string) => {
    const updatedGames = companionForm.selectedGames.includes(gameId)
      ? companionForm.selectedGames.filter(id => id !== gameId)
      : [...companionForm.selectedGames, gameId];
    
    handleCompanionFormChange('selectedGames', updatedGames);
  };

  const handleSave = () => {
    // Save updated data to localStorage
    localStorage.setItem('username', editedData.username);
    if (editedData.email) {
      localStorage.setItem(`username_${editedData.email}`, editedData.username);
    }
    setUserData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleBecomeCompanion = () => {
    if (!userData.username || !userData.email) {
      alert('Please set your username and email first!');
      return;
    }
    setShowCompanionForm(true);
  };

  const handleSubmitCompanionForm = () => {
    if (companionForm.selectedGames.length === 0) {
      alert('Please select at least one game you want to play!');
      return;
    }

    if (!companionForm.bio.trim()) {
      alert('Please add a short bio about yourself!');
      return;
    }

    if (companionForm.pricePerHour <= 0) {
      alert('Please set a valid price per hour!');
      return;
    }

    // Register as companion with form data
    setIsCompanion(true);
    setIsOnline(true);
    localStorage.setItem('isCompanion', 'true');
    localStorage.setItem('isOnline', 'true');
    
    registerCompanion({
      username: userData.username,
      email: userData.email,
      gamesPlayed: companionForm.gamesPlayed,
      achievements: companionForm.achievements,
      hoursPlayed: companionForm.hoursPlayed,
      specialties: companionForm.selectedGames,
      bio: companionForm.bio,
      experience: companionForm.experience,
      pricePerHour: companionForm.pricePerHour,
    });
    
    updateCompanionStatus(userData.email, true);
    setShowCompanionForm(false);
    
    // Save companion form data for future reference
    localStorage.setItem('companionFormData', JSON.stringify(companionForm));
  };

  const handleCancelCompanionForm = () => {
    setShowCompanionForm(false);
    // Reset form to default values
    setCompanionForm({
      gamesPlayed: 50,
      achievements: 25,
      hoursPlayed: 500,
      selectedGames: [],
      bio: '',
      experience: 'beginner',
      pricePerHour: 10,
    });
  };

  const toggleCompanionStatus = () => {
    const newCompanionStatus = !isCompanion;
    setIsCompanion(newCompanionStatus);
    localStorage.setItem('isCompanion', newCompanionStatus.toString());
    
    if (newCompanionStatus) {
      handleBecomeCompanion();
    } else {
      // Remove from companions list
      setIsOnline(false);
      localStorage.setItem('isOnline', 'false');
      removeCompanion(userData.email);
    }
  };

  const toggleOnlineStatus = () => {
    const newOnlineStatus = !isOnline;
    setIsOnline(newOnlineStatus);
    localStorage.setItem('isOnline', newOnlineStatus.toString());
    
    if (isCompanion) {
      updateCompanionStatus(userData.email, newOnlineStatus);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    // Remove all user-related data
    if (userData.email) {
      localStorage.removeItem(`username_${userData.email}`);
      localStorage.removeItem(`voiceSample_${userData.email}`);
      localStorage.removeItem(`profileImage_${userData.email}`); // Remove profile image
      // Remove all chat keys for this user
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(`chat_${userData.email}_`) || key.startsWith(`chat_${localStorage.getItem('userEmail')}_`))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isCompanion');
    localStorage.removeItem('isOnline');
    localStorage.removeItem('companionFormData');
    // Remove from companions list
    const companions = JSON.parse(localStorage.getItem('companions') || '[]');
    const updatedCompanions = companions.filter((c: any) => c.email !== userData.email);
    localStorage.setItem('companions', JSON.stringify(updatedCompanions));
    window.location.href = '/';
  };

  const startRecording = async () => {
    let localChunks: Blob[] = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) localChunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(localChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setVoiceSample(base64);
        if (userData.email) {
          localStorage.setItem(`voiceSample_${userData.email}`, base64);
        }
      };
      reader.readAsDataURL(blob);
    };
    setMediaRecorder(recorder);
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const deleteVoiceSample = () => {
    setVoiceSample(null);
    if (userData.email) {
      localStorage.removeItem(`voiceSample_${userData.email}`);
    }
  };

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async (imageSrc: string, crop: Area): Promise<string> => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return canvas.toDataURL('image/jpeg');
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (cropImage && croppedAreaPixels) {
      const cropped = await getCroppedImg(cropImage, croppedAreaPixels);
      setProfileImage(cropped);
      if (userData.email) {
        localStorage.setItem(`profileImage_${userData.email}`, cropped);
      }
      setCropModalOpen(false);
      setCropImage(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                My Voxxi Profile
              </h1>
              <p className="text-xl text-gray-600">
                Manage your profile and become a voice gaming companion
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-600">
                          {userData.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center mb-4">
                      <label className="cursor-pointer text-blue-600 hover:underline text-sm">
                        {profileImage ? 'Change Profile Image' : 'Upload Profile Image'}
                        <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                      </label>
                      {profileImage && (
                        <button
                          type="button"
                          className="text-xs text-red-500 mt-1 hover:underline"
                          onClick={() => {
                            setProfileImage(null);
                            if (userData.email) localStorage.removeItem(`profileImage_${userData.email}`);
                          }}
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">{userData.username || 'Gamer'}</h3>
                    <p className="text-gray-600">Level 42</p>
                    
                    {/* Companion Status Badge */}
                    {isCompanion && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🎮 Companion
                        </span>
                        {isOnline && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🟢 Online
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="username"
                          value={editedData.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                          {userData.username || 'Not set'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                          {userData.email || 'Not set'}
                        </div>
                      )}
                    </div>
                    
                    {/* Companion Controls */}
                    <div className="pt-4 space-y-3">
                      <button
                        onClick={toggleCompanionStatus}
                        className={`w-full py-2 px-4 rounded-md transition-colors ${
                          isCompanion
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {isCompanion ? 'Stop Being Companion' : 'Become a Companion'}
                      </button>
                      
                      {isCompanion && (
                        <button
                          onClick={toggleOnlineStatus}
                          className={`w-full py-2 px-4 rounded-md transition-colors ${
                            isOnline
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors mt-2"
                      >
                        Sign Out
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors mt-2"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Gaming Stats */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-6">Gaming Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900">Games Played</h4>
                      <p className="text-2xl font-bold text-blue-600">156</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900">Achievements</h4>
                      <p className="text-2xl font-bold text-green-600">89</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900">Hours Played</h4>
                      <p className="text-2xl font-bold text-purple-600">1,247</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900">Friends</h4>
                      <p className="text-2xl font-bold text-orange-600">23</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companion Registration Form Modal */}
        {showCompanionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Become a Gaming Companion</h2>
                  <button
                    onClick={handleCancelCompanionForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Gaming Experience */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Gaming Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Games Played
                        </label>
                        <input
                          type="number"
                          value={companionForm.gamesPlayed}
                          onChange={(e) => handleCompanionFormChange('gamesPlayed', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Achievements
                        </label>
                        <input
                          type="number"
                          value={companionForm.achievements}
                          onChange={(e) => handleCompanionFormChange('achievements', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hours Played
                        </label>
                        <input
                          type="number"
                          value={companionForm.hoursPlayed}
                          onChange={(e) => handleCompanionFormChange('hoursPlayed', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Game Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Games You Want to Play</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select the specific games you're interested in playing with others:
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {availableGames.map((game) => (
                        <label
                          key={game.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            companionForm.selectedGames.includes(game.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={companionForm.selectedGames.includes(game.id)}
                            onChange={() => handleGameSelection(game.id)}
                            className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900 text-lg">{game.name}</div>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {game.genre}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{game.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={companionForm.experience}
                      onChange={(e) => handleCompanionFormChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio (Tell others about yourself)
                    </label>
                    <textarea
                      value={companionForm.bio}
                      onChange={(e) => handleCompanionFormChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Tell other gamers about your gaming style, what you're looking for in teammates, or any other relevant information..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  {/* Price Per Hour */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Hour ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={companionForm.pricePerHour}
                      onChange={e => handleCompanionFormChange('pricePerHour', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your price per hour"
                    />
                  </div>

                  {/* Voice Sample Recording */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Sample (optional)
                    </label>
                    {voiceSample ? (
                      <div className="flex flex-col gap-2">
                        <audio ref={audioRef} src={voiceSample} controls className="w-full" />
                        <button
                          type="button"
                          onClick={deleteVoiceSample}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-fit"
                        >
                          Delete Sample
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`px-4 py-2 rounded ${isRecording ? 'bg-yellow-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          {isRecording ? 'Stop Recording' : 'Record Voice Sample'}
                        </button>
                        {isRecording && <span className="text-red-600 animate-pulse">● Recording...</span>}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSubmitCompanionForm}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Become Companion & Go Online
                    </button>
                    <button
                      onClick={handleCancelCompanionForm}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {cropModalOpen && cropImage && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="relative w-full h-64 bg-gray-200">
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setCropModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                  <button onClick={handleCropSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 