import './TicketSalesShow.css';

type Props = { homeTeam: string; awayTeam: string; homeLogo: string; awayLogo: string };

export function TicketSalesShow({ homeTeam, awayTeam, homeLogo, awayLogo }: Props) {
  return (
    <div className="ticket-sales-show">
      <div className="ticket-arena-sign">
        <span>СЕГОДНЯ · SOLD OUT SOON</span>
        <div><img src={homeLogo} alt="" /><b>{homeTeam}<em>VS</em>{awayTeam}</b><img src={awayLogo} alt="" /></div>
      </div>
      <div className="ticket-booth">
        <strong>SWISH ARENA · БИЛЕТЫ</strong>
        <div className="cashier"><i /><b>КАССИР</b></div>
        <div className="payment-screen">💳<small>ОПЛАТА ПРИНЯТА</small></div>
        <div className="printed-ticket">🎟️ <b>SEAT A-23</b></div>
      </div>
      <div className="fan-queue">
        {['📱','💳','🎫','📱','💳'].map((payment, index) => (
          <div className={`ticket-fan fan-${index}`} key={index}><i /><b /><span>{payment}</span></div>
        ))}
      </div>
      <div className="turnstile"><b>ВХОД</b><i /><span>✓</span></div>
      <strong className="ticket-status">БОЛЕЛЬЩИКИ ПОКУПАЮТ БИЛЕТЫ НА МАТЧ</strong>
    </div>
  );
}
