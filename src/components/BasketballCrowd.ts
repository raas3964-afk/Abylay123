import * as THREE from 'three';

const SHIRT_COLORS = [0xf4772d, 0x3056d3, 0x22a86b, 0xffc857, 0xd94f70, 0xf2f4f8];
const SKIN_COLORS = [0x6f4028, 0x9b5d38, 0xc98255, 0xe0a172, 0xf1bd91];

export type Crowd = {
  group: THREE.Group;
  fans: THREE.Group[];
};

function makeFan(index: number) {
  const fan = new THREE.Group();
  const shirt = new THREE.Mesh(
    new THREE.CapsuleGeometry(.28, .55, 3, 7),
    new THREE.MeshStandardMaterial({ color: SHIRT_COLORS[index % SHIRT_COLORS.length] }),
  );
  shirt.position.y = .82;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(.19, 10, 8),
    new THREE.MeshStandardMaterial({ color: SKIN_COLORS[(index * 3) % SKIN_COLORS.length] }),
  );
  head.position.y = 1.48;

  const armMaterial = new THREE.MeshStandardMaterial({ color: SKIN_COLORS[(index * 3) % SKIN_COLORS.length] });
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .46, 3, 6), armMaterial);
    arm.position.set(side * .34, 1.05, 0);
    arm.rotation.z = side * -.55;
    arm.name = side < 0 ? 'leftArm' : 'rightArm';
    return arm;
  });

  fan.add(shirt, head, ...arms);
  return fan;
}

export function createBasketballCrowd(): Crowd {
  const group = new THREE.Group();
  const fans: THREE.Group[] = [];
  const standMaterial = new THREE.MeshStandardMaterial({ color: 0x30394c, roughness: .9 });

  [-1, 1].forEach((side) => {
    for (let row = 0; row < 3; row += 1) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(2.1, .45, 29), standMaterial);
      stand.position.set(side * (8.1 + row * .72), row * .55, -5);
      group.add(stand);

      for (let seat = 0; seat < 14; seat += 1) {
        const fan = makeFan(row * 28 + seat * 2 + (side > 0 ? 1 : 0));
        fan.position.set(side * (7.65 + row * .72), .32 + row * .55, 8.2 - seat * 2.02);
        fan.rotation.y = side * Math.PI / 2;
        fan.scale.setScalar(.82);
        fan.userData.phase = row * .8 + seat * .47 + (side > 0 ? 1.2 : 0);
        fan.userData.baseY = fan.position.y;
        fans.push(fan);
        group.add(fan);
      }
    }
  });

  return { group, fans };
}

export function animateBasketballCrowd(crowd: Crowd, now: number, active: boolean) {
  crowd.fans.forEach((fan) => {
    const phase = fan.userData.phase as number;
    const baseY = fan.userData.baseY as number;
    const cheer = Math.sin(now * (active ? .006 : .002) + phase);
    fan.position.y = baseY + Math.max(0, cheer) * (active ? .16 : .035);
    fan.rotation.z = Math.sin(now * .002 + phase) * .035;
    const leftArm = fan.getObjectByName('leftArm');
    const rightArm = fan.getObjectByName('rightArm');
    if (leftArm) leftArm.rotation.z = -.55 - Math.max(0, cheer) * .7;
    if (rightArm) rightArm.rotation.z = .55 + Math.max(0, cheer) * .7;
  });
}
