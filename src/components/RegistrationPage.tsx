import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './RegistrationPage.css';

type Props = { onComplete: () => void; onGuest: () => void };

export function RegistrationPage({ onComplete, onGuest }: Props) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    if (mode === 'signup' && password !== confirmation) {
      setMessage('Пароли не совпадают');
      return;
    }

    setBusy(true);
    const { data, error } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === 'signup' && !data.session) {
      setMessage('Готово! Подтверди email по ссылке в письме, затем вернись в игру.');
      return;
    }
    onComplete();
  }

  return (
    <main className="registration-page">
      <section className="registration-info">
        <div className="registration-brand"><span>🏀</span> SWISH 3D</div>
        <div className="registration-copy">
          <small>ТВОЯ ПЛОЩАДКА. ТВОИ ПРАВИЛА.</small>
          <h1>Выходи на<br/><em>паркет</em></h1>
          <p>Создай профиль, набирай очки и поставь рекорд, который никто не сможет побить.</p>
          <div className="registration-stats">
            <span><b>3D</b> настоящая арена</span>
            <span><b>∞</b> попыток</span>
            <span><b>1</b> чемпион</span>
          </div>
        </div>
        <div className="registration-ball">🏀</div>
      </section>

      <section className="registration-form-wrap">
        <form className="registration-form" onSubmit={submit}>
          <small>ДОБРО ПОЖАЛОВАТЬ</small>
          <h2>{mode === 'signup' ? 'Создай аккаунт' : 'С возвращением!'}</h2>
          <p>{mode === 'signup' ? 'И сохрани свой лучший результат' : 'Войди и продолжи игру'}</p>

          <button className="google-button" type="button" onClick={signInWithGoogle} disabled={busy}>
            <span className="google-logo">G</span> ВОЙТИ ЧЕРЕЗ GOOGLE
          </button>
          <div className="registration-divider"><span>{mode === 'signup' ? 'или зарегистрируйся по email' : 'или войди по email'}</span></div>

          {mode === 'signup' && <label>Имя игрока
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Air Abylay" minLength={2} maxLength={24} required />
          </label>}
          <label>Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="player@email.com" required />
          </label>
          <div className={mode === 'signup' ? 'password-row' : ''}>
            <label>Пароль
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" minLength={6} required />
            </label>
            {mode === 'signup' && <label>Повтори пароль
              <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Ещё раз" minLength={6} required />
            </label>}
          </div>
          {mode === 'signup' && <label className="registration-agreement">
            <input type="checkbox" required /> Я согласен с правилами честной игры
          </label>}
          <button type="submit" disabled={busy}>{busy ? 'ПОДОЖДИ…' : mode === 'signup' ? 'НАЧАТЬ ИГРАТЬ →' : 'ВОЙТИ →'}</button>
          <button className="account-button" type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }} disabled={busy}>
            {mode === 'signup' ? 'УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ' : 'НЕТ АККАУНТА? СОЗДАТЬ'}
          </button>
          <button className="guest-button" type="button" onClick={onGuest} disabled={busy}>ЗАЙТИ КАК ГОСТЬ</button>
          {message && <div className="registration-message">{message}</div>}
        </form>
      </section>
    </main>
  );
}
