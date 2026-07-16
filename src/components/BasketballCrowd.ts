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

function makeTeamFlag(team: 'LAKERS' | 'GOLDEN STATE') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    const isLakers = team === 'LAKERS';
    context.fillStyle = isLakers ? '#552583' : '#1d428a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fdb927';
    context.beginPath();
    context.arc(118, 128, 78, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = isLakers ? '#552583' : '#1d428a';
    context.lineWidth = 9;
    context.beginPath();
    context.arc(118, 128, 61, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = isLakers ? '#552583' : '#1d428a';
    context.font = '900 35px Arial';
    context.textAlign = 'center';
    context.fillText(isLakers ? 'LA' : 'GS', 118, 141);
    context.fillStyle = '#ffffff';
    context.font = 'italic 900 44px Arial';
    context.fillText(team, 340, 143);
  }
  const material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3, 8, 3), material);
}

export function createBasketballCrowd(): Crowd {
  const group = new THREE.Group();
  const fans: THREE.Group[] = [];
  const standMaterial = new THREE.MeshStandardMaterial({ color: 0x30394c, roughness: .9 });

  const rowCount = 9;
  const seatsPerRow = 26;
  const standLength = 55;

  [-1, 1].forEach((side) => {
    for (let row = 0; row < rowCount; row += 1) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(2.1, .45, standLength), standMaterial);
      stand.position.set(side * (14.6 + row * .72), row * .55, -5);
      group.add(stand);

      for (let seat = 0; seat < seatsPerRow; seat += 1) {
        const fan = makeFan(row * seatsPerRow * 2 + seat * 2 + (side > 0 ? 1 : 0));
        fan.position.set(side * (14.15 + row * .72), .32 + row * .55, 20.2 - seat * 2.02);
        fan.rotation.y = side * Math.PI / 2;
        fan.scale.setScalar(.82);
        fan.userData.phase = row * .8 + seat * .47 + (side > 0 ? 1.2 : 0);
        fan.userData.baseY = fan.position.y;
        fans.push(fan);
        group.add(fan);
      }
    }

    [-17, -5, 7, 19].forEach((z, index) => {
      const flag = makeTeamFlag(index % 2 === 0 ? 'LAKERS' : 'GOLDEN STATE');
      flag.position.set(side * 14.02, 4.2 + (index % 2) * .45, z);
      flag.rotation.y = side * Math.PI / 2;
      group.add(flag);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(.045, .045, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xcbd3df, metalness: .7 }),
      );
      pole.position.set(side * 14.08, 3.2 + (index % 2) * .45, z - 2.25);
      group.add(pole);
    });
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
