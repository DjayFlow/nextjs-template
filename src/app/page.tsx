'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, List, Cell, Modal, AppRoot } from '@telegram-apps/telegram-ui';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const XP_PER_LEVEL = 10000;

export default function Home() {
  // --- PERSISTENT DATA ---
  const [points, setPoints] = useState<number>(13344);
  const [spins, setSpins] = useState<number>(50);
  const [maxSpins, setMaxSpins] = useState<number>(50);
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [shields, setShields] = useState<number>(0);
  const [lastGiftDate, setLastGiftDate] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- UI STATE ---
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [isMuted, setIsMuted] = useState(false);
  const [eventMsg, setEventMsg] = useState('');
  const [showShop, setShowShop] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];
  const energyPacks = [50, 100, 130, 150, 175, 200, 250, 375, 500, 750, 1000];

  // 1. Laden uit geheugen
  useEffect(() => {
    const saved = {
      p: localStorage.getItem('owl_p'),
      s: localStorage.getItem('owl_s'),
      ms: localStorage.getItem('owl_ms'),
      l: localStorage.getItem('owl_l'),
      x: localStorage.getItem('owl_x'),
      sh: localStorage.getItem('owl_sh'),
      gd: localStorage.getItem('owl_gd')
    };
    if (saved.p) setPoints(Number(saved.p));
    if (saved.s) setSpins(Number(saved.s));
    if (saved.ms) setMaxSpins(Number(saved.ms));
    if (saved.l) setLevel(Number(saved.l));
    if (saved.x) setXp(Number(saved.x));
    if (saved.sh) setShields(Number(saved.sh));
    if (saved.gd) setLastGiftDate(saved.gd);
    setIsLoaded(true);
  }, []);

  // 2. Opslaan
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_p', points.toString());
      localStorage.setItem('owl_s', spins.toString());
      localStorage.setItem('owl_ms', maxSpins.toString());
      localStorage.setItem('owl_l', level.toString());
      localStorage.setItem('owl_x', xp.toString());
      localStorage.setItem('owl_sh', shields.toString());
      localStorage.setItem('owl_gd', lastGiftDate);
    }
  }, [points, spins, maxSpins, level, xp, shields, lastGiftDate, isLoaded]);

  // 3. AUTO-SPIN LOGIC (FIXED)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1200);
    } else if (autoSpin && spins < multiplier) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, spins, multiplier]);

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
    if (spinning || spins < multiplier) return;
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
      
      if (res[0] === res[1] && res[1] === res[2]) handleWin(res[0]);
      else {
        const baseWin = 5 * multiplier * (1 + level * 0.1);
        setPoints(p => p + baseWin);
        playSound('points');
      }
    }, 1000);
  };

  const handleWin = (symbol: string) => {
    let winAmt = 500;
    if (symbol === '🦉') winAmt = 10000;
    else if (symbol === '🎰') winAmt = 5000;
    
    const finalWin = winAmt * multiplier * (1 + level * 0.2);
    setPoints(p => p + finalWin);
    setEventMsg(`🎉 BIG WIN! +${finalWin.toLocaleString()}`);
    playSound(symbol === '🦉' ? 'victory' : 'win');
    setTimeout(() => playSound('coins'), 500);
  };

  const claimDaily = () => {
    const today = new Date().toDateString();
    if (lastGiftDate === today) {
      setEventMsg("⏳ GIFT AL GECLAIMD! KOM MORGEN TERUG");
      playSound('click');
      return;
    }
    setSpins(s => Math.min(s + 50, maxSpins));
    setLastGiftDate(today);
    setEventMsg("🎁 DAILY 50 SPINS GRANTED!");
    playSound('reward');
  };

  const buyEnergy = (amount: number) => {
    const cost = amount * 10;
    if (points < cost) {
      setEventMsg("❌ NIET GENOEG CREDITS!");
      playSound('click');
      return;
    }
    setPoints(p => p - cost);
    setSpins(s => s + amount);
    setMaxSpins(ms => Math.max(ms, spins + amount));
    setEventMsg(`🔋 +${amount} ENERGY GEKOCHT!`);
    playSound('payout');
  };

  const upgradeOwl = () => {
    const cost = level * 5000;
    if (points < cost) {
       setEventMsg(`❌ UPGRADE KOST ${cost.toLocaleString()}`);
       return;
    }
    setPoints(p => p - cost);
    setLevel(l => l + 1);
    setEventMsg(`🦉 OWL UPGRADED NAAR LVL ${level + 1}!`);
    playSound('level');
  };

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', overflow: 'hidden' }}>
        
        {/* TOP HEADER */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00' }}>{points.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(3)].map((_, i) => <span key={i} style={{ opacity: i < shields ? 1 : 0.2 }}>🛡️</span>)}
            </div>
            <TonConnectButton />
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#222', borderRadius: '2px', marginTop: '8px' }}>
            <div style={{ width: `${(xp / XP_PER_LEVEL) * 100}%`, height: '100%', backgroundColor: '#a020f0' }} />
          </div>
        </div>

        {/* SIDE BUTTONS */}
        <div style={{ position: 'absolute', left: '10px', top: '120px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🛰️</div><span style={{ fontSize: '8px' }}>RADAR</span></div>
           <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🚢</div><span style={{ fontSize: '8px' }}>FLEET</span></div>
        </div>
        <div style={{ position: 'absolute', right: '10px', top: '120px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <div onClick={() => setShowShop(true)} style={{ textAlign: 'center', cursor: 'pointer' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🛒</div><span style={{ fontSize: '8px' }}>SHOP</span></div>
           <div onClick={toggleMusic} style={{ textAlign: 'center', cursor: 'pointer' }}><div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffcc00' }}>🎵</div><span style={{ fontSize: '8px' }}>MUSIC</span></div>
        </div>

        {/* ENERGY POWER BAR */}
        <div style={{ width: '100%', padding: '0 40px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>🧪 ENERGY POWER</span>
            <span>{spins} / {maxSpins}</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / maxSpins) * 100}%`, height: '100%', backgroundColor: '#00ffcc', boxShadow: '0 0 15px #00ffcc' }} />
          </div>
        </div>

        {/* SLOT MACHINE */}
        <div style={{ margin: '30px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '35px', border: '3px solid #ffcc00' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(6px)' : 'none' }}>{s}</div>
          ))}
        </div>

        {/* MULTIPLIERS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ width: '42px', height: '42px', borderRadius: '10px', border: 'none', backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', color: multiplier === m ? 'black' : 'white', fontWeight: '900' }}>x{m}</button>
          ))}
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888', fontWeight: 'bold' }}>AUTO</span>
          </div>
          <button onClick={spin} disabled={spinning} style={{ width: '150px', height: '150px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 12px 0 #997a00' }}>SPIN</button>
          <div onClick={claimDaily} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🎁</div>
             <span style={{ fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}>GIFT</span>
          </div>
        </div>

        <div onClick={upgradeOwl} style={{ marginTop: '20px', cursor: 'pointer', textAlign: 'center', backgroundColor: 'rgba(255,204,0,0.2)', padding: '10px 20px', borderRadius: '15px', border: '1px solid #ffcc00' }}>
           <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>OWL LEVEL: {level} 🆙</p>
           <p style={{ margin: 0, fontSize: '10px', opacity: 0.7 }}>UPGRADE VOOR {(level * 5000).toLocaleString()}</p>
        </div>

        {/* SHOP MODAL */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <Button onClick={() => setShowShop(false)} style={{ marginBottom: '20px' }}>TERUG</Button>
            <h1 style={{ color: '#ffcc00', textAlign: 'center' }}>🔋 ENERGY SHOP</h1>
            <List>
              {energyPacks.map(amt => (
                <Cell key={amt} onClick={() => buyEnergy(amt)} subtitle={`KOST ${(amt * 10).toLocaleString()} CREDITS`} after={<Button size="s">KOOP</Button>}>
                  +{amt} ENERGY
                </Cell>
              ))}
            </List>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: '900', fontSize: '18px', zIndex: 2000 }}>{eventMsg}</div>
        )}
      </div>
    </Page>
  );
}
