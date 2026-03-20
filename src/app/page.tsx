'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, Headline, List, Tappable, Info } from '@telegram-apps/telegram-ui';
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
  const [view, setView] = useState<'home' | 'radar' | 'fleet'>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  // --- FLEET STATE (Niveaus van schepen) ---
  const [fleetLevels, setFleetLevels] = useState<{scout: number, battle: number, galleon: number}>({
    scout: 1,
    battle: 0,
    galleon: 0
  });

  // --- UI STATE ---
  const [spinning, setSpinning] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '🎰', '💎']);
  const [eventMsg, setEventMsg] = useState('');
  const [showShop, setShowShop] = useState(false);

  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // --- DATA SYNC ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const fl = localStorage.getItem('owl_fleet');
    
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (st) setStage(Number(st));
    if (fl) setFleetLevels(JSON.parse(fl));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_fleet', JSON.stringify(fleetLevels));
    }
  }, [points, spins, stage, fleetLevels, isLoaded]);

  // PASSIVE INCOME CALCULATION
  // Scout: 50/hr, Battle: 250/hr, Galleon: 1000/hr (per level)
  const calculatePassiveIncome = () => {
    const base = (fleetLevels.scout * 50) + (fleetLevels.battle * 250) + (fleetLevels.galleon * 1000);
    const unityBonus = (fleetLevels.scout > 0 && fleetLevels.battle > 0 && fleetLevels.galleon > 0) ? 1.2 : 1.0;
    return Math.floor((base / 3600) * 5 * unityBonus); // Bedrag per 5 seconden
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoaded) {
        const income = calculatePassiveIncome();
        if (income > 0) setPoints(p => p + income);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded, fleetLevels]);

  const buyShip = (type: 'scout' | 'battle' | 'galleon', price: number) => {
    if (points >= price) {
      setPoints(p => p - price);
      setFleetLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      setEventMsg(`🚢 ${type.toUpperCase()} UPGRADED!`);
    } else {
      setEventMsg("❌ NIET GENOEG CREDITS!");
    }
  };

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
        const isOwl = res[0] === '🦉';
        const win = (isOwl ? 10000 : 2500) * multiplier * (1 + stage * 0.2);
        setPoints(p => p + Math.floor(win));
        setEventMsg(`🎉 BIG WIN! +${Math.floor(win).toLocaleString()}`);
      } else {
        setPoints(p => p + (5 * multiplier));
      }
    }, 1000);
  };

  const renderFleet = () => (
    <div style={{ width: '100%', padding: '10px', animation: 'fadeIn 0.5s forwards' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '20px' }} weight="1">🚢 BOINK FLEET HUB</Headline>
      
      <div style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)', padding: '15px', borderRadius: '15px', border: '1px solid #ffcc00', marginBottom: '15px' }}>
        <p style={{ color: '#ffcc00', margin: 0, fontWeight: 'bold' }}>Current Passive Income</p>
        <p style={{ fontSize: '24px', margin: '5px 0', fontWeight: '900' }}>+{(calculatePassiveIncome() * 720).toLocaleString()}/hr</p>
        <p style={{ fontSize: '10px', opacity: 0.7 }}>Respect as a foundation for Unity: Complete your fleet for +20% bonus!</p>
      </div>

      <Section header="FLEET MANAGEMENT">
          <Cell 
            before={<span>🛶</span>}
            after={<Button size="s" onClick={() => buyShip('scout', fleetLevels.scout * 10000)}>UPGRADE</Button>}
            subtitle={`LVL ${fleetLevels.scout} | +${fleetLevels.scout * 50}/hr`}
            description={`Cost: ${(fleetLevels.scout * 10000).toLocaleString()}`}
          >Scout Nest</Cell>
          
          <Cell 
            before={<span>🚢</span>}
            after={<Button size="s" onClick={() => buyShip('battle', (fleetLevels.battle + 1) * 50000)}>BUY/UPGRADE</Button>}
            subtitle={`LVL ${fleetLevels.battle} | +${fleetLevels.battle * 250}/hr`}
            description={`Cost: ${((fleetLevels.battle + 1) * 50000).toLocaleString()}`}
          >Battle Wing</Cell>
          
          <Cell 
            before={<span>🏯</span>}
            after={<Button size="s" onClick={() => buyShip('galleon', (fleetLevels.galleon + 1) * 250000)}>BUY/UPGRADE</Button>}
            subtitle={`LVL ${fleetLevels.galleon} | +${fleetLevels.galleon * 1000}/hr`}
            description={`Cost: ${((fleetLevels.galleon + 1) * 250000).toLocaleString()}`}
          >Unity Galleon</Cell>
      </Section>

      <Button onClick={() => setView('home')} mode="filled" style={{ width: '100%', backgroundColor: '#ffcc00', color: 'black', marginTop: '20px' }}>BACK TO NEST</Button>
    </div>
  );

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
        
        {/* TOP STATUS BAR */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <TonConnectButton />
          </div>
        </div>

        {view === 'home' ? (
          <>
            {/* OWL DISPLAY - Dynamisch van 1 t/m 15 */}
            <div style={{ margin: '15px 0', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <img 
                 src={`/image/owl_${stage}.jpeg`} 
                 alt="Owl" 
                 style={{ height: '100%', filter: 'drop-shadow(0 0 15px gold)' }} 
                 onError={(e) => { (e.target as any).src = 'https://img.icons8.com/color/144/owl.png'; }} 
               />
               <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>
                 LVL {stage} / 15
               </div>
            </div>

            {/* ENERGY BAR */}
            <div style={{ width: '100%', padding: '0 30px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold' }}><span>🧪 ENERGY</span><span>{spins} / {MAX_SPINS}</span></div>
              <div style={{ width: '100%', height: '12px', backgroundColor: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}><div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc' }} /></div>
            </div>

            {/* SIDEBAR NAVIGATION */}
            <div style={{ display: 'flex', gap: '15px', position: 'absolute', right: '15px', top: '150px', flexDirection: 'column' }}>
               <Tappable onClick={() => setView('radar')} style={{ backgroundColor: '#111', width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📡</Tappable>
               <Tappable onClick={() => setView('fleet')} style={{ backgroundColor: '#111', width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🚢</Tappable>
               <Tappable onClick={() => setShowShop(true)} style={{ backgroundColor: '#111', width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</Tappable>
            </div>

            {/* SLOT MACHINE */}
            <div style={{ margin: '20px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '40px', border: '3px solid #ffcc00' }}>
              {reels.map((s, i) => (<div key={i} style={{ fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>))}
            </div>

            <button onClick={spin} disabled={spinning} style={{ width: '140px', height: '140px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 12px 0 #997a00' }}>SPIN</button>
          </>
        ) : view === 'radar' ? (
          <div style={{ width: '100%', padding: '10px' }}>
            <Headline style={{ textAlign: 'center', color: '#ffcc00' }}>📡 RADAR QUEST</Headline>
            <Section header="DAILY"><Cell after={<Button size="s">CLAIM</Button>}>Daily Check-in</Cell></Section>
            <Button onClick={() => setView('home')} style={{ marginTop: '20px', width: '100%' }}>BACK TO NEST</Button>
          </div>
        ) : renderFleet()}

        {/* SHOP MODAL */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', zIndex: 1000, padding: '20px' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>CLOSE SHOP</Button>
            <Section header="🆙 OWL EVOLUTION">
               <Cell 
                subtitle={`${stage * 10000} Credits`} 
                after={<Button size="s" onClick={() => { if(points >= stage * 10000 && stage < MAX_LEVEL) { setPoints(p => p - stage * 10000); setStage(s => s + 1); } }}>EVOLVE</Button>}
               >UPGRADE TO LVL {stage + 1}</Cell>
            </Section>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000 }}>{eventMsg}</div>
        )}

      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Page>
  );
}
