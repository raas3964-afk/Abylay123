import * as THREE from 'three';

export type BasketballMascot = {
  group: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  flag: THREE.Mesh;
  startedAt: number;
  wasActive: boolean;
};

function lakersBadge() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#552583';
    context.fillRect(0, 0, 256, 320);
    context.fillStyle = '#fdb927';
    context.beginPath();
    context.arc(128, 125, 100, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#552583';
    context.lineWidth = 8;
    context.beginPath();
    context.arc(128, 125, 92, -.8, .8);
    context.moveTo(34, 125);
    context.lineTo(222, 125);
    context.stroke();
    context.fillStyle = '#552583';
    context.font = 'italic 900 42px Arial';
    context.textAlign = 'center';
    context.fillText('LAKERS', 128, 140);
    context.fillStyle = '#fdb927';
    context.font = '900 28px Arial';
    context.fillText('LOS ANGELES', 128, 278);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createBasketballMascot(scene: THREE.Scene): BasketballMascot {
  const group = new THREE.Group();
  const orange = new THREE.MeshStandardMaterial({ color: 0x552583, roughness: .7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x152039 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.68, 1.05, 8, 16), orange);
  body.position.y = 1.7;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(.54, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0xfdb927, roughness: .75 }),
  );
  head.position.y = 2.82;
  const eyes = [-.38, .38].map((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.15, 12, 10), dark);
    eye.position.set(x * .62, 2.9, .48);
    return eye;
  });
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(.7, .9),
    new THREE.MeshBasicMaterial({ map: lakersBadge(), side: THREE.DoubleSide }),
  );
  badge.position.set(0, 1.72, .69);
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.14, 1.15, 6, 10), orange);
    arm.position.set(side * .88, 1.85, 0);
    arm.rotation.z = side * -.6;
    group.add(arm);
    return arm;
  });
  [-.55, .55].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.18, .7, 6, 10), dark);
    leg.position.set(x, .62, 0);
    group.add(leg);
  });
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(.035, .035, 3.6, 8),
    new THREE.MeshStandardMaterial({ color: 0xd8dee8, metalness: .7 }),
  );
  flagPole.position.set(1.28, 2.45, 0);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.1, 8, 3),
    new THREE.MeshBasicMaterial({ map: lakersBadge(), side: THREE.DoubleSide }),
  );
  flag.position.set(2.16, 3.35, 0);
  group.add(body, head, ...eyes, badge, flagPole, flag);
  group.visible = false;
  group.scale.setScalar(.88);
  scene.add(group);
  return { group, leftArm: arms[0], rightArm: arms[1], flag, startedAt: 0, wasActive: false };
}

export function animateBasketballMascot(mascot: BasketballMascot, now: number, active: boolean) {
  if (active && !mascot.wasActive) mascot.startedAt = now;
  mascot.wasActive = active;
  const phase = now - mascot.startedAt;
  mascot.group.visible = active;
  if (!mascot.group.visible) return;
  const progress = phase / 5000;
  mascot.group.position.set(THREE.MathUtils.lerp(-15, 15, progress), Math.abs(Math.sin(phase * .007)) * .28, 6.8);
  mascot.group.rotation.y = Math.sin(phase * .002) * .25;
  mascot.leftArm.rotation.z = -.6 - Math.sin(phase * .012) * .75;
  mascot.rightArm.rotation.z = .6 + Math.sin(phase * .012) * .75;
  mascot.flag.rotation.y = Math.sin(phase * .01) * .18;
}
