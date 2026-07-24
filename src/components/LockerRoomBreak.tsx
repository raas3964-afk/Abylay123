import type { CSSProperties } from 'react';
import './LockerRoomBreak.css';

type Props = { team: string; teamColor: string; quarter: number };

export function LockerRoomBreak({ team, teamColor, quarter }: Props) {
  const style = { '--locker-team': teamColor } as CSSProperties;
  return (
    <div className="locker-room-break" style={style}>
      <header><small>ПЕРЕРЫВ ПОСЛЕ {quarter}-Й ЧЕТВЕРТИ</small><b>{team.toUpperCase()} · РАЗДЕВАЛКА</b></header>
      <div className="locker-wall">
        {[1,2,3,4,5].map((number) => <div className="locker" key={number}><i>{number}</i></div>)}
      </div>
      <div className="locker-coach"><i/><b>ТРЕНЕР</b><span>СЛЕДУЮЩАЯ<br/>КОМБИНАЦИЯ!</span></div>
      <div className="locker-strategy-board">
        <strong>ПЛАН НА ЧЕТВЕРТЬ {quarter + 1}</strong>
        <div><i/><i/><i/><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b></div>
        <small>ЗАСЛОН → ПАС → БРОСОК</small>
      </div>
      <div className="locker-players">
        {[1,2,3,4,5].map((number) => <div className={`locker-player locker-player-${number}`} key={number}><i/><b>{number}</b><span/></div>)}
      </div>
      <h2>СЛУШАЕМ ТРЕНЕРА · ИГРАЕМ КОМАНДОЙ</h2>
      <div className="locker-break-timer"><span/></div>
    </div>
  );
}
