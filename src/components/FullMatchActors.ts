import * as THREE from 'three';
import { runOpponentBrain } from './OpponentBrain';

type PersonFactory = (color: number) => THREE.Group;

export type FullMatchActors = {
  teammates: THREE.Group[];
  coaches: THREE.Group[];
  opponentBall: THREE.Mesh;
  attackStart: number;
  nextAttackAt: number;
  attackFinished: boolean;
  screenUntil: number;
  screenPlayerIndex: number;
  screenPosition: THREE.Vector3;
};

function addJerseyName(player: THREE.Group, name: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#ffffff';
  context.font = 'bold 48px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(name, 256, 48);
  const texture = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, .2),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }),
  );
  label.position.set(0, 1.45, .39);
  player.add(label);
}

function createBasket(scene: THREE.Scene) {
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(4.1, 2.4, .16),
    new THREE.MeshStandardMaterial({ color: 0xf6fbff, transparent: true, opacity: .78 }),
  );
  board.position.set(0, 4.85, 10);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(.12, .17, 5.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x313a4b }),
  );
  pole.position.set(0, 2.5, 11);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(.72, .075, 12, 36),
    new THREE.MeshStandardMaterial({ color: 0xf15d28 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 3.35, 8.9);
  const net = new THREE.Mesh(
    new THREE.CylinderGeometry(.7, .38, 1, 16, 3, true),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .65 }),
  );
  net.position.set(0, 2.82, 8.9);
  scene.add(board, pole, rim, net);
}

export function createFullMatchActors(scene: THREE.Scene, person: PersonFactory, teamColor: number): FullMatchActors {
  createBasket(scene);
  const teammatePositions = [[4.4, -3], [3.8, 2]];
  const names = ['CURRY', 'LEBRON JAMES'];
  const teammates = teammatePositions.map(([x, z], index) => {
    const teammate = person(teamColor);
    teammate.position.set(x, 0, z);
    addJerseyName(teammate, names[index]);
    teammate.userData.role = names[index];
    scene.add(teammate);
    return teammate;
  });
  const coaches = [
    { color: 0x176b48, x: -10.7, z: 2, rotation: Math.PI / 2 },
    { color: 0x172f83, x: 10.7, z: -10, rotation: -Math.PI / 2 },
  ].map(({ color, x, z, rotation }) => {
    const coach = person(color);
    coach.position.set(x, 0, z);
    coach.rotation.y = rotation;
    coach.scale.setScalar(1.05);
    scene.add(coach);
    return coach;
  });
  const opponentBall = new THREE.Mesh(
    new THREE.SphereGeometry(.3, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xef6c24 }),
  );
  opponentBall.visible = false;
  scene.add(opponentBall);
  return { teammates, coaches, opponentBall, attackStart: 0, nextAttackAt: performance.now() + 9000, attackFinished: false, screenUntil: 0, screenPlayerIndex: 0, screenPosition: new THREE.Vector3() };
}

export function requestScreen(match: FullMatchActors, playerPosition: THREE.Vector3, now: number) {
  if (match.attackStart || now < match.screenUntil) return false;
  match.screenPlayerIndex = (match.screenPlayerIndex + 1) % match.teammates.length;
  const side = match.screenPlayerIndex === 0 ? -1 : 1;
  match.screenPosition.set(playerPosition.x + side * 1.05, 0, playerPosition.z - .65);
  match.screenUntil = now + 2400;
  return true;
}

export function updateFullMatch(
  match: FullMatchActors,
  now: number,
  active: boolean,
  attacker: THREE.Group,
  opponents: THREE.Group[],
  defenderPosition: THREE.Vector3,
  onOpponentScore: (points: number) => void,
  onMessage: (message: string) => void,
) {
  match.coaches.forEach((coach, index) => {
    coach.rotation.z = Math.sin(now * .002 + index) * .035;
  });
  if (!active) return false;
  if (match.attackStart) match.opponentBall.visible = true;
  if (!match.attackStart && now < match.nextAttackAt) {
    const seconds = now / 1000;
    const curry = match.teammates[0];
    curry.position.set(4.7 + Math.sin(seconds * 1.8) * .7, 0, -4 + Math.cos(seconds * 1.4) * 2.2);
    curry.rotation.y = Math.PI;
    const lebron = match.teammates[1];
    const drive = (seconds % 5) / 5;
    lebron.position.x = THREE.MathUtils.lerp(4.5, -.7, drive);
    lebron.position.z = THREE.MathUtils.lerp(4, -15.4, drive);
    lebron.position.y = drive > .82 ? Math.sin((drive - .82) / .18 * Math.PI) * 1.65 : 0;
    lebron.rotation.y = Math.PI;
    match.teammates.forEach((teammate) => teammate.scale.lerp(new THREE.Vector3(1, 1, 1), .08));
    if (now < match.screenUntil) {
      const screener = match.teammates[match.screenPlayerIndex];
      screener.position.lerp(match.screenPosition, .2);
      screener.rotation.y = Math.PI / 2;
    }
  }
  if (!match.attackStart && now >= match.nextAttackAt) {
    match.attackStart = now;
    match.attackFinished = false;
    match.opponentBall.visible = true;
    onMessage('🔄 СОПЕРНИКИ ПАССУЮТСЯ И ИДУТ К ТВОЕМУ КОЛЬЦУ — ЗАЩИЩАЙСЯ!');
  }
  if (!match.attackStart) return false;

  const elapsed = (now - match.attackStart) / 1000;
  const passDuration = opponents.length >= 2 ? .9 : 0;
  if (elapsed < passDuration) {
    opponents[0].position.set(-2.8, 0, -15.2);
    opponents[1].position.set(2.8, 0, -14.2);
    attacker.position.set(0, 0, -12.4);
    const firstPass = elapsed < passDuration / 2;
    const passProgress = (elapsed % (passDuration / 2)) / (passDuration / 2);
    const passer = firstPass ? opponents[0] : opponents[1];
    const receiver = firstPass ? opponents[1] : attacker;
    const passOrigin = passer.position.clone().add(new THREE.Vector3(.35, 1.65, 0));
    const passTarget = receiver.position.clone().add(new THREE.Vector3(.35, 1.65, 0));
    match.opponentBall.position.lerpVectors(passOrigin, passTarget, passProgress);
    match.opponentBall.position.y += Math.sin(passProgress * Math.PI) * 1.15;
    passer.rotation.y = 0;
    receiver.rotation.y = 0;
    return true;
  }
  const attackElapsed = elapsed - passDuration;
  const progress = Math.min(1, attackElapsed / 2.05);
  const decision = runOpponentBrain({ defenderX: defenderPosition.x, defenderZ: defenderPosition.z, progress, time: now });
  const evadeDirection = defenderPosition.x <= 0 ? 1 : -1;
  const targetLane = decision.lane + evadeDirection * (1.1 + decision.hesitation);
  attacker.position.x = THREE.MathUtils.lerp(attacker.position.x, targetLane, .085);
  attacker.position.z = THREE.MathUtils.lerp(-12, 7.7, progress);
  attacker.rotation.y = 0;
  attacker.position.y = progress > .78 ? Math.sin((progress - .78) / .22 * Math.PI) * 1.2 : 0;
  match.opponentBall.position.set(attacker.position.x + .42, attacker.position.y + 1.55, attacker.position.z + .15);

  match.teammates.forEach((teammate, index) => {
    const defensiveX = (index - .5) * 3.2;
    teammate.position.x = THREE.MathUtils.lerp(teammate.position.x, defensiveX, .035);
    teammate.position.z = THREE.MathUtils.lerp(teammate.position.z, 3.5 + index * 1.25, .035);
    teammate.rotation.y = Math.PI;
    teammate.scale.lerp(new THREE.Vector3(1.32, 1.58, 1.32), .08);
  });
  if (progress > .88) match.opponentBall.position.lerp(new THREE.Vector3(0, 3.45, 8.9), .16);
  if (progress === 1 && !match.attackFinished) {
    match.attackFinished = true;
    const defenseDistance = Math.hypot(defenderPosition.x - attacker.position.x, defenderPosition.z - attacker.position.z);
    if (defenseDistance > 1.35 || decision.confidence > .72) onOpponentScore(2);
    onMessage('🔵 СОПЕРНИК ЗАБИЛ! ТВОЯ КОМАНДА СНОВА АТАКУЕТ');
    onMessage(defenseDistance > 1.35 || decision.confidence > .72
      ? '🤖 AI SCORED! READ THE NEXT ATTACK'
      : '🛡️ GREAT DEFENSE — AI MISSED!');
  }
  if (attackElapsed > 2.8) {
    match.attackStart = 0;
    match.nextAttackAt = now + 11000;
    match.opponentBall.visible = false;
    attacker.position.set(4.5, 0, -13);
  }
  return true;
}
