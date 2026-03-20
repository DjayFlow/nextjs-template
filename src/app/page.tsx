'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, List, Cell, Section, Headline } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT DATA (Balans op 14.135!) ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(50);
  const [owlLevel, setOwlLevel] = useState<number>(1);
  const [lastGiftDate, setLastGiftDate] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- UI STATE ---
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [reels, setReels] = useState(['🦉', '💎', '🎰']);
  const [isMuted, setIsMuted] = useState(false);
  const [eventMsg, setEventMsg] = useState('');
  const [showShop, setShowShop] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const icons = ['🦉', '💰', '💎', '🎰', '🔥', '🦹', '🔨'];

  // Energie Config
  const energyShop = [
    { amount: 50, price: 5000, currency: 'credits', info: "Basic Refill" },
    { amount: 150, price: 0.5, currency: 'TON', info: "Pro Gamer Pack" },
    { amount: 500, price: 1.5, currency: 'TON', info: "Ultimate Boost" },
    { amount: 1000, price: 2.5, currency: 'TON', info: "Whale Energy" },
  ];

  // Owl Upgrade Cost
  const upgradeCost = owlLevel * 25000;

  useEffect(() => {
    const p = localStorage.getItem('owl_p');
    const s = localStorage.getItem('owl_s');
    const l = localStorage.getItem('owl_l');
    const gd = localStorage.getItem('owl_gd');
    if (p) setPoints(Number(p));
    if (s) setSpins(Number(s));
    if (l) setOwlLevel(Number(l));
    if (gd) setLastGiftDate(gd);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_p', points.toString());
      localStorage.setItem('owl_s', spins.toString());
      localStorage.setItem('owl_l', owlLevel.toString());
      localStorage.setItem('owl_gd', lastGiftDate);
    }
  }, [points, spins, owlLevel, lastGiftDate, isLoaded]);

  // AUTO-SPIN LOGIC (Fixed)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning && spins >= multiplier) {
      timer = setTimeout(() => spin(), 1200);
    } else if (autoSpin && spins < multiplier) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning, spins, multiplier]);

  const spin = () => {
    if (spinning || spins < multiplier) return;
    
    // Muziek start bij eerste interactie
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }
    if (bgMusicRef.current.paused && !isMuted) bgMusicRef.current.play().catch(() => {});

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
        // Boost winst op basis van Owl Level
        const baseWin = (res[0] === '🦉' ? 10000 : 2500);
        const bonusMultiplier = 1 + (owlLevel * 0.25);
        const finalWin = Math.floor(baseWin * multiplier * bonusMultiplier);
        setPoints(p => p + finalWin);
        setEventMsg(`🎉 WIN! +${finalWin.toLocaleString()}`);
      } else {
        setPoints(p => p + (5 * multiplier));
      }
    }, 1000);
  };

  const claimDailyGift = () => {
    const today = new Date().toDateString();
    if (lastGiftDate === today) {
      setEventMsg("⏳ GIFT AL GECLAIMD! KOM MORGEN TERUG");
      return;
    }
    setSpins(s => Math.min(s + 50, MAX_SPINS));
    setLastGiftDate(today);
    setEventMsg("🎁 50 ENERGY GECLAIMD!");
  };

  return (
    <Page>
      <div style={{ backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
        
        {/* HEADER AREA */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.92)', padding: '12px', borderRadius: '20px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <TonConnectButton />
          </div>
        </div>

        {/* OWL CHARACTER EVOLUTION */}
        <div style={{ margin: '10px 0', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ fontSize: '100px', filter: 'drop-shadow(0 0 10px gold)' }}>
              {owlLevel === 1 ? '🦉' : owlLevel === 2 ? '🦉🛡️' : owlLevel === 3 ? '🦉⚔️' : '👑🦉👑'}
           </div>
           <p style={{ margin: 0, fontWeight: 'bold', color: '#ffcc00' }}>LVL {owlLevel} OWL</p>
        </div>

        {/* ENERGY BAR */}
        <div style={{ width: '100%', padding: '0 40px', marginTop: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>🧪 ENERGY POWER</span>
            <span>{spins} / {MAX_SPINS}</span>
          </div>
          <div style={{ width: '100%', height: '14px', backgroundColor: '#111', borderRadius: '7px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc', boxShadow: '0 0 15px #00ffcc' }} />
          </div>
        </div>

        {/* SLOTS AREA */}
        <div style={{ margin: '30px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '25px', borderRadius: '40px', border: '3px solid #ffcc00', boxShadow: '0 0 30px black' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ fontSize: '50px', width: '85px', height: '110px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', filter: spinning ? 'blur(8px)' : 'none' }}>{s}</div>
          ))}
        </div>

        {/* CONTROLS AREA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
           <div onClick={() => { setAutoSpin(!autoSpin); if(!isMuted) bgMusicRef.current?.play(); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444', fontSize: '24px' }}>🔄</div>
             <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888', fontWeight: 'bold' }}>AUTO</span>
           </div>

          <button onClick={spin} disabled={spinning} style={{ width: '150px', height: '150px', borderRadius: '50%', border: 'none', backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '36px', fontWeight: '900', boxShadow: spinning ? 'none' : '0 15px 0 #997a00' }}>SPIN</button>

          <div onClick={() => setShowShop(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffcc00', fontSize: '24px' }}>🛒</div>
             <span style={{ fontSize: '10px', fontWeight: 'bold' }}>SHOP</span>
          </div>
        </div>

        {/* DAILY GIFT BUTTON */}
        <button onClick={claimDailyGift} style={{ marginTop: '20px', padding: '10px 30px', borderRadius: '20px', border: '2px solid #ffcc00', backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffcc00', fontWeight: 'bold' }}>
           🎁 CLAIM DAILY 50 ENERGY
        </button>

        {/* SHOP MODAL */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', zIndex: 1000, padding: '20px' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK TO NEST</Button>
            
            <Section header="🔋 ENERGY SHOP">
              {energyShop.map((pack, i) => (
                <Cell 
                  key={i} 
                  subtitle={pack.info}
                  after={<Button size="s" mode={pack.currency === 'credits' ? 'outline' : 'filled'} onClick={() => {
                    if(pack.currency === 'credits' && points >= pack.price) {
                      setPoints(p => p - pack.price);
                      setSpins(s => s + pack.amount);
                    } else if(pack.currency === 'TON') {
                      setEventMsg("🔗 WALLET CONNECTING...");
                    }
                  }}>{pack.currency === 'credits' ? 'BUY' : 'PAY'}</Button>}
                  description={pack.currency === 'credits' ? `${pack.price.toLocaleString()} Credits` : `${pack.price} TON`}
                >
                  {pack.amount} ENERGY
                </Cell>
              ))}
            </Section>

            <Section header="🆙 OWL UPGRADES">
               <Cell 
                subtitle="Verhoogt winst met 25% per level"
                after={<Button size="s" onClick={() => {
                  if(points >= upgradeCost) {
                    setPoints(p => p - upgradeCost);
                    setOwlLevel(l => l + 1);
                  }
                }}>LEVEL UP</Button>}
                description={`${upgradeCost.toLocaleString()} Credits`}
               >
                 EVOLVE TO LVL {owlLevel + 1}
               </Cell>
            </Section>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: '900', zIndex: 2000 }}>{eventMsg}</div>
        )}
      </div>
    </Page>
  );
}
