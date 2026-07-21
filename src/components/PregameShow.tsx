import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ArenaTeamLogos } from "./ArenaTeamLogos";
import "./PregameShow.css";

type Props = { homeTeam: string; awayTeam: string; homeColor: string; awayColor: string; homeLogo: string; awayLogo: string; homeStar: string; awayStar: string; onComplete: () => void };

const PLAYERS = ["CURRY", "LEBRON", "PLAYER", "PARTNER"];

export function PregameShow({ homeTeam, awayTeam, homeColor, awayColor, homeLogo, awayLogo, homeStar, awayStar, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const ticker = window.setInterval(
      () => setElapsed(performance.now() - startedAt),
      100,
    );
    const finish = window.setTimeout(onComplete, 11000);
    return () => {
      clearInterval(ticker);
      clearTimeout(finish);
    };
  }, [onComplete]);

  const countdown = Math.max(1, 3 - Math.floor(Math.max(0, elapsed - 7800) / 900));
  const screenText = elapsed < 1800
    ? "WELCOME TO SWISH ARENA"
    : elapsed < 5200
      ? `MAKE SOME NOISE — ${homeTeam.toUpperCase()}!`
      : elapsed < 7800 ? "TEAM PHOTO · LOOK AT THE CAMERAS!"
      : elapsed < 10500 ? `TIP-OFF IN ${countdown}` : "GAME TIME";

  return (
    <div className="pregame-show">
      <div className="pregame-spotlight spotlight-left" />
      <div className="pregame-spotlight spotlight-right" />
      <div className="pregame-floor-glow" />
      <div className="arena-screen">
        <span>LIVE · SWISH 3D</span>
        <ArenaTeamLogos homeTeam={homeTeam} awayTeam={awayTeam} homeLogo={homeLogo} awayLogo={awayLogo} />
        <b>{screenText}</b>
        <em>{homeTeam}&nbsp;&nbsp; VS &nbsp;&nbsp;{awayTeam}</em>
      </div>
      {elapsed >= 1500 && elapsed < 5200 && (
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
      {elapsed >= 5200 && elapsed < 7800 && (
        <div className="team-photo-session">
          {[
            { name: homeTeam, color: homeColor, logo: homeLogo },
            { name: awayTeam, color: awayColor, logo: awayLogo },
          ].map((team) => (
            <section key={team.name}>
              <img src={team.logo} alt="" />
              <div className="photo-team-row">
                {[0, 1, 2, 3, 4].map((player) => <i key={player} style={{ "--photo-uniform": team.color } as CSSProperties} />)}
              </div>
              <b>{team.name}</b>
            </section>
          ))}
          <div className="pregame-photographers"><span>📷</span><span>📷</span><span>📷</span></div>
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
        <small>SWISH 3D ПРЕДСТАВЛЯЕТ</small>
        {elapsed < 1500 && <h2>ДОБРО ПОЖАЛОВАТЬ<br />НА ГЛАВНУЮ АРЕНУ</h2>}
        {elapsed >= 1800 && elapsed < 5200 && (
          <div className="pregame-teams">
            <section><b style={{ color: homeColor }}>{homeTeam}</b><span>⭐ {homeStar}</span></section>
            <strong>VS</strong>
            <section><b style={{ color: awayColor }}>{awayTeam}</b><span>⭐ {awayStar}</span></section>
          </div>
        )}
        {elapsed >= 7800 && elapsed < 10500 && (
          <div className="pregame-countdown" key={countdown}>{countdown}</div>
        )}
        {elapsed >= 10500 && <h2 className="pregame-go">ИГРА НАЧАЛАСЬ!</h2>}
      </div>
    </div>
  );
}
