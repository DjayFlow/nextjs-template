'use client';

import { useState, useEffect, useRef } from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;

const LEADERBOARD_DATA = [
  { name: "KingOwl_99", points: 154200, rank: "🥇" },
  { name: "CryptoVogel", points: 98500, rank: "🥈" },
  { name: "DjayFlow", points: 75000, rank: "🥉" },
  { name: "SlotMaster", points: 42000, rank: "4" },
  { name: "LuckyBird", points: 12500, rank: "5" }
];

export default function Home() {
  const [points, setPoints] = useState(775);
  const [spins, setSpins] = useState(10); // Start met wat spins om te testen
  const [multiplier, setMultiplier] = useState(1);
  const [stage, setStage] = useState(1);
  
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [shake, setShake] = useState(false);
  const [eventMsg, setEventMsg] = useState('');

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- AUDIO ENGINE (FIXED) ---
  const playSound = (name: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const toggleMusic = (forcePlay?: boolean) => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }

    if (forcePlay === true || isMuted) {
      bgMusicRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      bgMusicRef.current.pause();
      setIsMuted(true);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && !isAttacking && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1200);
    } else if (autoSpin && spins < multiplier) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, isAttacking, spins, multiplier]);

  const spin = () => {
    // Check of we kunnen spinnen
    if (spinning || isAttacking) return;
    
    if (spins < multiplier) {
      setEventMsg("❌ GEEN SPINS MEER!");
      playSound('click');
      setAutoSpin(false);
      return;
    }

    // Start muziek als het nog niet speelt
    if (!isMuted && (!bgMusicRef.current || bgMusicRef.current.paused)) {
      toggleMusic(true);
    }

    playSound('spin');
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

    setSpinning(true);
    setSpins(p => p - multiplier);
    setEventMsg('');

    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]]);
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]];
      setReels(res);
      setSpinning(false); // <--- Cruciaal: spinning naar false

      if (res[0] === res[1] && res[1] === res[2]) {
        handleWin(res[0]);
      } else {
        setPoints(p => p + (5 * multiplier));
        playSound('points');
      }
    }, 1200);
  };

  const handleWin = (symbol: string) => {
    if (symbol === '🦉') {
      setEventMsg("👑 KONINGSUIL! +10.000");
      setPoints(p => p + (10000 * multiplier));
      playSound('victory');
    } else if (symbol === '💎') {
      setEventMsg("💎 DIAMANTEN REGEN! +7500");
      setPoints(p => p + (7500 * multiplier));
      playSound('megawin');
      setTimeout(() => playSound('cash'), 3000);
    } else if (symbol === '🔨') {
      setIsAttacking(true);
      playSound('bonus');
      setTimeout(() => {
        setShake(true);
        setEventMsg(`🔨 BOEM! +${1500 * multiplier}`);
        setPoints(p => p + (1500 * multiplier));
        playSound('payout');
        setTimeout(() => { 
          setShake(false); 
          setIsAttacking(false); 
        }, 1200);
      }, 2000);
    } else {
      const isJackpot = symbol === '🎰';
      setPoints(p => p + (2500 * multiplier));
      setEventMsg(`🎉 BIG WIN! +${2500 * multiplier}`);
      playSound(isJackpot ? 'jackpot' : 'win');
      setTimeout(() => playSound('coins'), 500);
    }
  };

  if (showLeaderboard) {
    return (
      <Page>
        <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', padding: '20px', color: 'white' }}>
          <Button onClick={() => setShowLeaderboard(false)} style={{ marginBottom: '20px' }}>TERUG NAAR NEST</Button>
          <h1 style={{ textAlign: 'center', color: '#ffcc00' }}>🏆 TOP UILEN</h1>
          <List style={{ backgroundColor: 'transparent' }}>
            {LEADERBOARD_DATA.map((u, i) => (
              <Cell key={i} subtitle={`${u.points.toLocaleString()} Credits`} style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '15px', marginBottom: '10px' }}>
                <span style={{ color: 'white' }}>{u.rank} {u.name}</span>
              </Cell>
            ))}
          </List>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div style={{ 
        backgroundImage: 'url(/sounds/high_quality_bg.png)', 
        backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', color: 'white', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', overflow: 'hidden',
        transform: shake ? 'scale(1.05) rotate(2deg)' : 'none', transition: 'transform 0.1s'
      }}>
        
        {/* BOINKERS STYLE HEADER */}
        <div style={{ 
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)', padding: '12px', borderRadius: '18px',
          borderBottom: '3px solid #ffcc00', marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💰</span>
            <span style={{ fontWeight: '900', color: '#ffcc00' }}>{points.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧪</span>
            <div style={{ width: '80px', height: '14px', backgroundColor: '#222', borderRadius: '7px', overflow: 'hidden', border: '1px solid #444' }}>
              <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} />
            </div>
            <span style={{ fontSize: '11px' }}>{spins}</span>
          </div>
          <TonConnectButton />
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
          <div onClick={() => { setShowLeaderboard(true); playSound('click'); }} style={{ cursor: 'pointer', fontSize: '24px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '50%', border: '1px solid #ffcc00' }}>🏆</div>
          <div onClick={() => { toggleMusic(); playSound('click'); }} style={{ cursor: 'pointer', fontSize: '24px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '50%', border: '1px solid #ffcc00' }}>
            {isMuted ? '🔇' : '🔊'}
          </div>
        </div>

        {isAttacking && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,204,0,0.15)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '120px', animation: 'owlAttack 2s forwards' }}>🦉🚀🔨</div>
          </div>
        )}

        <div style={{ margin: '30px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '35px', border: '2px solid #ffcc00' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ 
              fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#000', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', 
              filter: spinning ? 'blur(5px)' : 'none'
            }}>{s}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          {[1, 2, 3, 5].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ 
              width: '45px', height: '45px', borderRadius: '12px', border: 'none', 
              backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', 
              color: multiplier === m ? 'black' : 'white', fontWeight: '900'
            }}>x{m}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); }} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning || isAttacking} style={{ 
            width: '150px', height: '150px', borderRadius: '50%', border: 'none', 
            backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', 
            boxShadow: spinning ? 'none' : '0 12px 0 #997a00'
          }}>SPIN</button>

          <div onClick={() => { playSound('reward'); setSpins(p => Math.min(p + 10, MAX_SPINS)); setEventMsg("🎁 +10 SPINS!"); }} style={{ cursor: 'pointer', textAlign: 'center' }}>
             <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🎁</div>
             <span style={{ fontSize: '10px', color: '#888' }}>REFILL</span>
          </div>
        </div>

        {eventMsg && (
          <div style={{ 
            position: 'absolute', bottom: '120px', backgroundColor: '#ffcc00', color: 'black', 
            padding: '12px 25px', borderRadius: '20px', fontWeight: '900', animation: 'slideUp 0.4s'
          }}>
            {eventMsg}
          </div>
        )}

        <style>{`
          @keyframes owlAttack {
            0% { transform: translate(-500px, 500px) scale(0.3); }
            50% { transform: translate(0, 0) scale(1.6); }
            100% { transform: translate(500px, -500px) scale(0.3); }
          }
          @keyframes slideUp {
            from { transform: translateY(80px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </Page>
  );
}
