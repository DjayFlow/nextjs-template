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
  const [reels, setReels] = useState(['🦉', '🦉', '🦉']);
  
  const haptic = useHapticFeedback();
  const icons = ['🦉', '💰', '💎', '🎰', '🔥'];

  const spin = () => {
    if (spinning) return;
    
    // Kleine trilling bij het starten
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
        haptic.notificationOccurred('success'); // Feest-trilling!
      } else {
        setPoints(p => p + 5);
        haptic.impactOccurred('light'); // Tikje bij stop
      }
    }, 1500);
  };

  if (showGame) {
    return (
      <Page>
        <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '42px', color: '#ffcc00', margin: 0 }}>{points}</h1>
            <p style={{ color: '#888', fontSize: '12px', letterSpacing: '2px' }}>UNITY CREDITS</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#1a1a1a', padding: '25px', borderRadius: '20px', border: '3px solid #333', boxShadow: 'inset 0 0 20px black' }}>
            {reels.map((symbol, i) => (
              <div key={i} style={{ fontSize: '45px', width: '75px', height: '90px', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid #444' }}>
                {symbol}
              </div>
            ))}
          </div>

          <button 
            onClick={spin}
            disabled={spinning}
            style={{ 
              marginTop: '50px', width: '180px', height: '180px', borderRadius: '50%', border: 'none',
              backgroundColor: spinning ? '#444' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900',
              boxShadow: spinning ? 'none' : '0 10px 0 #b38f00, 0 15px 30px rgba(255,204,0,0.4)',
              transform: spinning ? 'translateY(8px)' : 'none', transition: 'all 0.1s'
            }}
          >
            {spinning ? '...' : 'SPIN!'}
          </button>

          <div onClick={() => setShowGame(false)} style={{ marginTop: '40px', color: '#555', fontWeight: 'bold', cursor: 'pointer' }}>
            BACK TO MENU
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <List style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
            <img src="/apple-touch-icon.png.jpg" width="110" style={{ borderRadius: '25px', boxShadow: '0 0 40px rgba(255,204,0,0.3)' }} />
            <h1 style={{ color: 'white', marginTop: '15px' }}>Unbreakable Owl</h1>
          </div>
        </Section>
        <Section header="Wallet">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <TonConnectButton />
          </div>
        </Section>
        <Section header="Menu">
          <Cell onClick={() => { haptic.impactOccurred('light'); setShowGame(true); }} subtitle="Win big with the Slot Machine">
            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>🎰 Play Slots</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
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
