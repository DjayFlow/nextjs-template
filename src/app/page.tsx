'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;

export default function Home() {
  const [points, setPoints] = useState(490); // Sync met je screenshot
  const [spins, setSpins] = useState(9); 
  const [multiplier, setMultiplier] = useState(1);
  const [autoSpin, setAutoSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['💰', '🦉', '💰']);
  const [stage, setStage] = useState(1);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- AUDIO LOGIC ---
  const playSound = (name: string) => {
    // Zorg dat je de bestanden in public/sounds/ zet!
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {}); 
  };

  const triggerHaptic = (type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  // Auto-spin Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && spins >= multiplier) {
      timer = setTimeout(() => spin(), 800);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, spins, multiplier]);

  const spin = () => {
    if (spinning || spins < multiplier) {
      setAutoSpin(false);
      return;
    }

    playSound('spin'); // Koppel hier je slot-machine-payout mp3 aan
    triggerHaptic('medium');
    setSpinning(true);
    setSpins(p => p - multiplier);

    // Super snelle rotatie (50ms)
    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]]);
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]];
      setReels(res);
      setSpinning(false);

      if (res[0] === res[1] && res[1] === res[2]) {
        const win = res[0] === '🦹' ? 1000 : 250;
        setPoints(p => p + (win * multiplier));
        playSound('win'); // Koppel hier je badge-coin-win mp3 aan
        triggerHaptic('success');
      } else {
        setPoints(p => p + (5 * multiplier));
        triggerHaptic('light');
      }
    }, 1000);
  };

  return (
    <Page>
      <div style={{ 
        // De nieuwe fantasy achtergrond stijl
        background: 'radial-gradient(circle at top, #1c1c3e 0%, #050510 100%)', 
        minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' 
      }}>
        
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <p style={{ color: '#ffcc00', letterSpacing: '2px', fontWeight: 'bold', fontSize: '10px' }}>STAGE {stage}</p>
          <h2 style={{ fontSize: '20px', margin: 0 }}>The Owl's Nest</h2>
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h1 style={{ fontSize: '65px', color: '#ffcc00', margin: 0, fontWeight: '900', textShadow: '0 0 20px rgba(255,204,0,0.5)' }}>{points}</h1>
          <p style={{ color: '#aaa', fontSize: '10px', letterSpacing: '2px' }}>UNITY CREDITS</p>
        </div>

        {/* Reels met Blur effect bij het draaien */}
        <div style={{ 
          display: 'flex', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', 
          borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 40px black' 
        }}>
          {reels.map((s, i) => (
            <div key={i} style={{ 
              fontSize: '50px', width: '80px', height: '110px', backgroundColor: '#111', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px',
              filter: spinning ? 'blur(2px)' : 'none', transition: 'filter 0.1s'
            }}>{s}</div>
          ))}
        </div>

        {/* Inzet Multipliers */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '25px' }}>
          {[1, 2, 3, 5].map(m => (
            <button key={m} onClick={() => setMultiplier(m)} style={{
              width: '45px', height: '45px', borderRadius: '12px', border: 'none',
              backgroundColor: multiplier === m ? '#ffcc00' : '#222', color: multiplier === m ? 'black' : 'white', fontWeight: 'bold'
            }}>x{m}</button>
          ))}
        </div>

        {/* Controls: Auto-Spin & Main Spin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '30px' }}>
          <div onClick={() => setAutoSpin(!autoSpin)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>
              🔄
            </div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#666' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning || spins < multiplier} style={{ 
            width: '150px', height: '150px', borderRadius: '50%', border: 'none',
            backgroundColor: spinning ? '#444' : '#ffcc00', color: 'black', fontSize: '30px', fontWeight: '900',
            boxShadow: spinning ? 'none' : '0 10px 0 #997a00, 0 20px 40px rgba(255,204,0,0.3)',
            transform: spinning ? 'translateY(10px)' : 'none'
          }}>{spinning ? '...' : 'SPIN'}</button>

          <div style={{ width: '55px', textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>🔊</div>
            <span style={{ fontSize: '10px', color: '#666' }}>ON</span>
          </div>
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <h3 style={{ color: '#ffcc00', fontSize: '28px', margin: 0 }}>{spins} / {MAX_SPINS}</h3>
          <p style={{ color: '#888', fontSize: '12px' }}>SPINS</p>
        </div>
      </div>
    </Page>
  );
}
