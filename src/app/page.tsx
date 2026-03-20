'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, List, Cell } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const XP_PER_LEVEL = 10000;

export default function Home() {
  // --- ROBUUST GEHEUGEN SYSTEEM ---
  const [points, setPoints] = useState<number>(775);
  const [spins, setSpins] = useState<number>(10);
  const [shields, setShields] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [stage, setStage] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // 1. Data laden uit browsergeheugen
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const sh = localStorage.getItem('owl_shields');
    const st = localStorage.getItem('owl_stage');
    
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (sh) setShields(Number(sh));
    if (st) setStage(Number(st));
    
    setIsLoaded(true);
  }, []);

  // 2. Data direct opslaan bij elke verandering
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_shields', shields.toString());
      localStorage.setItem('owl_stage', stage.toString());
    }
  }, [points, spins, shields, stage, isLoaded]);

  // 3. Energie herstel (1 per minuut)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpins(p => p < MAX_SPINS ? p + 1 : p);
    }, 60000);
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
    if (spinning || isAttacking || spins < multiplier) {
      if (spins < multiplier) setEventMsg("❌ NO ENERGY! WAIT FOR REFILL");
      setAutoSpin(false);
      return;
    }

    // Start soundtrack bij eerste actie
    if (!isMuted && (!bgMusicRef.current || bgMusicRef.current.paused)) {
      toggleMusic();
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
        setPoints(p => p + (5 * multiplier));
        playSound('points');
      }
    }, 1000);
  };

  const handleWin = (symbol: string) => {
    if (symbol === '🔥') {
      if (shields < 3) {
        setShields(s => s + 1);
        setEventMsg("🛡️ SHIELD COLLECTED!");
        playSound('badge');
      } else {
        setPoints(p => p + (1000 * multiplier));
        setEventMsg("💰 SHIELDS FULL! +1000");
        playSound('cash');
      }
    } else if (symbol === '🔨') {
      setIsAttacking(true);
      playSound('bonus');
      setTimeout(() => {
        setShake(true);
        setEventMsg(`🔨 ATTACK BOOM! +${2000 * multiplier}`);
        setPoints(p => p + (2000 * multiplier));
        playSound('payout');
        setTimeout(() => { setShake(false); setIsAttacking(false); }, 1200);
      }, 2000);
    } else {
      const winAmt = symbol === '🦉' ? 10000 : 2500;
      setPoints(p => p + (winAmt * multiplier));
      setEventMsg(`🎉 BIG WIN! +${winAmt * multiplier}`);
      playSound(symbol === '🦉' ? 'victory' : 'jackpot');
      setTimeout(() => playSound('coins'), 500);
    }
  };

  return (
    <Page>
      <div style={{ 
        backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', 
        minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', padding: '10px', overflow: 'hidden',
        transform: shake ? 'scale(1.05) rotate(2deg)' : 'none', transition: 'transform 0.1s'
      }}>
        
        {/* HEADER AREA */}
        <div style={{ 
          width: '100%', backgroundColor: 'rgba(0,0,0,0.85)', padding: '12px', 
          borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '15px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{ opacity: i < shields ? 1 : 0.2 }}>🛡️</span>
              ))}
            </div>
            <TonConnectButton />
          </div>
        </div>

        {/* ENERGY BAR */}
        <div style={{ width: '100%', padding: '0 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '4px' }}>
            <span>🧪 ENERGY</span>
            <span>{spins} / {MAX_SPINS}</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: '#111', borderRadius: '5px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc', boxShadow: '0 0 10px #00ffcc' }} />
          </div>
        </div>

        {/* SLOTS AREA */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '35px', border: '2px solid #ffcc00' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ 
              fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#000', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', 
              filter: spinning ? 'blur(5px)' : 'none', border: '1px solid #222'
            }}>{s}</div>
          ))}
        </div>

        {/* MULTIPLIERS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ 
              width: '42px', height: '42px', borderRadius: '10px', border: 'none', 
              backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', 
              color: multiplier === m ? 'black' : 'white', fontWeight: 'bold'
            }}>x{m}</button>
          ))}
        </div>

        {/* CONTROLS AREA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning} style={{ 
            width: '140px', height: '140px', borderRadius: '50%', border: 'none', 
            backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', 
            boxShadow: spinning ? 'none' : '0 12px 0 #997a00' 
          }}>SPIN</button>

          <div onClick={toggleMusic} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>{isMuted ? '🔇' : '🎵'}</div>
             <span style={{ fontSize: '10px', color: '#888' }}>MUSIC</span>
          </div>
        </div>

        {/* STAGE FOOTER */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#ffcc00', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>STAGE {stage}</p>
          <p style={{ color: '#888', fontSize: '10px', margin: 0 }}>THE OWL'S NEST</p>
        </div>

        {eventMsg && (
          <div style={{ position: 'absolute', bottom: '100px', backgroundColor: '#ffcc00', color: 'black', padding: '10px 25px', borderRadius: '20px', fontWeight: 'bold', animation: 'slideUp 0.4s' }}>
            {eventMsg}
          </div>
        )}

        {isAttacking && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '120px', animation: 'owlAttack 2s forwards' }}>🦉🚀🔨</div>
          </div>
        )}

        <style>{`
          @keyframes owlAttack { 0% { transform: translate(-500px, 500px); } 50% { transform: translate(0, 0) scale(1.5); } 100% { transform: translate(500px, -500px); } }
          @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
      </div>
    </Page>
  );
}
