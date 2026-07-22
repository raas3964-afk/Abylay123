import './TeamSelection.css';
import { useEffect, useRef, useState } from 'react';

const logo = (teamId: number) => `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;

export const BASKETBALL_TEAMS = [
  { id: 'lakers', name: 'LA Lakers', color: '#fdb927', logo: logo(1610612747), star: 'LeBron James' },
  { id: 'bulls', name: 'Chicago Bulls', color: '#ce2441', logo: logo(1610612741), star: 'Michael Jordan' },
  { id: 'warriors', name: 'Golden State', color: '#2b6acb', logo: logo(1610612744), star: 'Stephen Curry' },
  { id: 'celtics', name: 'Boston Celtics', color: '#17864a', logo: logo(1610612738), star: 'Jayson Tatum' },
  { id: 'knicks', name: 'New York Knicks', color: '#f58426', logo: logo(1610612752), star: 'Jalen Brunson' },
  { id: 'hornets', name: 'Charlotte Hornets', color: '#1d8b9f', logo: logo(1610612766), star: 'LaMelo Ball' },
  { id: 'wizards', name: 'Washington Wizards', color: '#d52b1e', logo: logo(1610612764), star: 'John Wall' },
  { id: 'nets', name: 'Brooklyn Nets', color: '#c5cad2', logo: logo(1610612751), star: 'Kyrie Irving' },
  { id: 'hawks', name: 'Atlanta Hawks', color: '#e03a3e', logo: logo(1610612737), star: 'Trae Young' },
  { id: 'heat', name: 'Miami Heat', color: '#e24a53', logo: logo(1610612748), star: 'Dwyane Wade' },
  { id: 'sixers', name: 'Philadelphia 76ers', color: '#006bb6', logo: logo(1610612755), star: 'Allen Iverson' },
  { id: 'raptors', name: 'Toronto Raptors', color: '#ce1141', logo: logo(1610612761), star: 'Vince Carter' },
  { id: 'cavaliers', name: 'Cleveland Cavaliers', color: '#860038', logo: logo(1610612739), star: 'Donovan Mitchell' },
  { id: 'pistons', name: 'Detroit Pistons', color: '#c8102e', logo: logo(1610612765), star: 'Isiah Thomas' },
  { id: 'pacers', name: 'Indiana Pacers', color: '#fdbb30', logo: logo(1610612754), star: 'Reggie Miller' },
  { id: 'bucks', name: 'Milwaukee Bucks', color: '#00471b', logo: logo(1610612749), star: 'Giannis Antetokounmpo' },
  { id: 'magic', name: 'Orlando Magic', color: '#0077c0', logo: logo(1610612753), star: 'Shaquille O’Neal' },
  { id: 'clippers', name: 'LA Clippers', color: '#c8102e', logo: logo(1610612746), star: 'Kawhi Leonard' },
  { id: 'suns', name: 'Phoenix Suns', color: '#e56020', logo: logo(1610612756), star: 'Charles Barkley' },
  { id: 'kings', name: 'Sacramento Kings', color: '#5a2d81', logo: logo(1610612758), star: 'Chris Webber' },
  { id: 'mavericks', name: 'Dallas Mavericks', color: '#00538c', logo: logo(1610612742), star: 'Dirk Nowitzki' },
  { id: 'rockets', name: 'Houston Rockets', color: '#ce1141', logo: logo(1610612745), star: 'Hakeem Olajuwon' },
  { id: 'grizzlies', name: 'Memphis Grizzlies', color: '#5d76a9', logo: logo(1610612763), star: 'Ja Morant' },
  { id: 'pelicans', name: 'New Orleans Pelicans', color: '#0c2340', logo: logo(1610612740), star: 'Zion Williamson' },
  { id: 'spurs', name: 'San Antonio Spurs', color: '#a7a9ac', logo: logo(1610612759), star: 'Tim Duncan' },
  { id: 'nuggets', name: 'Denver Nuggets', color: '#0e2240', logo: logo(1610612743), star: 'Nikola Jokić' },
  { id: 'timberwolves', name: 'Minnesota Timberwolves', color: '#0c2340', logo: logo(1610612750), star: 'Kevin Garnett' },
  { id: 'thunder', name: 'Oklahoma City Thunder', color: '#007ac1', logo: logo(1610612760), star: 'Shai Gilgeous-Alexander' },
  { id: 'blazers', name: 'Portland Trail Blazers', color: '#e03a3e', logo: logo(1610612757), star: 'Damian Lillard' },
  { id: 'jazz', name: 'Utah Jazz', color: '#002b5c', logo: logo(1610612762), star: 'Karl Malone' },
] as const;

export type TeamId = typeof BASKETBALL_TEAMS[number]['id'];

const AWAY_JERSEY_COLORS: Partial<Record<TeamId, string>> = {
  lakers: '#552583', warriors: '#f7f7f7', bulls: '#f4f4f4', celtics: '#f4f4f4',
  knicks: '#1d428a', hornets: '#f4f4f4', wizards: '#002b5c', nets: '#111111',
  hawks: '#f4f4f4', heat: '#111111', sixers: '#f4f4f4', raptors: '#111111',
  cavaliers: '#fdbb30', pistons: '#1d42ba', pacers: '#002d62', bucks: '#eee1c6',
  magic: '#111111', clippers: '#1d428a', suns: '#1d1160', kings: '#f4f4f4',
  mavericks: '#f4f4f4', rockets: '#f4f4f4', grizzlies: '#12173f', pelicans: '#c8102e',
  spurs: '#111111', nuggets: '#fec524', timberwolves: '#78be20', thunder: '#ef3b24',
  blazers: '#111111', jazz: '#fff21f',
};

type Props = {
  homeTeam: TeamId | '';
  awayTeam: TeamId | '';
  onHomeChange: (team: TeamId) => void;
  onAwayChange: (team: TeamId | '') => void;
};

export function teamName(teamId: TeamId) {
  return BASKETBALL_TEAMS.find((team) => team.id === teamId)?.name ?? teamId;
}

export function teamColor(teamId: TeamId) {
  return BASKETBALL_TEAMS.find((team) => team.id === teamId)?.color ?? '#2463d4';
}

export function teamAwayColor(teamId: TeamId) {
  return AWAY_JERSEY_COLORS[teamId] ?? '#f4f4f4';
}

export function teamLogo(teamId: TeamId) {
  return BASKETBALL_TEAMS.find((team) => team.id === teamId)?.logo ?? '';
}

export function teamStar(teamId: TeamId) {
  return BASKETBALL_TEAMS.find((team) => team.id === teamId)?.star ?? 'Team Captain';
}

export function TeamSelection({ homeTeam, awayTeam, onHomeChange, onAwayChange }: Props) {
  const [previewOpponent, setPreviewOpponent] = useState<TeamId | ''>('');
  const [isChoosing, setIsChoosing] = useState(false);
  const intervalRef = useRef<number>();
  const timeoutRef = useRef<number>();

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  const chooseHomeTeam = (teamId: TeamId) => {
    const opponents = BASKETBALL_TEAMS.filter((team) => team.id !== teamId);
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    onHomeChange(teamId);
    onAwayChange('');
    setIsChoosing(true);
    let cycle = 0;
    setPreviewOpponent(opponents[0].id);
    intervalRef.current = window.setInterval(() => {
      cycle = (cycle + 1) % opponents.length;
      setPreviewOpponent(opponents[cycle].id);
    }, 130);
    timeoutRef.current = window.setTimeout(() => {
      clearInterval(intervalRef.current);
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      setPreviewOpponent(opponent.id);
      onAwayChange(opponent.id);
      setIsChoosing(false);
    }, 1800);
  };
  const aiOpponent = BASKETBALL_TEAMS.find((team) => team.id === (previewOpponent || awayTeam));

  return (
    <div className="team-selection">
      <strong>ВЫБЕРИ СВОЮ КОМАНДУ</strong>
      <div className="team-choice-column">
        <span>ТВОЯ КОМАНДА</span>
        <div className="team-logo-grid">
          {BASKETBALL_TEAMS.map((team) => (
            <button className={homeTeam === team.id ? 'chosen' : ''} disabled={isChoosing} key={team.id} onClick={() => chooseHomeTeam(team.id)} title={team.name}>
              <img src={team.logo} alt="" /><small>{team.name}</small>
            </button>
          ))}
        </div>
      </div>
      <b className="team-versus">VS</b>
      <div className="ai-team-choice">
        <span>{isChoosing ? 'AI АНАЛИЗИРУЕТ КОМАНДЫ…' : 'СОПЕРНИК, ВЫБРАННЫЙ AI'}</span>
        {aiOpponent ? (
          <div className={isChoosing ? 'ai-selecting' : ''}>
            <img src={aiOpponent.logo} alt="" />
            <b>{aiOpponent.name}</b>
            <small>{isChoosing ? 'Выбор идёт прямо сейчас' : 'AI выбрал эту команду'}</small>
          </div>
        ) : (
          <p>Сначала выбери свою команду</p>
        )}
      </div>
    </div>
  );
}
