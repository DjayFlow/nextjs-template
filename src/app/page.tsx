'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, List, Cell, Progress } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const XP_PER_LEVEL = 10000;

export default function Home() {
  // --- PERSISTENT STATE ---
  const [points, setPoints] = useState<number>(13344);
  const [spins, setSpins] = useState<number>(50);
  const [shields, setShields] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- UI STATE ---
  const [multiplier, setMultiplier] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [isMuted, setIsMuted] = useState(false);
  const [eventMsg, setEventMsg] = useState('');
  const [isAttacking, setIsAttacking] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // 1. Data laden uit browsergeheugen
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const sh = localStorage.getItem('owl_shields');
    const l = localStorage.getItem('owl_level');
    const x = localStorage.getItem('owl_xp');
    
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (sh) setShields(Number(sh));
    if (l) setLevel(Number(l));
    if (x) setXp(Number(x));
    
    setIsLoaded(true);
  }, []);

  // 2. Data direct opslaan
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_shields', shields.toString());
      localStorage.setItem('owl_level', level.toString());
      localStorage.setItem('owl_xp', xp.toString());
    }
  }, [points, spins, shields, level, xp, isLoaded]);

  // 3. Snelle Energie herstel (Boinkers vibe)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpins(p => p < MAX_SPINS ? p + 1 : p);
    }, 30000); // Elke 30 sec 1 spin erbij
    return () => clearInterval(interval);
  }, []);

  const playSound = (name: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const toggleMusic = () => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }
    if (isMuted) {
      bgMusicRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      bgMusicRef.current.pause();
      setIsMuted(true);
    }
  };

  const spin = () => {
    if (spinning || spins < multiplier) {
      if (spins < multiplier) setEventMsg("❌ NO ENERGY! CLAIM DAILY GIFT 🎁");
      setAutoSpin(false);
      return;
    }

    if (!isMuted && (!bgMusicRef.current || bgMusicRef.current.paused)) toggleMusic();

    playSound('spin');
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
      setSpinning(false);

      if (res[0] === res[1] && res[1] === res[2]) {
        handleWin(res[0]);
      } else {
        addXp(5 * multiplier);
        setPoints(p => p + (5 * multiplier));
        playSound('points');
      }
    }, 1000);
  };

  const addXp = (amt: number) => {
    setXp(current => {
      const total = current + amt;
      if (total >= XP_PER_LEVEL) {
        setLevel(l => l + 1);
        playSound('level');
        setEventMsg(`🚀 LEVEL UP! NU LEVEL ${level + 1}`);
        return 0;
      }
      return total;
    });
  };

  const handleWin = (symbol: string) => {
    let winAmt = 500;
    if (symbol === '🦉') winAmt = 10000;
    else if (symbol === '🎰') winAmt = 5000;
    else if (symbol === '💎') winAmt = 2500;

    setPoints(p => p + (winAmt * multiplier));
    addXp(winAmt / 10);
    setEventMsg(`🎉 BIG WIN! +${winAmt * multiplier}`);
    playSound(symbol === '🦉' ? 'victory' : 'win');
    setTimeout(() => playSound('coins'), 500);
  };

  const claimDaily = () => {
    setSpins(MAX_SPINS);
    setEventMsg("🎁 DAILY 50 SPINS GRANTED!");
    playSound('reward');
  };

  return (
    <Page>
      <div style={{ 
        backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', 
        minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', padding: '10px', overflow: 'hidden'
      }}>
        
        {/* --- PRO HEADER --- */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{ opacity: i < shields ? 1 : 0.2, filter: 'drop-shadow(0 0 5px blue)' }}>🛡️</span>
              ))}
            </div>
            <TonConnectButton />
          </div>
          {/* PET LEVEL BAR */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#222', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${(xp / XP_PER_LEVEL) * 100}%`, height: '100%', backgroundColor: '#a020f0', boxShadow: '0 0 10px #a020f0' }} />
          </div>
        </div>

        {/* SIDE BUTTONS (QUESTS/SHOP) */}
        <div style={{ position: 'absolute', left: '10px', top: '120px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🛰️</div><span style={{ fontSize: '8px' }}>RADAR</span></div>
           <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🚢</div><span style={{ fontSize: '8px' }}>FLEET</span></div>
        </div>

        <div style={{ position: 'absolute', right: '10px', top: '120px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🛒</div><span style={{ fontSize: '8px' }}>SHOP</span></div>
           <div onClick={toggleMusic} style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>{isMuted ? '🔇' : '🎵'}</div><span style={{ fontSize: '8px' }}>MUSIC</span></div>
        </div>

        {/* ENERGY BAR */}
        <div style={{ width: '100%', padding: '0 40px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>🧪 ENERGY POWER</span>
            <span>{spins} / {MAX_SPINS}</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc', boxShadow: '0 0 15px #00ffcc' }} />
          </div>
        </div>

        {/* SLOTS */}
        <div style={{ margin: '40px 0', display: 'flex', gap: '12px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '40px', border: '3px solid #ffcc00', boxShadow: '0 0 50px black' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '50px', width: '80px', height: '110px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(6px)' : 'none', border: '1px solid #222' }}>{s}</div>
          ))}
        </div>

        {/* MULTIPLIERS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ width: '45px', height: '45px', borderRadius: '12px', border: 'none', backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', color: multiplier === m ? 'black' : 'white', fontWeight: '900', boxShadow: multiplier === m ? '0 0 15px #ffcc00' : 'none' }}>x{m}</button>
          ))}
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444', fontSize: '24px' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888', fontWeight: 'bold' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning} style={{ width: '160px', height: '160px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '36px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 15px 0 #997a00, 0 20px 40px rgba(0,0,0,0.6)' }}>SPIN</button>

          <div onClick={claimDaily} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444', fontSize: '24px' }}>🎁</div>
             <span style={{ fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}>GIFT</span>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div style={{ marginTop: 'auto', marginBottom: '20px', textAlign: 'center' }}>
           <p style={{ color: '#ffcc00', fontSize: '14px', fontWeight: 'bold', margin: 0, textShadow: '2px 2px 0 black' }}>OWL LEVEL: {level}</p>
           <p style={{ color: '#888', fontSize: '10px', margin: 0 }}>THE UNBREAKABLE NEST • STAGE 1</p>
        </div>

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: '900', fontSize: '20px', zIndex: 1000, boxShadow: '0 0 50px gold', animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>{eventMsg}</div>
        )}

        <style>{`
          @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
        `}</style>
      </div>
    </Page>
  );
}
