'use client';

import { useState } from 'react';
import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  const [points, setPoints] = useState(0);
  const [showGame, setShowGame] = useState(false);

  // GAMESCHERM
  if (showGame) {
    return (
      <Page back={true} onBackClick={() => setShowGame(false)}>
        <List>
          <Section>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h1 style={{ fontSize: '48px', color: '#007AFF' }}>{points}</h1>
              <p>Unity Points</p>
              <br />
              <img 
                src="/apple-touch-icon.png.jpg" 
                onClick={() => setPoints(points + 1)}
                style={{ width: '200px', borderRadius: '50%', cursor: 'pointer' }} 
              />
            </div>
            <Cell onClick={() => setShowGame(false)}>
              <center><b>Sluiten</b></center>
            </Cell>
          </Section>
        </List>
      </Page>
    );
  }

  // STARTPAGINA
  return (
    <Page back={false}>
      <List>
        <Section header="Unbreakable Owl">
          <Cell>
            <center>
              <img src="/apple-touch-icon.png.jpg" width="100" style={{borderRadius: '20px'}} />
              <h2>Unity Game</h2>
            </center>
          </Cell>
        </Section>

        <Section header="Wallet">
          <Cell>
            <center><TonConnectButton /></center>
          </Cell>
        </Section>

        <Section header="Menu">
          <Cell onClick={() => setShowGame(true)} subtitle="Klik om te spelen">
            Start Game
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
