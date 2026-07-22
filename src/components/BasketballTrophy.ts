import * as THREE from "three";

export function createBasketballTrophy(scene: THREE.Scene) {
  const trophy = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc928, metalness: .85, roughness: .2 });
  const darkGold = new THREE.MeshStandardMaterial({ color: 0xb97808, metalness: .72, roughness: .28 });
  const pedestal = new THREE.MeshStandardMaterial({ color: 0x172033, metalness: .35, roughness: .3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.78, .92, .34, 24), pedestal);
  base.position.y = .17;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(.45, .62, .18, 24), darkGold);
  foot.position.y = .43;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, .72, 18), gold);
  stem.position.y = .86;
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.7, .32, .85, 24, 1, true), gold);
  cup.position.y = 1.55;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.7, .065, 10, 32), gold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.98;
  [-1, 1].forEach((side) => {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.48, .07, 10, 24, Math.PI), gold);
    handle.rotation.set(0, side * Math.PI / 2, Math.PI / 2);
    handle.position.set(side * .68, 1.58, 0);
    trophy.add(handle);
  });
  trophy.add(base, foot, stem, cup, rim);
  trophy.position.set(-8.2, 0, -13.5);
  trophy.scale.setScalar(.78);
  trophy.traverse((item) => { if (item instanceof THREE.Mesh) item.castShadow = true; });
  scene.add(trophy);
  const trophyLight = new THREE.PointLight(0xffd45a, 2.2, 7);
  trophyLight.position.set(-8.2, 2.3, -13.5);
  scene.add(trophyLight);
}
