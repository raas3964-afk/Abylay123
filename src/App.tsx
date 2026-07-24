import { useEffect, useState } from 'react';
import { BasketballGame } from './components/BasketballGame';
import { HomePage, type GameMode } from './components/HomePage';
import { DeviceChoice, type DeviceMode } from './components/DeviceChoice';
import { RegistrationPage } from './components/RegistrationPage';
import { supabase } from './lib/supabase';
import { teamAwayColor, teamColor, teamLogo, teamName, teamStar, type TeamId } from './components/TeamSelection';

export default function App() {
  const [registered, setRegistered] = useState(false);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [device, setDevice] = useState<DeviceMode | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('5v5');
  const [teams, setTeams] = useState<{ home: TeamId; away: TeamId }>({ home: 'lakers', away: 'warriors' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setRegistered(Boolean(data.session));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setRegistered(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="app-loading">🏀</div>;
  async function logout() {
    if (registered) await supabase.auth.signOut();
    setRegistered(false);
    setGuest(false);
    setPlaying(false);
    setDevice(null);
  }

  async function startGame(mode: GameMode, home: TeamId, away: TeamId) {
    const isPhone = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 800;
    try {
      if (!document.fullscreenElement) {
        const page = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
        if (page.requestFullscreen) await page.requestFullscreen();
        else await page.webkitRequestFullscreen?.();
      }
      if (isPhone && 'lock' in screen.orientation) {
        await (screen.orientation as ScreenOrientation & { lock: (orientation: string) => Promise<void> }).lock('landscape');
      }
    } catch {
      // The game still opens if the browser blocks fullscreen mode.
    }
    setGameMode(mode);
    setTeams({ home, away });
    setPlaying(true);
  }

  async function exitGame() {
    const fullscreenDocument = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> | void };
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (fullscreenDocument.webkitFullscreenElement) await fullscreenDocument.webkitExitFullscreen?.();
    setPlaying(false);
  }

  if (!registered && !guest) {
    return <RegistrationPage onComplete={() => setRegistered(true)} onGuest={() => setGuest(true)} />;
  }
  if (!device) return <DeviceChoice onSelect={setDevice} />;
  if (playing) {
    const activeDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 800 ? 'phone' : device;
    return <BasketballGame device={activeDevice} mode={gameMode} homeTeam={teamName(teams.home)} awayTeam={teamName(teams.away)} homeColor={teamColor(teams.home)} awayColor={teamAwayColor(teams.away)} homeLogo={teamLogo(teams.home)} awayLogo={teamLogo(teams.away)} homeStar={teamStar(teams.home)} awayStar={teamStar(teams.away)} onExit={exitGame} />;
  }
  return <HomePage onPlay={startGame} onLogout={logout} />;
}
