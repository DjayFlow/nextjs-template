'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const REGEN_TIME_MS = 180000; 

export default function Home() {
  // Sync met jouw huidige stats
  const [points, setPoints] = useState(775);
  const [spins, setSpins] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [autoSpin, setAutoSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🔨', '🦹', '💎']); // Laatste symbolen
  
  const [stage, setStage] = useState(1);
  const [shake, setShake] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  const triggerHaptic = (type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  const playSound = (name: string) => {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1000);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, spins, multiplier]);

  const spin = () => {
    if (spinning || spins < multiplier) {
      setAutoSpin(false);
      return;
    }

    playSound('spin'); 
    triggerHaptic('medium');
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

      if (res[0] === res[1] && res[1] === res[2]) {
        if (res[0] === '🔨') setShake(true);
        setTimeout(() => setShake(false), 500);
        
        const win = res[0] === '🦹' ? 1000 : 250;
        setPoints(p => p + (win * multiplier));
        playSound('win');
        triggerHaptic('success');
      } else {
        setPoints(p => p + (5 * multiplier));
        triggerHaptic('light');
      }
    }, 1200);
  };

  return (
    <Page>
      <div style={{ 
        // --- GEFIXTE ACHTERGROND NAAM ---
        backgroundImage: 'url(/sounds/high_quality_bg.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '15px',
        overflow: 'hidden',
        transform: shake ? 'scale(1.05)' : 'none',
        transition: 'transform 0.1s'
      }}>
        
        <div style={{ textAlign: 'center', marginTop: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px' }}>
          <p style={{ color: '#ffcc00', letterSpacing: '2px', fontWeight: 'bold', fontSize: '10px', margin: 0 }}>STAGE {stage}</p>
          <h2 style={{ fontSize: '18px', margin: 0 }}>The Owl's Nest</h2>
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0', backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '30px' }}>
          <h1 style={{ fontSize: '55px', color: '#ffcc00', margin: 0, fontWeight: '900', textShadow: '0 0 20px rgba(255,204,0,0.5)' }}>{points}</h1>
          <p style={{ color: '#aaa', fontSize: '10px', letterSpacing: '2px' }}>UNITY CREDITS</p>
        </div>

        <div style={{ 
          display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', 
          borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 30px black' 
        }}>
          {reels.map((s, i) => (
            <div key={i} style={{ 
              fontSize: '40px', width: '70px', height: '90px', backgroundColor: '#111', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px',
              filter: spinning ? 'blur(2px)' : 'none', transition: 'filter 0.1s'
            }}>{s}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          {[1, 2, 3, 5].map(m => (
            <button key={m} onClick={() => setMultiplier(m)} style={{
              width: '40px', height: '40px', borderRadius: '10px', border: 'none',
              backgroundColor: multiplier === m ? '#ffcc00' : '#222', color: multiplier === m ? 'black' : 'white', fontWeight: 'bold', fontSize: '14px'
            }}>x{m}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '25px' }}>
          <div onClick={() => setAutoSpin(!autoSpin)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>
              🔄
            </div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning} style={{ 
            width: '140px', height: '140px', borderRadius: '50%', border: 'none',
            backgroundColor: spinning ? '#444' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900',
            boxShadow: spinning ? 'none' : '0 10px 0 #997a00, 0 15px 30px rgba(255,204,0,0.3)',
            transform: spinning ? 'translateY(8px)' : 'none'
          }}>{spinning ? '...' : 'SPIN'}</button>

          <div style={{ width: '50px', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>🔊</div>
            <span style={{ fontSize: '10px', color: '#666' }}>ON</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#ffcc00', fontSize: '24px', margin: 0 }}>{spins} / {MAX_SPINS}</h3>
          <p style={{ color: '#888', fontSize: '12px' }}>SPINS</p>
        </div>
      </div>
    </Page>
  );
}
