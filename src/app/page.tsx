'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, List } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const MAX_SPINS = 100;
const MAX_LEVEL = 15; // <--- HET MAXIMAAL AANTAL LEVELS

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  
  // --- PERSISTENT STATE (Points op 14.135!) ---
  const [points, setPoints] = useState<number>(14135);
  const [spins, setSpins] = useState<number>(50);
  const [shields, setShields] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [stage, setStage] = useState<number>(1);
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

  // Energie Pakketten Config
  const energyShop = [
    { amount: 50, price: 5000, currency: 'credits', icon: '🔋' },
    { amount: 150, price: 0.5, currency: 'TON', icon: '⚡' },
    { amount: 500, price: 1.5, currency: 'TON', icon: '🌀' },
    { amount: 1000, price: 2.5, currency: 'TON', icon: '🌌' },
  ];

  // Owl Upgrade Cost
  const upgradeCost = stage * 10000;

  // 1. Data laden uit browsergeheugen
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

  // 2. Data direct opslaan
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

  // 3. Energie herstel (1 per minuut)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpins(p => p < MAX_SPINS ? p + 1 : p);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 4. Auto-Spin Loop
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

  const toggleMusic = () => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/sounds/Got 5 on it Symphonic Horror trap FM 152bpm.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.2;
    }
    if (isMuted) {
      bgMusicRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      bgMusicRef.current.pause();
      setIsMuted(true);
    }
  };

  const spin = () => {
    if (spinning || isAttacking || spins < multiplier) {
      if (spins < multiplier) setEventMsg("❌ NO ENERGY!");
      setAutoSpin(false);
      return;
    }

    if (!isMuted && (!bgMusicRef.current || bgMusicRef.current.paused)) {
      toggleMusic();
    }

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
        addPoints(5 * multiplier);
        playSound('points');
      }
    }, 1000);
  };

  const addPoints = (amt: number) => {
    const bonusMultiplier = 1 + (stage * 0.1); // 10% bonus per level
    const finalAmt = Math.floor(amt * bonusMultiplier);
    setPoints(p => p + finalAmt);
    addXp(amt / 10);
  };

  const addXp = (amt: number) => {
    setXp(current => {
      const total = current + amt;
      const xpPerLevel = stage * 2000;
      if (total >= xpPerLevel) {
        setStage(s => (s < MAX_LEVEL ? s + 1 : MAX_LEVEL)); // UPGRADE TOT LEVEL 15
        playSound('level');
        setEventMsg(`🚀 LEVEL UP! NU LEVEL ${stage < MAX_LEVEL ? stage + 1 : MAX_LEVEL}`);
        return 0;
      }
      return total;
    });
  };

  const handleWin = (symbol: string) => {
    if (symbol === '🔥') {
      if (shields < 3) {
        setShields(s => s + 1);
        setEventMsg("🛡️ SHIELD COLLECTED!");
        playSound('badge');
      } else {
        addPoints(1000 * multiplier);
        setEventMsg("💰 SHIELDS FULL! +1000 CASH");
        playSound('cash');
      }
    } else if (symbol === '🔨') {
      setIsAttacking(true);
      playSound('bonus');
      setTimeout(() => {
        setShake(true);
        const winAmt = 2000 * multiplier;
        setEventMsg(`🔨 ATTACK SUCCESS! +${winAmt.toLocaleString()}`);
        addPoints(winAmt);
        playSound('payout');
        setTimeout(() => { setShake(false); setIsAttacking(false); }, 1200);
      }, 2000);
    } else {
      const isOwl = symbol === '🦉';
      const isJackpot = symbol === '🎰';
      const winAmt = isOwl ? 10000 : 2500;
      addPoints(winAmt * multiplier);
      setEventMsg(`🎉 ${isOwl ? 'THE OWL KING!' : isJackpot ? 'JACKPOT!' : 'BIG WIN!'} +${(winAmt * multiplier).toLocaleString()}`);
      playSound(isOwl ? 'victory' : isJackpot ? 'jackpot' : 'win');
      setTimeout(() => playSound('coins'), 500);
    }
  };

  const claimDailyGift = () => {
    const today = new Date().toDateString();
    if (lastGiftDate === today) {
      setEventMsg("⏳ GIFT AL GECLAIMD! KOM MORGEN TERUG");
      playSound('click');
      return;
    }
    setSpins(s => Math.min(s + 50, MAX_SPINS));
    setLastGiftDate(today);
    setEventMsg("🎁 DAILY 50 SPINS GRANTED!");
    playSound('reward');
  };

  const buyEnergy = (amount: number) => {
    // In een echte app koppel je dit aan TON of credit betaling
    setSpins(s => Math.min(s + amount, MAX_SPINS));
    setEventMsg(`🔋 +${amount} ENERGY GEKOCHT!`);
    playSound('payout');
  };

  const evolveOwl = () => {
    if (points >= upgradeCost && stage < MAX_LEVEL) {
      setPoints(p => p - upgradeCost);
      setStage(s => s + 1);
      setEventMsg(`🦉 EVOLVED TO LVL ${stage + 1}!`);
      playSound('level');
    } else if (stage >= MAX_LEVEL) {
      setEventMsg("👑 OWL IS MAX LEVEL!");
    } else {
      setEventMsg("❌ NIET GENOEG CREDITS!");
    }
  };

  return (
    <Page>
      <div style={{ 
        backgroundImage: 'url(/sounds/high_quality_bg.png)', backgroundSize: 'cover', 
        minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', padding: '10px', overflow: 'hidden',
        transform: shake ? 'scale(1.05) rotate(2deg)' : 'none', transition: 'transform 0.1s'
      }}>
        
        {/* HEADER AREA */}
        <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.9)', padding: '12px', borderRadius: '18px', borderBottom: '3px solid #ffcc00', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '18px' }}>{points.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{ opacity: i < shields ? 1 : 0.2 }}>🛡️</span>
              ))}
            </div>
            <TonConnectButton />
          </div>
        </div>

        {/* OWL CHARACTER EVOLUTION */}
        <div style={{ margin: '10px 0', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <img 
             src={`/images/owl_${stage}.jpg`} // <--- CRUCIALE VERANDERING NAAR .JPG EN DYNAMISCH LEVEL
             alt={`Owl Lvl ${stage}`} 
             style={{ height: '100%', filter: 'drop-shadow(0 0 15px gold)' }}
             onError={(e) => { (e.target as any).src = 'https://img.icons8.com/color/144/owl.png'; }} // Fallback emoji uil
           />
           <div style={{ backgroundColor: '#ffcc00', color: 'black', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>
             LVL {stage} / 15
           </div>
        </div>

        {/* ENERGY BAR */}
        <div style={{ width: '100%', padding: '0 30px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ffcc00', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>🧪 ENERGY POWER</span>
            <span>{spins} / {MAX_SPINS}</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
            <div style={{ width: `${(spins / MAX_SPINS) * 100}%`, height: '100%', backgroundColor: '#00ffcc', boxShadow: '0 0 10px #00ffcc' }} />
          </div>
        </div>

        {/* SLOTS AREA */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '35px', border: '2px solid #ffcc00', boxShadow: '0 0 30px black' }}>
          {reels.map((s, i) => (
            <div key={i} style={{ 
              fontSize: '45px', width: '85px', height: '110px', backgroundColor: '#000', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', 
              filter: spinning ? 'blur(8px)' : 'none', border: '1px solid #222'
            }}>{s}</div>
          ))}
        </div>

        {/* MULTIPLIERS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 5, 10].map(m => (
            <button key={m} onClick={() => { setMultiplier(m); playSound('click'); }} style={{ 
              width: '42px', height: '42px', borderRadius: '10px', border: 'none', 
              backgroundColor: multiplier === m ? '#ffcc00' : '#1a1a1a', 
              color: multiplier === m ? 'black' : 'white', fontWeight: 'bold'
            }}>x{m}</button>
          ))}
        </div>

        {/* CONTROLS AREA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div onClick={() => { setAutoSpin(!autoSpin); playSound('powerup'); if (!isMuted) bgMusicRef.current?.play(); }} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: autoSpin ? '#ffcc00' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>🔄</div>
            <span style={{ fontSize: '10px', color: autoSpin ? '#ffcc00' : '#888' }}>AUTO</span>
          </div>

          <button onClick={spin} disabled={spinning || isAttacking} style={{ 
            width: '140px', height: '140px', borderRadius: '50%', border: 'none', 
            backgroundColor: spinning ? '#333' : '#ffcc00', color: 'black', fontSize: '32px', fontWeight: '900', 
            boxShadow: spinning ? 'none' : '0 12px 0 #997a00' 
          }}>SPIN</button>

          <div onClick={() => setShowShop(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #444' }}>🛒</div>
             <span style={{ fontSize: '10px', color: '#888' }}>SHOP</span>
          </div>
        </div>

        {/* DAILY GIFT BUTTON */}
        <button onClick={claimDailyGift} style={{ marginTop: '20px', padding: '10px 30px', borderRadius: '20px', border: '2px solid #ffcc00', backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffcc00', fontWeight: 'bold' }}>
           🎁 CLAIM DAILY 50 ENERGY
        </button>

        {/* SHOP MODAL */}
        {showShop && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, padding: '20px' }}>
            <Button onClick={() => setShowShop(false)} mode="bezeled" style={{ marginBottom: '20px', width: '100%', backgroundColor: '#ffcc00', color: 'black' }}>BACK TO NEST</Button>
            
            <Section header="🔋 ENERGY SHOP">
              {energyShop.map((pack, i) => (
                <Cell 
                  key={i} 
                  before={<span style={{fontSize: '24px'}}>{pack.icon}</span>}
                  subtitle={pack.currency === 'credits' ? `${pack.price.toLocaleString()} Credits` : `${pack.price} TON`}
                  after={<Button size="s" mode="filled" style={{backgroundColor: pack.currency === 'TON' ? '#0088cc' : '#333'}}>BUY</Button>}
                  onClick={() => buyEnergy(pack.amount)}
                >
                  GET {pack.amount} ENERGY
                </Cell>
              ))}
            </Section>

            <Section header="🆙 OWL UPGRADES">
               <Cell 
                before={<span style={{fontSize: '24px'}}>👑</span>}
                subtitle={`${upgradeCost.toLocaleString()} Credits`}
                after={<Button size="s" mode="filled" style={{backgroundColor: stage < MAX_LEVEL ? '#ffcc00' : '#333'}}>UPGRADE</Button>}
                onClick={evolveOwl}
               >
                 EVOLVE TO LVL {stage < MAX_LEVEL ? stage + 1 : stage}
               </Cell>
            </Section>
          </div>
        )}

        {eventMsg && (
          <div style={{ position: 'absolute', top: '50%', backgroundColor: '#ffcc00', color: 'black', padding: '15px 30px', borderRadius: '25px', fontWeight: 'bold', zIndex: 2000, boxShadow: '0 0 50px gold' }}>{eventMsg}</div>
        )}

        {isAttacking && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '120px', animation: 'owlAttack 2s forwards' }}>🦉🚀🔨</div>
          </div>
        )}

        <style>{`
          @keyframes owlAttack { 0% { transform: translate(-500px, 500px); } 50% { transform: translate(0, 0) scale(1.5); } 100% { transform: translate(500px, -500px); } }
        `}</style>
      </div>
    </Page>
  );
}
