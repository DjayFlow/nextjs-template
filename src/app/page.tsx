'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;

export default function Home() {
  const [points, setPoints] = useState(490);
  const [spins, setSpins] = useState(44);
  const [multiplier, setMultiplier] = useState(1);
  const [autoSpin, setAutoSpin] = useState(false);
  const [stage, setStage] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💰']);
  const [isAttacking, setIsAttacking] = useState(false);
  const [eventMsg, setEventMsg] = useState('');
  const [shake, setShake] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- AUDIO LOGIC (Verwijst naar jouw public/sounds map) ---
  const playSound = (name: string) => {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => console.log("Audio play blocked - click needed"));
  };

  const triggerHaptic = (type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
  };

  // Auto-spin loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && !isAttacking && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1500);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, isAttacking, spins, multiplier]);

  const spin = () => {
    if (spinning || isAttacking || spins < multiplier) {
      setAutoSpin(false);
      return;
    }

    playSound('spin'); // Zorg dat spin.mp3 in public/sounds staat!
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
        handleWin(res[0]);
      } else {
        setPoints(p => p + (5 * multiplier));
        triggerHaptic('light');
      }
    }, 1200);
  };

  const handleWin = (symbol: string) => {
    if (symbol === '🔨') {
      startAttack();
    } else if (symbol === '🦹') {
      setEventMsg(`🦹 RAID! +${1000 * multiplier}`);
      setPoints(p => p + (1000 * multiplier));
      playSound('win');
      triggerHaptic('success');
    } else {
      setEventMsg(`🎉 BIG WIN! +${500 * multiplier}`);
      setPoints(p => p + (500 * multiplier));
      playSound('win');
      triggerHaptic('success');
    }
  };

  const startAttack = () => {
    setIsAttacking(true);
    playSound('attack'); // Gebruik dat brass/level geluid dat je stuurde
    setTimeout(() => {
      setShake(true);
      setEventMsg(`🔨 ATTACK BOOM! +${1500 * multiplier}`);
      setPoints(p => p + (1500 * multiplier));
      triggerHaptic('success');
      setTimeout(() => {
        setShake(false);
        setIsAttacking(false);
      }, 1000);
    }, 2000);
  };

  return (
    <Page>
      <div style={{ 
        background: 'radial-gradient(circle at center, #1c1c3e 0%, #050510 100%)', 
        minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px',
        overflow: 'hidden', transform: shake ? 'scale(1.05)' : 'none', transition: 'transform 0.1s'
      }}>
        
        {/* Stage & Progress */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <p style={{ color: '#ffcc00', letterSpacing: '2px', fontWeight: 'bold', fontSize: '12px' }}>STAGE {stage}</p>
          <h2 style={{ fontSize: '22px', margin: 0, textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>The Owl's Nest</h2>
        </div>

        {/* High-Quality Credits Display */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h1 style={{ fontSize: '70px', color: '#ffcc00', margin: 0, fontWeight: '900', textShadow: '0 0 25px rgba(255,204,0,0.6)' }}>{points}</h1>
          <p style={{ color: '#888', letterSpacing: '3px', fontSize: '10px' }}>UNITY CREDITS</p>
        </div>

        {/* ATTACK ANIMATION LAYER */}
        {isAttacking && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,204,0,0.1)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '100px', animation: 'owlFly 2s forwards' }}>🦉🚀</div>
            <div style={{ fontSize: '80px', position: 'absolute', right: '10%', bottom: '30%', animation: 'targetShake 2s' }}>🏘️💥</div>
          </div>
        )}

        {/* Slot Machine */}
        <div style={{ 
          display: 'flex', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', 
          borderRadius: '30px', border: '2px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 40px black' 
        }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '50px', width: '80px', height: '110px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', boxShadow: '0 0 15px rgba(255,255,255,0.05)' }}>{s}</div>
          ))}
        </div>

        {/* Multiplier Select */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '25px' }}>
          {[1, 2, 3, 5].map(m => (
            <button key={m} onClick={() => setMultiplier(m)} style={{
              width: '45px', height: '45px', borderRadius: '12px', border: 'none',
              backgroundColor: multiplier === m ? '#ffcc00' : '#222', color: multiplier === m ? 'black' : 'white', fontWeight: 'bold'
            }}>x{m}</button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '30px' }}>
          <div onClick={() => setAutoSpin(!autoSpin)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#666' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning || isAttacking || spins < multiplier} style={{ 
            width: '150px', height: '150px', borderRadius: '50%', border: 'none',
            backgroundColor: spinning ? '#444' : '#ffcc00', color: 'black', fontSize: '30px', fontWeight: '900',
            boxShadow: spinning ? 'none' : '0 12px 0 #997a00, 0 20px 40px rgba(255,204,0,0.3)',
            transform: spinning ? 'translateY(10px)' : 'none', transition: 'all 0.1s'
          }}>{spinning ? '...' : 'SPIN'}</button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🔊</div>
            <span style={{ fontSize: '10px', color: '#666' }}>ON</span>
          </div>
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <h3 style={{ color: '#ffcc00', fontSize: '28px', margin: 0, fontWeight: 'bold' }}>{spins} / {MAX_SPINS}</h3>
          <p style={{ color: '#888', fontSize: '12px' }}>SPINS</p>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes owlFly {
            0% { transform: translate(-300px, 200px) rotate(20deg) scale(0.5); }
            50% { transform: translate(0, 0) rotate(0deg) scale(1.5); }
            100% { transform: translate(300px, -200px) rotate(-20deg) scale(0.5); }
          }
          @keyframes targetShake {
            0%, 40% { transform: scale(1); }
            50% { transform: scale(1.5) rotate(10deg); filter: brightness(2); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </Page>
  );
}
