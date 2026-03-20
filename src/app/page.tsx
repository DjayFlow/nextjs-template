'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, Headline, Tappable, Title } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const BASE_ENERGY = 50; // De standaard 50/50 energie

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT STATE ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(0); 
  const [stage, setStage] = useState<number>(1);
  const [view, setView] = useState<'home' | 'radar' | 'fleet' | 'boss' | 'shop' | 'info'>('home');
  const [lastGift, setLastGift] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- GAME STATE ---
  const [bossHp, setBossHp] = useState<number>(1000000);
  const [fleetLevels, setFleetLevels] = useState({ scout: 1, battle: 0, galleon: 0 });
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [eventMsg, setEventMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- DATA SYNC & WELCOME GIFT ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const lg = localStorage.getItem('owl_last_gift');
    const welcome = localStorage.getItem('owl_welcome_claimed');

    if (p) setPoints(Number(p));
    if (st) setStage(Number(st));
    if (lg) setLastGift(Number(lg));

    // Welkomstcadeau Logica: 500 energie voor nieuwe spelers
    if (!welcome) {
        setSpins(500);
        localStorage.setItem('owl_welcome_claimed', 'true');
        setEventMsg("🎁 WELCOME GIFT: +500 ENERGY!");
    } else if (s) {
        setSpins(Number(s));
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_last_gift', lastGift.toString());
    }
  }, [points, spins, stage, lastGift, isLoaded]);

  // DAGELIJKS CADEAU CHECK (Elke 24 uur +50)
  useEffect(() => {
    const checkGift = () => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - lastGift > oneDay) {
            setSpins(s => s + 50);
            setLastGift(now);
            setEventMsg("🎁 DAILY GIFT: +50 ENERGY!");
        }
    };
    if (isLoaded) checkGift();
  }, [isLoaded, lastGift]);

  // AUTO SPIN LOGIC
  useEffect(() => {
    let timer: any;
    if (autoSpin && spins > 0 && !spinning) {
      timer = setTimeout(() => spin(), 1200);
    } else if (spins <= 0) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spins, spinning]);

  const spin = () => {
    if (spinning || spins <= 0) return;
    
    setSpinning(true);
    setSpins(s => s - 1);
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
        const win = (res[0] === '🦉' ? 10000 : 2500) * (1 + stage * 0.1);
        setPoints(p => p + Math.floor(win));
        setEventMsg(`🎉 BIG WIN! +${Math.floor(win).toLocaleString()}`);
      } else {
        setPoints(p => p + 5);
      }
    }, 800);
  };

  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ margin: '10px 0', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <img src={`/image/owl_${stage > 15 ? 15 : stage}.jpeg`} alt="Owl" style={{ height: '100%', filter: `drop-shadow(0 0 ${Math.min(stage, 25)}px gold)` }} />
         <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900', marginTop: '5px' }}>LVL {stage} | UNBREAKABLE</div>
      </div>

      <div style={{ width: '100%', padding: '0 20px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}><span>🧪 ENERGY</span><span>{spins} / {BASE_ENERGY}</span></div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#111', borderRadius: '5px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${Math.min((spins / BASE_ENERGY) * 100, 100)}%`, height: '100%', backgroundColor: spins > BASE_ENERGY ? '#ffcc00' : '#00ffcc', boxShadow: '0 0 10px gold' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            <Button size="s" mode={autoSpin ? 'filled' : 'bezeled'} onClick={() => setAutoSpin(!autoSpin)}>{autoSpin ? 'AUTO: ON' : 'AUTO: OFF'}</Button>
            <Button size="s" mode="bezeled" onClick={() => setIsMuted(!isMuted)}>{isMuted ? '🔈 MUTED' : '🔊 SOUND'}</Button>
        </div>
      </div>

      {/* SIDE NAVIGATION */}
      <div style={{ display: 'flex', gap: '12px', position: 'absolute', right: '15px', top: '130px', flexDirection: 'column' }}>
         <Tappable onClick={() => setView('boss')} style={{ backgroundColor: '#ff3333', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>💀</Tappable>
         <Tappable onClick={() => setView('radar')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📡</Tappable>
         <Tappable onClick={() => setView('shop')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</Tappable>
         <Tappable onClick={() => setView('info')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>ℹ️</Tappable>
      </div>

      <div style={{ margin: '30px 0', display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '25px', border: '2px solid #ffcc00' }}>
        {reels.map((s, i) => (<div key={i} style={{ fontSize: '36px', width: '65px', height: '85px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>))}
      </div>

      <button onClick={spin} disabled={spinning} style={{ width: '130px', height: '130px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 10px 0 #997a00', cursor: 'pointer' }}>SPIN</button>
    </div>
  );

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', overflow: 'hidden' }}>
        
        <audio ref={bgMusicRef} src="/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3" loop muted={isMuted} />

        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}><span>💰</span><span style={{ fontWeight: '900', color: '#ffcc00' }}>{points.toLocaleString()}</span></div>
            <TonConnectButton />
        </div>

        {!gameStarted ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Title style={{ color: '#ffcc00', marginBottom: '20px' }}>UNBREAKABLE OWL</Title>
                <Button size="l" onClick={() => { setGameStarted(true); if(bgMusicRef.current) bgMusicRef.current.play(); }}>🚀 START GAME</Button>
            </div>
        ) : (
            <>
                {view === 'home' ? renderHome() : 
                 view === 'boss' ? (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <Headline style={{ color: '#ff3333' }}>💀 BOSS: VORTIGERN</Headline>
                        <img src="/image/boss_vortigern.jpeg" style={{ width: '100%', borderRadius: '15px', border: '2px solid #ff3333', margin: '15px 0' }} />
                        <Button onClick={() => setBossHp(h => h - 5000)} style={{ width: '100%', backgroundColor: '#ff3333' }}>ATTACK</Button>
                        <Button onClick={() => setView('home')} style={{ width: '100%', marginTop: '10px' }}>BACK</Button>
                    </div>
                 ) : 
                 view === 'shop' ? (
                    <div style={{ width: '100%' }}>
                        <Headline style={{ textAlign: 'center', color: '#ffcc00' }}>🛒 SHOP</Headline>
                        <Section header="RESOURCES">
                            <Cell subtitle="5.000 Credits" after={<Button size="s" onClick={() => setSpins(s => s + 50)}>BUY</Button>}>+50 ENERGY</Cell>
                        </Section>
                        <Button onClick={() => setView('home')} style={{ width: '100%', marginTop: '20px' }}>BACK</Button>
                    </div>
                 ) : 
                 (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <Headline style={{ color: '#ffcc00' }}>ℹ️ INFO</Headline>
                        <div style={{ padding: '20px' }}>"Respect as a foundation for Unity"</div>
                        <Button onClick={() => setView('home')} style={{ width: '100%' }}>BACK</Button>
                    </div>
                 )}
            </>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000 }}>{eventMsg}</div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Page>
  );
}
