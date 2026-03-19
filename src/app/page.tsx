'use client';

import { useState } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [points, setPoints] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '💰', '🎰']);
  
  const icons = ['🦉', '💰', '💎', '🎰', '🔥'];

  // Functie voor trillen zonder extra pakketjes
  const triggerHaptic = (type: 'light' | 'medium' | 'success') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
      else tg.HapticFeedback.impactOccurred(type);
    }
  };

  const spin = () => {
    if (spinning) return;
    
    triggerHaptic('medium');
    setSpinning(true);
    
    const interval = setInterval(() => {
      setReels([
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalResult = [
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ];
      setReels(finalResult);
      setSpinning(false);

      if (finalResult[0] === finalResult[1] && finalResult[1] === finalResult[2]) {
        setPoints(p => p + 100);
        triggerHaptic('success');
      } else {
        setPoints(p => p + 5);
        triggerHaptic('light');
      }
    }, 1200);
  };

  if (showGame) {
    return (
      <Page back={true} onBackClick={() => setShowGame(false)}>
        <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1 style={{ fontSize: '55px', color: '#ffcc00', margin: 0, fontWeight: '900' }}>{points}</h1>
            <p style={{ color: '#666', letterSpacing: '2px', fontSize: '10px' }}>UNITY CREDITS</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#111', padding: '20px', borderRadius: '20px', border: '3px solid #333', marginTop: '30px' }}>
            {reels.map((symbol, i) => (
              <div key={i} style={{ fontSize: '40px', width: '70px', height: '90px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid #333' }}>
                {symbol}
              </div>
            ))}
          </div>

          <button 
            onClick={spin}
            disabled={spinning}
            style={{ 
              marginTop: '50px', width: '160px', height: '160px', borderRadius: '50%', border: 'none',
              backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '26px', fontWeight: '900',
              boxShadow: spinning ? 'none' : '0 10px 0 #997a00, 0 15px 30px rgba(255,204,0,0.3)',
              transform: spinning ? 'translateY(8px)' : 'none', transition: 'all 0.1s'
            }}
          >
            {spinning ? '...' : 'SPIN'}
          </button>

          <div onClick={() => setShowGame(false)} style={{ marginTop: 'auto', marginBottom: '30px', color: '#444', fontWeight: 'bold', fontSize: '12px' }}>
            BACK TO MENU
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <List style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
            <img src="/apple-touch-icon.png.jpg" width="110" style={{ borderRadius: '25px', boxShadow: '0 0 40px rgba(255,204,0,0.2)' }} />
            <h1 style={{ color: 'white', marginTop: '15px' }}>Unbreakable Owl</h1>
          </div>
        </Section>
        <Section header="Wallet Connection">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <TonConnectButton />
          </div>
        </Section>
        <Section header="Game Menu">
          <Cell onClick={() => setShowGame(true)} subtitle="Win big like Boinkers!">
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play Slot Machine</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
