'use client';

import { useState } from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

// --- VISUAL CONSTANTS (Modern Casino Theme) ---
const THEME = {
  bg: 'radial-gradient(circle at center, #1c1c3e 0%, #0d0e20 100%)', // Modern Dark Navy/Purple
  cardBg: 'rgba(255, 255, 255, 0.04)', // Sophisticated glass effect
  cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
  gold: '#ffcc00', // Popped Gold
  reelBg: '#1c1d2e', // Backlit reel
};

const MAX_SPINS = 50;

export default function Home() {
  // Sync met jouw huidige stats
  const [points, setPoints] = useState(125); // Start met zijn 125 credits
  const [spins, setSpins] = useState(44); // Start met zijn 44 spins
  const [stage, setStage] = useState(1);
  
  const [showGame, setShowGame] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '🔥']);
  const [animatingOwl, setAnimatingOwl] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥'];

  // De veilige manier om te trillen (Vercel-proof!)
  const triggerHaptic = (group: 'impact' | 'notification' | 'selection', type: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (group === 'notification') tg.HapticFeedback.notificationOccurred(type);
      else if (group === 'impact') tg.HapticFeedback.impactOccurred(type);
    }
  };

  const spin = () => {
    if (spinning || spins <= 0) return;

    triggerHaptic('impact', 'medium');
    setSpinning(true);
    setSpins(p => p - 1);
    
    // Animate Owl on Spin Start
    setAnimatingOwl(true);
    setTimeout(() => setAnimatingOwl(false), 300);
    
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
        // --- WINNAAR! ---
        setPoints(p => p + 100);
        triggerHaptic('notification', 'success');
      } else {
        // --- VERLIEZER (Kleine troostprijs) ---
        setPoints(p => p + 5);
        triggerHaptic('impact', 'light');
      }
    }, 1200);
  };

  // --- HET GAMESCHERM (HIGH-QUALITY MODERN CASINO STYLE) ---
  if (showGame) {
    return (
      <Page>
        {/* Feature 1: Dynamic "House" Background */}
        <div style={{ background: THEME.bg, minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
          
          {/* Top Section: Character Badge & Stage Progress */}
          <div style={{ textAlign: 'center', marginTop: '10px', width: '100%', marginBottom: '20px' }}>
            {/* Feature 4: Glowing Collectible Owl Badge */}
            <div style={{
              position: 'relative', width: '90px', height: '90px', margin: '0 auto', marginBottom: '10px',
              borderRadius: '50%', border: `4px solid ${THEME.gold}`, 
              boxShadow: spinning ? `0 0 30px ${THEME.gold}` : '0 0 15px rgba(255,204,0,0.3)',
              background: 'radial-gradient(circle at center, #2c2d3e 0%, #1c1d2e 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: animatingOwl ? 'owlPulse 0.3s ease-out' : 'none'
            }}>
              <span style={{ fontSize: '60px' }}>🦉</span>
            </div>
            
            <p style={{ color: '#aaa', letterSpacing: '2px', fontSize: '10px', margin: 0 }}>STAGE {stage}</p>
            <h2 style={{ fontSize: '18px', color: 'white', margin: 0, fontWeight: '900', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>The Owl's Nest</h2>
          </div>

          {/* Unity Point Display (Gold Gleam!) */}
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <h1 style={{ fontSize: '55px', color: THEME.gold, margin: 0, fontWeight: '900', textShadow: `0 0 15px rgba(255,204,0,0.5)` }}>{points}</h1>
            <p style={{ color: '#aaa', letterSpacing: '2px', fontSize: '10px', fontWeight: 'bold' }}>UNITY CREDITS</p>
          </div>

          {/* Feature 2: Illuminated Casino Reels */}
          <div style={{
            display: 'flex', gap: '10px', backgroundColor: THEME.reelBg, padding: '20px', borderRadius: '25px', 
            border: THEME.cardBorder, boxShadow: 'inset 0 0 25px black, 0 5px 15px rgba(0,0,0,0.5)',
            marginTop: '30px'
          }}>
            {reels.map((symbol, i) => (
              <div key={i} style={{
                fontSize: '45px', width: '75px', height: '95px', backgroundColor: '#111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '15px', border: '1px solid #333',
                boxShadow: `0 0 10px rgba(255,255,255,0.02)` // subtle backlit glow
              }}>
                {symbol}
              </div>
            ))}
          </div>

          {/* SPIN KNOP (Boinkers/Original Spin Vibe) */}
          <button 
            onClick={spin}
            disabled={spinning || spins <= 0} 
            style={{ 
              marginTop: '40px', width: '160px', height: '160px', borderRadius: '50%', border: 'none',
              backgroundColor: spins <= 0 ? '#333' : (spinning ? '#444' : THEME.gold), color: 'black', fontSize: '28px', fontWeight: '900',
              boxShadow: (spins <= 0 || spinning) ? 'none' : `0 10px 0 #997a00, 0 15px 30px rgba(255,204,0,0.4)`,
              transform: (spinning || spins <= 0) ? 'translateY(8px)' : 'none', transition: 'all 0.1s'
            }}
          >
            {spinning ? '...' : (spins <= 0 ? 'LEEG' : 'SPIN')}
          </button>

          {/* Spins Teller */}
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <h3 style={{ color: THEME.gold, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{spins} / {MAX_SPINS}</h3>
            <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>SPINS</p>
          </div>

          <div onClick={() => setShowGame(false)} style={{ marginTop: 'auto', marginBottom: '20px', color: '#444', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            TERUG NAAR LOBBY
          </div>
          
          <style>{`
            @keyframes owlPulse {
              0% { transform: scale(1); box-shadow: 0 0 15px rgba(255,204,0,0.3); }
              50% { transform: scale(1.1); box-shadow: 0 0 35px ${THEME.gold}; }
              100% { transform: scale(1); box-shadow: 0 0 20px ${THEME.gold}; }
            }
          `}</style>
        </div>
      </Page>
    );
  }

  // --- STARTPAGINA (MODERN CASINO LOBBY) ---
  return (
    <Page>
      {/* Feature 1: Modern Background Across entire app */}
      <List style={{ background: THEME.bg, minHeight: '100vh', padding: '10px' }}>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
            <img src="/apple-touch-icon.png.jpg" width="120" style={{ borderRadius: '30px', boxShadow: `0 0 50px rgba(255,204,0,0.2)` }} />
            <h1 style={{ color: 'white', marginTop: '20px', fontSize: '32px' }}>Unbreakable Owl</h1>
            <p style={{color: 'gray', textAlign: 'center'}}>The ultimate casino & house challenge.</p>
          </div>
        </Section>
        
        {/* Feature 3: Glassmorphism Card Style */}
        <Section header="Wallet Connection">
          <Cell style={{ backgroundColor: THEME.cardBg, border: THEME.cardBorder, borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
              <TonConnectButton />
            </div>
          </Cell>
        </Section>

        <Section header="Game Menu">
          <Cell 
            onClick={() => { triggerHaptic('impact', 'light'); setShowGame(true); }} 
            subtitle={`Spins: ${spins}/${MAX_SPINS} | Points: ${points}`}
            style={{ backgroundColor: THEME.cardBg, border: THEME.cardBorder, borderRadius: '15px', margin: '0 10px', cursor: 'pointer' }}
          >
            <span style={{ color: THEME.gold, fontWeight: 'bold', fontSize: '18px' }}>🎰 Start Spinning</span>
          </Cell>
        </Section>
      </List>
    </Page>
  );
}
