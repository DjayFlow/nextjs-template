'use client';

import { Section, Cell, Image, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

export default function Home() {
  return (
    <Page back={false}>
      <List>
        {/* De Header met jouw Logo */}
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <img 
              src="/apple-touch-icon.png" 
              alt="Unbreakable Owl Logo" 
              style={{ width: '100px', height: '100px', borderRadius: '20px', marginBottom: '10px' }} 
            />
            <h1 style={{ margin: 0 }}>Unbreakable Owl</h1>
            <p style={{ color: 'gray' }}>The ultimate blockchain challenge</p>
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
          <Cell 
            before={<Image src="/apple-touch-icon.png" width={24} height={24}/>}
            subtitle="Coming soon: Battle for the Nest"
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
