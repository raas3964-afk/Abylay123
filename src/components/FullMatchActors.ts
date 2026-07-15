import * as THREE from 'three';

type PersonFactory = (color: number) => THREE.Group;

export type FullMatchActors = {
  teammates: THREE.Group[];
  coaches: THREE.Group[];
  opponentBall: THREE.Mesh;
  attackStart: number;
  nextAttackAt: number;
  attackFinished: boolean;
};

function createBasket(scene: THREE.Scene) {
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(4.1, 2.4, .16),
    new THREE.MeshStandardMaterial({ color: 0xf6fbff, transparent: true, opacity: .78 }),
  );
  board.position.set(0, 4.2, 10);
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

export function createFullMatchActors(scene: THREE.Scene, person: PersonFactory): FullMatchActors {
  createBasket(scene);
  const teammatePositions = [[4.4, 4], [-3.8, -1], [3.8, -6]];
  const teammates = teammatePositions.map(([x, z]) => {
    const teammate = person(0x22a86b);
    teammate.position.set(x, 0, z);
    scene.add(teammate);
    return teammate;
  });
  const coaches = [
    { color: 0x176b48, x: -6.7, z: 2, rotation: Math.PI / 2 },
    { color: 0x172f83, x: 6.7, z: -10, rotation: -Math.PI / 2 },
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
  return { teammates, coaches, opponentBall, attackStart: 0, nextAttackAt: performance.now() + 9000, attackFinished: false };
}

export function updateFullMatch(
  match: FullMatchActors,
  now: number,
  active: boolean,
  attacker: THREE.Group,
  onOpponentScore: (points: number) => void,
  onMessage: (message: string) => void,
) {
  match.coaches.forEach((coach, index) => {
    coach.rotation.z = Math.sin(now * .002 + index) * .035;
  });
  if (!active) return false;
  if (!match.attackStart && now >= match.nextAttackAt) {
    match.attackStart = now;
    match.attackFinished = false;
    match.opponentBall.visible = true;
    onMessage('🔄 СМЕНА ВЛАДЕНИЯ — СОПЕРНИК АТАКУЕТ!');
  }
  if (!match.attackStart) return false;

  const elapsed = (now - match.attackStart) / 1000;
  const progress = Math.min(1, elapsed / 2.8);
  attacker.position.x = Math.sin(progress * Math.PI) * 1.2;
  attacker.position.z = THREE.MathUtils.lerp(-12, 7.7, progress);
  attacker.rotation.y = 0;
  attacker.position.y = progress > .78 ? Math.sin((progress - .78) / .22 * Math.PI) * 1.2 : 0;
  match.opponentBall.position.set(attacker.position.x + .42, attacker.position.y + 1.55, attacker.position.z + .15);

  match.teammates.forEach((teammate, index) => {
    const defensiveX = (index - 1) * 2.1;
    teammate.position.x = THREE.MathUtils.lerp(teammate.position.x, defensiveX, .035);
    teammate.position.z = THREE.MathUtils.lerp(teammate.position.z, 3.5 + index * 1.25, .035);
    teammate.rotation.y = Math.PI;
  });
  if (progress > .88) match.opponentBall.position.lerp(new THREE.Vector3(0, 3.45, 8.9), .16);
  if (progress === 1 && !match.attackFinished) {
    match.attackFinished = true;
    onOpponentScore(2);
    onMessage('🔵 СОПЕРНИК ЗАБИЛ! НАША КОМАНДА СНОВА АТАКУЕТ');
  }
  if (elapsed > 3.6) {
    match.attackStart = 0;
    match.nextAttackAt = now + 11000;
    match.opponentBall.visible = false;
    attacker.position.set(4.5, 0, -13);
  }
  return true;
}
