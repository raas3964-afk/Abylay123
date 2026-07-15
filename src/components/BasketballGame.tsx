import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  animateBasketballCrowd,
  createBasketballCrowd,
} from "./BasketballCrowd";
import { animateReferee, createReferee, signalFoul } from "./BasketballReferee";
import { createFullMatchActors, updateFullMatch } from "./FullMatchActors";
import "./BasketballGameHeader.css";

type Props = {
  active: boolean;
  onScore: (points: number) => void;
  onOpponentScore: (points: number) => void;
  onCharge: (power: number) => void;
  onMessage: (text: string) => void;
};

function person(color: number) {
  const group = new THREE.Group();
  const shirt = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.72, 6, 12),
    new THREE.MeshStandardMaterial({ color }),
  );
  shirt.position.y = 1.3;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x9b5d38 }),
  );
  head.position.y = 2.08;
  const legs = [-0.2, 0.2].map((x) => {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.62, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x18213a }),
    );
    leg.position.set(x, 0.42, 0);
    return leg;
  });
  group.add(shirt, head, ...legs);
  group.traverse((item) => {
    if (item instanceof THREE.Mesh) item.castShadow = true;
  });
  return group;
}

function ThreeCourt({ active, onScore, onOpponentScore, onCharge, onMessage }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const callbacks = useRef({ onScore, onOpponentScore, onCharge, onMessage });
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    callbacks.current = { onScore, onOpponentScore, onCharge, onMessage };
  }, [onScore, onOpponentScore, onCharge, onMessage]);

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9ed8f5);
    scene.fog = new THREE.Fog(0x9ed8f5, 25, 55);
    const camera = new THREE.PerspectiveCamera(
      48,
      host.clientWidth / host.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 7.5, 15);
    camera.lookAt(0, 2, -7);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x5e7045, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(-8, 14, 8);
    sun.castShadow = true;
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.25, 31),
      new THREE.MeshStandardMaterial({ color: 0xc98548, roughness: 0.75 }),
    );
    floor.position.set(0, -0.15, -5);
    floor.receiveShadow = true;
    scene.add(floor);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffe1b8 });
    const centerLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.02, 30),
      lineMaterial,
    );
    centerLine.rotation.y = Math.PI / 2;
    scene.add(centerLine);
    const circle = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.045, 8, 50),
      lineMaterial,
    );
    circle.rotation.x = Math.PI / 2;
    circle.position.y = 0.02;
    scene.add(circle);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 2.4, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0xf6fbff,
        transparent: true,
        opacity: 0.78,
      }),
    );
    board.position.set(0, 4.2, -18);
    board.castShadow = true;
    scene.add(board);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.17, 5.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x313a4b }),
    );
    pole.position.set(0, 2.5, -19);
    scene.add(pole);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.075, 12, 36),
      new THREE.MeshStandardMaterial({ color: 0xf15d28 }),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.35, -16.9);
    scene.add(rim);
    const net = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.38, 1, 16, 3, true),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      }),
    );
    net.position.set(0, 2.82, -16.9);
    scene.add(net);

    const crowd = createBasketballCrowd();
    scene.add(crowd.group);
    const referee = createReferee();
    scene.add(referee.group);
    const fullMatch = createFullMatchActors(scene, person);

    const player = person(0xf4772d);
    player.position.set(0, 0, 6);
    scene.add(player);
    const teammate = person(0x22a86b);
    teammate.position.set(-4.5, 0, 5);
    scene.add(teammate);
    const teammateBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xef6c24 }),
    );
    teammateBall.visible = false;
    scene.add(teammateBall);
    const defenders = [-4, -6.5, -9, -11.5, -13].map((z, index) => {
      const defender = person(index === 1 ? 0x2949b8 : 0x3056d3);
      defender.position.set((index - 2) * 2.2, 0, z);
      defender.rotation.y = Math.PI;
      scene.add(defender);
      return defender;
    });
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xef6c24, roughness: 0.72 }),
    );
    ball.castShadow = true;
    scene.add(ball);
    const keys = new Set<string>();
    let playerY = 0;
    let jumpVelocity = 0;
    let charging = false;
    let chargeStart = 0;
    let flying = false;
    let scored = false;
    let freeThrow = false;
    let shotPoints = 2;
    let stepBackUntil = 0;
    let stepBackReady = 0;
    let evadeUntil = 0;
    let crossoverReady = 0;
    let stealReady = 0;
    let foulReady = 0;
    let foulCount = 0;
    let partnerRunStart = 0;
    let partnerPassBackStart = 0;
    let partnerScored = false;
    const partnerPassOrigin = new THREE.Vector3();
    const velocity = new THREE.Vector3();
    const heldPosition = () =>
      new THREE.Vector3(
        player.position.x + 0.48,
        player.position.y + 1.8,
        player.position.z - 0.15,
      );
    ball.position.copy(heldPosition());

    const keyDown = (event: KeyboardEvent) => {
      keys.add(event.code);
      if (event.code === "Space" && playerY === 0) jumpVelocity = 7.2;
      if (
        event.code === "KeyQ" &&
        performance.now() > stepBackReady &&
        !flying
      ) {
        stepBackUntil = performance.now() + 260;
        stepBackReady = performance.now() + 850;
        callbacks.current.onMessage("⚡ СТЕП-БЭК! Бросай!");
      }
      if (
        event.code === "KeyE" &&
        activeRef.current &&
        !partnerRunStart &&
        !freeThrow &&
        !flying
      ) {
        partnerRunStart = performance.now();
        partnerScored = false;
        teammateBall.visible = true;
        ball.visible = false;
        callbacks.current.onMessage(
          "🤝 Пас партнёру! Нажми R, чтобы получить пас обратно",
        );
      }
      if (
        event.code === "KeyR" &&
        activeRef.current &&
        partnerRunStart &&
        !partnerPassBackStart &&
        !partnerScored
      ) {
        partnerPassBackStart = performance.now();
        partnerPassOrigin.copy(teammateBall.position);
        callbacks.current.onMessage("🏀 ПАРТНЁР ПАСУЕТ ТЕБЕ!");
      }
      if (
        (event.code === "ShiftLeft" || event.code === "ShiftRight") &&
        performance.now() > crossoverReady &&
        !flying
      ) {
        const side = keys.has("KeyA")
          ? -1
          : keys.has("KeyD")
            ? 1
            : player.position.x <= 0
              ? 1
              : -1;
        player.position.x = THREE.MathUtils.clamp(
          player.position.x + side * 2.1,
          -5.8,
          5.8,
        );
        evadeUntil = performance.now() + 650;
        crossoverReady = performance.now() + 900;
        callbacks.current.onMessage("💨 КРОССОВЕР! Защитник позади");
      }
    };
    const keyUp = (event: KeyboardEvent) => keys.delete(event.code);
    const pointerDown = (event: PointerEvent) => {
      if (!activeRef.current || flying || partnerRunStart) return;
      renderer.domElement.setPointerCapture(event.pointerId);
      charging = true;
      chargeStart = performance.now();
      callbacks.current.onCharge(1);
      callbacks.current.onMessage("Держи… и отпускай!");
    };
    const pointerUp = () => {
      if (!charging || flying) return;
      charging = false;
      const power = Math.max(
        28,
        Math.min(100, (performance.now() - chargeStart) / 11),
      );
      callbacks.current.onCharge(0);
      if (player.position.z < -13.2 && playerY > 0.42 && !freeThrow) {
        callbacks.current.onScore(2);
        callbacks.current.onMessage("💥 ДАНК! +2");
        ball.position.set(0, 3.25, -16.9);
        player.position.z = -15.7;
        playerY = 1.15;
        jumpVelocity = -1.5;
        return;
      }
      if (player.position.z < -13.2 && !freeThrow) {
        callbacks.current.onScore(2);
        callbacks.current.onMessage("✨ ЛЭЙ-АП! +2");
        player.position.z = -11.5;
        player.position.y = 0.8;
        window.setTimeout(() => {
          player.position.y = 0;
        }, 350);
        return;
      }
      const target = new THREE.Vector3(0, 3.48 + (power - 62) * 0.025, -16.9);
      shotPoints = freeThrow ? 1 : 2;
      const origin = heldPosition();
      ball.position.copy(origin);
      const distance = target.z - origin.z;
      const flight = Math.max(1, Math.abs(distance) / 13);
      velocity.set(
        (target.x - origin.x) / flight,
        (target.y - origin.y + 4.9 * flight * flight) / flight,
        distance / flight,
      );
      flying = true;
      scored = false;
      callbacks.current.onMessage(
        freeThrow ? "🏀 ШТРАФНОЙ БРОСОК…" : "Мяч летит…",
      );
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    window.addEventListener("pointerup", pointerUp);
    let last = performance.now();
    let id = 0;
    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.035);
      last = now;
      animateBasketballCrowd(crowd, now, activeRef.current);
      animateReferee(referee, now);
      const opponentAttacking = updateFullMatch(
        fullMatch,
        now,
        activeRef.current,
        defenders[4],
        callbacks.current.onOpponentScore,
        callbacks.current.onMessage,
      );
      if (activeRef.current) {
        const move =
          (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
          (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
        const forward =
          (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) -
          (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0);
        if (freeThrow) {
          player.position.x = 0;
          player.position.z = -11.2;
        } else {
          player.position.x = THREE.MathUtils.clamp(
            player.position.x + move * 5.3 * dt,
            -5.8,
            5.8,
          );
          if (now < stepBackUntil)
            player.position.z = Math.min(9, player.position.z + 12 * dt);
          else
            player.position.z = THREE.MathUtils.clamp(
              player.position.z + forward * 5.1 * dt,
              -15.2,
              9,
            );
        }
        jumpVelocity -= 16 * dt;
        playerY = Math.max(0, playerY + jumpVelocity * dt);
        if (playerY === 0) jumpVelocity = 0;
        player.position.y = playerY;
        defenders.forEach((defender, index) => {
          if (index === 4 && opponentAttacking) return;
          if (freeThrow) {
            defender.position.x = (index - 1) * 2.2;
            defender.position.z = -7.2 - index * 0.3;
            defender.position.y = 0;
            return;
          }
          const spread = (index - 1) * 1.15;
          const guardTarget = THREE.MathUtils.clamp(
            player.position.x + spread + Math.sin(now * 0.0018 + index) * 0.45,
            -5.2,
            5.2,
          );
          defender.position.x = THREE.MathUtils.lerp(
            defender.position.x,
            guardTarget,
            dt * (2.2 + index * 0.35),
          );
          defender.position.z = THREE.MathUtils.lerp(
            defender.position.z,
            -4.5 -
              index * 4 +
              Math.abs(player.position.x - defender.position.x) * 0.18,
            dt * 1.3,
          );
          defender.position.y = charging
            ? Math.abs(Math.sin(now * 0.009 + index)) * (0.55 + index * 0.12)
            : 0;
        });
        if (
          !flying &&
          !partnerRunStart &&
          now > evadeUntil &&
          now > stealReady
        ) {
          const thief = defenders.find(
            (defender) =>
              Math.hypot(
                player.position.x - defender.position.x,
                player.position.z - defender.position.z,
              ) < 0.92,
          );
          if (thief) {
            const hardContact =
              charging ||
              keys.has("ShiftLeft") ||
              keys.has("ShiftRight") ||
              playerY > 0.25;
            if (hardContact && now > foulReady) {
              foulCount += 1;
              foulReady = now + 2200;
              stealReady = now + 1200;
              charging = false;
              callbacks.current.onCharge(0);
              signalFoul(referee, now);
              thief.position.z -= 1.4;
              freeThrow = true;
              player.position.set(0, 0, -11.2);
              playerY = 0;
              jumpVelocity = 0;
              ball.position.copy(heldPosition());
              callbacks.current.onMessage(
                `📣 ФОЛ №${foulCount}! ВЫПОЛНИ ШТРАФНОЙ БРОСОК`,
              );
            } else {
              stealReady = now + 1500;
              charging = false;
              callbacks.current.onCharge(0);
              callbacks.current.onMessage(
                "🚫 ЗАЩИТНИК ЗАБРАЛ МЯЧ! Начинай заново",
              );
              player.position.set(0, 0, 6);
              teammateBall.visible = false;
            }
          }
        }
        if (partnerPassBackStart) {
          const passProgress = Math.min(1, (now - partnerPassBackStart) / 520);
          teammateBall.position.lerpVectors(
            partnerPassOrigin,
            heldPosition(),
            passProgress,
          );
          teammateBall.position.y += Math.sin(passProgress * Math.PI) * 1.4;
          if (passProgress === 1) {
            partnerPassBackStart = 0;
            partnerRunStart = 0;
            teammateBall.visible = false;
            ball.visible = true;
            teammate.position.set(-4.5, 0, 5);
            callbacks.current.onMessage("🙌 ПАС ПОЛУЧЕН! АТАКУЙ!");
          }
        } else if (partnerRunStart) {
          const runTime = (now - partnerRunStart) / 1000;
          const progress = Math.min(1, runTime / 1.8);
          teammate.position.x = THREE.MathUtils.lerp(-4.5, -1, progress);
          teammate.position.z = THREE.MathUtils.lerp(5, -15.7, progress);
          teammate.position.y =
            progress > 0.68
              ? Math.sin(((progress - 0.68) / 0.32) * Math.PI) * 1.7
              : 0;
          teammateBall.position.set(
            teammate.position.x + 0.45,
            teammate.position.y + 1.8,
            teammate.position.z - 0.2,
          );
          if (progress > 0.88)
            teammateBall.position.lerp(new THREE.Vector3(0, 3.5, -16.9), 0.18);
          if (progress === 1 && !partnerScored) {
            partnerScored = true;
            callbacks.current.onScore(2);
            callbacks.current.onMessage("💥 ПАРТНЁР СДЕЛАЛ ДАНК! +2");
          }
          if (runTime > 2.7) {
            partnerRunStart = 0;
            teammate.position.set(-4.5, 0, 5);
            teammateBall.visible = false;
            ball.visible = true;
          }
        } else {
          teammate.position.x = -4.5 + Math.sin(now * 0.0012) * 0.5;
        }
        if (charging)
          callbacks.current.onCharge(Math.min(100, (now - chargeStart) / 11));
        if (!flying) {
          ball.position.copy(heldPosition());
          if (!charging && playerY === 0) {
            const dribble = Math.abs(Math.sin(now * (move ? 0.012 : 0.009)));
            ball.position.y = 0.34 + dribble * 1.45;
            ball.position.x += move * 0.18;
            ball.rotation.x += dt * 7;
          }
        } else {
          const oldY = ball.position.y;
          velocity.y -= 9.8 * dt;
          ball.position.addScaledVector(velocity, dt);
          ball.rotation.x += dt * 8;
          const blocker = freeThrow
            ? undefined
            : defenders.find(
                (defender) =>
                  ball.position.distanceTo(
                    defender.position.clone().add(new THREE.Vector3(0, 1.9, 0)),
                  ) < 1.05,
              );
          if (blocker) {
            velocity.z = Math.abs(velocity.z) * 0.35;
            velocity.x += (ball.position.x - blocker.position.x) * 2;
            velocity.y = 3;
            callbacks.current.onMessage("🖐️ БЛОК защитника!");
          }
          if (
            !scored &&
            velocity.y < 0 &&
            oldY > 3.35 &&
            ball.position.y <= 3.35 &&
            Math.hypot(ball.position.x, ball.position.z + 16.9) < 0.63
          ) {
            scored = true;
            callbacks.current.onScore(
              shotPoints === 1
                ? 1
                : Math.abs(player.position.z + 16.9) > 19
                  ? 3
                  : 2,
            );
            callbacks.current.onMessage(
              shotPoints === 1 ? "✅ ШТРАФНОЙ ЗАБИТ! +1" : "🔥 СВИШ!",
            );
          }
          if (ball.position.y < 0.2 || Math.abs(ball.position.z) > 25) {
            flying = false;
            ball.position.copy(heldPosition());
            if (!scored)
              callbacks.current.onMessage(
                freeThrow
                  ? "Штрафной не забит — игра продолжается"
                  : "Попробуй ещё раз",
              );
            freeThrow = false;
            shotPoints = 2;
          }
        }
      }
      renderer.render(scene, camera);
      id = requestAnimationFrame(animate);
    }
    id = requestAnimationFrame(animate);
    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);
  return <div className="three-court" ref={mount} />;
}

type BasketballGameProps = { onExit: () => void };

export function BasketballGame({ onExit }: BasketballGameProps) {
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [time, setTime] = useState(120);
  const [charge, setCharge] = useState(0);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("У кольца: Space + мышь — данк");
  const [best, setBest] = useState(
    () => Number(localStorage.getItem("swish-3d-best")) || 0,
  );
  useEffect(() => {
    const button = document.createElement("button");
    button.className = "game-exit-button";
    button.textContent = "← ВЫЙТИ";
    button.addEventListener("click", onExit);
    document.body.appendChild(button);
    return () => button.remove();
  }, [onExit]);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(
      () =>
        setTime((value) => {
          if (value <= 1) {
            setActive(false);
            return 0;
          }
          return value - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [active]);
  function start() {
    setScore(0);
    setOpponentScore(0);
    setTime(120);
    setStreak(0);
    setMessage("У кольца: Space + мышь — данк");
    setActive(true);
  }
  function scored(points: number) {
    setStreak((value) => value + 1);
    setScore((value) => {
      const result =
        value + (points === 1 ? 1 : streak >= 2 ? points * 2 : points);
      if (result > best) {
        setBest(result);
        localStorage.setItem("swish-3d-best", String(result));
      }
      return result;
    });
  }
  return (
    <main className="game3d">
      <header>
        <div>
          <span>🏀</span>
          <h1>SWISH 3D</h1>
        </div>
        <p>
          РЕКОРД <b>{best}</b>
        </p>
      </header>
      <section className="game3d-card">
        <ThreeCourt
          active={active}
          onCharge={setCharge}
          onMessage={setMessage}
          onScore={scored}
          onOpponentScore={(points) => setOpponentScore((value) => value + points)}
        />
        <div className="hud">
          <div>
            <small>МЫ — СОПЕРНИК</small>
            <b>{score} : {opponentScore}</b>
          </div>
          <strong>{message}</strong>
          <div>
            <small>ВРЕМЯ</small>
            <b>{time}</b>
          </div>
        </div>
        <aside className="controls-panel">
          <h3>УПРАВЛЕНИЕ</h3>
          <p>
            <kbd>A</kbd>
            <kbd>D</kbd>
            <span>Влево / вправо</span>
          </p>
          <p>
            <kbd>W</kbd>
            <kbd>S</kbd>
            <span>Вперёд / назад</span>
          </p>
          <p>
            <kbd>SHIFT</kbd>
            <span>Кроссовер</span>
          </p>
          <p>
            <kbd>Q</kbd>
            <span>Степ-бэк</span>
          </p>
          <p>
            <kbd>E</kbd>
            <span>Пас партнёру</span>
          </p>
          <p>
            <kbd>R</kbd>
            <span>Запросить пас</span>
          </p>
          <p>
            <kbd>SPACE</kbd>
            <span>Прыжок / данк</span>
          </p>
          <p>
            <i>🖱️</i>
            <span>Бросок / лэй-ап</span>
          </p>
        </aside>
        <div className="power">
          <span style={{ width: `${charge}%` }} />
          <b>СИЛА БРОСКА</b>
        </div>
        {!active && (
          <div className="game-overlay">
            <span className="ball-logo">🏀</span>
            <small>НАСТОЯЩИЙ 3D-БАСКЕТБОЛ</small>
            <h2>{time === 0 ? `${score} очков` : "Выйди на площадку"}</h2>
            <p>
              WASD — движение · Shift — кроссовер · Q — степ-бэк
              <br />
              Пройди к кольцу и нажми мышь для лэй-апа
            </p>
            <button onClick={start}>
              {time === 0 ? "РЕВАНШ" : "НАЧАТЬ МАТЧ"}
            </button>
          </div>
        )}
        <div className="streak">
          СЕРИЯ{" "}
          <b>
            {streak} {streak >= 3 ? "🔥" : ""}
          </b>
        </div>
      </section>
    </main>
  );
}
