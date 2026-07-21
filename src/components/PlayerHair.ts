import * as THREE from 'three';

const HAIR_COLORS = [0x17120f, 0x3b2416, 0x6b3d20, 0xc28b45, 0x24170f, 0x101820];

function hairMaterial(index: number) {
  return new THREE.MeshStandardMaterial({ color: HAIR_COLORS[index % HAIR_COLORS.length], roughness: .92 });
}

export function addPlayerHair(player: THREE.Group, index: number) {
  const material = hairMaterial(index);
  const style = index % 6;
  const hairGroup = new THREE.Group();
  const base = new THREE.Mesh(new THREE.SphereGeometry(.31, 18, 14), material);
  base.scale.set(1.05, .72, 1.05);
  base.position.y = 2.27;
  hairGroup.add(base);

  if (style === 0) {
    const fade = new THREE.Mesh(new THREE.BoxGeometry(.4, .16, .35), material);
    fade.position.y = 2.48;
    hairGroup.add(fade);
  }

  if (style === 1) {
    const afro = new THREE.Mesh(new THREE.IcosahedronGeometry(.48, 2), material);
    afro.scale.set(1.08, 1, 1.08);
    afro.position.y = 2.48;
    hairGroup.add(afro);
  }

  if (style === 2) {
    [-.18, -.06, .06, .18].forEach((z, point) => {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(.13, .48 + point * .035, 8), material);
      spike.position.set(0, 2.57, z);
      hairGroup.add(spike);
    });
  }

  if (style === 3) {
    const highTop = new THREE.Mesh(new THREE.BoxGeometry(.5, .62, .48, 2, 2, 2), material);
    highTop.position.y = 2.58;
    highTop.rotation.y = .08;
    hairGroup.add(highTop);
  }

  if (style === 4) {
    const curls = [
      [-.22, 2.4, 0], [.22, 2.4, 0], [0, 2.6, 0],
      [-.18, 2.54, -.18], [.18, 2.54, -.18], [0, 2.48, .2],
    ];
    curls.forEach(([x, y, z]) => {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), material);
      curl.position.set(x, y, z);
      hairGroup.add(curl);
    });
  }

  if (style === 5) {
    const sidePart = new THREE.Mesh(new THREE.SphereGeometry(.35, 16, 12), material);
    sidePart.scale.set(1, .65, 1);
    sidePart.position.set(-.05, 2.34, 0);
    sidePart.rotation.z = -.12;
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(.34, .14, .2), material);
    fringe.position.set(.14, 2.38, .24);
    fringe.rotation.z = -.28;
    hairGroup.add(sidePart, fringe);
  }
  hairGroup.children.forEach((piece) => piece.scale.multiplyScalar(.65));
  player.add(hairGroup);
}
