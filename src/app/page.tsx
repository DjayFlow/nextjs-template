'use client';

import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  return (
    <Page back={false}>
      <List>
        {/* De Header met jouw Logo */}
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', gap: '15px' }}>
            <img 
              src="/owl-avatar.png" // De foto die je net hebt geüpload
              alt="Unbreakable Owl Logo" 
              style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} 
            />
            <h1 style={{ margin: 0, textAlign: 'center' }}>Unbreakable Owl</h1>
            <p style={{ color: 'gray', textAlign: 'center', margin: 0 }}>The ultimate blockchain challenge</p>
          </div>
        </Section>

        {/* Wallet Sectie */}
        <Section header="Account" footer="Connect your TON wallet to start playing.">
          <Cell>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <TonConnectButton />
            </div>
          </Cell>
        </Section>

        {/* Game Menu */}
        <Section header="Menu">
          <Cell subtitle="Battle for the Nest (Launching Soon)">
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
