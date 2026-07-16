import { useEffect, useState } from 'react';
import './HomePage.css';

type Props = {
  playerName: string;
  onPlay: () => void;
  onLogout: () => void;
};

type StreakData = {
  count: number;
  lastVisit: string;
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function updateStreak(): number {
  const today = new Date();
  const todayKey = dateKey(today);
  const saved = localStorage.getItem('swish-login-streak');
  const previous: StreakData = saved ? JSON.parse(saved) as StreakData : { count: 0, lastVisit: '' };

  if (previous.lastVisit === todayKey) return previous.count;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const count = previous.lastVisit === dateKey(yesterday) ? previous.count + 1 : 1;
  localStorage.setItem('swish-login-streak', JSON.stringify({ count, lastVisit: todayKey }));
  return count;
}

export function HomePage({ playerName, onPlay, onLogout }: Props) {
  const [streak, setStreak] = useState(1);
  const [easyRead, setEasyRead] = useState(() => localStorage.getItem('swish-easy-read') === 'true');

  useEffect(() => {
    setStreak(updateStreak());
  }, []);

  function toggleEasyRead() {
    setEasyRead((enabled) => {
      localStorage.setItem('swish-easy-read', String(!enabled));
      return !enabled;
    });
  }

  return (
    <main className={`home-page${easyRead ? ' easy-read' : ''}`}>
      <a className="skip-link" href="#play-button">Skip to Play</a>
      <div className="home-court" aria-hidden="true">
        <div className="court-circle" />
        <div className="court-key" />
      </div>
      <div className="home-hoop" aria-hidden="true"><span /><i /></div>
      <div className="home-ball" aria-hidden="true">🏀</div>
      <header className="home-header">
        <div className="home-brand"><span>🏀</span> SWISH 3D</div>
        <div className="home-actions">
          <button className="readability-button" onClick={toggleEasyRead} aria-pressed={easyRead} aria-label="Toggle large text and high contrast">Aa</button>
          <button onClick={onLogout}>Log out</button>
        </div>
      </header>
      <section className="home-arena-decor" aria-label="Basketball legends">
        <div className="legend-banner curry"><b>STEPHEN CURRY</b><span>GREATEST SHOOTER</span></div>
        <div className="home-nba-flag" aria-label="NBA"><i/><b>NBA</b></div>
        <div className="legend-banner kyrie"><b>KYRIE IRVING</b><span>HANDLE MASTER</span></div>
        <div className="legend-banner lamelo"><b>LAMELO BALL</b><span>FUTURE STAR</span></div>
      </section>

      <section className="home-hero">
        <div className="home-welcome">
          <small>WELCOME TO THE COURT</small>
          <h1>READY TO<br/><em>BALL?</em></h1>
          <strong>Hey, {playerName}</strong>
          <p>The arena is waiting. Keep your streak alive and set a new record.</p>
          <div className="team-preview" aria-label="Blue team attacks, red team defends">
            <div className="team-side attack-team">
              <div className="mini-player"><i/><b/><span/></div>
              <span><b>BLUE</b>ATTACK</span>
            </div>
            <em>VS</em>
            <div className="team-side defense-team">
              <div className="mini-player"><i/><b/><span/></div>
              <span><b>RED</b>DEFENSE</span>
            </div>
          </div>
        </div>

        <div className="streak-card" aria-label={`${streak} day login streak`}>
          <div className="streak-fire">🔥</div>
          <div><b>{streak}</b><span>{streak === 1 ? 'day in a row' : 'days in a row'}</span></div>
          <small>YOUR STREAK</small>
        </div>

        <button className="home-play" id="play-button" onClick={onPlay} aria-label="Play basketball now">
          <span><small>ENTER THE COURT</small>Play now</span>
          <i>→</i>
        </button>
        <div className="home-stats">
          <span><b>5v5</b>FULL MATCH</span>
          <span><b>3D</b>LIVE ARENA</span>
          <span><b>∞</b>SHOTS</span>
        </div>
      </section>

      <nav className="home-nav" aria-label="Main menu">
        <button className="active" aria-current="page"><span aria-hidden="true">⌂</span>Home</button>
        <button><span aria-hidden="true">🏆</span>Records</button>
        <button><span aria-hidden="true">●</span>Profile</button>
      </nav>
    </main>
  );
}
