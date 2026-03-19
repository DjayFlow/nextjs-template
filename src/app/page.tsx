'use client';

import { useState, useEffect, useRef } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const REGEN_TIME_MS = 180000; // 3 min
const SPINS_PER_REGEN = 5;

const stagesData = [
  { name: "The Owl's Nest", bg: 'linear-gradient(180deg, #1a1a1a 0%, #050505 100%)', house: '🦉🏠' },
  { name: "Gold Feather Valley", bg: 'linear-gradient(180deg, #4d3a00 0%, #1a1400 100%)', house: '🦉🏡💰' },
  { name: "Diamond Peak", bg: 'linear-gradient(180deg, #004d4d 0%, #001a1a 100%)', house: '🦉🏰💎' },
  { name: "Fire Forge", bg: 'linear-gradient(180deg, #4d0000 0%, #1a0000 100%)', house: '🦉🔥⚒️' }
];

const fakeOpponents = ["CryptoKing", "LuckyLuke", "CoinQueen", "ElonMusk", "Vitalik_Fan"];

// --- Muntjes Animatie ---
const CoinRain = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
      {[...Array(15)].map((_, i) => (
        <div key={i} className="coin" style={{
          position: 'absolute', fontSize: '24px', left: '50%', bottom: '40%',
          animation: `flyToVault 1s ease-out forwards`,
          animationDelay: `${Math.random() * 0.5}s`
        }}>💰</div>
      ))}
      <style>{`
        @keyframes flyToVault {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(${Math.random() * 200 - 100}px, -300px) scale(0.5); }
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  // START STATS (Precies zoals op je scherm!)
  const [points, setPoints] = useState(125); 
  const [stage, setStage] = useState(1);
  const [spins, setSpins] = useState(44); 
  
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '🔥']);
  const [xp, setXp] = useState(0);
  const [raidMessage, setRaidMessage] = useState('');
  const [animatingCoins, setAnimatingCoins] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹'];

  const triggerHaptic = (type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
      else tg.HapticFeedback.impactOccurred(type);
    }
  };

  useEffect(() => {
    if (spins >= MAX_SPINS) return;
    const interval = setInterval(() => {
      setSpins(p => Math.min(MAX_SPINS, p + SPINS_PER_REGEN));
    }, REGEN_TIME_MS);
    return () => clearInterval(interval);
  }, [spins]);

  const spin = () => {
    if (spinning || spins <= 0) return;
    setRaidMessage('');
    triggerHaptic('medium');
    setSpinning(true);
    setSpins(p => p - 1);
    
    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)]]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)]];
      setReels(res);
      setSpinning(false);

      if (res[0] === res[1] && res[1] === res[2]) {
        setAnimatingCoins(true);
        if (res[0] === '🦹') {
          const amount = stage * 500 + Math.floor(Math.random() * 200);
          setPoints(p => p + amount);
          setRaidMessage(`🦹 RAID! Je stal ${amount} van ${fakeOpponents[Math.floor(Math.random()*5)]}!`);
          triggerHaptic('success');
        } else {
          setPoints(p => p + 100);
          triggerHaptic('success');
          if (xp + 25 >= stage * 100) { setStage(s => s + 1); setXp(0); }
          else { setXp(p => p + 25); }
        }
      } else {
        setPoints(p => p + 5);
        triggerHaptic('light');
      }
    }, 1200);
  };

  const cur = stagesData[(stage - 1) % stagesData.length];

  if (showGame) {
    return (
      <Page>
        <div style={{ background: cur.bg, minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', transition: 'all 0.5s' }}>
          {animatingCoins && <CoinRain onComplete={() => setAnimatingCoins(false)} />}
          
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{fontSize: '40px'}}>{cur.house}</div>
            <p style={{ color: '#aaa', fontSize: '10px', margin: 0 }}>STAGE {stage}</p>
            <h2 style={{ fontSize: '18px', margin: 0 }}>{cur.name}</h2>
            <div style={{ width: '150px', height: '6px', backgroundColor: '#333', borderRadius: '3px', margin: '10px auto', overflow: 'hidden' }}>
              <div style={{ width: `${(xp / (stage * 100)) * 100}%`, height: '100%', backgroundColor: '#ffcc00' }}></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <h1 style={{ fontSize: '55px', color: '#ffcc00', margin: 0, fontWeight: '900' }}>{points}</h1>
            <p style={{ color: '#aaa', fontSize: '10px', fontWeight: 'bold' }}>UNITY CREDITS</p>
          </div>

          {raidMessage && <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '10px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '15px' }}>{raidMessage}</div>}

          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#111', padding: '18px', borderRadius: '20px', border: '3px solid #333' }}>
            {reels.map((s, i) => (
              <div key={i} style={{ fontSize: '40px', width: '70px', height: '90px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{s}</div>
            ))}
          </div>

          <button onClick={spin} disabled={spinning || spins <= 0} style={{ 
            marginTop: '30px', width: '160px', height: '160px', borderRadius: '50%', border: 'none',
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
        <Section header="Wallet"><div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}><TonConnectButton /></div></Section>
        <Section header="Lobby">
          <Cell onClick={() => setShowGame(true)} subtitle={`Spins: ${spins}/${MAX_SPINS} | Points: ${points}`}>
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play & Raid (Stage {stage})</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
