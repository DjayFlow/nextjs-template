'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [points, setPoints] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '🦉', '🦉']);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥'];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    
    // Simuleer het draaien
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

      // Check voor winst (3 op een rij)
      if (finalResult[0] === finalResult[1] && finalResult[1] === finalResult[2]) {
        setPoints(p => p + 100);
        // Hier voegen we later de trilling toe!
      } else {
        setPoints(p => p + 5);
      }
    }, 1500);
  };

  if (showGame) {
    return (
      <Page>
        <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white', padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '48px', color: '#ffcc00', textShadow: '0 0 20px rgba(255,204,0,0.5)', margin: 0 }}>{points}</h1>
            <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Unity Credits</p>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '15px', 
            backgroundColor: '#1a1a1a', 
            padding: '30px 10px', 
            borderRadius: '20px',
            border: '4px solid #333',
            boxShadow: 'inset 0 0 20px black'
          }}>
            {reels.map((symbol, i) => (
              <div key={i} style={{ 
                fontSize: '50px', 
                width: '80px', 
                height: '100px', 
                backgroundColor: '#222', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '10px',
                border: '2px solid #444'
              }}>
                {symbol}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <button 
              onClick={spin}
              disabled={spinning}
              style={{ 
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: spinning ? '#555' : '#ffcc00',
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'black',
                boxShadow: spinning ? 'none' : '0 10px 0 #b38f00, 0 20px 30px rgba(255,204,0,0.3)',
                transform: spinning ? 'translateY(10px)' : 'none',
                transition: 'all 0.1s'
              }}
            >
              {spinning ? 'SPINNING...' : 'SPIN!'}
            </button>
          </div>

          <center style={{ marginTop: '40px' }}>
            <Button size="s" mode="tertiary" onClick={() => setShowGame(false)}>Back to Menu</Button>
          </center>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <List style={{ backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
        <Section>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <img src="/apple-touch-icon.png.jpg" width="120" style={{ borderRadius: '30px', boxShadow: '0 0 30px rgba(0,122,255,0.4)' }} />
            <h1 style={{ color: 'white' }}>Unbreakable Owl</h1>
            <p style={{ color: '#888' }}>Slot-style Telegram Game</p>
          </div>
        </Section>
        <Section header="TON Wallet">
          <Cell><center><TonConnectButton /></center></Cell>
        </Section>
        <Section header="Game Menu">
          <Cell onClick={() => setShowGame(true)} subtitle="Win Unity Credits with the slot machine!">
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play Slots</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
