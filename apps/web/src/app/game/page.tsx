'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  name: string;
  genre: string;
  rating: number;
  players: string;
  releaseYear: number;
  description: string;
  imageUrl: string;
}

const popularGames: Game[] = [
  {
    id: '1',
    name: 'League of Legends',
    genre: 'MOBA',
    rating: 4.2,
    players: 'Multiplayer',
    releaseYear: 2009,
    description: 'A multiplayer online battle arena video game.',
    imageUrl: '/images/games/lol.png'
  },
  {
    id: '2',
    name: 'Valorant',
    genre: 'FPS',
    rating: 4.3,
    players: 'Multiplayer',
    releaseYear: 2020,
    description: 'A tactical first-person hero shooter game.',
    imageUrl: '/images/games/valorant.png'
  },
  {
    id: '3',
    name: 'PUBG',
    genre: 'Battle Royale',
    rating: 4.1,
    players: 'Multiplayer',
    releaseYear: 2017,
    description: 'PlayerUnknown\'s Battlegrounds - a battle royale game.',
    imageUrl: '/images/games/pubg.png'
  }
];

export default function GamePage() {
  const router = useRouter();
  const filteredGames = popularGames;

  const handleGameClick = (game: Game) => {
    // Redirect to companion page with the specific game name as a filter
    router.push(`/companion?game=${encodeURIComponent(game.name)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Voxxi Game Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore games and connect with voice gaming companions for real-time play.
          </p>
        </div>

        {/* Games Grid */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {filteredGames.map((game) => (
            <div 
              key={game.id} 
              className="relative group cursor-pointer"
              onClick={() => handleGameClick(game)}
            >
              {/* Game Image */}
              <div className="relative w-64 h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {/* Colored background based on game */}
                <div className={`absolute inset-0 ${
                  game.name === 'League of Legends' ? 'bg-blue-500' :
                  game.name === 'Valorant' ? 'bg-red-500' :
                  'bg-green-500'
                }`}></div>
                
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover relative z-10"
                  onLoad={(e) => {
                    console.log(`Image loaded successfully: ${game.name}`);
                  }}
                  onError={(e) => {
                    console.error(`Image failed to load: ${game.name}`, e);
                    // Hide the image and show placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
                {/* Fallback Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300" style={{ display: 'none' }}>
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">{game.name}</h3>
                    <p className="text-sm text-gray-600">{game.genre} • {game.releaseYear}</p>
                    <p className="text-xs text-gray-500 mt-2">Import: {game.imageUrl}</p>
                  </div>
                </div>
                
                {/* Hover Overlay with Game Name */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {game.name}
                    </h3>
                    <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {game.genre} • {game.releaseYear}
                    </p>
                    <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 mt-2">
                      Click to find companions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">No Games Found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 