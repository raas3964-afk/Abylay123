import type { CSSProperties } from 'react';
import './BasketballTimeout.css';
import './TimeoutGather.css';

type Props = { team: string; teamColor: string; timeoutsLeft: number };

export function BasketballTimeout({ team, teamColor, timeoutsLeft }: Props) {
  const style = { '--timeout-team': teamColor } as CSSProperties;
  return (
    <div className="basketball-timeout" style={style}>
      <div className="timeout-score-sign">TIMEOUT · {team.toUpperCase()} · ОСТАЛОСЬ {timeoutsLeft}</div>
      <div className="timeout-huddle-stage">
        <div className="timeout-coach"><i /><b>ТРЕНЕР</b><span>СМОТРИМ НА ДОСКУ!</span></div>
        <div className="strategy-board">
          <strong>СХЕМА АТАКИ</strong>
          <div className="board-court"><i className="route-one"/><i className="route-two"/><i className="route-three"/><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b></div>
          <small>ПАС → ЗАСЛОН → РЫВОК К КОЛЬЦУ</small>
        </div>
        {[0,1,2,3,4].map((player) => <div className={`timeout-player timeout-player-${player}`} key={player}><i/><b>{player + 1}</b></div>)}
      </div>
      <h2>ИГРАЕМ ВМЕСТЕ!</h2>
      <p>Тренер объясняет комбинацию · матч скоро продолжится</p>
      <div className="timeout-clock"><span /></div>
    </div>
  );
}
