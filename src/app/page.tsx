'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, Headline, Tappable, Title } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const BASE_ENERGY = 50; 
const CREDIT_LIMIT = 200; // Jouw regel: tot 200 met credits, daarna betalen

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT STATE ---
  const [points, setPoints] = useState<number>(0);
  const [spins, setSpins] = useState<number>(0); 
  const [stage, setStage] = useState<number>(1);
  const [view, setView] = useState<'home' | 'radar' | 'boss' | 'shop' | 'info' | 'friends'>('home');
  const [lastGift, setLastGift] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(1000000);
  const [multiplier, setMultiplier] = useState<number>(1); 
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- UI STATE ---
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [eventMsg, setEventMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  const playSfx = (file: string) => {
    if (!isMuted) { new Audio(`/sounds/${file}`).play().catch(() => {}); }
  };

  // --- DATA LOADING ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const lg = localStorage.getItem('owl_last_gift');
    const bhp = localStorage.getItem('owl_boss_hp');
    const cq = localStorage.getItem('owl_claimed_quests');
    const welcome = localStorage.getItem('owl_welcome_claimed');

    if (p) setPoints(Math.max(0, Number(p))); 
    if (st) setStage(Number(st));
    if (lg) setLastGift(Number(lg));
    if (bhp) setBossHp(Number(bhp));
    if (cq) { try { setClaimedQuests(JSON.parse(cq)); } catch(e) { setClaimedQuests([]); } }

    if (!welcome) {
      setSpins(500);
      localStorage.setItem('owl_welcome_claimed', 'true');
      setEventMsg("🎁 WELCOME: +500 ENERGY!");
    } else if (s) { setSpins(Number(s)); }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_last_gift', lastGift.toString());
      localStorage.setItem('owl_boss_hp', bossHp.toString());
      localStorage.setItem('owl_claimed_quests', JSON.stringify(claimedQuests));
    }
  }, [points, spins, stage, lastGift, bossHp, claimedQuests, isLoaded]);

  // --- ACTION LOGIC ---
  const handleUpgrade = async () => {
    if (stage < CREDIT_LIMIT) {
        const cost = stage * 10000;
        if (points >= cost) {
            setPoints(p => p - cost);
            setStage(s => s + 1);
            playSfx('win.mp3');
            setEventMsg("🆙 LEVEL UP!");
        } else { setEventMsg("❌ NO CREDITS"); }
    } else {
        if (!tonConnectUI.connected) { setEventMsg("❌ CONNECT WALLET!"); return; }
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [{ address: "JOUW_TON_ADRES_HIER", amount: "500000000" }] // 0.5 TON
        };
        try {
            await tonConnectUI.sendTransaction(transaction);
            setStage(s => s + 1);
            setEventMsg("💎 DIVINE LEVEL UP!");
        } catch (e) { setEventMsg("❌ TRANSACTION FAILED"); }
    }
  };

  const spinAction = () => {
    if (spinning || spins < multiplier) { setAutoSpin(false); return; }
    playSfx('click.mp3');
    setSpinning(true);
    setSpins(prev => prev - multiplier);
    const interval = setInterval(() => {
      setReels([icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]]);
    }, 60);
    setTimeout(() => {
      clearInterval(interval);
      const res = [icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)], icons[Math.floor(Math.random()*7)]];
      setReels(res);
      setSpinning(false);
      if (res[0] === res[1] && res[1] === res[2]) {
        playSfx('win.mp3');
        const win = (res[0] === '🦉' ? 10000 : 2500) * multiplier * (1 + stage * 0.1);
        setPoints(p => p + Math.floor(win));
        setEventMsg(`🎉 BIG WIN!`);
      } else { setPoints(p => p + (5 * multiplier)); }
    }, 700);
  };

  // --- DASHBOARD PARTS ---
  const renderHome = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', left: '10px', top: '90px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
         <Tappable onClick={() => setView('friends')} style={{ backgroundColor: '#ffcc00', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>👥</Tappable>
         <Tappable onClick={() => setView('radar')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📡</Tappable>
         <Tappable onClick={() => setView('info')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>ℹ️</Tappable>
      </div>
      <div style={{ position: 'absolute', right: '10px', top: '90px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
         <Tappable onClick={() => setView('boss')} style={{ backgroundColor: '#ff3333', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>💀</Tappable>
         <Tappable onClick={() => setView('shop')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</Tappable>
         <Tappable onClick={() => { const now = Date.now(); if(now - lastGift > 86400000){ setSpins(s=>s+50); setLastGift(now); setEventMsg("🎁 +50 ENERGY!"); } else { setEventMsg("⏳ NOT READY"); } }} style={{ backgroundColor: '#ffcc00', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🎁</Tappable>
      </div>

      <div style={{ margin: '5px 0', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <img src={`/image/owl_${stage > 15 ? 15 : stage}.jpeg`} alt="Owl" style={{ height: '100%', filter: `drop-shadow(0 0 ${Math.min(stage, 25)}px gold)` }} />
         <div style={{ backgroundColor: stage >= CREDIT_LIMIT ? '#00ffcc' : '#ffcc00', color: 'black', padding: '2px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', marginTop: '5px' }}>LVL {stage} | {stage >= CREDIT_LIMIT ? 'DIVINE' : 'UNBREAKABLE'}</div>
      </div>

      <div style={{ width: '85%', marginBottom: '15px' }}>
        <div style={{ width: '100%', height: '28px', backgroundColor: '#111', borderRadius: '14px', border: '2px solid #444', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: `${Math.min((spins / BASE_ENERGY) * 100, 100)}%`, height: '100%', position: 'absolute', left: 0, backgroundColor: spins > BASE_ENERGY ? '#ffcc00' : '#00ffcc', transition: 'width 0.4s' }} />
            <span style={{ position: 'relative', color: 'white', fontSize: '14px', fontWeight: '900', textShadow: '1px 1px 3px black', zIndex: 5 }}>{spins.toLocaleString()} / {BASE_ENERGY}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            <Button size="s" mode={autoSpin ? 'filled' : 'bezeled'} onClick={() => setAutoSpin(!autoSpin)}>{autoSpin ? 'AUTO: ON' : 'AUTO: OFF'}</Button>
            <Button size="s" mode="filled" onClick={() => setMultiplier(m => m === 10 ? 1 : m === 5 ? 10 : m === 2 ? 5 : 2)} style={{ backgroundColor: '#ffcc00', color: 'black' }}>BET x{multiplier}</Button>
            <Button size="s" mode="bezeled" onClick={() => setIsMuted(!isMuted)}>{isMuted ? '🔈' : '🔊'}</Button>
        </div>
      </div>

      <div style={{ margin: '20px 0', display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '25px', border: '2px solid #ffcc00' }}>
        {reels.map((s, i) => (<div key={i} style={{ fontSize: '36px', width: '65px', height: '85px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>))}
      </div>

      <button onClick={() => { if(!spinning) spinAction(); }} disabled={spinning} style={{ width: '130px', height: '130px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 10px 0 #997a00', cursor: 'pointer' }}>SPIN</button>
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
                 view === 'radar' ? (
                    <div style={{ width: '100%', padding: '10px' }}>
                        <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '15px' }}>📡 RADAR</Headline>
                        <Section header="MISSIONS">
                            <Cell subtitle="+1.000 Credits" after={<Button size="s" disabled={claimedQuests.includes('daily')} onClick={() => { setPoints(p=>p+1000); setClaimedQuests([...claimedQuests, 'daily']); setEventMsg("CLAIMED!"); }}>{claimedQuests.includes('daily') ? 'DONE' : 'CLAIM'}</Button>}>Daily Check-in</Cell>
                            <Cell subtitle="+5.000 Credits" after={<Button size="s" disabled={claimedQuests.includes('unity')} onClick={() => { window.open('https://t.me/your_channel', '_blank'); setTimeout(() => { setPoints(p=>p+5000); setClaimedQuests([...claimedQuests, 'unity']); }, 2000); }}>JOIN</Button>}>Join Community</Cell>
                        </Section>
                        <Button onClick={() => setView('home')} style={{ marginTop: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK</Button>
                    </div>
                 ) : view === 'shop' ? (
                    <div style={{ width: '100%', padding: '10px' }}>
                        <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '15px' }}>🛒 SHOP</Headline>
                        <Section header="UPGRADES">
                            <Cell subtitle={stage < CREDIT_LIMIT ? `${(stage * 10000).toLocaleString()} Credits` : "0.5 TON"} after={<Button size="s" onClick={handleUpgrade}>UPGRADE</Button>}>LEVEL UP</Cell>
                            <Cell subtitle="5.000 Credits" after={<Button size="s" onClick={() => { if(points >= 5000){ setPoints(p=>p-5000); setSpins(s=>s+50); } }}>BUY</Button>}>+50 ENERGY</Cell>
                        </Section>
                        <Button onClick={() => setView('home')} style={{ marginTop: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK</Button>
                    </div>
                 ) : view === 'boss' ? (
                    <div style={{ width: '100%', textAlign: 'center', padding: '10px' }}>
                        <Headline style={{ color: '#ff3333' }}>💀 BOSS: VORTIGERN</Headline>
                        <img src="/image/boss_vortigern.jpeg" style={{ width: '100%', borderRadius: '15px', border: '2px solid #ff3333', margin: '15px 0' }} />
                        <div style={{ width: '100%', height: '10px', backgroundColor: '#333', borderRadius: '5px', marginBottom: '15px' }}>
                            <div style={{ width: `${(bossHp / 1000000) * 100}%`, height: '100%', backgroundColor: '#ff3333' }} />
                        </div>
                        <Button size="l" onClick={() => setBossHp(h => Math.max(0, h - 10000))} style={{ width: '100%', backgroundColor: '#ff3333' }}>ATTACK</Button>
                        <Button onClick={() => setView('home')} style={{ marginTop: '10px', width: '100%' }}>BACK</Button>
                    </div>
                 ) : (
                    <div style={{ width: '100%', textAlign: 'center', overflowY: 'auto', maxHeight: '80vh' }}>
                        <Headline style={{ color: '#ffcc00' }}>ℹ️ WIKI</Headline>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px' }}>
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
                                <div key={i}><img src={`/image/owl_${i}.jpeg`} style={{ width: '100%', borderRadius: '8px' }} /><span style={{ fontSize: '10px' }}>LVL {i}</span></div>
                            ))}
                        </div>
                        <Button onClick={() => setView('home')} style={{ marginTop: '10px', width: '100%' }}>BACK</Button>
                    </div>
                 )}
            </>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000, textAlign: 'center', boxShadow: '0 0 20px gold' }}>{eventMsg}</div>
        )}
      </div>
    </Page>
  );
}
