import * as THREE from 'three';

type Dancer = {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  phase: number;
  baseX: number;
};

export type Cheerleaders = { group: THREE.Group; dancers: Dancer[] };

function createDancer(baseX: number, index: number, teamColor: number): Dancer {
  const group = new THREE.Group();
  const uniform = new THREE.MeshStandardMaterial({ color: index % 2 ? 0xf5f5f5 : teamColor });
  const skin = new THREE.MeshStandardMaterial({ color: index % 2 ? 0xc98255 : 0x9b5d38 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .58, 5, 10), uniform);
  body.position.y = 1.25;
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(.48, .55, 16), uniform);
  skirt.position.y = .78;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 12), skin);
  head.position.y = 1.92;
  const pomMaterial = new THREE.MeshStandardMaterial({ color: index % 2 ? teamColor : 0xffffff, roughness: .65 });
  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * .32, 1.52, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .48, 4, 8), skin);
    arm.position.y = .27;
    const pom = new THREE.Mesh(new THREE.DodecahedronGeometry(.27, 1), pomMaterial);
    pom.position.y = .68;
    pivot.add(arm, pom);
    group.add(pivot);
    return pivot;
  });
  [-.18, .18].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .55, 4, 8), skin);
    leg.position.set(x, .3, 0);
    group.add(leg);
  });
  group.add(body, skirt, head);
  group.position.set(baseX, 0, 7.1);
  group.rotation.y = Math.PI;
  return { group, leftArm: arms[0], rightArm: arms[1], phase: index * .8, baseX };
}

export function createCheerleaders(scene: THREE.Scene, teamColor: number): Cheerleaders {
  const group = new THREE.Group();
  const dancers = [-5.4, -2, 2, 5.4].map((x, index) => createDancer(x, index, teamColor));
  dancers.forEach((dancer) => group.add(dancer.group));
  group.visible = false;
  scene.add(group);
  return { group, dancers };
}

export function animateCheerleaders(cheerleaders: Cheerleaders, now: number, visible: boolean) {
  cheerleaders.group.visible = visible;
  if (!visible) return;
  cheerleaders.dancers.forEach((dancer) => {
    const beat = now * .009 + dancer.phase;
    dancer.group.position.x = dancer.baseX + Math.sin(beat) * .22;
    dancer.group.position.y = Math.max(0, Math.sin(beat * 2)) * .24;
    dancer.group.rotation.z = Math.sin(beat) * .12;
    dancer.leftArm.rotation.z = -.7 - Math.sin(beat) * .8;
    dancer.rightArm.rotation.z = .7 + Math.sin(beat) * .8;
  });
}
