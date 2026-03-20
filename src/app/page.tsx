'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, List, Cell } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [points, setPoints] = useState(775);
  const [spins, setSpins] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [isMuted, setIsMuted] = useState(false);
  
  // Referentie voor de achtergrondmuziek
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- AUDIO ENGINE ---
  const playSound = (name: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const toggleMusic = () => {
    if (!bgMusicRef.current) {
      // EXACTE NAAM
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }

    if (isMuted) {
      bgMusicRef.current.play();
      setIsMuted(false);
    } else {
      bgMusicRef.current.pause();
      setIsMuted(true);
    }
  };

  const spin = () => {
    if (spinning || spins < multiplier) return;

    // Start muziek bij de eerste spin als het nog niet speelt
    if (!isMuted && bgMusicRef.current?.paused) {
      toggleMusic();
    }

    playSound('spin');
    setSpinning(true);
    setSpins(p => p - multiplier);

    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]]);
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]];
      setReels(res);
      setSpinning(false);
      
      // Win logica...
      if (res[0] === res[1] && res[1] === res[2]) {
        playSound('win');
        setPoints(p => p + (1000 * multiplier));
      } else {
        playSound('points');
        setPoints(p => p + 5);
      }
    }, 1200);
  };

  return (
    <Page>
      <div style={{ 
        backgroundImage: 'url(/sounds/high_quality_bg.png)', 
        backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' 
      }}>
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
          <div onClick={toggleMusic} style={{ fontSize: '24px', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '10px' }}>
            {isMuted ? '🔇' : '🔊'}
          </div>
          <TonConnectButton />
        </div>

        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <h1 style={{ fontSize: '60px', color: '#ffcc00', margin: 0 }}>{points}</h1>
          <p style={{ letterSpacing: '2px', fontSize: '12px' }}>UNITY CREDITS</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '20px', border: '2px solid #ffcc00' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '50px', width: '80px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: '10px' }}>
              {s}
            </div>
          ))}
        </div>

        <button onClick={spin} style={{ 
          marginTop: '40px', width: '150px', height: '150px', borderRadius: '50%', border: 'none', 
          backgroundColor: '#ffcc00', color: 'black', fontSize: '30px', fontWeight: 'bold', boxShadow: '0 10px 0 #997a00' 
        }}>
          SPIN
        </button>

        <p style={{ marginTop: '20px', fontSize: '20px' }}>{spins} / 50 SPINS</p>
      </div>
    </Page>
  );
}
