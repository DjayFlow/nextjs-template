'use client';

import { useState, useEffect } from 'react';
import { Button, Cell, Section, Headline, Tappable } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT STATE ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(50);
  const [stage, setStage] = useState<number>(1);
  const [view, setView] = useState<'home' | 'radar' | 'fleet' | 'boss'>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [bossHp, setBossHp] = useState<number>(1000000);
  const [fleetLevels, setFleetLevels] = useState({ scout: 1, battle: 0 });

  // --- UI STATE ---
  const [spinning, setSpinning] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [eventMsg, setEventMsg] = useState('');
  const [showShop, setShowShop] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

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

  // PASSIVE INCOME
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoaded) {
        const income = Math.floor(((fleetLevels.scout * 50 + fleetLevels.battle * 250) / 3600) * 5 * (1 + stage * 0.05)); 
        if (income > 0) setPoints(p => p + income);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded, fleetLevels, stage]);

  const spin = () => {
    if (spinning || spins < multiplier) return;
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
        const win = (res[0] === '🦉' ? 10000 : 2500) * multiplier * (1 + stage * 0.1);
        setPoints(p => p + Math.floor(win));
        setEventMsg(`🎉 BIG WIN! +${Math.floor(win).toLocaleString()}`);
      } else {
        setPoints(p => p + (5 * multiplier));
      }
    }, 1000);
  };

  const attackBoss = () => {
    const dmg = multiplier * 500 * stage;
    if (spins >= multiplier) {
      setSpins(s => s - multiplier);
      setBossHp(h => Math.max(0, h - dmg));
      setEventMsg(`💥 ATTACK! -${dmg.toLocaleString()} HP`);
    }
  };

  // --- RENDER PARTS ---
  const renderBoss = () => (
    <div style={{ width: '100%', padding: '10px', animation: 'fadeIn 0.5s forwards', textAlign: 'center' }}>
      <Headline style={{ color: '#ff3333', marginBottom: '10px' }}>💀 BOSS RAID</Headline>
      <div style={{ position: 'relative', height: '200px', marginBottom: '20px', border: '2px solid #ff3333', borderRadius: '15px', overflow: 'hidden' }}>
        <img src="/image/boss_vortigern.jpeg" alt="Boss" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as any).src = 'https://img.icons8.com/color/144/crow.png'; }} />
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '10px', background: 'linear-gradient(transparent, black)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}><span>VOID HP</span><span>{bossHp.toLocaleString()}</span></div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', marginTop: '5px' }}>
            <div style={{ width: `${(bossHp / 1000000) * 100}%`, height: '100%', backgroundColor: '#ff3333' }} />
          </div>
        </div>
      </div>
      <Button size="l" mode="filled" style={{ width: '100%', backgroundColor: '#ff3333' }} onClick={attackBoss}>ATTACK BOSS</Button>
      <Button onClick={() => setView('home')} mode="plain" style={{ marginTop: '10px', color: 'white' }}>BACK TO NEST</Button>
    </div>
  );

  const renderFleet = () => (
    <div style={{ width: '100%', padding: '10px', animation: 'fadeIn 0.5s forwards' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '15px' }}>🚢 FLEET HUB</Headline>
      <Section header="SHIPS">
          <Cell before={<span>🛶</span>} subtitle={`LVL ${fleetLevels.scout}`} after={<Button size="s" onClick={() => { if(points >= 10000) { setPoints(p => p - 10000); setFleetLevels(f => ({...f, scout: f.scout + 1})); } }}>UPGRADE</Button>}>Scout Nest</Cell>
          <Cell before={<span>🚢</span>} subtitle={`LVL ${fleetLevels.battle}`} after={<Button size="s" onClick={() => { if(points >= 50000) { setPoints(p => p - 50000); setFleetLevels(f => ({...f, battle: f.battle + 1})); } }}>UPGRADE</Button>}>Battle Wing</Cell>
      </Section>
      <Button onClick={() => setView('home')} mode="filled" style={{ width: '100%', backgroundColor: '#ffcc00', color: 'black', marginTop: '15px' }}>BACK TO NEST</Button>
    </div>
  );

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', overflow: 'hidden' }}>
        
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}><span>💰</span><span style={{ fontWeight: '900', color: '#ffcc00' }}>{points.toLocaleString()}</span></div>
            <TonConnectButton />
        </div>

        {view === 'home' ? (
          <>
            <div style={{ margin: '15px 0', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <img src={`/image/owl_${stage > 15 ? 15 : stage}.jpeg`} alt="Owl" style={{ height: '100%', filter: `drop-shadow(0 0 ${Math.min(stage, 25)}px gold)` }} onError={(e) => { (e.target as any).src = 'https://img.icons8.com/color/144/owl.png'; }} />
               <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>LVL {stage} (ONBREEKBAAR)</div>
            </div>
            <div style={{ width: '100%', padding: '0 30px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}><span>🧪 ENERGY</span><span>{spins} / {MAX_SPINS}</span></div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#111', borderRadius: '5px', overflow: 'hidden', border: '1px solid #333' }}><div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', position: 'absolute', right: '15px', top: '140px', flexDirection: 'column' }}>
               <Tappable onClick={() => setView('boss')} style={{ backgroundColor: '#ff3333', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 10px red' }}>💀</Tappable>
               <Tappable onClick={() => setView('radar')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📡</Tappable>
               <Tappable onClick={() => setView('fleet')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🚢</Tappable>
               <Tappable onClick={() => setShowShop(true)} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</Tappable>
            </div>
            <div style={{ margin: '40px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '40px', border: '3px solid #ffcc00' }}>
              {reels.map((s, i) => (<div key={i} style={{ fontSize: '45px', width: '80px', height: '105px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>))}
            </div>
            <button onClick={spin} disabled={spinning} style={{ width: '130px', height: '130px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 10px 0 #997a00' }}>SPIN</button>
          </>
        ) : view === 'boss' ? renderBoss() : view === 'fleet' ? renderFleet() : (
          <div style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
            <Headline style={{ color: '#ffcc00' }}>📡 RADAR QUEST</Headline>
            <Button onClick={() => setView('home')} style={{ marginTop: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK TO NEST</Button>
          </div>
        )}

        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', zIndex: 1000, padding: '20px' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>CLOSE</Button>
            <Section header="🆙 UPGRADES">
               <Cell subtitle={`${stage * 10000} Credits`} after={<Button size="s" onClick={() => { if(points >= stage * 10000) { setPoints(p => p - stage * 10000); setStage(s => s + 1); } }}>LEVEL UP</Button>}>LVL {stage + 1}</Cell>
            </Section>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '12px 25px', borderRadius: '20px', fontWeight: 'bold', zIndex: 2000 }}>{eventMsg}</div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Page>
  );
}
