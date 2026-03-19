'use client';

import { useState } from 'react';
import { Section, Cell, Image, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [showGame, setShowGame] = useState(false);
  const [points, setPoints] = useState(0);

  // --- DIT IS HET SCHERM ALS JE DE GAME START ---
  if (showGame) {
    return (
      <Page back={true} onBackClick={() => setShowGame(false)}>
        <List>
          <Section>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '20px' }}>
              <h1 style={{ fontSize: '48px', margin: 0, color: '#007AFF' }}>{points}</h1>
              <p style={{ color: 'gray', margin: 0 }}>Unity Points</p>
              
              <div 
                onClick={() => setPoints(points + 1)}
                style={{ cursor: 'pointer', transform: 'scale(1)', transition: 'transform 0.1s' }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src="/apple-touch-icon.png.jpg" 
                  style={{ width: '220px', borderRadius: '50%', boxShadow: '0 0 30px rgba(0,122,255,0.5)', border: '5px solid white' }} 
                />
              </div>
            </div>
            {/* Extra knop om terug te gaan als de hardware knop hapert */}
            <Cell onClick={() => setShowGame(false)} style={{ textAlign: 'center' }}>
              <span style={{ color: '#007AFF', fontWeight: 'bold' }}>Back to Menu</span>
            </Cell>
          </Section>
          <Section header="Game Manual">
            <Cell subtitle="Tap the Unbreakable Owl to earn points for your ranking!">
              How to play
            </Cell>
          </Section>
        </List>
      </Page>
    );
  }

  // --- DIT IS JE STANDAARD STARTPAGINA ---
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

        <Section header="Account" footer="Connect your TON wallet to start playing.">
          <Cell>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <TonConnectButton />
            </div>
          </Cell>
        </Section>

        <Section header="Menu">
          <Cell 
            before={<Image src="/apple-touch-icon.png.jpg" width={32} height={32} style={{borderRadius: '8px'}}/>}
            subtitle="Battle for the Nest: Online"
            onClick={() => setShowGame(true)} // Hier vliegen we de game in!
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
