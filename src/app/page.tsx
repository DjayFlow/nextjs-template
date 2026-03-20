'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, List, Headline } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;
const MAX_LEVEL = 15;

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT STATE ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(50);
  const [shields, setShields] = useState<number>(0);
  const [stage, setStage] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [lastGiftDate, setLastGiftDate] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- UI STATE ---
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [isMuted, setIsMuted] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [shake, setShake] = useState(false);
  const [eventMsg, setEventMsg] = useState('');
  const [showShop, setShowShop] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  const energyShop = [
    { amount: 50, price: 5000, currency: 'credits', icon: '🔋' },
    { amount: 150, price: 0.5, currency: 'TON', icon: '⚡' },
    { amount: 500, price: 1.5, currency: 'TON', icon: '🌀' },
    { amount: 1000, price: 2.5, currency: 'TON', icon: '🌌' },
  ];

  const upgradeCost = stage * 10000;

  // 1. Data laden
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const sh = localStorage.getItem('owl_shields');
    const st = localStorage.getItem('owl_stage');
    const x = localStorage.getItem('owl_xp');
    const gd = localStorage.getItem('owl_last_gift');
    
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (sh) setShields(Number(sh));
    if (st) setStage(Number(st));
    if (x) setXp(Number(x));
    if (gd) setLastGiftDate(gd);
    
    setIsLoaded(true);
  }, []);

  // 2. Data opslaan
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_shields', shields.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_xp', xp.toString());
      localStorage.setItem('owl_last_gift', lastGiftDate);
    }
  }, [points, spins, shields, stage, xp, lastGiftDate, isLoaded]);

  // 3. Auto-Spin Loop
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

  const spin = () => {
    if (spinning || isAttacking || spins < multiplier) return;

    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }
    if (bgMusicRef.current.paused && !isMuted) bgMusicRef.current.play().catch(() => {});

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
        const bonus = 1 + (stage * 0.1);
        setPoints(p => p + Math.floor(5 * multiplier * bonus));
        playSound('points');
      }
    }, 1000);
  };

  const handleWin = (symbol: string) => {
    const isOwl = symbol === '🦉';
    const winAmt = (isOwl ? 10000 : 2500) * multiplier * (1 + stage * 0.2);
    setPoints(p => p + Math.floor(winAmt));
    setEventMsg(`🎉 WIN! +${Math.floor(winAmt).toLocaleString()}`);
    playSound(isOwl ? 'victory' : 'win');
  };

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <TonConnectButton />
          </div>
        </div>

        {/* OWL DISPLAY - NU MET .JPEG */}
        <div style={{ margin: '15px 0', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <img 
             src={`/image/owl_${stage}.jpeg`} 
             alt={`Owl Level ${stage}`} 
             style={{ height: '100%', filter: 'drop-shadow(0 0 15px gold)' }}
             onError={(e) => { (e.target as any).src = 'https://img.icons8.com/color/144/owl.png'; }}
           />
           <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>
             LVL {stage} / 15
           </div>
        </div>

        {/* ENERGY BAR */}
        <div style={{ width: '100%', padding: '0 30px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}>
            <span>🧪 ENERGY POWER</span>
            <span>{spins} / {MAX_SPINS}</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} />
          </div>
        </div>

        {/* SLOT MACHINE */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '40px', border: '3px solid #ffcc00' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>
          ))}
        </div>

        {/* MULTIPLIERS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => setMultiplier(m)} style={{ width: '42px', height: '42px', borderRadius: '10px', border: 'none', backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', color: multiplier === m ? 'black' : 'white', fontWeight: 'bold' }}>x{m}</button>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div onClick={() => setAutoSpin(!autoSpin)} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888' }}>AUTO</span>
          </div>
          <button onClick={spin} disabled={spinning} style={{ width: '140px', height: '140px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 12px 0 #997a00' }}>SPIN</button>
          <div onClick={() => setShowShop(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🛒</div>
             <span style={{ fontSize: '10px', color: '#888' }}>SHOP</span>
          </div>
        </div>

        {/* SHOP MODAL */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', zIndex: 1000, padding: '20px' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK TO NEST</Button>
            <Section header="🆙 UPGRADES">
               <Cell 
                before={<span>👑</span>} 
                subtitle={`${upgradeCost.toLocaleString()} Credits`}
                after={<Button size="s" onClick={() => { if(points >= upgradeCost && stage < MAX_LEVEL) { setPoints(p => p - upgradeCost); setStage(s => s + 1); } }}>LEVEL UP</Button>}
               >EVOLVE OWL TO LVL {stage + 1}</Cell>
            </Section>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000 }}>{eventMsg}</div>
        )}
      </div>
    </Page>
  );
}
