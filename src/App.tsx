import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { LEVELS } from './game/levels';
import { LevelData, GameStats, Player, ElectroApparatus } from './game/types';
import { soundEngine } from './game/audio';
import { ApparatusModal, APPARATUS_ENCYCLOPEDIA } from './game/ApparatusModal';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  Shield, 
  Award, 
  BookOpen, 
  HelpCircle, 
  ChevronRight,
  Sparkles,
  Tv,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI state
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY'>('MENU');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false);
  
  // Active HUD state (updated from engine loop)
  const [playerStats, setPlayerStats] = useState<{
    health: number;
    maxHealth: number;
    polarity: 'positive' | 'negative';
    canDash: boolean;
    dashCooldown: number;
    isDashing: boolean;
  }>({
    health: 3,
    maxHealth: 3,
    polarity: 'positive',
    canDash: true,
    dashCooldown: 0,
    isDashing: false
  });

  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    deaths: 0,
    collectiblesCollected: 0,
    totalCollectibles: 0,
    timeElapsed: 0
  });

  // Modals
  const [inspectingApparatus, setInspectingApparatus] = useState<ElectroApparatus | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState<boolean>(false);

  // Initialize or restart engine
  const startLevel = useCallback((levelIdx: number) => {
    setCurrentLevelIndex(levelIdx);
    setGameState('PLAYING');

    setTimeout(() => {
      if (!canvasRef.current) return;
      if (engineRef.current) {
        engineRef.current.stop();
      }

      const targetLevel = LEVELS[levelIdx];
      const engine = new GameEngine(canvasRef.current, targetLevel, {
        onLevelComplete: (stats) => {
          setGameStats({ ...stats });
          setGameState('VICTORY');
        },
        onGameOver: () => {
          // Handled via engine respawn
        },
        onApparatusInspect: (app) => {
          setInspectingApparatus(app);
        },
        onStatsUpdate: (stats, player) => {
          setGameStats({ ...stats });
          setPlayerStats({
            health: player.health,
            maxHealth: player.maxHealth,
            polarity: player.polarity,
            canDash: player.canDash && player.dashCooldown <= 0,
            dashCooldown: player.dashCooldown,
            isDashing: player.isDashing
          });
        }
      });

      engineRef.current = engine;
      engine.start();
    }, 50);
  }, []);

  // Toggle Sound
  const toggleSound = () => {
    const nextState = soundEngine.toggleMute();
    setSoundEnabled(nextState);
  };

  // Keyboard shortcut for pausing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          setGameState('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Clean up engine on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const currentLevel = LEVELS[currentLevelIndex];

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-slate-950 text-slate-100 font-sans-ui selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            ElectroStatic Lab
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            · Retro Pixel Platformer
          </span>
        </div>

        {/* Center navigation/status links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => setShowEncyclopedia(true)}
            className="flex items-center gap-1.5 hover:text-sky-400 transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kísérleti Eszközök</span>
          </button>
          <button 
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 hover:text-sky-400 transition-colors whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Irányítás & Tippek</span>
          </button>
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setCrtEnabled(!crtEnabled)}
            className={`p-2 rounded-lg border transition-colors ${
              crtEnabled ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="CRT Monitor Hatás"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Hang Némítása' : 'Hang Bekapcsolása'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {gameState === 'PLAYING' && (
            <button
              onClick={() => {
                engineRef.current?.pause();
                setGameState('PAUSED');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              Szünet (ESC)
            </button>
          )}

          {gameState === 'MENU' && (
            <button
              onClick={() => startLevel(0)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Játék Indítása</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Game Arena / Workspace */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden">
        {/* Canvas & HUD Container */}
        <div className="relative w-full max-w-5xl aspect-[16/9] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* HUD Overlay (visible when playing or paused) */}
          {gameState !== 'MENU' && (
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none">
              {/* Left: Health & Polarity */}
              <div className="flex items-center gap-4 pointer-events-auto">
                {/* Health Coulomb Cells */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Élet</span>
                  {[...Array(playerStats.maxHealth)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-4.5 rounded-xs border transition-all ${
                        i < playerStats.health
                          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                          : 'bg-slate-800/80 border-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Polarity Indicator & Clickable Toggle */}
                <button
                  onClick={() => engineRef.current?.togglePolarity()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-pixel text-lg font-bold transition-all shadow-sm ${
                    playerStats.polarity === 'positive'
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                      : 'bg-orange-950/80 border-orange-500 text-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.3)]'
                  }`}
                  title="Kattints a polaritás váltásához (E vagy C gomb)"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{playerStats.polarity === 'positive' ? 'POZITÍV (+)' : 'NEGATÍV (-)'}</span>
                </button>

                {/* Dash indicator */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <span className="text-slate-400">Dash:</span>
                  <span className={playerStats.canDash ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    {playerStats.canDash ? 'KÉSZ (Shift)' : 'Töltés...'}
                  </span>
                </div>
              </div>

              {/* Right: Score, Level Title, Collectibles */}
              <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                  <span className="text-slate-500 mr-1.5">Pálya:</span>
                  <span className="font-semibold text-white">{currentLevel.id}/4</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-amber-300">
                  <span className="text-slate-500 mr-1.5">Leyden:</span>
                  <span>{gameStats.collectiblesCollected}/{gameStats.totalCollectibles}</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-sky-300">
                  <span className="text-slate-500 mr-1.5">Pont:</span>
                  <span className="font-bold">{gameStats.score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Element */}
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="w-full h-full pixelated bg-[#090d16]"
          />

          {/* CRT Scanline Overlay */}
          {crtEnabled && <div className="absolute inset-0 scanlines pointer-events-none z-10" />}

          {/* MENU SCREEN OVERLAY */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm text-center">
              <div className="max-w-lg space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/80 text-sky-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kísérleti Fizika & Platformer Játék</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-pixel">
                  ELECTRO<span className="text-sky-400">STATIC</span> LAB
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed font-sans-ui">
                  Győzd le a kihívást jelentő akadálypályákat az elektrosztatika valódi kísérleti eszközeivel! 
                  Használd a Van de Graaff taszítást, a Wimshurst szikrákat, ugorj, dashelj és semmisítsd meg a tüzelő robotokat!
                </p>

                {/* Level selection cards */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                  {LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.id}
                      onClick={() => startLevel(idx)}
                      className="group p-3 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 hover:border-sky-500/60 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                          {lvl.id}. Pálya
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1 truncate">
                        {lvl.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {lvl.subtitle}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 pt-3">
                  <button
                    onClick={() => startLevel(0)}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-lg shadow-sky-600/30"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Első Pálya Indítása</span>
                  </button>

                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Irányítás</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAUSE OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-sm text-center">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                <h3 className="text-2xl font-bold font-pixel text-amber-300">
                  JÁTÉK SZÜNETELTETVE
                </h3>
                <p className="text-xs text-slate-300">
                  {currentLevel.title} · {currentLevel.subtitle}
                </p>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      engineRef.current?.resume();
                      setGameState('PLAYING');
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                  >
                    Folytatás (ESC)
                  </button>
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="w-full py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    Pálya Újraindítása
                  </button>
                  <button
                    onClick={() => setGameState('MENU')}
                    className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Vissza a Főmenübe
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VICTORY OVERLAY */}
          {gameState === 'VICTORY' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm text-center animate-in fade-in duration-300">
              <div className="max-w-md w-full bg-slate-900 border border-sky-500/50 rounded-xl p-6 shadow-2xl space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400">
                  <Award className="w-6 h-6" />
                </div>

                <h3 className="text-3xl font-extrabold font-pixel text-white">
                  PÁLYA TELJESÍTVE!
                </h3>
                <p className="text-xs text-sky-300 font-semibold">
                  {currentLevel.title}
                </p>

                {/* Stats recap */}
                <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs font-mono">
                  <div className="p-2">
                    <span className="text-slate-500 block text-[10px]">Pontszám</span>
                    <span className="font-bold text-sky-400 text-sm">{gameStats.score}</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block text-[10px]">Leyden Gyűjtve</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {gameStats.collectiblesCollected}/{gameStats.totalCollectibles}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block text-[10px]">Újjászületések</span>
                    <span className="font-bold text-slate-300 text-sm">{gameStats.deaths}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => startLevel(currentLevelIndex)}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Újra</span>
                  </button>

                  {currentLevelIndex < LEVELS.length - 1 ? (
                    <button
                      onClick={() => startLevel(currentLevelIndex + 1)}
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Következő Pálya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setGameState('MENU')}
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                    >
                      Főmenü
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* On-screen Touch Controls (For Mobile & Tablet) */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-5xl mt-3 flex items-center justify-between px-2 select-none">
            {/* D-Pad Movement */}
            <div className="flex items-center gap-2">
              <button
                onMouseDown={() => engineRef.current?.pressMoveLeft(true)}
                onMouseUp={() => engineRef.current?.pressMoveLeft(false)}
                onTouchStart={(e) => { e.preventDefault(); engineRef.current?.pressMoveLeft(true); }}
                onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.pressMoveLeft(false); }}
                className="w-13 h-13 rounded-xl bg-slate-800/90 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 font-pixel text-xl shadow-md touch-manipulation"
              >
                ◀
              </button>
              <button
                onMouseDown={() => engineRef.current?.pressMoveRight(true)}
                onMouseUp={() => engineRef.current?.pressMoveRight(false)}
                onTouchStart={(e) => { e.preventDefault(); engineRef.current?.pressMoveRight(true); }}
                onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.pressMoveRight(false); }}
                className="w-13 h-13 rounded-xl bg-slate-800/90 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 font-pixel text-xl shadow-md touch-manipulation"
              >
                ▶
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Polarity Switch */}
              <button
                onClick={() => engineRef.current?.togglePolarity()}
                className={`px-3.5 h-13 rounded-xl font-bold font-pixel text-sm flex items-center gap-1.5 border shadow-md active:scale-95 transition-all touch-manipulation ${
                  playerStats.polarity === 'positive'
                    ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                    : 'bg-orange-950/80 border-orange-500 text-orange-300'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{playerStats.polarity === 'positive' ? '+ TÖLTÉS' : '- TÖLTÉS'}</span>
              </button>

              {/* Dash */}
              <button
                onClick={() => engineRef.current?.triggerDash()}
                disabled={!playerStats.canDash}
                className={`w-13 h-13 rounded-xl font-pixel text-xs font-bold border shadow-md active:scale-95 transition-all flex flex-col items-center justify-center touch-manipulation ${
                  playerStats.canDash
                    ? 'bg-amber-600/90 border-amber-400 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                <span>DASH</span>
                <span className="text-[9px] opacity-80">(Shift)</span>
              </button>

              {/* Jump */}
              <button
                onMouseDown={() => engineRef.current?.triggerJump()}
                onMouseUp={() => engineRef.current?.releaseJump()}
                onTouchStart={(e) => { e.preventDefault(); engineRef.current?.triggerJump(); }}
                onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.releaseJump(); }}
                className="w-14 h-13 rounded-xl bg-sky-600 active:bg-sky-500 border border-sky-400 text-white font-pixel text-sm font-bold shadow-md active:scale-95 transition-all flex flex-col items-center justify-center touch-manipulation"
              >
                <span>UGRÁS</span>
                <span className="text-[9px] opacity-80">(W)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info strip */}
      <footer className="px-6 py-3 border-t border-slate-900 bg-slate-950/80 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Kísérleti eszközök:</span>
          <span className="text-slate-400">Van de Graaff · Leydeni palack · Wimshurst-gép · Elektroszkóp · Faraday-kalitka</span>
        </div>
        <div>
          <span>Irányítás: Nyilak / WASD · Ugrás: Space/W · Dash: Shift/X · Polaritás: E/C</span>
        </div>
      </footer>

      {/* Help / Controls Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100">
            <h3 className="text-xl font-bold font-pixel text-sky-400 mb-4 pb-2 border-b border-slate-800">
              JÁTÉKIRÁNYÍTÁS & FIZIKAI TIPPEK
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
                <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono font-bold text-white text-[11px] shrink-0">
                  ← → / A D
                </span>
                <div>
                  <span className="font-semibold text-white block">Futás és mozgás</span>
                  Folyamatos gyorsulás és lassulás a platformokon való precíz egyensúlyozáshoz.
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
                <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono font-bold text-white text-[11px] shrink-0">
                  W / Space / ↑
                </span>
                <div>
                  <span className="font-semibold text-white block">Ugrás & Dupla ugrás</span>
                  A gomb hosszabb nyomva tartása magasabb ugrást eredményez. A levegőben másodszor megnyomva szikrahajtású dupla ugrást végezhetsz!
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
                <span className="px-2 py-1 bg-amber-950/60 border border-amber-700/60 rounded font-mono font-bold text-amber-300 text-[11px] shrink-0">
                  Shift / X / J
                </span>
                <div>
                  <span className="font-semibold text-amber-300 block">Villám Dash (Dashelés)</span>
                  Nagy sebességű előretörés, amely sebezhetetlenséget nyújt! Áthatol a veszélyes szikraközökön és azonnal megsemmisíti az eltalált ellenségeket.
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
                <span className="px-2 py-1 bg-sky-950/60 border border-sky-700/60 rounded font-mono font-bold text-sky-300 text-[11px] shrink-0">
                  E / C gomb
                </span>
                <div>
                  <span className="font-semibold text-sky-300 block">Elektrosztatikus Polaritás (+ / -)</span>
                  Válts pozitív és negatív töltés között. Az azonos polaritású lemezek és a Van de Graaff gömb hatalmas Coulomb-taszítóerővel repítenek a magasba!
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300 block">Faraday-kalitka menedék</span>
                  A fémhálós kalitka belsejében a térerősség 0: védve vagy a tüzelő drónok és tornyok szikráitól!
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
              >
                Értem, játszom!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encyclopedia Modal */}
      {showEncyclopedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <h3 className="text-xl font-bold font-pixel text-white">
                  AZ ELEKTROSZTATIKA KÍSÉRLETI ESZKÖZEI
                </h3>
              </div>
              <button
                onClick={() => setShowEncyclopedia(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {Object.entries(APPARATUS_ENCYCLOPEDIA).map(([key, item]) => (
                <div key={key} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.nameHu}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.inventor} ({item.year})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.principleHu}
                  </p>

                  <div className="text-xs text-sky-300/90 font-medium pt-1">
                    <span className="text-slate-400">Játékbeli szerepe: </span>
                    {item.gameplayRoleHu}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowEncyclopedia(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Inspect Apparatus Modal */}
      {inspectingApparatus && (
        <ApparatusModal
          apparatus={inspectingApparatus}
          onClose={() => setInspectingApparatus(null)}
        />
      )}
    </div>
  );
}
