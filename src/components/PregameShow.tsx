import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ArenaTeamLogos } from "./ArenaTeamLogos";
import "./PregameShow.css";
import "./PregameTeamRitual.css";
import "./PregameVs.css";
import { TicketSalesShow } from "./TicketSalesShow";

type Props = { trophyName: string; homeTeam: string; awayTeam: string; homeColor: string; awayColor: string; homeLogo: string; awayLogo: string; homeStar: string; awayStar: string; onComplete: () => void };

const PLAYERS = ["CURRY", "LEBRON", "PLAYER", "PARTNER"];

function teamChant(team: string) {
  const chants: Record<string, string> = {
    "LA Lakers": "SHOWTIME! LAKERS! ПОБЕДА!",
    "Golden State": "STRENGTH IN NUMBERS! WARRIORS!",
    "Chicago Bulls": "RUN WITH THE BULLS! ВПЕРЁД!",
    "Boston Celtics": "CELTIC PRIDE! ВМЕСТЕ ДО КОНЦА!",
    "Miami Heat": "HEAT NATION! ЗАЖИГАЕМ!",
  };
  return chants[team] ?? `${team.toUpperCase()}! ОДНА КОМАНДА — ОДНА ПОБЕДА!`;
}

export function PregameShow({ trophyName, homeTeam, awayTeam, homeColor, awayColor, homeLogo, awayLogo, homeStar, awayStar, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const ticker = window.setInterval(
      () => setElapsed(performance.now() - startedAt),
      100,
    );
    const finish = window.setTimeout(onComplete, 20000);
    return () => {
      clearInterval(ticker);
      clearTimeout(finish);
    };
  }, [onComplete]);

  const showElapsed = Math.max(0, elapsed - 3500);
  const countdown = Math.max(1, 3 - Math.floor(Math.max(0, showElapsed - 13500) / 900));
  const screenText = showElapsed < 1800
    ? "WELCOME TO SWISH ARENA"
    : showElapsed < 4800
      ? `MAKE SOME NOISE — ${homeTeam.toUpperCase()}!`
      : showElapsed < 8500 ? "КОМАНДА ВЫШЛА НА РАЗМИНКУ"
      : showElapsed < 12500 ? teamChant(homeTeam)
      : showElapsed < 16000 ? `TIP-OFF IN ${countdown}` : "GAME TIME";

  return (
    <div className="pregame-show">
      {elapsed < 3500 && <TicketSalesShow homeTeam={homeTeam} awayTeam={awayTeam} homeLogo={homeLogo} awayLogo={awayLogo} />}
      <div className="pregame-spotlight spotlight-left" />
      <div className="pregame-spotlight spotlight-right" />
      <div className="pregame-floor-glow" />
      <div className="arena-screen">
        <span>LIVE · SWISH 3D</span>
        <ArenaTeamLogos homeTeam={homeTeam} awayTeam={awayTeam} homeLogo={homeLogo} awayLogo={awayLogo} />
        <b>{screenText}</b>
        <em>{homeTeam}&nbsp;&nbsp; VS &nbsp;&nbsp;{awayTeam}</em>
      </div>
      {showElapsed >= 1500 && showElapsed < 4800 && (
        <div className="player-entrance">
          <div className="entrance-tunnel" />
          <div className="glowing-runway"><span /></div>
          {[0, 1, 2, 3, 4, 5].map((flame) => (
            <span className={`fire-jet fire-${flame}`} key={flame}>
              <i className="flame-core" />
              <i className="flame-tip" />
            </span>
          ))}
          {[homeStar, ...PLAYERS.slice(1)].map((name, index) => (
            <div
              className="show-player home-show-player"
              key={`home-${name}`}
              style={{
                "--player-delay": `${index * .48}s`,
                "--player-lane": index - 3.5,
              } as CSSProperties}
            >
              <div className="show-player-head" />
              <div className="show-player-body" style={{ background: homeColor }}>{index + 1}</div>
              <b>{name}</b>
            </div>
          ))}
          {[awayStar, 'CAPTAIN', 'GUARD', 'CENTER'].map((name, index) => (
            <div
              className="show-player opponent-show-player"
              key={`away-${index}`}
              style={{
                "--player-delay": `${.25 + index * .48}s`,
                "--player-lane": index + .5,
              } as CSSProperties}
            >
              <div className="show-player-head" />
              <div className="show-player-body" style={{ background: awayColor }}>{index + 1}</div>
              <b>{name}</b>
            </div>
          ))}
        </div>
      )}
      {showElapsed >= 4800 && showElapsed < 8500 && (
        <div className="team-warmup" style={{ "--ritual-color": homeColor } as CSSProperties}>
          <strong>РАЗМИНКА · {homeTeam}</strong>
          <div className="warmup-cones">▲　▲　▲　▲　▲</div>
          {[0, 1, 2, 3, 4].map((player) => (
            <div className={`warmup-player warmup-${player}`} key={player}><i /><b>{player + 1}</b><span>🏀</span></div>
          ))}
        </div>
      )}
      {showElapsed >= 8500 && showElapsed < 12500 && (
        <div className="team-huddle" style={{ "--ritual-color": homeColor } as CSSProperties}>
          <img src={homeLogo} alt="" />
          <div className="huddle-coach"><i /><b>ТРЕНЕР</b></div>
          {[0, 1, 2, 3, 4].map((player) => <div className={`huddle-player huddle-${player}`} key={player}><i /><b>{player + 1}</b></div>)}
          <div className="hands-together">🤝</div>
          <strong>{teamChant(homeTeam)}</strong>
        </div>
      )}
      {Array.from({ length: 26 }, (_, index) => (
        <i key={index} style={{
          left: `${(index * 37) % 100}%`,
          animationDuration: `${2.4 + (index % 5) * .25}s`,
          animationDelay: `${index * -.12}s`,
          background: `hsl(${index * 47}deg 90% 60%)`,
        } as CSSProperties} />
      ))}
      <div className="pregame-content">
        {showElapsed < 1500 && <strong>🏆 МАТЧ ЗА {trophyName}</strong>}
        <small>SWISH 3D ПРЕДСТАВЛЯЕТ</small>
        {showElapsed < 1500 && <h2>ДОБРО ПОЖАЛОВАТЬ<br />НА ГЛАВНУЮ АРЕНУ</h2>}
        {showElapsed >= 1800 && showElapsed < 4800 && (
          <div className="pregame-teams">
            <section><b style={{ color: homeColor }}>{homeTeam}</b><span>⭐ {homeStar}</span></section>
            <strong>VS</strong>
            <section><b style={{ color: awayColor }}>{awayTeam}</b><span>⭐ {awayStar}</span></section>
          </div>
        )}
        {showElapsed >= 13500 && showElapsed < 16000 && (
          <div className="pregame-countdown" key={countdown}>{countdown}</div>
        )}
        {showElapsed >= 16000 && <h2 className="pregame-go">ИГРА НАЧАЛАСЬ!</h2>}
      </div>
    </div>
  );
}
