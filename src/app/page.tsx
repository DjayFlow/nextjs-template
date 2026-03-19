'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;

export default function Home() {
  // Sync met je laatste voortgang
  const [points, setPoints] = useState(490);
  const [spins, setSpins] = useState(9);
  const [multiplier, setMultiplier] = useState(1);
  const [autoSpin, setAutoSpin] = useState(false);
  
  const [stage, setStage] = useState(1);
  const [houseLevel, setHouseLevel] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['💰', '🦉', '💰']);
  const [eventMsg, setEventMsg] = useState('');
  const [shake, setShake] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- AUDIO ENGINE ---
  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {}); 
  };

  const triggerHaptic = (type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  // --- AUTO-SPIN LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1200);
    } else if (spins < multiplier) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, spins, multiplier]);

  const spin = () => {
    if (spinning || spins < multiplier) {
      setAutoSpin(false);
      return;
    }

    // Geluid bij draaien
    playSound('https://www.soundjay.com/buttons/sounds/button-37a.mp3');
    triggerHaptic('medium');
    setSpinning(true);
    setSpins(p => p - multiplier);
    setEventMsg('');

    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]];
      setReels(res);
      setSpinning(false);

      if (res[0] === res[1] && res[1] === res[2]) {
        // WIN OF SPECIAL EVENT
        const winBase = res[0] === '🦹' ? 500 : (res[0] === '🔨' ? 300 : 150);
        const totalWin = winBase * multiplier;
        setPoints(p => p + totalWin);
        
        if (res[0] === '🦹') setEventMsg(`🦹 RAID: +${totalWin}!`);
        else if (res[0] === '🔨') { setEventMsg(`🔨 ATTACK: +${totalWin}!`); setShake(true); setTimeout(() => setShake(false), 500); }
        else setEventMsg(`🎉 WIN: +${totalWin}!`);

        playSound('https://www.myinstants.com/media/sounds/coin-win.mp3');
        triggerHaptic('success');
      } else {
        setPoints(p => p + (5 * multiplier));
        triggerHaptic('light');
      }
    }, 1200);
  };

  return (
    <Page>
      {/* High-Quality Modern Background */}
      <div style={{ 
        background: 'radial-gradient(circle at top, #1c1c3e 0%, #050510 100%)', 
        minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px',
        transform: shake ? 'translateX(5px)' : 'none', transition: 'transform 0.1s'
      }}>
        
        {/* Modern Header */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <p style={{ color: '#ffcc00', letterSpacing: '2px', fontSize: '12px', fontWeight: 'bold' }}>STAGE {stage}</p>
          <h2 style={{ fontSize: '20px', margin: 0 }}>The Owl's Nest</h2>
        </div>

        {/* High-Quality Points Display */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h1 style={{ fontSize: '65px', color: '#ffcc00', margin: 0, fontWeight: '900', textShadow: '0 0 20px rgba(255,204,0,0.5)' }}>{points}</h1>
          <p style={{ color: '#888', fontSize: '10px', letterSpacing: '2px' }}>UNITY CREDITS</p>
        </div>

        {/* Slot Machine - Modern Look */}
        <div style={{ 
          display: 'flex', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', 
          borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 30px black' 
        }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '45px', width: '75px', height: '100px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', border: '1px solid #222' }}>{s}</div>
          ))}
        </div>

        {/* Multiplier / Inzet Kiezen */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {[1, 2, 3, 5].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('https://www.soundjay.com/buttons/sounds/button-50.mp3'); }} style={{
              padding: '10px 15px', borderRadius: '12px', border: 'none',
              backgroundColor: multiplier === m ? '#ffcc00' : '#222', color: multiplier === m ? 'black' : 'white', fontWeight: 'bold'
            }}>x{m}</button>
          ))}
        </div>

        {/* Spin & Auto-Spin Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
          <div onClick={() => setAutoSpin(!autoSpin)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning} style={{ 
            width: '150px', height: '150px', borderRadius: '50%', border: 'none',
            backgroundColor: spinning ? '#444' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900',
            boxShadow: spinning ? 'none' : '0 10px 0 #997a00, 0 15px 30px rgba(255,204,0,0.3)'
          }}>{spinning ? '...' : 'SPIN'}</button>

          <div style={{ width: '50px', opacity: 0 }}></div> {/* Spacer */}
        </div>

        {/* Spins Teller */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3 style={{ color: '#ffcc00', fontSize: '26px', margin: 0 }}>{spins} / {MAX_SPINS}</h3>
          <p style={{ color: '#888', fontSize: '12px' }}>SPINS</p>
        </div>

        <div onClick={() => window.location.reload()} style={{ marginTop: 'auto', marginBottom: '20px', color: '#444', fontSize: '10px', fontWeight: 'bold' }}>TERUG NAAR LOBBY</div>
      </div>
    </Page>
  );
}
