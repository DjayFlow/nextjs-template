'use client';

import { useState, useEffect, useRef } from 'react';
import { Section, Cell, List, Button, Progress } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const XP_PER_LEVEL = 5000;

export default function Home() {
  // --- STATE MET LOCALSTORAGE (Persistente data) ---
  const [points, setPoints] = useState(775);
  const [spins, setSpins] = useState(10);
  const [shields, setShields] = useState(0);
  const [xp, setXp] = useState(0);
  const [stage, setStage] = useState(1);
  
  const [multiplier, setMultiplier] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [isMuted, setIsMuted] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [shake, setShake] = useState(false);
  const [eventMsg, setEventMsg] = useState('');

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- LOKALE OPSLAG LADEN ---
  useEffect(() => {
    const savedPoints = localStorage.getItem('owl_points');
    const savedSpins = localStorage.getItem('owl_spins');
    const savedShields = localStorage.getItem('owl_shields');
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedSpins) setSpins(parseInt(savedSpins));
    if (savedShields) setShields(parseInt(savedShields));
  }, []);

  // --- LOKALE OPSLAG OPSLAAN ---
  useEffect(() => {
    localStorage.setItem('owl_points', points.toString());
    localStorage.setItem('owl_spins', spins.toString());
    localStorage.setItem('owl_shields', shields.toString());
  }, [points, spins, shields]);

  // --- ENERGIE REGEN (1 spin elke 60 sec) ---
  useEffect(() => {
    const regenInterval = setInterval(() => {
      setSpins(p => p < MAX_SPINS ? p + 1 : p);
    }, 60000); 
    return () => clearInterval(regenInterval);
  }, []);

  const playSound = (name: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const spin = () => {
    if (spinning || isAttacking || spins < multiplier) {
      if (spins < multiplier) setEventMsg("❌ NO ENERGY! WAIT FOR REFILL");
      setAutoSpin(false);
      return;
    }

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
        addPoints(5 * multiplier);
        playSound('points');
      }
    }, 1000);
  };

  const addPoints = (amt: number) => {
    setPoints(p => p + amt);
    setXp(x => {
      const newXp = x + (amt / 10);
      if (newXp >= XP_PER_LEVEL) {
        setStage(s => s + 1);
        playSound('level');
        setEventMsg(`🚀 STAGE UP! LEVEL ${stage + 1}`);
        return 0;
      }
      return newXp;
    });
  };

  const handleWin = (symbol: string) => {
    if (symbol === '🔥') {
      if (shields < 3) {
        setShields(s => s + 1);
        setEventMsg("🛡️ SHIELD COLLECTED!");
        playSound('badge');
      } else {
        addPoints(1000 * multiplier);
        setEventMsg("💰 SHIELDS FULL! +1000 CASH");
        playSound('cash');
      }
    } else if (symbol === '🔨') {
      setIsAttacking(true);
      playSound('bonus');
      setTimeout(() => {
        setShake(true);
        setEventMsg(`🔨 ATTACK SUCCESS! +${2000 * multiplier}`);
        addPoints(2000 * multiplier);
        playSound('payout');
        setTimeout(() => { setShake(false); setIsAttacking(false); }, 1200);
      }, 2000);
    } else {
      const winAmt = symbol === '🦉' ? 10000 : 2500;
      addPoints(winAmt * multiplier);
      setEventMsg(`🎉 BIG WIN! +${winAmt * multiplier}`);
      playSound(symbol === '🦉' ? 'victory' : 'jackpot');
      setTimeout(() => playSound('coins'), 500);
    }
  };

  return (
    <Page>
      <div style={{ 
        backgroundImage: 'url(/sounds/high_quality_bg.png)', 
        backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', color: 'white', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', overflow: 'hidden',
        transform: shake ? 'scale(1.05) rotate(2deg)' : 'none', transition: 'transform 0.1s'
      }}>
        
        {/* --- DYNAMIC HEADER --- */}
        <div style={{ 
          width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '20px',
          borderBottom: '3px solid #ffcc00', marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
             <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
               <span style={{ fontSize: '20px' }}>💰</span>
               <span style={{ fontWeight: '900', color: '#ffcc00' }}>{points.toLocaleString()}</span>
             </div>
             <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
               {Array.from({length: 3}).map((_, i) => (
                 <span key={i} style={{ opacity: i < shields ? 1 : 0.2, fontSize: '18px' }}>🛡️</span>
               ))}
             </div>
             <TonConnectButton />
          </div>
          
          {/* XP Progress Bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: '#222', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(xp / XP_PER_LEVEL) * 100}%`, height: '100%', backgroundColor: '#a020f0', boxShadow: '0 0 10px #a020f0' }} />
          </div>
        </div>

        {/* Energy/Spins Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '20px', marginBottom: '15px' }}>
          <span style={{ fontSize: '14px' }}>🧪 ENERGY:</span>
          <div style={{ width: '100px', height: '10px', backgroundColor: '#111', borderRadius: '5px', overflow: 'hidden', border: '1px solid #444' }}>
            <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{spins}/{MAX_SPINS}</span>
        </div>

        {/* --- SLOT MACHINE --- */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '35px', border: '2px solid rgba(255,204,0,0.3)', boxShadow: 'inset 0 0 40px black' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ 
              fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#0a0a0a', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', 
              filter: spinning ? 'blur(5px)' : 'none', border: '1px solid #333'
            }}>{s}</div>
          ))}
        </div>

        {/* Multipliers */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ 
              width: '42px', height: '42px', borderRadius: '10px', border: 'none', 
              backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', 
              color: multiplier === m ? 'black' : 'white', fontWeight: '900'
            }}>x{m}</button>
          ))}
        </div>

        {/* Hoofd Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); }} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888', fontWeight: 'bold' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning || isAttacking} style={{ 
            width: '140px', height: '140px', borderRadius: '50%', border: 'none', 
            backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '30px', fontWeight: '900', 
            boxShadow: spinning ? 'none' : '0 12px 0 #997a00'
          }}>SPIN</button>

          <div onClick={() => { playSound('reward'); setPoints(p => p + 500); setEventMsg("🎁 GIFT COLLECTED!"); }} style={{ cursor: 'pointer', textAlign: 'center' }}>
             <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🎁</div>
             <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>GIFT</span>
          </div>
        </div>

        {/* Status Text */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
           <p style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '12px' }}>STAGE {stage}: THE OWL'S NEST</p>
        </div>

        {/* Overlays */}
        {eventMsg && (
          <div style={{ 
            position: 'absolute', bottom: '100px', backgroundColor: '#ffcc00', color: 'black', 
            padding: '12px 25px', borderRadius: '20px', fontWeight: '900', boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.4s'
          }}>{eventMsg}</div>
        )}

        {isAttacking && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '120px', animation: 'owlAttack 2s forwards' }}>🦉🚀🔨</div>
          </div>
        )}

        <style>{`
          @keyframes owlAttack {
            0% { transform: translate(-500px, 500px) scale(0.3); }
            50% { transform: translate(0, 0) scale(1.6); }
            100% { transform: translate(500px, -500px) scale(0.3); }
          }
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </Page>
  );
}
