import * as THREE from 'three';

const STAND_COLOR = 0x344d70;
const SEAT_COLORS = [0x552583, 0xfdb927, 0x1d428a, 0x376db6];

function addEndStand(scene: THREE.Scene, side: -1 | 1) {
  const standMaterial = new THREE.MeshStandardMaterial({ color: STAND_COLOR, roughness: .88 });
  const seatGeometry = new THREE.BoxGeometry(.75, .42, .72);
  const seatMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 });
  const rows = 18;
  const seatsPerRow = 68;
  const seats = new THREE.InstancedMesh(seatGeometry, seatMaterial, rows * seatsPerRow);
  const fanCount = rows * Math.ceil(seatsPerRow / 2);
  const fanBodies = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(.25, .46, 3, 6),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }),
    fanCount,
  );
  const fanHeads = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.18, 7, 6),
    new THREE.MeshStandardMaterial({ color: 0xb97850, roughness: .85 }),
    fanCount,
  );
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  let seatIndex = 0;
  let fanIndex = 0;

  for (let row = 0; row < rows; row += 1) {
    const z = side < 0 ? -27 - row * .92 : 17 + row * .92;
    const step = new THREE.Mesh(new THREE.BoxGeometry(61, .5, 1.8), standMaterial);
    step.position.set(0, 1.3 + row * .62, z);
    scene.add(step);

    for (let seat = 0; seat < seatsPerRow; seat += 1) {
      transform.position.set(-29.5 + seat * .88, 1.8 + row * .62, z - side * .1);
      transform.rotation.y = side < 0 ? 0 : Math.PI;
      transform.updateMatrix();
      seats.setMatrixAt(seatIndex, transform.matrix);
      color.setHex(SEAT_COLORS[(row + Math.floor(seat / 6)) % SEAT_COLORS.length]);
      seats.setColorAt(seatIndex, color);
      seatIndex += 1;
      if (seat % 2 === 0) {
        transform.position.y = 2.42 + row * .62;
        transform.updateMatrix();
        fanBodies.setMatrixAt(fanIndex, transform.matrix);
        fanBodies.setColorAt(fanIndex, color);
        transform.position.y += .7;
        transform.updateMatrix();
        fanHeads.setMatrixAt(fanIndex, transform.matrix);
        fanIndex += 1;
      }
    }
  }
  seats.instanceMatrix.needsUpdate = true;
  if (seats.instanceColor) seats.instanceColor.needsUpdate = true;
  fanBodies.instanceMatrix.needsUpdate = true;
  fanHeads.instanceMatrix.needsUpdate = true;
  if (fanBodies.instanceColor) fanBodies.instanceColor.needsUpdate = true;
  scene.add(seats, fanBodies, fanHeads);
}

function addUpperSide(scene: THREE.Scene, side: -1 | 1) {
  const material = new THREE.MeshStandardMaterial({ color: 0x29486f, roughness: .9 });
  const rows = 12;
  const peoplePerRow = 34;
  const peopleCount = rows * peoplePerRow;
  const bodyMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xb97850, roughness: .85 });
  const bodies = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(.25, .48, 3, 6),
    bodyMaterial,
    peopleCount,
  );
  const heads = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.18, 7, 6),
    skinMaterial,
    peopleCount,
  );
  const transform = new THREE.Object3D();
  const shirtColor = new THREE.Color();
  let personIndex = 0;

  for (let row = 0; row < rows; row += 1) {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(2.1, .55, 78), material);
    tier.position.set(side * (25 + row * .9), 7 + row * .68, -5);
    scene.add(tier);

    for (let person = 0; person < peoplePerRow; person += 1) {
      const x = side * (24.5 + row * .9);
      const y = 7.65 + row * .68;
      const z = 30.5 - person * 2.15;
      transform.position.set(x, y, z);
      transform.rotation.y = side * Math.PI / 2;
      transform.updateMatrix();
      bodies.setMatrixAt(personIndex, transform.matrix);
      shirtColor.setHex(SEAT_COLORS[(row + person) % SEAT_COLORS.length]);
      bodies.setColorAt(personIndex, shirtColor);
      transform.position.y = y + .72;
      transform.updateMatrix();
      heads.setMatrixAt(personIndex, transform.matrix);
      personIndex += 1;
    }
  }
  bodies.instanceMatrix.needsUpdate = true;
  heads.instanceMatrix.needsUpdate = true;
  if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
  scene.add(bodies, heads);
}

export function createArenaGrandstands(scene: THREE.Scene) {
  addEndStand(scene, -1);
  addEndStand(scene, 1);
  addUpperSide(scene, -1);
  addUpperSide(scene, 1);
}
