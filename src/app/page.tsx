'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, Headline, Tappable, List, Info, Modal } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;
const MAX_LEVEL = 15;

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
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);

  // --- UI & FEATURES STATE ---
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false); // <--- AUTO CLICKER
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [eventMsg, setEventMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- DATA LOADING & SYNC ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const fl = localStorage.getItem('owl_fleet');
    const bhp = localStorage.getItem('owl_boss_hp');
    const q = localStorage.getItem('owl_quests');
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (st) setStage(Number(st));
    if (fl) { try { setFleetLevels(JSON.parse(fl)); } catch(e) {} }
    if (bhp) setBossHp(Number(bhp));
    if (q) { try { setClaimedQuests(JSON.parse(q)); } catch(e) {} }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_fleet', JSON.stringify(fleetLevels));
      localStorage.setItem('owl_boss_hp', bossHp.toString());
      localStorage.setItem('owl_quests', JSON.stringify(claimedQuests));
    }
  }, [points, spins, stage, fleetLevels, bossHp, claimedQuests, isLoaded]);

  // AUTO SPIN LOGIC
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && spins >= multiplier && !spinning) {
      timer = setTimeout(() => spin(), 1500);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spins, spinning]);

  // PASSIVE INCOME
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoaded) {
        const income = Math.floor(((fleetLevels.scout * 50 + fleetLevels.battle * 250 + fleetLevels.galleon * 1000) / 3600) * 5 * (1 + stage * 0.05)); 
        if (income > 0) setPoints(p => p + income);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded, fleetLevels, stage]);

  const spin = () => {
    if (spinning || spins < multiplier) {
        setAutoSpin(false);
        return;
    }
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

  // --- RENDERS ---

  const renderHome = () => (
    <>
      <div style={{ margin: '15px 0', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <img src={`/image/owl_${stage > 15 ? 15 : stage}.jpeg`} alt="Owl" style={{ height: '100%', filter: `drop-shadow(0 0 ${Math.min(stage, 25)}px gold)` }} onError={(e) => { (e.target as any).src = 'https://img.icons8.com/color/144/owl.png'; }} />
         <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', marginTop: '5px' }}>LVL {stage} | {stage >= 15 ? 'GODLIKE' : 'UNBREAKABLE'}</div>
      </div>

      <div style={{ width: '100%', padding: '0 30px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}><span>🧪 ENERGY</span><span>{spins} / {MAX_SPINS}</span></div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#111', borderRadius: '5px', overflow: 'hidden', border: '1px solid #333' }}><div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} /></div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <Button size="s" mode={autoSpin ? 'filled' : 'bezeled'} onClick={() => setAutoSpin(!autoSpin)}>{autoSpin ? 'AUTO: ON' : 'AUTO: OFF'}</Button>
        <Button size="s" mode="bezeled" onClick={() => setIsMuted(!isMuted)}>{isMuted ? '🔈' : '🔊'}</Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', position: 'absolute', right: '15px', top: '140px', flexDirection: 'column' }}>
         <Tappable onClick={() => setView('boss')} style={{ backgroundColor: '#ff3333', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 10px red' }}>💀</Tappable>
         <Tappable onClick={() => setView('radar')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📡</Tappable>
         <Tappable onClick={() => setView('fleet')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🚢</Tappable>
         <Tappable onClick={() => setView('shop')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</Tappable>
         <Tappable onClick={() => setView('info')} style={{ backgroundColor: '#111', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>ℹ️</Tappable>
      </div>

      <div style={{ margin: '30px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '30px', border: '2px solid #ffcc00' }}>
        {reels.map((s, i) => (<div key={i} style={{ fontSize: '40px', width: '70px', height: '90px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>))}
      </div>

      <button onClick={spin} disabled={spinning} style={{ width: '130px', height: '130px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '28px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 10px 0 #997a00' }}>SPIN</button>
    </>
  );

  const renderShop = () => (
    <div style={{ width: '100%', padding: '10px', animation: 'fadeIn 0.5s forwards' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '15px' }}>🛒 UNBREAKABLE SHOP</Headline>
      <Section header="CREDIT PURCHASES">
          <Cell subtitle="5.000 Credits" after={<Button size="s" onClick={() => { if(points >= 5000) { setPoints(p => p - 5000); setSpins(s => Math.min(s + 50, MAX_SPINS)); } }}>BUY</Button>}>+50 ENERGY</Cell>
          <Cell subtitle={`${stage * 10000} Credits`} after={<Button size="s" onClick={() => { if(points >= stage * 10000) { setPoints(p => p - stage * 10000); setStage(s => s + 1); } }}>UPGRADE</Button>}>EVOLVE OWL</Cell>
      </Section>
      <Section header="REAL MONEY (STARS/TON)">
          <Cell before={<span>⭐</span>} subtitle="Buy with Telegram Stars" after={<Button size="s" mode="filled">100 ⭐</Button>}>+500 ENERGY</Cell>
          <Cell before={<span>💎</span>} subtitle="Withdraw your earnings" after={<Button size="s" mode="outline" onClick={() => alert("Withdrawal to " + tonConnectUI.account?.address)}>CASH OUT</Button>}>EARN TON</Cell>
      </Section>
      <Button onClick={() => setView('home')} mode="filled" style={{ width: '100%', backgroundColor: '#ffcc00', color: 'black', marginTop: '15px' }}>BACK TO NEST</Button>
    </div>
  );

  const renderInfo = () => (
    <div style={{ width: '100%', padding: '10px', animation: 'fadeIn 0.5s forwards', maxHeight: '80vh', overflowY: 'auto' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '15px' }}>ℹ️ OWL WIKI & RULES</Headline>
      <Section header="THE CORE VALUE">
          <div style={{ padding: '15px', fontStyle: 'italic', textAlign: 'center', backgroundColor: 'rgba(255,204,0,0.1)', borderRadius: '10px' }}>
            "Respect as a foundation for Unity"
          </div>
      </Section>
      <Section header="EVOLUTION TIERS">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                  <div key={i} style={{ textAlign: 'center' }}>
                      <img src={`/image/owl_${i}.jpeg`} style={{ width: '100%', borderRadius: '5px' }} />
                      <span style={{ fontSize: '10px' }}>LVL {i}</span>
                  </div>
              ))}
          </div>
      </Section>
      <Section header="HOW TO PLAY">
          <Cell multiline subtitle="Spin the slot machine to earn credits and energy. Use credits to evolve your owl and build a fleet for passive income.">Basics</Cell>
          <Cell multiline subtitle="Use your energy to attack General Vortigern (the Boss) or intercept his fleet to steal massive rewards.">Warfare</Cell>
      </Section>
      <Button onClick={() => setView('home')} mode="filled" style={{ width: '100%', backgroundColor: '#ffcc00', color: 'black', marginTop: '15px' }}>BACK TO NEST</Button>
    </div>
  );

  const renderBoss = () => (
    <div style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
      <Headline style={{ color: '#ff3333' }}>💀 BOSS RAID</Headline>
      <img src="/image/boss_vortigern.jpeg" alt="Boss" style={{ width: '100%', borderRadius: '15px', margin: '15px 0' }} />
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}><span>VOID HP</span><span>{bossHp.toLocaleString()}</span></div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px'
