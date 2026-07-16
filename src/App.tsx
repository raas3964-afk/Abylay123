import { useEffect, useState } from 'react';
import { BasketballGame } from './components/BasketballGame';
import { HomePage } from './components/HomePage';
import { RegistrationPage } from './components/RegistrationPage';
import { supabase } from './lib/supabase';

export default function App() {
  const [registered, setRegistered] = useState(false);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [playerName, setPlayerName] = useState('Player');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setRegistered(Boolean(data.session));
      setPlayerName(data.session?.user.user_metadata.display_name || 'Player');
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setRegistered(Boolean(session));
      setPlayerName(session?.user.user_metadata.display_name || 'Player');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="app-loading">🏀</div>;
  async function logout() {
    if (registered) await supabase.auth.signOut();
    setRegistered(false);
    setGuest(false);
    setPlaying(false);
  }

  if (!registered && !guest) {
    return <RegistrationPage onComplete={() => setRegistered(true)} onGuest={() => setGuest(true)} />;
  }
  if (playing) return <BasketballGame onExit={() => setPlaying(false)} />;
  return <HomePage playerName={guest ? 'Guest' : playerName} onPlay={() => setPlaying(true)} onLogout={logout} />;
}
