import { useEffect, useState } from 'react';
import { BasketballGame } from './components/BasketballGame';
import { RegistrationPage } from './components/RegistrationPage';
import { supabase } from './lib/supabase';

export default function App() {
  const [registered, setRegistered] = useState(false);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setRegistered(Boolean(data.session));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setRegistered(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="app-loading">🏀</div>;
  async function exitGame() {
    if (registered) await supabase.auth.signOut();
    setRegistered(false);
    setGuest(false);
  }

  return registered || guest
    ? <BasketballGame onExit={exitGame} />
    : <RegistrationPage onComplete={() => setRegistered(true)} onGuest={() => setGuest(true)} />;
}
