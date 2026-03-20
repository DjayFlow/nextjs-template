'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, List, Cell, Section } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 50;
const XP_PER_LEVEL = 10000;

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT DATA ---
  const [points, setPoints] = useState<number>(13344);
  const [spins, setSpins] = useState<number>(50);
  const [maxSpins, setMaxSpins] = useState<number>(50);
  const [level, setLevel] = useState<number>(1);
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

  // Energie Pakketten Config
  const energyShop = [
    { amount: 50, price: 5000, currency: 'credits' },
    { amount: 100, price: 0.5, currency: 'TON' },
    { amount: 250, price: 1.2, currency: 'TON' },
    { amount: 500, price: 2.0, currency: 'TON' },
    { amount: 1000, price: 3.5, currency: 'TON' },
  ];

  // 1. Laden uit geheugen
  useEffect(() => {
    const p = localStorage.getItem('owl_p');
    const s = localStorage.getItem('owl_s');
    const l = localStorage.getItem('owl_l');
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (l) setLevel(Number(l));
    setIsLoaded(true);
  }, []);

  // 2. Opslaan
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_p', points.toString());
      localStorage.setItem('owl_s', spins.toString());
      localStorage.setItem('owl_l', level.toString());
    }
  }, [points, spins, level, isLoaded]);

  // 3. AUTO-SPIN LOOP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1000);
    } else if (autoSpin && spins < multiplier) {
      setAutoSpin(false);
      setEventMsg("🔋 ENERGY DEPLETED!");
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, spins, multiplier]);

  const playSound = (name: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const startMusic = () => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }
    if (bgMusicRef.current.paused && !isMuted) {
      bgMusicRef.current.play().catch(() => {});
    }
  };

  const spin = () => {
    if (spinning || spins < multiplier) return;
    
    startMusic();
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
        setPoints(p => p + (5 * multiplier));
        playSound('points');
      }
    }, 1000);
  };

  const handleWin = (symbol: string) => {
    const winAmt = symbol === '🦉' ? 10000 : 2500;
    const finalWin = winAmt * multiplier;
    setPoints(p => p + finalWin);
    setEventMsg(`🎉 WIN! +${finalWin.toLocaleString()}`);
    playSound(symbol === '🦉' ? 'victory' : 'win');
    setTimeout(() => playSound('coins'), 500);
  };

  const handlePurchase = async (pack: any) => {
    if (pack.currency === 'credits') {
      if (points < pack.price) {
        setEventMsg("❌ NOT ENOUGH CREDITS!");
        return;
      }
      setPoints(p => p - pack.price);
      setSpins(s => s + pack.amount);
      setEventMsg(`🔋 +${pack.amount} ENERGY ADDED!`);
      playSound('payout');
    } else {
      setEventMsg("🔗 CONNECTING WALLET...");
      try {
        await tonConnectUI.connectWallet();
        setEventMsg("💰 TRANSACTION PENDING...");
      } catch (e) {
        setEventMsg("❌ TRANSACTION CANCELLED");
      }
    }
  };

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
        
        {/* HEADER AREA */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '20px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <TonConnectButton />
          </div>
        </div>

        {/* SIDE BUTTONS */}
        <div style={{ position: 'absolute', right: '10px', top: '100px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10 }}>
           <div onClick={() => setShowShop(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '45px', height: '45px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffcc00', fontSize: '20px' }}>🛒</div>
             <span style={{ fontSize: '8px', fontWeight: 'bold' }}>SHOP</span>
           </div>
           <div onClick={() => { setIsMuted(!isMuted); if(bgMusicRef.current) isMuted ? bgMusicRef.current.play() : bgMusicRef.current.pause(); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '45px', height: '45px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffcc00', fontSize: '20px' }}>{isMuted ? '🔇' : '🎵'}</div>
             <span style={{ fontSize: '8px', fontWeight: 'bold' }}>MUSIC</span>
           </div>
        </div>

        {/* ENERGY BAR */}
        <div style={{ width: '100%', padding: '0 40px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>🧪 ENERGY POWER</span>
            <span>{spins} / {maxSpins}</span>
          </div>
          <div style={{ width: '100%', height: '14px', backgroundColor: '#111', borderRadius: '7px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / maxSpins) * 100}%`, height: '100%', backgroundColor: '#00ffcc', boxShadow: '0 0 15px #00ffcc' }} />
          </div>
        </div>

        {/* SLOTS AREA */}
        <div style={{ margin: '30px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '40px', border: '3px solid #ffcc00' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '50px', width: '85px', height: '110px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>
          ))}
        </div>

        {/* MULTIPLIERS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ width: '45px', height: '45px', borderRadius: '12px', border: 'none', backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', color: multiplier === m ? 'black' : 'white', fontWeight: '900' }}>x{m}</button>
          ))}
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); startMusic(); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444', fontSize: '24px' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888', fontWeight: 'bold' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning} style={{ width: '160px', height: '160px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '36px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 15px 0 #997a00' }}>SPIN</button>

          <div onClick={() => { setSpins(s => Math.min(s + 5, MAX_SPINS)); setEventMsg("🎁 +5 BONUS!"); playSound('reward'); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444', fontSize: '24px' }}>🎁</div>
             <span style={{ fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}>BONUS</span>
          </div>
        </div>

        {/* SHOP MODAL - GEFIXTE VERSIE */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', backgroundColor: '#ffcc00', color: 'black' }}>BACK TO NEST</Button>
            <h1 style={{ color: '#ffcc00', textAlign: 'center', fontSize: '28px', marginBottom: '20px' }}>🔋 ENERGY SHOP</h1>
            <Section header="FREE & CREDITS">
               <Cell onClick={() => handlePurchase(energyShop[0])} subtitle="5.000 Credits" after={<Button size="s">BUY</Button>}>50 ENERGY</Cell>
            </Section>
            <Section header="REAL MONEY (WALLET)">
              {energyShop.slice(1).map((pack, i) => (
                <Cell key={i} onClick={() => handlePurchase(pack)} subtitle={`${pack.price} TON`} after={<Button size="s" mode="filled" style={{backgroundColor: '#0088cc'}}>PAY</Button>}>
                  {pack.amount} ENERGY
                </Cell>
              ))}
            </Section>
            <p style={{ fontSize: '10px', textAlign: 'center', marginTop: '20px', opacity: 0.6 }}>Transactions via TON Blockchain</p>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: '900', fontSize: '20px', zIndex: 2000, boxShadow: '0 0 50px gold' }}>{eventMsg}</div>
        )}

      </div>
    </Page>
  );
}
