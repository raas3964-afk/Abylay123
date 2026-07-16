import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  animateBasketballCrowd,
  createBasketballCrowd,
} from "./BasketballCrowd";
import { animateReferee, createReferee, signalFoul } from "./BasketballReferee";
import { createFullMatchActors, requestScreen, updateFullMatch } from "./FullMatchActors";
import { createBasketballSidelines } from "./BasketballSidelines";
import { animateBasketballMascot, createBasketballMascot } from "./BasketballMascot";
import { animateCheerleaders, createCheerleaders } from "./BasketballCheerleaders";
import "./BasketballGameHeader.css";
import "./BasketballFullscreen.css";

type Props = {
  active: boolean;
  mascotVisible: boolean;
  score: number;
  opponentScore: number;
  time: number;
  quarter: number;
  onScore: (points: number) => void;
  onOpponentScore: (points: number) => void;
  onCharge: (power: number) => void;
  onMessage: (text: string) => void;
};

function person(color: number) {
  const group = new THREE.Group();
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x9b5d38 });
  const shirt = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.72, 6, 12),
    new THREE.MeshStandardMaterial({ color }),
  );
  shirt.position.y = 1.3;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 20, 20),
    skinMaterial,
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
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09, 0.62, 5, 9),
      skinMaterial,
    );
    arm.position.set(side * 0.48, 1.3, 0);
    arm.rotation.z = side * -0.22;
    arm.name = side < 0 ? "leftArm" : "rightArm";
    return arm;
  });
  group.add(shirt, head, ...legs, ...arms);
  group.traverse((item) => {
    if (item instanceof THREE.Mesh) item.castShadow = true;
  });
  return group;
}

function bannerTexture(title: string, subtitle: string, colors: [string, string]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 320);
    context.strokeStyle = "#f4c34f";
    context.lineWidth = 14;
    context.strokeRect(10, 10, 1004, 300);
    context.textAlign = "center";
    context.fillStyle = "#ffffff";
    context.font = "900 86px Arial";
    context.fillText(title, 512, 155);
    context.fillStyle = "#f4c34f";
    context.font = "800 34px Arial";
    context.fillText(subtitle, 512, 225);
  }
  return new THREE.CanvasTexture(canvas);
}

function nbaFlagTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 900;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#17408b";
    context.fillRect(0, 0, 300, 900);
    context.fillStyle = "#c9082a";
    context.fillRect(300, 0, 300, 900);
    context.strokeStyle = "#ffffff";
    context.lineWidth = 18;
    context.strokeRect(12, 12, 576, 876);
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(325, 185, 62, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(300, 245);
    context.quadraticCurveTo(235, 350, 265, 500);
    context.lineTo(210, 690);
    context.lineTo(290, 705);
    context.lineTo(345, 535);
    context.lineTo(405, 690);
    context.lineTo(480, 655);
    context.lineTo(385, 455);
    context.lineTo(410, 300);
    context.closePath();
    context.fill();
    context.font = "900 110px Arial";
    context.textAlign = "center";
    context.fillText("NBA", 300, 835);
  }
  return new THREE.CanvasTexture(canvas);
}

function ThreeCourt({ active, mascotVisible, score, opponentScore, time, quarter, onScore, onOpponentScore, onCharge, onMessage }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const mascotVisibleRef = useRef(mascotVisible);
  const gameInfoRef = useRef({ score, opponentScore, time, quarter });
  const callbacks = useRef({ onScore, onOpponentScore, onCharge, onMessage });
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    mascotVisibleRef.current = mascotVisible;
  }, [mascotVisible]);
  useEffect(() => {
    gameInfoRef.current = { score, opponentScore, time, quarter };
  }, [score, opponentScore, time, quarter]);
  useEffect(() => {
    callbacks.current = { onScore, onOpponentScore, onCharge, onMessage };
  }, [onScore, onOpponentScore, onCharge, onMessage]);

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.Fog(0x070b14, 68, 115);
    const camera = new THREE.PerspectiveCamera(
      54,
      host.clientWidth / host.clientHeight,
      0.1,
      100,
    );
    camera.position.set(20.5, 21, 19.5);
    camera.lookAt(0, 0.8, -5);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xaecbff, 0x11131a, .9));
    const arenaShellMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: .88, side: THREE.DoubleSide });
    const arenaShell = [
      [72, 1, 62, 0, 24, -5],
      [1, 28, 62, -35, 10, -5],
      [1, 28, 62, 35, 10, -5],
      [72, 28, 1, 0, 10, -36],
      [72, 28, 1, 0, 10, 26],
    ];
    arenaShell.forEach(([width, height, depth, x, y, z]) => {
      const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), arenaShellMaterial);
      part.position.set(x, y, z);
      scene.add(part);
    });
    const legends = [
      ["STEPHEN CURRY", "THE GREATEST SHOOTER", -15, "#1d428a", "#0b2048"],
      ["KYRIE IRVING", "MASTER OF THE HANDLE", 0, "#143c36", "#071b19"],
      ["LAMELO BALL", "THE FUTURE OF THE GAME", 15, "#1d8b9f", "#4b2082"],
    ] as const;
    legends.forEach(([name, subtitle, x, firstColor, secondColor]) => {
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(11.5, 3.6),
        new THREE.MeshBasicMaterial({ map: bannerTexture(name, subtitle, [firstColor, secondColor]) }),
      );
      banner.position.set(x, 14.8, -35.42);
      scene.add(banner);
    });
    const nbaFlag = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 10.2),
      new THREE.MeshBasicMaterial({ map: nbaFlagTexture(), side: THREE.DoubleSide }),
    );
    nbaFlag.position.set(0, 15.6, -21);
    nbaFlag.rotation.y = -.12;
    scene.add(nbaFlag);
    const lightPanelMaterial = new THREE.MeshBasicMaterial({ color: 0xaebfd3 });
    [-16, 0, 16].forEach((z) => {
      [-10, 10].forEach((x) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(7, .18, 2.3), lightPanelMaterial);
        panel.position.set(x, 22.8, z - 5);
        scene.add(panel);
        const spotlight = new THREE.SpotLight(0xdcecff, 190, 48, .62, .65, 1.35);
        spotlight.position.set(x, 22, z - 5);
        spotlight.target.position.set(x * .25, 0, z * .55 - 5);
        spotlight.castShadow = true;
        scene.add(spotlight, spotlight.target);
      });
    });

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.25, 52),
      new THREE.MeshStandardMaterial({ color: 0xc98548, roughness: 0.75 }),
    );
    floor.position.set(0, -0.15, -5);
    floor.receiveShadow = true;
    scene.add(floor);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffe1b8, side: THREE.DoubleSide });
    const zoneMaterial = new THREE.MeshBasicMaterial({ color: 0x315ea8, transparent: true, opacity: .22 });
    const courtLines = [
      [19, .07, .08, 0, -19.4],
      [19, .07, .08, 0, 11.4],
      [.08, .07, 30.8, -9.5, -4],
      [.08, .07, 30.8, 9.5, -4],
    ];
    courtLines.forEach(([width, height, depth, x, z]) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), lineMaterial);
      line.position.set(x, .02, z);
      scene.add(line);
    });
    const paddingMaterial = new THREE.MeshStandardMaterial({ color: 0x202b40, roughness: .8 });
    [-20.2, 12.2].forEach((z) => {
      const safetyBarrier = new THREE.Mesh(new THREE.BoxGeometry(11, 1.25, .45), paddingMaterial);
      safetyBarrier.position.set(0, .55, z);
      safetyBarrier.castShadow = true;
      scene.add(safetyBarrier);
    });
    [-16.9, 8.9].forEach((basketZ, index) => {
      const key = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 6.4), zoneMaterial);
      key.rotation.x = -Math.PI / 2;
      key.position.set(0, .015, basketZ + (index === 0 ? 3.2 : -3.2));
      scene.add(key);
      const arc = new THREE.Mesh(new THREE.RingGeometry(7.45, 7.58, 72, 1, 0, Math.PI), lineMaterial);
      arc.rotation.x = index === 0 ? Math.PI / 2 : -Math.PI / 2;
      arc.position.set(0, .035, basketZ);
      scene.add(arc);
      [-7.51, 7.51].forEach((x) => {
        const cornerLine = new THREE.Mesh(new THREE.BoxGeometry(.07, .05, 4.1), lineMaterial);
        cornerLine.position.set(x, .03, basketZ + (index === 0 ? 2.05 : -2.05));
        scene.add(cornerLine);
      });
      const freeThrowZ = basketZ + (index === 0 ? 6.4 : -6.4);
      const freeThrowLine = new THREE.Mesh(new THREE.BoxGeometry(5.2, .06, .1), lineMaterial);
      freeThrowLine.position.set(0, .035, freeThrowZ);
      const freeThrowCircle = new THREE.Mesh(new THREE.TorusGeometry(1.8, .055, 8, 48), lineMaterial);
      freeThrowCircle.rotation.x = Math.PI / 2;
      freeThrowCircle.position.set(0, .04, freeThrowZ);
      scene.add(freeThrowLine, freeThrowCircle);
    });
    const centerLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.02, 19),
      lineMaterial,
    );
    centerLine.rotation.y = Math.PI / 2;
    scene.add(centerLine);
    const circle = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.045, 8, 50),
      lineMaterial,
    );
    circle.rotation.x = Math.PI / 2;
    circle.position.set(0, 0.02, -5);
    scene.add(circle);

    const jumbotron = new THREE.Group();
    const scoreboardCanvas = document.createElement('canvas');
    scoreboardCanvas.width = 1024;
    scoreboardCanvas.height = 400;
    const scoreboardContext = scoreboardCanvas.getContext('2d');
    if (scoreboardContext) {
      const gradient = scoreboardContext.createLinearGradient(0, 0, 1024, 0);
      gradient.addColorStop(0, '#552583');
      gradient.addColorStop(.48, '#121a2c');
      gradient.addColorStop(.52, '#121a2c');
      gradient.addColorStop(1, '#1d428a');
      scoreboardContext.fillStyle = gradient;
      scoreboardContext.fillRect(0, 0, 1024, 400);
      scoreboardContext.fillStyle = '#fdb927';
      scoreboardContext.beginPath();
      scoreboardContext.arc(180, 175, 105, 0, Math.PI * 2);
      scoreboardContext.fill();
      scoreboardContext.strokeStyle = '#552583';
      scoreboardContext.lineWidth = 8;
      scoreboardContext.beginPath();
      scoreboardContext.arc(180, 175, 105, -.7, .7);
      scoreboardContext.moveTo(75, 175);
      scoreboardContext.lineTo(285, 175);
      scoreboardContext.moveTo(180, 70);
      scoreboardContext.quadraticCurveTo(130, 175, 180, 280);
      scoreboardContext.stroke();
      scoreboardContext.fillStyle = '#552583';
      scoreboardContext.font = 'italic 900 45px Arial';
      scoreboardContext.textAlign = 'center';
      scoreboardContext.fillText('LAKERS', 180, 191);
      scoreboardContext.strokeStyle = '#fdb927';
      scoreboardContext.lineWidth = 7;
      [0, 1, 2].forEach((line) => {
        scoreboardContext.beginPath();
        scoreboardContext.moveTo(42, 132 + line * 30);
        scoreboardContext.lineTo(92, 132 + line * 30);
        scoreboardContext.stroke();
      });
      scoreboardContext.fillStyle = '#fdb927';
      scoreboardContext.beginPath();
      scoreboardContext.arc(842, 175, 112, 0, Math.PI * 2);
      scoreboardContext.fill();
      scoreboardContext.strokeStyle = '#1d428a';
      scoreboardContext.lineWidth = 12;
      scoreboardContext.beginPath();
      scoreboardContext.arc(842, 175, 96, 0, Math.PI * 2);
      scoreboardContext.stroke();
      scoreboardContext.fillStyle = '#1d428a';
      scoreboardContext.fillRect(772, 185, 140, 10);
      scoreboardContext.fillRect(790, 145, 104, 9);
      scoreboardContext.fillRect(806, 112, 72, 8);
      [790, 815, 842, 869, 894].forEach((x, index) => {
        scoreboardContext.beginPath();
        scoreboardContext.moveTo(x, 105 + Math.abs(2 - index) * 18);
        scoreboardContext.lineTo(x - 16 + index * 8, 235);
        scoreboardContext.lineWidth = 7;
        scoreboardContext.stroke();
      });
      scoreboardContext.fillStyle = '#fff';
      scoreboardContext.font = '900 38px Arial';
      scoreboardContext.fillText('LAKERS', 205, 350);
      scoreboardContext.fillText('VS', 512, 210);
      scoreboardContext.fillText('GOLDEN STATE', 805, 350);
    }
    const scoreboardTexture = new THREE.CanvasTexture(scoreboardCanvas);
    let lastScoreboardText = "";
    const updateArenaScoreboard = () => {
      if (!scoreboardContext) return;
      const info = gameInfoRef.current;
      const clock = `${Math.floor(info.time / 60)}:${String(info.time % 60).padStart(2, "0")}`;
      const text = `${info.score}-${info.opponentScore}-${clock}-${info.quarter}`;
      if (text === lastScoreboardText) return;
      lastScoreboardText = text;
      scoreboardContext.fillStyle = "#080d18";
      scoreboardContext.fillRect(365, 55, 294, 290);
      scoreboardContext.fillStyle = "#ffffff";
      scoreboardContext.textAlign = "center";
      scoreboardContext.font = "900 92px Arial";
      scoreboardContext.fillText(`${info.score} : ${info.opponentScore}`, 512, 180);
      scoreboardContext.fillStyle = "#fdb927";
      scoreboardContext.font = "900 46px Arial";
      scoreboardContext.fillText(clock, 512, 245);
      scoreboardContext.font = "800 25px Arial";
      scoreboardContext.fillText(`QUARTER ${info.quarter}`, 512, 295);
      scoreboardTexture.needsUpdate = true;
    };
    const screenMaterial = new THREE.MeshBasicMaterial({ map: scoreboardTexture });
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x151b26, metalness: .65, roughness: .3 });
    const screenCore = new THREE.Mesh(new THREE.BoxGeometry(8.4, 3.7, 4.8), frameMaterial);
    jumbotron.add(screenCore);
    [[0, 0, 2.43, 0], [0, 0, -2.43, Math.PI]].forEach(([x, y, z, rotation]) => {
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 3), screenMaterial);
      screen.position.set(x, y, z);
      screen.rotation.y = rotation;
      jumbotron.add(screen);
    });
    [[4.23, 0, 0, Math.PI / 2], [-4.23, 0, 0, -Math.PI / 2]].forEach(([x, y, z, rotation]) => {
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 3), screenMaterial);
      screen.position.set(x, y, z);
      screen.rotation.y = rotation;
      jumbotron.add(screen);
    });
    [-3.2, 3.2].forEach((x) => {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 7, 8), frameMaterial);
      cable.position.set(x, 5.3, 0);
      jumbotron.add(cable);
    });
    jumbotron.position.set(0, 13.2, -5);
    scene.add(jumbotron);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 2.4, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0xf6fbff,
        transparent: true,
        opacity: 0.78,
      }),
    );
    board.position.set(0, 4.85, -18);
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
    createBasketballSidelines(scene, person);
    const mascot = createBasketballMascot(scene);
    const cheerleaders = createCheerleaders(scene);

    const player = person(0x2463d4);
    player.position.set(0, 0, 6);
    scene.add(player);
    const teammate = person(0x2463d4);
    teammate.position.set(-4.5, 0, 5);
    scene.add(teammate);
    const teammateBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xef6c24 }),
    );
    teammateBall.visible = false;
    scene.add(teammateBall);
    const teamRoster = [player, teammate, ...fullMatch.teammates];
    const rosterNames = ["PLAYER", "PARTNER", "CURRY", "LEBRON JAMES"];
    let selectedPlayer = 0;
    const playerMarker = new THREE.Mesh(
      new THREE.RingGeometry(.55, .72, 28),
      new THREE.MeshBasicMaterial({ color: 0xffe84a, side: THREE.DoubleSide }),
    );
    playerMarker.rotation.x = -Math.PI / 2;
    playerMarker.position.y = .025;
    player.add(playerMarker);
    const defenders = [-4, -6.5, -9, -11.5, -13].map((z, index) => {
      const defender = person(index === 1 ? 0xb91f32 : 0xe23845);
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
    let defenseReady = 0;
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
      const numberIndex = event.code.startsWith("Digit") ? Number(event.code.slice(5)) - 1 : -1;
      if (event.code === "Tab" || (numberIndex >= 0 && numberIndex < teamRoster.length)) {
        event.preventDefault();
        const nextIndex = event.code === "Tab" ? (selectedPlayer + 1) % teamRoster.length : numberIndex;
        if (nextIndex !== selectedPlayer) {
          const target = teamRoster[nextIndex];
          const previousPosition = player.position.clone();
          const previousRotation = player.rotation.y;
          player.position.copy(target.position);
          player.rotation.y = target.rotation.y;
          target.position.copy(previousPosition);
          target.rotation.y = previousRotation;
          selectedPlayer = nextIndex;
          callbacks.current.onMessage(`🎮 ТЫ ИГРАЕШЬ ЗА ${rosterNames[selectedPlayer]}`);
        }
      }
      if (event.code === "KeyF" && activeRef.current) {
        const screenStarted = requestScreen(fullMatch, player.position, performance.now());
        callbacks.current.onMessage(
          screenStarted ? "🧱 ЗАСЛОН ПОСТАВЛЕН — ПРОХОДИ К КОЛЬЦУ!" : "Заслон пока недоступен",
        );
      }
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
      const shotDistance = Math.hypot(player.position.x, player.position.z + 16.9);
      const longRangeDifficulty = freeThrow
        ? 0
        : THREE.MathUtils.clamp((shotDistance - 14) / 13, 0, 1);
      const idealPowerError = Math.abs(power - 62);
      const accuracyWindow = THREE.MathUtils.lerp(10, 3, longRangeDifficulty);
      const extraPowerError = Math.max(0, idealPowerError - accuracyWindow);
      const horizontalSpread = longRangeDifficulty * (0.28 + extraPowerError * 0.055);
      const target = new THREE.Vector3(
        (Math.random() * 2 - 1) * horizontalSpread,
        3.48 + (power - 62) * 0.025,
        -16.9,
      );
      shotPoints = freeThrow ? 1 : 2;
      const origin = heldPosition();
      ball.position.copy(origin);
      const distance = target.z - origin.z;
      const flight = Math.max(0.72, Math.abs(distance) / 17);
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
      animateBasketballMascot(mascot, now, mascotVisibleRef.current);
      animateCheerleaders(cheerleaders, now, mascotVisibleRef.current);
      updateArenaScoreboard();
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
            player.position.z = Math.min(7.8, player.position.z + 12 * dt);
          else
            player.position.z = THREE.MathUtils.clamp(
              player.position.z + forward * 5.1 * dt,
              -15.8,
              7.8,
            );
        }
        jumpVelocity -= 16 * dt;
        playerY = Math.max(0, playerY + jumpVelocity * dt);
        if (playerY === 0) jumpVelocity = 0;
        player.position.y = playerY;
        if (opponentAttacking && now > defenseReady) {
          const attacker = defenders[4];
          const distanceToAttacker = Math.hypot(
            player.position.x - attacker.position.x,
            player.position.z - attacker.position.z,
          );
          const playerHands = player.position.clone().add(new THREE.Vector3(0, 1.8, 0));
          const blocked = playerY > .38 && playerHands.distanceTo(fullMatch.opponentBall.position) < 1.45;
          const stole = (keys.has("ShiftLeft") || keys.has("ShiftRight")) && distanceToAttacker < 1.15;
          if (blocked || stole) {
            defenseReady = now + 1800;
            fullMatch.attackStart = 0;
            fullMatch.nextAttackAt = now + 9000;
            fullMatch.opponentBall.visible = false;
            attacker.position.set(4.5, 0, -13);
            callbacks.current.onMessage(
              blocked ? "🖐️ БЛОК! LAKERS ЗАЩИТИЛИ КОЛЬЦО" : "⚡ ПЕРЕХВАТ! МЯЧ У LAKERS",
            );
          }
        }
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
          if (now < fullMatch.screenUntil) {
            const screener = fullMatch.teammates[fullMatch.screenPlayerIndex];
            if (defender.position.distanceTo(screener.position) < 1.35) {
              defender.position.x += (defender.position.x <= screener.position.x ? -1 : 1) * dt * 2.8;
              defender.position.z += dt * 1.4;
            }
          }
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
  const [time, setTime] = useState(240);
  const [quarter, setQuarter] = useState(1);
  const [quarterBreak, setQuarterBreak] = useState(false);
  const [charge, setCharge] = useState(0);
  const [streak, setStreak] = useState(0);
  const [waterBreak, setWaterBreak] = useState(false);
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
    if (!active || waterBreak || quarterBreak) return;
    const timer = window.setInterval(
      () =>
        setTime((value) => {
          if (value <= 1) {
            if (quarter < 4) setQuarterBreak(true);
            else setActive(false);
            return 0;
          }
          if (value === 161 || value === 81) setWaterBreak(true);
          return value - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [active, waterBreak, quarterBreak, quarter]);
  useEffect(() => {
    if (!waterBreak) return;
    setMessage("💧 WATER BREAK — TEAMS ARE HYDRATING");
    const resume = window.setTimeout(() => {
      setWaterBreak(false);
      setMessage("🏀 BACK TO THE GAME!");
    }, 5000);
    return () => clearTimeout(resume);
  }, [waterBreak]);
  useEffect(() => {
    if (!quarterBreak) return;
    setMessage(`🏀 END OF QUARTER ${quarter}`);
    const nextQuarter = window.setTimeout(() => {
      setQuarter((value) => value + 1);
      setTime(240);
      setQuarterBreak(false);
      setMessage("🏀 NEXT QUARTER — PLAY!");
    }, 6000);
    return () => clearTimeout(nextQuarter);
  }, [quarterBreak, quarter]);
  function start() {
    setScore(0);
    setOpponentScore(0);
    setTime(240);
    setQuarter(1);
    setQuarterBreak(false);
    setStreak(0);
    setWaterBreak(false);
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
          active={active && !waterBreak && !quarterBreak}
          mascotVisible={waterBreak || quarterBreak}
          score={score}
          opponentScore={opponentScore}
          time={time}
          quarter={quarter}
          onCharge={setCharge}
          onMessage={setMessage}
          onScore={scored}
          onOpponentScore={(points) => setOpponentScore((value) => value + points)}
        />
        <div className="game-status">
          <div className="score-square">
            <small>LAKERS — GSW · Q{quarter}</small>
            <b>{score} : {opponentScore}</b>
          </div>
          <strong className="game-message">{message}</strong>
          <div className="time-badge">
            <small>ВРЕМЯ</small>
            <b>{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</b>
          </div>
        </div>
        {waterBreak && <div className="water-break"><span>💧</span><b>WATER BREAK</b><small>Players are hydrating · game resumes soon</small></div>}
        {quarterBreak && <div className="water-break"><span>🏀</span><b>END OF QUARTER {quarter}</b><small>Next quarter starts soon</small></div>}
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
            <span>Прыжок / данк / блок</span>
          </p>
          <p>
            <kbd>TAB</kbd>
            <span>Сменить игрока</span>
          </p>
          <p>
            <kbd>F</kbd>
            <span>Поставить заслон</span>
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
