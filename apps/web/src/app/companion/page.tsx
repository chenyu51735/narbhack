'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Companion, getAllCompanions, getOnlineCompanions } from '@/lib/companionUtils';
import { useRouter } from 'next/navigation';

const availableGames = [
  { id: 'League of Legends', name: 'League of Legends', genre: 'MOBA' },
  { id: 'Valorant', name: 'Valorant', genre: 'FPS' },
  { id: 'PUBG', name: 'PUBG', genre: 'Battle Royale' }
];

export default function CompanionPage() {
  const searchParams = useSearchParams();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [filter, setFilter] = useState<'all' | 'online'>('online');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [gameNameSearch, setGameNameSearch] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCompanion, setChatCompanion] = useState<Companion | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; timestamp: number }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
  const router = useRouter();

  useEffect(() => {
    // Check for game parameter in URL
    const gameParam = searchParams.get('game');
    if (gameParam) {
      setSelectedGame(gameParam);
    }
    
    // Load companions from localStorage
    loadCompanions();
    
    // Set up interval to refresh companions list
    const interval = setInterval(loadCompanions, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [filter, searchTerm, selectedGame, gameNameSearch, searchParams]);

  useEffect(() => {
    const handler = (e: any) => {
      const email = e.detail?.companionEmail;
      if (!email) return;
      const companion = companions.find(c => c.email === email);
      if (companion) openChat(companion);
    };
    window.addEventListener('open-chat-modal', handler);
    return () => window.removeEventListener('open-chat-modal', handler);
  }, [companions]);

  const loadCompanions = () => {
    // Get companions using utility functions
    const allCompanions = getAllCompanions().filter(c => c.email !== userEmail);
    const onlineCompanions = getOnlineCompanions().filter(c => c.email !== userEmail);
    
    // Filter based on current filter
    let filteredCompanionsList = filter === 'online' 
      ? onlineCompanions
      : allCompanions;
    
    // Apply username search filter
    if (searchTerm.trim()) {
      filteredCompanionsList = filteredCompanionsList.filter(companion =>
        companion.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply specific game filter
    if (selectedGame !== 'all') {
      filteredCompanionsList = filteredCompanionsList.filter(companion =>
        companion.specialties && companion.specialties.includes(selectedGame)
      );
    }
    
    // Apply game name search filter
    if (gameNameSearch.trim()) {
      filteredCompanionsList = filteredCompanionsList.filter(companion =>
        companion.specialties && companion.specialties.some(specialty =>
          specialty.toLowerCase().includes(gameNameSearch.toLowerCase())
        )
      );
    }
    
    setCompanions(filteredCompanionsList);
  };

  const handleFilterChange = (newFilter: 'all' | 'online') => {
    setFilter(newFilter);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleGameChange = (game: string) => {
    setSelectedGame(game);
  };

  const handleGameNameSearchChange = (value: string) => {
    setGameNameSearch(value);
  };

  const openChat = (companion: Companion) => {
    setChatCompanion(companion);
    setChatOpen(true);
    // Load chat history
    if (userEmail && companion.email) {
      const key = `chat_${userEmail}_${companion.email}`;
      const history = localStorage.getItem(key);
      setChatMessages(history ? JSON.parse(history) : []);
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    setChatCompanion(null);
    setChatMessages([]);
    setChatInput('');
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !userEmail || !chatCompanion) return;
    const newMsg = { sender: userEmail, text: chatInput, timestamp: Date.now() };
    const newHistory = [...chatMessages, newMsg];
    setChatMessages(newHistory);
    setChatInput('');
    // Save to localStorage
    const key = `chat_${userEmail}_${chatCompanion.email}`;
    localStorage.setItem(key, JSON.stringify(newHistory));
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleConnect = (companion: Companion) => {
    // Always redirect to /messages?companion=email, messages page will handle selection or creation
    router.push(`/messages?companion=${encodeURIComponent(companion.email)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Voxxi Companions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with experienced voice gaming companions for your favorite games.
          </p>
          
          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto mb-8">
            {/* Filter Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg p-1 shadow-md">
                <button
                  onClick={() => handleFilterChange('online')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'online'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Online Companions
                </button>
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Companions
                </button>
              </div>
            </div>

            {/* Search and Game Filter */}
            <div className="space-y-4">
              {/* Username and Game Name Search */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Username Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Game Name Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by game name..."
                    value={gameNameSearch}
                    onChange={(e) => handleGameNameSearchChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Specific Game Selection */}
              <div className="flex justify-center">
                <div className="md:w-64">
                  <select
                    value={selectedGame}
                    onChange={(e) => handleGameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="all">All Games</option>
                    {availableGames.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.genre})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {companions.length === 0 ? (
          <div className="text-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">No Companions Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || gameNameSearch || selectedGame !== 'all'
                  ? 'No companions match your search criteria. Try adjusting your filters or search terms.'
                  : filter === 'online' 
                    ? 'No companions are currently online. Try checking all companions or come back later!'
                    : 'No companions have registered yet. Be the first to become a companion!'
                }
              </p>
              <button
                onClick={() => window.location.href = '/profile'}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Become a Companion
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion) => {
              // Voice sample
              let voiceSample: string | null = null;
              if (typeof window !== 'undefined' && companion.email) {
                voiceSample = localStorage.getItem(`voiceSample_${companion.email}`);
              }
              const profileImage = typeof window !== 'undefined' && companion.email ? localStorage.getItem(`profileImage_${companion.email}`) : null;
              return (
                <div key={companion.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt={companion.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-purple-700">
                          {companion.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{companion.username}</h3>
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          companion.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-sm text-gray-600">
                          {companion.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Games Played:</span>
                      <span className="font-semibold">{companion.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Achievements:</span>
                      <span className="font-semibold">{companion.achievements}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hours Played:</span>
                      <span className="font-semibold">{companion.hoursPlayed}</span>
                    </div>
                  </div>
                  
                  {companion.specialties && companion.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Games:</p>
                      <div className="flex flex-wrap gap-1">
                        {companion.specialties.map((game, index) => {
                          const gameInfo = availableGames.find(g => g.id === game);
                          return (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {gameInfo ? `${gameInfo.name} (${gameInfo.genre})` : game}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Bio and Experience */}
                  {companion.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">About:</p>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                        {companion.bio}
                      </p>
                    </div>
                  )}
                  
                  {companion.experience && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Experience Level:</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        companion.experience === 'expert' ? 'bg-red-100 text-red-800' :
                        companion.experience === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        companion.experience === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {companion.experience.charAt(0).toUpperCase() + companion.experience.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  {/* Price Per Hour */}
                  {typeof companion.pricePerHour === 'number' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Price Per Hour:</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
                        ${companion.pricePerHour}/hr
                      </span>
                    </div>
                  )}
                  
                  {/* Voice Sample Player */}
                  {voiceSample && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Voice Sample:</p>
                      <audio src={voiceSample} controls className="w-full" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleConnect(companion)}
                    disabled={!companion.isOnline}
                    className={`w-full py-2 px-4 rounded-md transition-colors ${
                      companion.isOnline
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {companion.isOnline ? 'Connect' : 'Offline'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {chatOpen && chatCompanion && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-700">
                    {chatCompanion.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{chatCompanion.username}</div>
                  <div className="text-xs text-gray-500">{chatCompanion.email}</div>
                </div>
              </div>
              <button onClick={closeChat} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-400 py-8">No messages yet. Say hi!</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-2 flex ${msg.sender === userEmail ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.sender === userEmail ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    {msg.text}
                    <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <div className="p-3 border-t flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 