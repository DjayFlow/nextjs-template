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

  // Veilige manier om te trillen zonder dat Vercel crasht
  const triggerHaptic = (type: string) => {
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
      const res = [
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ];
      setReels(res);
      setSpinning(false);

      if (res[0] === res[1] && res[1] === res[2]) {
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
            <h1 style={{ fontSize: '50px', color: '#ffcc00', margin: 0 }}>{points}</h1>
            <p style={{ color: '#666', letterSpacing: '2px' }}>UNITY CREDITS</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#111', padding: '20px', borderRadius: '20px', border: '3px solid #333', marginTop: '30px' }}>
            {reels.map((s, i) => (
              <div key={i} style={{ fontSize: '40px', width: '70px', height: '90px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{s}</div>
            ))}
          </div>
          <button 
            onClick={spin}
            disabled={spinning}
            style={{ 
              marginTop: '50px', width: '160px', height: '160px', borderRadius: '50%', border: 'none',
              backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '24px', fontWeight: '900',
              boxShadow: spinning ? 'none' : '0 10px 0 #997a00, 0 15px 30px rgba(255,204,0,0.3)',
              transform: spinning ? 'translateY(8px)' : 'none', transition: 'all 0.1s'
            }}
          >
            {spinning ? '...' : 'SPIN'}
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <List style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <img src="/apple-touch-icon.png.jpg" width="110" style={{ borderRadius: '25px' }} />
            <h1 style={{ color: 'white' }}>Unbreakable Owl</h1>
          </div>
        </Section>
        <Section header="TON Wallet">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <TonConnectButton />
          </div>
        </Section>
        <Section header="Menu">
          <Cell onClick={() => setShowGame(true)} subtitle="Win big like Boinkers!">
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play Slots</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}

