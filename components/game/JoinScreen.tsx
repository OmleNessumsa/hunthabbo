'use client';

import { useState, FormEvent } from 'react';

interface JoinScreenProps {
  onJoin: (name: string) => void;
}

export default function JoinScreen({ onJoin }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError('Naam moet minimaal 2 karakters zijn');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Naam mag maximaal 20 karakters zijn');
      return;
    }

    // Save name to localStorage for next visit
    localStorage.setItem('ibood-mansion-name', trimmedName);
    onJoin(trimmedName);
  };

  return (
    <div className="min-h-screen bg-ibood-dark flex items-center justify-center p-4">
      <div className="bg-slate-800/90 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-ibood-orange rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">iB</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">iBOOD Mansion</h1>
          <p className="text-slate-400">
            Verken de mansion en ontdek de beste deals!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-slate-300 mb-2 text-left">
              Jouw naam
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Bijv. DealHunter123"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-ibood-orange"
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-1 text-left">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-ibood-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            Betreed de Mansion
          </button>
        </form>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🏠</div>
            <p className="text-xs text-slate-400">8 kamers</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🛒</div>
            <p className="text-xs text-slate-400">Live deals</p>
          </div>
          <div>
            <div className="text-2xl mb-1">👥</div>
            <p className="text-xs text-slate-400">Multiplayer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
