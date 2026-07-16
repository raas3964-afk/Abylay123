import * as THREE from 'three';

type PersonFactory = (color: number) => THREE.Group;

function teamSign(text: string, background: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = background;
    context.fillRect(0, 0, 512, 128);
    context.fillStyle = '#fff';
    context.font = '900 48px Arial';
    context.textAlign = 'center';
    context.fillText(text, 256, 82);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createBasketballSidelines(scene: THREE.Scene, person: PersonFactory) {
  const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x273247, roughness: .75 });
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xaab5c5, metalness: .65, roughness: .3 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x54c8f2, transparent: true, opacity: .82 });

  [
    { side: -1, color: 0x2463d4, name: 'LAKERS', sign: '#552583' },
    { side: 1, color: 0xe23845, name: 'GOLDEN STATE', sign: '#1d428a' },
  ].forEach(({ side, color, name, sign }) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.3, .55, 9), benchMaterial);
    bench.position.set(side * 11.35, .42, -4.5);
    scene.add(bench);

    [-7.4, -5.5, -3.6, -1.7].forEach((z) => {
      const substitute = person(color);
      substitute.position.set(side * 11.35, .7, z);
      substitute.rotation.y = side * -Math.PI / 2;
      substitute.scale.setScalar(.88);
      scene.add(substitute);
    });

    const table = new THREE.Mesh(new THREE.BoxGeometry(1.15, .12, 2), metalMaterial);
    table.position.set(side * 11.35, 1.05, 1.2);
    scene.add(table);
    [-.65, -.22, .22, .65].forEach((offset) => {
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, .65, 10), waterMaterial);
      bottle.position.set(side * 11.35, 1.42, 1.2 + offset);
      scene.add(bottle);
    });

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, .7),
      new THREE.MeshBasicMaterial({ map: teamSign(name, sign), side: THREE.DoubleSide }),
    );
    label.position.set(side * 10.66, 1.25, -4.5);
    label.rotation.y = side * Math.PI / 2;
    scene.add(label);
  });
}
