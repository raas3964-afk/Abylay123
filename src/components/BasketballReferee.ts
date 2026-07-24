import * as THREE from 'three';

export type Referee = {
  group: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  signalUntil: number;
};

function refereeBadge() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffcf33';
    context.fillRect(0, 0, 256, 128);
    context.fillStyle = '#111827';
    context.font = '900 72px Arial';
    context.textAlign = 'center';
    context.fillText('REF', 128, 88);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createReferee(): Referee {
  const group = new THREE.Group();
  const shirt = new THREE.Mesh(
    new THREE.CapsuleGeometry(.42, .9, 5, 10),
    new THREE.MeshStandardMaterial({ color: 0xe8ebef }),
  );
  shirt.position.y = 1.35;

  const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const stripes = [-.32, -.16, 0, .16, .32].flatMap((x) => [-1, 1].map((side) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(.075, .86, .035), stripeMaterial);
    stripe.position.set(x, 1.4, side * .39);
    return stripe;
  }));
  const shoulders = [-1, 1].map((side) => {
    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 10), stripeMaterial);
    sleeve.position.set(side * .48, 1.66, 0);
    return sleeve;
  });
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(.39, .39, .1, 16), stripeMaterial);
  belt.position.y = .88;
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(.32, .17),
    new THREE.MeshBasicMaterial({ map: refereeBadge(), side: THREE.DoubleSide }),
  );
  badge.position.set(.18, 1.58, .43);
  const whistle = new THREE.Mesh(
    new THREE.CapsuleGeometry(.035, .11, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xffcf33, metalness: .7 }),
  );
  whistle.position.set(0, 1.98, .42);
  whistle.rotation.z = Math.PI / 2;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(.29, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xa96d48 }),
  );
  head.position.y = 2.42;
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });
  const legs = [-.2, .2].map((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.11, .72, 4, 8), legMaterial);
    leg.position.set(x, .48, 0);
    return leg;
  });
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xa96d48 });
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .72, 4, 8), armMaterial);
  const rightArm = leftArm.clone();
  leftArm.position.set(-.5, 1.5, 0); rightArm.position.set(.5, 1.5, 0);
  leftArm.rotation.z = -.2; rightArm.rotation.z = .2;
  group.add(shirt, head, leftArm, rightArm, belt, badge, whistle, ...shoulders, ...stripes, ...legs);
  group.position.set(6.7, 0, -7);
  group.rotation.y = -Math.PI / 2;
  return { group, leftArm, rightArm, signalUntil: 0 };
}

export function signalFoul(referee: Referee, now: number) {
  referee.signalUntil = now + 1600;
}

export function animateReferee(referee: Referee, now: number) {
  const signalling = now < referee.signalUntil;
  referee.rightArm.rotation.z = THREE.MathUtils.lerp(referee.rightArm.rotation.z, signalling ? -Math.PI : .2, .14);
  referee.leftArm.rotation.z = THREE.MathUtils.lerp(referee.leftArm.rotation.z, signalling ? Math.PI : -.2, .14);
  if (signalling) {
    referee.group.position.y = Math.abs(Math.sin(now * .012)) * .08;
    return;
  }
  const patrol = Math.sin(now * .00055);
  referee.group.position.z = -5 + patrol * 11.5;
  referee.group.position.y = Math.abs(Math.sin(now * .009)) * .055;
  referee.group.rotation.y = Math.cos(now * .00055) >= 0 ? Math.PI : 0;
}
