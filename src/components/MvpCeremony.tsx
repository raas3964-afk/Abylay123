import type { CSSProperties } from 'react';
import './MvpCeremony.css';
import './MvpTrophy.css';

type Props = { team: string; player: string; score: string; teamColor: string; trophyName: string; onRematch: () => void };

export function MvpCeremony({ team, player, score, teamColor, trophyName, onRematch }: Props) {
  const teamStyle = { '--team-color': teamColor } as CSSProperties;
  return (
    <div className="mvp-ceremony">
      <div className="mvp-beam beam-one" /><div className="mvp-beam beam-two" />
      {Array.from({ length: 30 }, (_, index) => <i key={index} style={{ left: `${(index * 43) % 100}%`, animationDelay: `${index * -.09}s` }} />)}
      <small>ПОБЕДИТЕЛЬ · {score}</small>
      <div className="mvp-stage">
        {[0, 1, 2, 3].map((index) => <div className={`mvp-teammate teammate-${index}`} key={index} style={teamStyle}><i /></div>)}
        <div className="mvp-player" style={teamStyle}><i /></div>
        <div className="team-trophy" aria-label={trophyName}>🏆</div>
        {[0, 1, 2].map((index) => <div className={`mvp-photographer photographer-${index}`} key={index}><i /><span>📷</span><b /></div>)}
      </div>
      <small>🏆 ТРОФЕЙ ЗАВОЁВАН</small>
      <strong>{trophyName}</strong>
      <h2>MVP МАТЧА</h2>
      <strong>{player}</strong>
      <p>Лучший игрок команды <b>{team}</b></p>
      <button onClick={onRematch}>СЫГРАТЬ ЕЩЁ РАЗ</button>
    </div>
  );
}
