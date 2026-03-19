'use client';

import { useState } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [points, setPoints] = useState(0);
  const [showGame, setShowGame] = useState(false);

  // HET GAMESCHERM
  if (showGame) {
    return (
      <Page>
        <List>
          <Section>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
              <h1 style={{ fontSize: '48px', color: '#007AFF', margin: 0 }}>{points}</h1>
              <p style={{ color: 'gray' }}>Unity Points</p>
              <br />
              <img 
                src="/apple-touch-icon.png.jpg" 
                onClick={() => setPoints(points + 1)}
                style={{ width: '200px', borderRadius: '50%', cursor: 'pointer', border: '5px solid #007AFF' }} 
              />
              <br />
              <button 
                onClick={() => setShowGame(false)}
                style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#007AFF', color: 'white', fontWeight: 'bold' }}
              >
                Sluiten
              </button>
            </div>
          </Section>
        </List>
      </Page>
    );
  }

  // DE STARTPAGINA
  return (
    <Page>
      <List>
        <Section header="Unbreakable Owl">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <img src="/apple-touch-icon.png.jpg" width="100" style={{ borderRadius: '20px' }} />
            <h2 style={{ margin: '10px 0' }}>Unity Game</h2>
          </div>
        </Section>

        <Section header="Wallet">
          <Cell>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TonConnectButton />
            </div>
          </Cell>
        </Section>

        <Section header="Menu">
          <Cell onClick={() => setShowGame(true)} subtitle="Klik om te spelen">
            Start Game
          </Cell>
          <Cell subtitle="Komt binnenkort">
            Leaderboard
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
