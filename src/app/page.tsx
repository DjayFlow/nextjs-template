'use client';

import { useState } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useHapticFeedback } from '@telegram-apps/sdk-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [points, setPoints] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '💰', '🎰']);
  
  const haptic = useHapticFeedback();
  const icons = ['🦉', '💰', '💎', '🎰', '🔥'];

  const spin = () => {
    if (spinning) return;
    
    // 📳 START VIBE
    haptic.impactOccurred('medium');
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
        // 📳 WIN VIBE!
        haptic.notificationOccurred('success');
      } else {
        setPoints(p => p + 5);
        haptic.impactOccurred('light');
      }
    }, 1200);
  };

  // --- HET GAMESCHERM (DARK CASINO STYLE) ---
  if (showGame) {
    return (
      <Page>
        <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <h1 style={{ fontSize: '55px', color: '#ffcc00', margin: 0, fontWeight: '900', textShadow: '0 0 20px rgba(255,204,0,0.6)' }}>{points}</h1>
            <p style={{ color: '#666', letterSpacing: '3px', fontSize: '10px', fontWeight: 'bold' }}>UNITY CREDITS</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', backgroundColor: '#111', padding: '25px', borderRadius: '25px', border: '4px solid #222', boxShadow: 'inset 0 0 30px #000', marginTop: '40px' }}>
            {reels.map((symbol, i) => (
              <div key={i} style={{ fontSize: '42px', width: '75px', height: '100px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', border: '1px solid #333' }}>
                {symbol}
              </div>
            ))}
          </div>

          <button 
            onClick={spin}
            disabled={spinning}
            style={{ 
              marginTop: '60px', width: '170px', height: '170px', borderRadius: '50%', border: 'none',
              backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900',
              boxShadow: spinning ? 'none' : '0 12px 0 #997a00, 0 20px 40px rgba(255,204,0,0.3)',
              transform: spinning ? 'translateY(10px)' : 'none', transition: 'all 0.1s'
            }}
          >
            {spinning ? '...' : 'SPIN'}
          </button>

          <div onClick={() => setShowGame(false)} style={{ marginTop: 'auto', marginBottom: '40px', color: '#444', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            BACK TO MENU
          </div>
        </div>
      </Page>
    );
  }

  // --- DE STARTPAGINA ---
  return (
    <Page>
      <List style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
            <img src="/apple-touch-icon.png.jpg" width="120" style={{ borderRadius: '30px', boxShadow: '0 0 50px rgba(255,204,0,0.2)' }} />
            <h1 style={{ color: 'white', marginTop: '20px', fontSize: '28px' }}>Unbreakable Owl</h1>
          </div>
        </Section>
        
        <Section header="TON Wallet">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '15px' }}>
            <TonConnectButton />
          </div>
        </Section>

        <Section header="Play & Earn">
          <Cell 
            onClick={() => { haptic.impactOccurred('light'); setShowGame(true); }} 
            subtitle="The ultimate slot challenge"
            style={{ backgroundColor: '#111', borderRadius: '15px', margin: '0 10px' }}
          >
            <span style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '18px' }}>🎰 Start Spinning</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
