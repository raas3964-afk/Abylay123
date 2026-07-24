import { useEffect, useState } from 'react';
import './HomePage.css';
import './HomePageOverflow.css';
import './HomeLegends.css';
import { TeamSelection, type TeamId } from './TeamSelection';

type Props = {
  onPlay: (mode: GameMode, homeTeam: TeamId, awayTeam: TeamId) => void;
  onLogout: () => void;
};

export type GameMode = '5v5' | '3v3' | '1v1' | 'training';

const GAME_MODES: { value: GameMode; title: string; subtitle: string }[] = [
  { value: 'training', title: 'ТРЕНИРОВКА', subtitle: 'Фишки и дриблинг' },
  { value: '5v5', title: '5 VS 5', subtitle: 'Полный матч' },
  { value: '3v3', title: '3 VS 3', subtitle: 'Быстрая игра' },
  { value: '1v1', title: '1 VS 1', subtitle: 'Дуэль' },
];

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

export function HomePage({ onPlay, onLogout }: Props) {
  const [streak, setStreak] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('5v5');
  const [homeTeam, setHomeTeam] = useState<TeamId | ''>('');
  const [awayTeam, setAwayTeam] = useState<TeamId | ''>('');
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
        <div className="home-nba-flag" aria-label="NBA"><i/><b>NBA</b></div>
        <div className="home-legends-line">
          <article className="home-legend curry-player"><div><i/><b>30</b></div><strong>STEPHEN CURRY</strong><span>GREATEST SHOOTER</span></article>
          <article className="home-legend kyrie-player"><div><i/><b>11</b></div><strong>KYRIE IRVING</strong><span>HANDLE MASTER</span></article>
          <article className="home-legend lamelo-player"><div><i/><b>1</b></div><strong>LAMELO BALL</strong><span>FUTURE STAR</span></article>
        </div>
      </section>
      <section className="home-hero">
        <div className="home-welcome">
          <small>WELCOME TO THE COURT</small>
          <h1>READY TO<br/><em>BALL?</em></h1>
          <strong>Hey, Baller</strong>
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
          <button
            className="home-play"
            id="play-button"
            disabled={!homeTeam || !awayTeam}
            onClick={() => homeTeam && awayTeam && onPlay(gameMode, homeTeam, awayTeam)}
            aria-label={`Играть в режиме ${gameMode}`}
          >
            <span><small>РЕЖИМ {gameMode}</small>{homeTeam && awayTeam ? 'Играть сейчас' : 'Выбери команды'}</span>
            <i>→</i>
          </button>
          <div className="home-stats">
            <span><b>{gameMode}</b>ВЫБРАННЫЙ РЕЖИМ</span>
            <span><b>3D</b>LIVE ARENA</span>
            <span><b>∞</b>SHOTS</span>
          </div>
        </div>

        <div className="streak-card" aria-label={`${streak} day login streak`}>
          <div className="streak-fire">🔥</div>
          <div><b>{streak}</b><span>{streak === 1 ? 'day in a row' : 'days in a row'}</span></div>
          <small>YOUR STREAK</small>
        </div>

        <div className="game-mode-picker" aria-label="Выбор режима игры">
          {GAME_MODES.map((mode) => (
            <button
              className={gameMode === mode.value ? 'selected' : ''}
              key={mode.value}
              onClick={() => setGameMode(mode.value)}
              aria-pressed={gameMode === mode.value}
            >
              <b>{mode.title}</b>
              <span>{mode.subtitle}</span>
            </button>
          ))}
        </div>

        <TeamSelection
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          onHomeChange={(team) => {
            setHomeTeam(team);
            if (team === awayTeam) setAwayTeam('');
          }}
          onAwayChange={(team) => {
            setAwayTeam(team);
            if (team && window.matchMedia('(pointer: coarse)').matches) {
              window.setTimeout(() => {
                document.getElementById('play-button')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }, 100);
            }
          }}
        />

      </section>

      <nav className="home-nav" aria-label="Main menu">
        <button className="active" aria-current="page"><span aria-hidden="true">⌂</span>Home</button>
        <button><span aria-hidden="true">🏆</span>Records</button>
        <button><span aria-hidden="true">●</span>Profile</button>
      </nav>
    </main>
  );
}
