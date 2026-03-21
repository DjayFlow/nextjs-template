'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Cell, Section, Headline, Tappable, Title } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page';

const BASE_ENERGY = 50; 
const CREDIT_LIMIT = 200; // De magische grens

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

  // --- DATA LOADING ---
  useEffect(() => {
    const p = localStorage.getItem('owl_points');
    const s = localStorage.getItem('owl_spins');
    const st = localStorage.getItem('owl_stage');
    const lg = localStorage.getItem('owl_last_gift');
    const cq = localStorage.getItem('owl_claimed_quests');
    const welcome = localStorage.getItem('owl_welcome_claimed');

    if (p) setPoints(Math.max(0, Number(p))); 
    if (st) setStage(Number(st));
    if (lg) setLastGift(Number(lg));
    if (cq) { try { setClaimedQuests(JSON.parse(cq)); } catch(e) { setClaimedQuests([]); } }

    if (!welcome) {
      setSpins(500);
      localStorage.setItem('owl_welcome_claimed', 'true');
      setEventMsg("🎁 WELCOME GIFT!");
    } else if (s) { setSpins(Number(s)); }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('owl_points', points.toString());
      localStorage.setItem('owl_spins', spins.toString());
      localStorage.setItem('owl_stage', stage.toString());
      localStorage.setItem('owl_last_gift', lastGift.toString());
      localStorage.setItem('owl_claimed_quests', JSON.stringify(claimedQuests));
    }
    // Meldingen automatisch opruimen
    if (eventMsg !== '') {
        const timer = setTimeout(() => setEventMsg(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [points, spins, stage, lastGift, claimedQuests, isLoaded, eventMsg]);

  // --- UPGRADE LOGIC (Veilig & Simpel) ---
  const handleUpgrade = async () => {
    if (stage < CREDIT_LIMIT) {
        const cost = stage * 10000;
        if (points >= cost) {
            setPoints(p => p - cost);
            setStage(s => s + 1);
            setEventMsg("🆙 LEVEL UP!");
        } else { setEventMsg("❌ NO CREDITS"); }
    } else {
        // HIER KOMT DE TON BETALING
        if (!tonConnectUI.connected) {
            setEventMsg("❌ CONNECT WALLET!");
            return;
        }
        setEventMsg("⏳ STARTING TON PAYMENT...");
        // Voor nu houden we het simpel om errors te voorkomen
        alert("TON Payment System Ready - Level " + stage);
    }
  };

  const spinAction = () => {
    if (spinning || spins < multiplier) { setAutoSpin(false); return; }
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
        const win = (res[0] === '🦉' ? 10000 : 2500) * multiplier * (1 + stage * 0.1);
        setPoints(p => p
