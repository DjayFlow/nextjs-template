'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const REGEN_TIME_MS = 180000; // 3 min
const SPINS_PER_REGEN = 5;

const stageNames = ["The Owl's Nest", "Gold Feather Valley", "Diamond Peak", "Slot Canyon", "Fire Forge"];
const fakeOpponents = ["CryptoKing", "LuckyLuke", "CoinQueen", "ElonMusk", "Vitalik_Fan", "DogecoinMaster"];

export default function Home() {
  const [points, setPoints] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '💰', '🎰']);
  const [spins, setSpins] = useState(50);
  const [stage, setStage] = useState(1);
  const [xp, setXp] = useState(0);
  const [raidMessage, setRaidMessage] = useState('');

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹']; // 🦹 = De Dief

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
      setReels([
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const res = [
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ];
      setReels(res);
      setSpinning(false);

      // --- CHECK VOOR WIN OF RAID ---
      if (res[0] === res[1] && res[1] === res[2]) {
        if (res[0] === '🦹') {
          // RAID GETRIGGERD!
          const victim = fakeOpponents[Math.floor(Math.random() * fakeOpponents.length)];
          const stolenAmount = stage * 500 + Math.floor(Math.random() * 200);
          setPoints(p => p + stolenAmount);
          setRaidMessage(`🦹 RAID! Je hebt ${stolenAmount} gestolen van ${victim}!`);
          triggerHaptic('success');
        } else {
          // NORMALE WINST
          setPoints(p => p + 100);
          triggerHaptic('success');
          const xpThreshold = stage * 100;
          if (xp + 20 >= xpThreshold) {
            setStage(s => s + 1);
            setXp(0);
          } else {
            setXp(p => p + 20);
          }
        }
      } else {
        setPoints(p => p + 5);
        triggerHaptic('light');
      }
    }, 1200);
  };

  if (showGame) {
    return (
      <Page>
        <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
          
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ color: '#aaa', fontSize: '10px', margin: 0 }}>STAGE {stage}</p>
            <h2 style={{ fontSize: '16px', margin: 0 }}>{stageNames[(stage - 1) % stageNames.length]}</h2>
            <div style={{ width: '70%', height: '6px', backgroundColor: '#222', borderRadius: '3px', margin: '8px auto', overflow: 'hidden' }}>
              <div style={{ width: `${(xp / (stage * 100)) * 100}%`, height: '100%', backgroundColor: '#ffcc00' }}></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <h1 style={{ fontSize: '45px', color: '#ffcc00', margin: 0 }}>{points}</h1>
            <p style={{ color: '#666', fontSize: '10px', fontWeight: 'bold' }}>UNITY CREDITS</p>
          </div>

          {raidMessage && (
            <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '10px', borderRadius: '10px', fontWeight: 'bold', marginBottom: '10px', fontSize: '12px', textAlign: 'center', animation: 'bounce 0.5s infinite alternate' }}>
              {raidMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#111', padding: '15px', borderRadius: '20px', border: '2px solid #333' }}>
            {reels.map((s, i) => (
              <div key={i} style={{ fontSize: '35px', width: '65px', height: '85px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: '1px solid #333' }}>{s}</div>
            ))}
          </div>

          <button onClick={spin} disabled={spinning || spins <= 0} style={{ 
            marginTop: '30px', width: '150px', height: '150px', borderRadius: '50%', border: 'none',
            backgroundColor: spins <= 0 ? '#333' : (spinning ? '#444' : '#ffcc00'), color: 'black', fontSize: '24px', fontWeight: '900',
            boxShadow: spins <= 0 ? 'none' : '0 10px 0 #997a00', transform: (spinning || spins <= 0) ? 'translateY(5px)' : 'none'
          }}>
            {spinning ? '...' : (spins <= 0 ? 'LEEG' : 'SPIN')}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#ffcc00', fontSize: '22px', margin: 0 }}>{spins} / {MAX_SPINS}</h3>
            <p style={{ color: '#555', fontSize: '10px' }}>SPINS</p>
          </div>

          <div onClick={() => setShowGame(false)} style={{ marginTop: 'auto', paddingBottom: '20px', color: '#444', fontWeight: 'bold', fontSize: '11px' }}>BACK TO MENU</div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <List style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Section><div style={{ textAlign: 'center', padding: '40px' }}><img src="/apple-touch-icon.png.jpg" width="100" style={{ borderRadius: '20px' }} /> <h1 style={{ color: 'white' }}>Unbreakable Owl</h1></div></Section>
        <Section header="Wallet"><div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}><TonConnectButton /></div></Section>
        <Section header="Game Menu">
          <Cell onClick={() => setShowGame(true)} subtitle={`Spins: ${spins}/${MAX_SPINS} | Level ${stage}`}>
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play & Raid</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
