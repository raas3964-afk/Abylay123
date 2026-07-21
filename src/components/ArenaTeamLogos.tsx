type Props = { homeTeam: string; awayTeam: string; homeLogo: string; awayLogo: string };

export function ArenaTeamLogos({ homeTeam, awayTeam, homeLogo, awayLogo }: Props) {
  return (
    <div className="arena-team-logos" aria-label={`${homeTeam} против ${awayTeam}`}>
      <img src={homeLogo} alt={homeTeam} />
      <strong>VS</strong>
      <img src={awayLogo} alt={awayTeam} />
    </div>
  );
}
