'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const REGEN_TIME_MS = 180000; 

const stagesData = [
  { name: "The Owl's Nest", bg: 'linear-gradient(180deg, #1a1a1a 0%, #050505 100%)', houses: ['🥚', '🐣', '🐥', '🦉', '🏠'] },
  { name: "Gold Valley", bg: 'linear-gradient(180deg, #4d3a00 0%, #1a1400 100%)', houses: ['🪵', '🛖', '🏡', '🏘️', '🏰'] }
];

export default function Home() {
  // Sync met jouw huidige stats!
  const [points, setPoints] = useState(125); 
  const [stage, setStage] = useState(1);
  const [spins, setSpins] = useState(44); 
  const [houseLevel, setHouseLevel] = useState(0); // 0 tot 4
  
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '🔥']);
  const [eventMsg, setEventMsg] = useState('');
  const [shake, setShake] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨']; // 🔨 = Attack!

  const triggerHaptic = (type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
      else tg.HapticFeedback.impactOccurred(type);
    }
  };

  useEffect(() => {
    if (spins >= MAX_SPINS) return;
    const interval = setInterval(() => setSpins(p => Math.min(MAX_SPINS, p + 5)), REGEN_TIME_MS);
    return () => clearInterval(interval);
  }, [spins]);

  const spin = () => {
    if (spinning || spins <= 0) return;
    setEventMsg('');
    triggerHaptic('medium');
    setSpinning(true);
    setSpins(p => p - 1);
    
    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]];
      setReels(res);
      setSpinning(false);

      if (res[0] === res[1] && res[1] === res[2]) {
        triggerHaptic('success');
        if (res[0] === '🦹') {
          const amt = stage * 450;
          setPoints(p => p + amt);
          setEventMsg(`🦹 RAID! Je stal ${amt} van een rival!`);
        } else if (res[0] === '🔨') {
          const amt = stage * 600;
          setPoints(p => p + amt);
          setEventMsg(`🔨 ATTACK! Je sloopte een dorp voor ${amt}!`);
          setShake(true);
          setTimeout(() => setShake(false), 500);
        } else {
          setPoints(p => p + 150);
        }
      } else {
        setPoints(p => p + 5);
        triggerHaptic('light');
      }
    }, 1200);
  };

  const build = () => {
    const cost = (houseLevel + 1) * 200 * stage;
    if (points >= cost && houseLevel < 4) {
      setPoints(p => p - cost);
      setHouseLevel(h => h + 1);
      triggerHaptic('success');
    } else if (houseLevel >= 4) {
      // Stage Up!
      setStage(s => s + 1);
      setHouseLevel(0);
      alert("🎉 DORP COMPLEET! Op naar de volgende Stage!");
    } else {
      alert("Niet genoeg credits om te bouwen!");
    }
  };

  const cur = stagesData[(stage - 1) % stagesData.length];

  if (showGame) {
    return (
      <Page>
        <div style={{ background: cur.bg, minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', transition: 'all 0.5s', transform: shake ? 'translateX(10px)' : 'none' }}>
          
          {/* Village Display */}
          <div style={{ textAlign: 'center', marginTop: '10px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '20px', width: '90%' }}>
            <div style={{fontSize: '60px', marginBottom: '10px'}}>{cur.houses[houseLevel]}</div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>{cur.name}</h2>
            <div onClick={build} style={{ marginTop: '10px', backgroundColor: '#ffcc00', color: 'black', padding: '8px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>
              {houseLevel < 4 ? `BOUW UPGRADE (${(houseLevel + 1) * 200 * stage})` : "STAGE UP! 🚀"}
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <h1 style={{ fontSize: '50px', color: '#ffcc00', margin: 0 }}>{points}</h1>
            <p style={{ color: '#aaa', fontSize: '10px', fontWeight: 'bold' }}>UNITY CREDITS</p>
          </div>

          {eventMsg && <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '10px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '15px', animation: 'bounce 0.5s infinite' }}>{eventMsg}</div>}

          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#111', padding: '18px', borderRadius: '20px', border: '3px solid #333' }}>
            {reels.map((s, i) => (
              <div key={i} style={{ fontSize: '40px', width: '70px', height: '90px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{s}</div>
            ))}
          </div>

          <button onClick={spin} disabled={spinning || spins <= 0} style={{ 
            marginTop: '30px', width: '150px', height: '150px', borderRadius: '50%', border: 'none',
            backgroundColor: spins <= 0 ? '#333' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900',
            boxShadow: spins <= 0 ? 'none' : '0 10px 0 #997a00', transform: spinning ? 'translateY(8px)' : 'none'
          }}>{spinning ? '...' : 'SPIN'}</button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#ffcc00', fontSize: '24px', margin: 0 }}>{spins} / {MAX_SPINS}</h3>
            <p style={{ color: '#888', fontSize: '12px' }}>SPINS</p>
          </div>

          <div onClick={() => setShowGame(false)} style={{ marginTop: 'auto', marginBottom: '20px', color: '#555', cursor: 'pointer' }}>BACK TO MENU</div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <List style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Section><div style={{ textAlign: 'center', padding: '40px' }}><img src="/apple-touch-icon.png.jpg" width="110" style={{ borderRadius: '25px' }} /><h1 style={{ color: 'white' }}>Unbreakable Owl</h1></div></Section>
        <Section header="Lobby">
          <Cell onClick={() => setShowGame(true)} subtitle={`Stage ${stage} | House Lvl ${houseLevel}`}>
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play, Raid & Build</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
