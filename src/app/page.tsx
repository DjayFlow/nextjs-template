'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, Headline, Tappable, List, Title } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT STATE ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(50);
  const [stage, setStage] = useState<number>(1);
  const [view, setView] = useState<'home' | 'radar' | 'fleet' | 'boss' | 'shop' | 'info'>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [bossHp, setBossHp] = useState<number>(1000000);
  const [fleetLevels, setFleetLevels] = useState({ scout: 1, battle: 0, galleon: 0 });

  // --- UI & FEATURES STATE ---
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false); 
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [eventMsg, setEventMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- AUDIO HELPERS ---
  const playSfx = (name: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${name}`);
    audio.play().catch(() => {});
  };

  // --- DATA LOADING & SYNC ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const fl = localStorage.getItem('owl_fleet');
    const bhp = localStorage.getItem('owl_boss_hp');
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (st) setStage(Number(st));
    if (fl) { try { setFleetLevels(JSON.parse(fl)); } catch(e) {} }
    if (bhp) setBossHp(Number(bhp));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_fleet', JSON.stringify(fleetLevels));
      localStorage.setItem('owl_boss_hp', bossHp.toString());
    }
  }, [points, spins, stage, fleetLevels, bossHp, isLoaded]);

  // AUTO CLICKER
  useEffect(() => {
    let interval: any;
    if (autoSpin && spins >= multiplier && !spinning) {
      interval = setInterval(() => { spin(); }, 1500);
    }
    return () => clearInterval(interval);
  }, [autoSpin, spinning, spins, multiplier]);

  const spin = () => {
    if (spinning || spins < multiplier) { setAutoSpin(false); return; }
    playSfx('click.mp3');
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
        playSfx('win.mp3');
        const win = (res[0] === '🦉' ? 10000 : 2500) * multiplier * (1 + stage * 0.1);
        setPoints(p => p + Math.floor(win));
        setEventMsg(`🎉 BIG WIN! +${Math.floor(win).toLocaleString()}`);
      } else { setPoints(p => p + (5 * multiplier)); }
    }, 1000);
  };

  // --- VIEWS ---

  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ margin: '10px 0', height: '170px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <img src={`/image/owl_${stage > 15 ? 15 : stage}.jpeg`} alt="Owl" style={{ height: '100%', filter: `drop-shadow(0 0 ${Math.min(stage, 25)}px gold)` }} />
         <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900', marginTop: '5px' }}>LVL {stage} | UNBREAKABLE</div>
      </div>

      <div style={{ width: '100%', padding: '0 20px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}><span>🧪 ENERGY POWER</span><span>{spins} / {MAX_SPINS}</span></div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#111', borderRadius: '5px', overflow: 'hidden', border: '1px solid #333' }}><div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            <Button size="s" mode={autoSpin ? 'filled' : 'bezeled'} onClick={() => setAutoSpin(!autoSpin)}>{autoSpin ? 'AUTO: ON' : 'AUTO: OFF'}</Button>
            <Button size="s" mode="bezeled" onClick={() => setIsMuted(!isMuted)}>{isMuted ? '🔈' : '🔊'}</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', position: 'absolute', right: '15px', top: '130px', flexDirection: 'column' }}>
         <Tappable onClick={() => setView('boss')} style={{ backgroundColor: '#ff3333', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>💀</Tappable>
         <Tappable onClick={() => setView('radar')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📡</Tappable>
         <Tappable onClick={() => setView('shop')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</Tappable>
         <Tappable onClick={() => setView('info')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>ℹ️</Tappable>
      </div>

      <div style={{ margin: '20px 0', display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '30px', border: '2px solid #ffcc00' }}>
        {reels.map((s, i) => (<div key={i} style={{ fontSize: '40px', width: '75px', height: '100px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>))}
      </div>

      <button onClick={spin} disabled={spinning} style={{ width: '130px', height: '130px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 12px 0 #997a00' }}>SPIN</button>
    </div>
  );

  const renderBoss = () => (
    <div style={{ width: '100%', padding: '10px', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
      <Headline style={{ color: '#ff3333' }}>💀 BOSS: VORTIGERN</Headline>
      <img src="/image/boss_vortigern.jpeg" style={{ width: '100%', borderRadius: '15px', border: '2px solid #ff3333', margin: '15px 0' }} />
      <div style={{ width: '100%', height: '10px', backgroundColor: '#333', borderRadius: '5px' }}><div style={{ width: `${(bossHp / 1000000) * 100}%`, height: '100%', backgroundColor: '#ff3333' }} /></div>
      <Button size="l" mode="filled" style={{ width: '100%', backgroundColor: '#ff3333', marginTop: '20px' }} onClick={() => setBossHp(h => h - 10000)}>ATTACK BOSS</Button>
      <Button onClick={() => setView('home')} mode="plain" style={{ marginTop: '10px', color: 'white' }}>BACK TO NEST</Button>
    </div>
  );

  const renderShop = () => (
    <div style={{ width: '100%', padding: '10px' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '15px' }}>🛒 PREMIUM SHOP</Headline>
      <Section header="INGAME">
        <Cell subtitle="5.000 Credits" after={<Button size="s" onClick={() => setPoints(p => p - 5000)}>BUY</Button>}>+50 ENERGY</Cell>
        <Cell subtitle="10.000 Credits" after={<Button size="s" onClick={() => setStage(s => s + 1)}>UPGRADE</Button>}>EVOLVE OWL</Cell>
      </Section>
      <Section header="REAL MONEY">
        <Cell before={<span>⭐</span>} subtitle="100 Stars" after={<Button size="s" mode="filled">BUY</Button>}>+500 ENERGY</Cell>
        <Cell before={<span>💎</span>} after={<Button size="s" mode="outline">CASH OUT</Button>}>EARN TON</Cell>
      </Section>
      <Button onClick={() => setView('home')} mode="filled" style={{ width: '100%', backgroundColor: '#ffcc00', color: 'black', marginTop: '20px' }}>BACK</Button>
    </div>
  );

  const renderInfo = () => (
    <div style={{ width: '100%', padding: '10px', overflowY: 'auto', maxHeight: '80vh' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00' }}>ℹ️ GAME WIKI</Headline>
      <Section header="EVOLUTION LEVELS">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                  <div key={i} style={{ textAlign: 'center' }}><img src={`/image/owl_${i}.jpeg`} style={{ width: '100%', borderRadius: '5px' }} /><span style={{ fontSize: '8px' }}>LVL {i}</span></div>
              ))}
          </div>
      </Section>
      <Button onClick={() => setView('home')} mode="filled" style={{ width: '100%', backgroundColor: '#ffcc00', color: 'black', marginTop: '20px' }}>BACK</Button>
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
            <>{view === 'home' ? renderHome() : view === 'boss' ? renderBoss() : view === 'shop' ? renderShop() : renderInfo()}</>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000 }}>{eventMsg}</div>
        )}
      </div>
    </Page>
  );
}
