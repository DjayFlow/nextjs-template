'use client';

import { useState } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [showGame, setShowGame] = useState(false);
  const [points, setPoints] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  // --- DIT IS HET GAMESCHERM ---
  if (showGame) {
    return (
      <Page back={true} onBackClick={() => setShowGame(false)}>
        <List>
          <Section>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '20px' }}>
              <h1 style={{ fontSize: '48px', margin: 0, color: '#007AFF' }}>{points}</h1>
              <p style={{ color: 'gray', margin: 0 }}>Unity Points</p>
              
              <div 
                onClick={() => setPoints((prev) => prev + 1)}
                onPointerDown={() => setIsPressed(true)}
                onPointerUp={() => setIsPressed(false)}
                onPointerLeave={() => setIsPressed(false)}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.1s',
                  transform: isPressed ? 'scale(0.92)' : 'scale(1)' 
                }}
              >
                <img 
                  src="/apple-touch-icon.png.jpg" 
                  alt="Owl"
                  style={{ 
                    width: '220px', 
                    height: '220px',
                    borderRadius: '50%', 
                    boxShadow: '0 0 30px rgba(0,122,255,0.5)', 
                    border: '5px solid white' 
                  }} 
                />
              </div>
            </div>
            <Cell onClick={() => setShowGame(false)} style={{ textAlign: 'center' }}>
              <span style={{ color: '#007AFF', fontWeight: 'bold' }}>Terug naar Menu</span>
            </Cell>
          </Section>
        </List>
      </Page>
    );
  }

  // --- DIT IS JE STARTPAGINA ---
  return (
    <Page back={false}>
      <List>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', gap: '10px' }}>
            <img 
              src="/apple-touch-icon.png.jpg" 
              alt="Unbreakable Owl Logo" 
              style={{ width: '120px', height: '120px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,122,255,0.3)' }} 
            />
            <h1 style={{ margin: 0, fontSize: '24px' }}>Unbreakable Owl</h1>
            <p style={{ color: 'gray', margin: 0 }}>The ultimate blockchain challenge</p>
          </div>
        </Section>

        <Section header="Wallet">
          <Cell>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <TonConnectButton />
            </div>
          </Cell>
        </Section>

        <Section header="Menu">
          <Cell 
            before={<img src="/apple-touch-icon.png.jpg" width={32} height={32} style={{borderRadius: '8px'}}/>}
            subtitle="Battle for the Nest: Online"
            onClick={() => setShowGame(true)}
          >
            Start Game
          </Cell>
          <Cell subtitle="Global Ranking">
            Leaderboard
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
