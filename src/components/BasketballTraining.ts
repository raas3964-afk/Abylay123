import * as THREE from "three";

export function createTrainingCourse(scene: THREE.Scene) {
  const course = new THREE.Group();
  course.name = "training-course";
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: .7 });
  const white = new THREE.MeshStandardMaterial({ color: 0xfff3d6, roughness: .65 });
  const positions = [[-5, 3], [-2.5, 0], [0, -3], [2.5, 0], [5, 3], [-5, 9], [-2.5, 6], [0, 9], [2.5, 6], [5, 9]];

  positions.forEach(([x, z]) => {
    const cone = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(.32, .85, 16), orange);
    body.position.y = .43;
    body.castShadow = true;
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(.22, .27, .12, 16), white);
    stripe.position.y = .35;
    const base = new THREE.Mesh(new THREE.BoxGeometry(.72, .08, .72), orange);
    base.position.y = .04;
    cone.position.set(x, 0, z);
    cone.add(body, stripe, base);
    course.add(cone);
  });

  scene.add(course);
  return course;
}
