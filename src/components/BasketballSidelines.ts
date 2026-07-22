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

function createCoach(teamColor: number, side: number) {
  const coach = new THREE.Group();
  const suit = new THREE.MeshStandardMaterial({ color: 0x151c2b, roughness: .82 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xa96d48, roughness: .9 });
  const teamAccent = new THREE.MeshStandardMaterial({ color: teamColor, roughness: .7 });
  const clipboardMaterial = new THREE.MeshStandardMaterial({ color: 0xe8edf4, roughness: .8 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.38, .78, 7, 14), suit);
  body.position.y = 1.28;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.25, 18, 18), skin);
  head.position.y = 2.06;
  const tie = new THREE.Mesh(new THREE.BoxGeometry(.09, .5, .04), teamAccent);
  tie.position.set(0, 1.38, side * -.37);
  const clipboard = new THREE.Mesh(new THREE.BoxGeometry(.5, .7, .07), clipboardMaterial);
  clipboard.position.set(side * -.52, 1.25, side * -.2);
  clipboard.rotation.z = side * -.22;
  const legs = [-.17, .17].map((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.13, .72, 5, 10), suit);
    leg.position.set(x, .43, 0);
    return leg;
  });
  coach.add(body, head, tie, clipboard, ...legs);
  coach.traverse((item) => { if (item instanceof THREE.Mesh) item.castShadow = true; });
  return coach;
}

function createTeamBench(side: number, benchMaterial: THREE.Material, metalMaterial: THREE.Material) {
  const bench = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.82, .14, 13.5), benchMaterial);
  seat.position.y = .58;
  const back = new THREE.Mesh(new THREE.BoxGeometry(.13, .95, 13.5), benchMaterial);
  back.position.set(side * .42, 1.08, 0);
  bench.add(seat, back);

  [-5.7, -2.8, 0, 2.8, 5.7].forEach((z) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.12, .58, .52), metalMaterial);
    leg.position.set(0, .28, z);
    bench.add(leg);
  });
  bench.position.set(side * 11.35, 0, -4.5);
  bench.traverse((item) => { if (item instanceof THREE.Mesh) item.castShadow = true; });
  return bench;
}

export function seatPlayer(player: THREE.Group) {
  const legs = player.children.slice(2, 4);
  legs.forEach((leg, index) => {
    leg.rotation.x = -Math.PI / 2.6;
    leg.position.y = .28;
    leg.position.z = .3;
    leg.position.x = index === 0 ? -.2 : .2;
  });
}

export function standPlayer(player: THREE.Group) {
  const legs = player.children.slice(2, 4);
  legs.forEach((leg, index) => {
    leg.rotation.x = 0;
    leg.position.set(index === 0 ? -.2 : .2, .42, 0);
  });
}

export function createBasketballSidelines(scene: THREE.Scene, person: PersonFactory, homeTeam: string, awayTeam: string, homeColor: number, awayColor: number, showAwayTeam = true) {
  const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x273247, roughness: .75 });
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xaab5c5, metalness: .65, roughness: .3 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x54c8f2, transparent: true, opacity: .82 });
  const homeSubstitutes: THREE.Group[] = [];
  const awaySubstitutes: THREE.Group[] = [];

  const teams = [
    { side: -1, color: homeColor, name: homeTeam, sign: `#${homeColor.toString(16).padStart(6, '0')}` },
    { side: 1, color: awayColor, name: awayTeam, sign: `#${awayColor.toString(16).padStart(6, '0')}` },
  ];
  teams.filter(({ side }) => showAwayTeam || side === -1).forEach(({ side, color, name, sign }) => {
    const bench = createTeamBench(side, benchMaterial, metalMaterial);
    scene.add(bench);

    [-9.7, -8, -6.3, -4.6, -2.9, -1.2, .5].forEach((z) => {
      const substitute = person(color);
      substitute.position.set(side * 11.35, .7, z);
      substitute.rotation.y = side * -Math.PI / 2;
      substitute.scale.setScalar(.88);
      substitute.position.y = .72;
      seatPlayer(substitute);
      scene.add(substitute);
      (side === -1 ? homeSubstitutes : awaySubstitutes).push(substitute);
    });

    const coach = createCoach(color, side);
    coach.position.set(side * 9.85, 0, -4.5);
    coach.rotation.y = side * -Math.PI / 2;
    coach.scale.setScalar(1.08);
    scene.add(coach);

    const table = new THREE.Mesh(new THREE.BoxGeometry(1.15, .12, 2), metalMaterial);
    table.position.set(side * 11.35, 1.05, 3.25);
    scene.add(table);
    [-.65, -.22, .22, .65].forEach((offset) => {
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, .65, 10), waterMaterial);
      bottle.position.set(side * 11.35, 1.42, 3.25 + offset);
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

  return { homeSubstitutes, awaySubstitutes };
}
