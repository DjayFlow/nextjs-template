'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, List, Headline, Tappable } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;
const MAX_LEVEL = 15;

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- STATE ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(50);
  const [stage, setStage] = useState<number>(1);
  const [lastGiftDate, setLastGiftDate] = useState<string>("");
  const [view, setView] = useState<'home' | 'radar'>('home'); // <--- NIEUW: Schermwissel
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

  // --- DATA LOADING ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const gd = localStorage.getItem('owl_last_gift');
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (st) setStage(Number(st));
    if (gd) setLastGiftDate(gd);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_last_gift', lastGiftDate);
    }
  }, [points, spins, stage, lastGiftDate, isLoaded]);

  // --- SPIN LOGIC ---
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
        const winAmt = (isOwl ? 10000 : 2500) * multiplier * (1 + stage * 0.2);
        setPoints(p => p + Math.floor(winAmt));
        setEventMsg(`🎉 BIG WIN! +${Math.floor(winAmt).toLocaleString()}`);
      } else {
        setPoints(p => p + Math.floor(5 * multiplier));
      }
    }, 1000);
  };

  const claimQuest = (id: string, reward: number) => {
    const claimed = localStorage.getItem(`quest_${id}`);
    if (claimed) {
      setEventMsg("❌ AL GECLAIMD!");
      return;
    }
    setPoints(p => p + reward);
    localStorage.setItem(`quest_${id}`, 'true');
    setEventMsg(`🎁 QUEST KLAAR! +${reward.toLocaleString()}`);
  };

  // --- RENDER COMPONENTS ---
  const renderHome = () => (
    <>
      {/* OWL DISPLAY */}
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

      {/* SLOTS */}
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

      {/* CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div onClick={() => setView('radar')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444', fontSize: '24px' }}>📡</div>
          <span style={{ fontSize: '10px', color: '#888' }}>RADAR</span>
        </div>
        <button onClick={spin} disabled={spinning} style={{ width: '140px', height: '140px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 12px 0 #997a00' }}>SPIN</button>
        <div onClick={() => setShowShop(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
           <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444', fontSize: '24px' }}>🛒</div>
           <span style={{ fontSize: '10px', color: '#888' }}>SHOP</span>
        </div>
      </div>
    </>
  );

  const renderRadar = () => (
    <div style={{ width: '100%', padding: '10px', animation: 'fadeIn 0.5s forwards' }}>
      <Headline style={{ textAlign: 'center', color: '#ffcc00', marginBottom: '20px' }} weight="1">📡 RADAR QUEST HUB</Headline>
      
      <Section header="DAILY MISSIONS">
        <Cell 
          before={<span>✅</span>} 
          after={<Button size="s" onClick={() => claimQuest('daily', 1000)}>CLAIM</Button>}
          subtitle="+1.000 Credits"
        >Daily Check-in</Cell>
      </Section>

      <Section header="COMMUNITY MISSIONS">
        <Cell 
          before={<span>🐦</span>} 
          after={<Button size="s" mode="bezeled" onClick={() => window.open('https://twitter.com', '_blank')}>GO</Button>}
          subtitle="+5.000 Credits"
        >Follow Unbreakable Owl on X</Cell>
        <Cell 
          before={<span>📢</span>} 
          after={<Button size="s" mode="bezeled" onClick={() => window.open('https://t.me', '_blank')}>JOIN</Button>}
          subtitle="+5.000 Credits"
        >Join Telegram Channel</Cell>
      </Section>

      <Section header="SPECIAL MISSIONS">
        <Cell 
          before={<span>🤝</span>} 
          after={<Button size="s" onClick={() => claimQuest('unity', 10000)}>COMPLETE</Button>}
          subtitle="Respect as a foundation for Unity"
          description="+10.000 Credits Reward"
        >Unity Mission</Cell>
      </Section>

      <Button onClick={() => setView('home')} mode="filled" style={{ marginTop: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK TO NEST</Button>
    </div>
  );

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
        
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

        {view === 'home' ? renderHome() : renderRadar()}

        {/* SHOP MODAL (Hetzelfde als voorheen) */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', zIndex: 1000, padding: '20px' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>CLOSE SHOP</Button>
            <Section header="🔋 ENERGY">
              <Cell subtitle="5.000 Credits" after={<Button size="s" onClick={() => { if(points >= 5000) { setPoints(p => p - 5000); setSpins(s => Math.min(s + 50, MAX_SPINS)); } }}>BUY</Button>}>50 ENERGY</Cell>
            </Section>
            <Section header="🆙 UPGRADES">
               <Cell subtitle={`${stage * 10000} Credits`} after={<Button size="s" onClick={() => { if(points >= stage * 10000 && stage < MAX_LEVEL) { setPoints(p => p - stage * 10000); setStage(s => s + 1); } }}>LEVEL UP</Button>}>EVOLVE TO LVL {stage + 1}</Cell>
            </Section>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000 }}>{eventMsg}</div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </Page>
  );
}
