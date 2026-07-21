import './DeviceChoice.css';

export type DeviceMode = 'phone' | 'computer';

type Props = { onSelect: (device: DeviceMode) => void };

export function DeviceChoice({ onSelect }: Props) {
  return (
    <main className="device-choice">
      <div className="device-brand">🏀 <b>SWISH 3D</b></div>
      <section>
        <small>НА ЧЁМ БУДЕШЬ ИГРАТЬ?</small>
        <h1>Выбери устройство</h1>
        <p>Мы подготовим подходящий размер интерфейса и управление.</p>
        <div className="device-options">
          <button onClick={() => onSelect('phone')}>
            <span>📱</span>
            <b>Телефон</b>
            <small>Большие кнопки и сенсорное управление</small>
          </button>
          <button onClick={() => onSelect('computer')}>
            <span>🖥️</span>
            <b>Компьютер</b>
            <small>Клавиатура и мышь</small>
          </button>
        </div>
      </section>
    </main>
  );
}
