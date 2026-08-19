// Shared building kit: geometry helpers, standard materials, room constants,
// the zone registry, and the reusable props. Every zone module imports from here
// so zone files stay independent of one another.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { woodTex, namePlateTex, binTex } from './tex.js';

export const ROOM_W = 30;
export const ROOM_D = 22;
export const WALL_H = 7;

/** The scene every helper attaches to by default; set once at start-up. */
let scene = null;
export function setScene(s) { scene = s; }
export function getScene() { return scene; }

/** Zone registry consumed by the sidebar and the camera fly-to animation. */
export const zones = {};
export function registerZone(key, labelText, center, camPos, color) {
  zones[key] = {
    label: labelText,
    center: new THREE.Vector3(...center),
    cam: new THREE.Vector3(...camPos),
    color,
  };
}

export function mat(color, rough=0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough });
}
/** Flat plane carrying a canvas texture — the workhorse for every printed surface. */
export function decal(texture, w, h, {transparent=false, side=THREE.FrontSide}={}) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: texture, roughness: .85, transparent, side })
  );
  m.receiveShadow = true;
  return m;
}
/**
 * Framed board mounted flat on a wall: a thin backing panel plus a printed face.
 * Everything the reference shows as wall print goes through here, so the text
 * lives on the object instead of floating in front of it.
 */
export function wallBoard(texture, w, h, x, y, z, parent, frameColor = 0xe8e2d5, tip = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  (parent ?? scene).add(g);
  const back = softBox(w + .12, h + .12, .09, frameColor, 0, 0, 0, g, .02);
  back.userData.tip = tip;
  const face = decal(texture, w, h);
  face.position.z = .05;
  face.userData.tip = tip;
  g.add(face);
  return g;
}

/** Bevelled box — real furniture has no razor edges, and the highlight sells it. */
export function softBox(w,h,d,color, x=0,y=h/2,z=0, parent=null, radius=.03, material=null) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(w,h,d, 2, Math.min(radius, Math.min(w,h,d)/2.05)),
    material ?? mat(color)
  );
  mesh.position.set(x,y,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  (parent ?? scene).add(mesh);
  return mesh;
}
export const WOOD_MAP = woodTex('#c99a69');
export const WOOD_LIGHT_MAP = woodTex('#d9b382');
export const woodStd = new THREE.MeshStandardMaterial({ map: WOOD_MAP, roughness: .72 });
export const woodLightStd = new THREE.MeshStandardMaterial({ map: WOOD_LIGHT_MAP, roughness: .7 });
export const wood = mat(0xc99a69);
export const lightWood = mat(0xd9b382);
export const wallMat = mat(0xf4efe6);
export const white = mat(0xfafafa);
export const black = mat(0x111111);
export const gray = mat(0x78808b);
export const silver = mat(0xc3c7cc, 0.35);

export function box(w,h,d,color, x=0,y=h/2,z=0, parent=null) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  mesh.position.set(x,y,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  (parent ?? scene).add(mesh);
  return mesh;
}
export function cyl(r,h,color,x=0,y=h/2,z=0,parent=null,segments=32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments), mat(color));
  mesh.position.set(x,y,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  (parent ?? scene).add(mesh);
  return mesh;
}
export function makeGroup(name, x, z) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x,0,z);
  scene.add(g);
  return g;
}
export function label(text, x, y, z, parent=null, className='label') {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text;
  const obj = new CSS2DObject(el);
  obj.position.set(x,y,z);
  (parent ?? scene).add(obj);
  return obj;
}
export function card(text, width=1.2, height=.06, depth=.7, borderColor=0x3366cc, parent=null, x=0,y=0.85,z=0) {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.BoxGeometry(width+.12,height+.03,depth+.12), mat(borderColor));
  outer.position.y = y;
  const inner = new THREE.Mesh(new THREE.BoxGeometry(width,height,depth), white);
  inner.position.y = y+.03;
  g.add(outer, inner);
  g.position.set(x,0,z);
  g.userData.tip = text;
  (parent ?? scene).add(g);
  return g;
}


/** Potted plant: terracotta or white pot with a clump of leaf blobs. */
export function plant(x, y, z, parent, scale = 1, potColor = 0xdcdcd4) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  (parent ?? scene).add(g);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.19,.14,.28,20), mat(potColor,.7));
  pot.position.y = .14;
  pot.castShadow = true;
  g.add(pot);
  const soil = cyl(.17,.03,0x3b2b20,0,.28,0,g,20);
  soil.castShadow = false;
  const greens = [0x3e8e41, 0x4caf50, 0x2f7d32, 0x66bb6a];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = .09 + Math.random() * .13;
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(.09 + Math.random() * .06, 0),
      mat(greens[i % greens.length], .85)
    );
    leaf.position.set(Math.cos(a) * r, .34 + Math.random() * .26, Math.sin(a) * r);
    leaf.scale.set(1, .75, 1);
    leaf.castShadow = true;
    g.add(leaf);
  }
  g.userData.tip = "Classroom plant";
  return g;
}

/** Fabric storage bin with a printed label on the front face. */
export function fabricBin(w, h, d, label, x, y, z, parent, base = '#e9e6df', faceAxis = '+x') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  (parent ?? scene).add(g);
  const body = softBox(w, h, d, 0xffffff, 0, 0, 0, g, .05,
    new THREE.MeshStandardMaterial({ color: base, roughness: .95 }));
  body.userData.tip = label ? `${label}'s bin` : "Storage bin";
  const face = decal(binTex(label, base), faceAxis === '+x' ? d : w, h);
  if (faceAxis === '+x') { face.rotation.y = Math.PI / 2; face.position.x = w / 2 + .004; }
  else { face.position.z = d / 2 + .004; }
  g.add(face);
  return g;
}

/** Insulated lunch bag: soft rounded case, zip line, carry handle, name tag. */
export function lunchBox(color, name, x, y, z, parent, wide = .8) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = (Math.random() - .5) * .14;
  (parent ?? scene).add(g);
  const m = mat(color, .8);
  const body = softBox(.55, .58, wide, color, 0, 0, 0, g, .12, m);
  body.userData.tip = `${name}'s lunch box`;
  // lid seam
  const seam = softBox(.57, .05, wide + .02, 0xffffff, 0, .17, 0, g, .02,
    mat(new THREE.Color(color).multiplyScalar(.7).getHex(), .5));
  seam.userData.tip = body.userData.tip;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.13, .03, 8, 14, Math.PI), m);
  handle.position.set(0, .29, 0);
  handle.rotation.y = Math.PI / 2;
  handle.castShadow = true;
  g.add(handle);
  const tag = decal(namePlateTex(name, {accent: '#ffffff', bg: '#fbf7ec'}), wide * .62, .17);
  tag.rotation.y = Math.PI / 2;
  tag.position.set(.281, -.08, 0);
  tag.userData.tip = body.userData.tip;
  g.add(tag);
  return g;
}

/** Kid backpack: rounded shell, front pocket, two shoulder straps, top loop. */
export function backpack(color, x, y, z, parent, wide = .9) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = (Math.random() - .5) * .18;
  (parent ?? scene).add(g);
  const m = mat(color, .78);
  softBox(.52, 1.0, wide, color, 0, 0, 0, g, .16, m);
  softBox(.2, .5, wide * .74, color, .3, -.16, 0, g, .08,
    mat(new THREE.Color(color).multiplyScalar(.82).getHex(), .8));
  // zip pull
  cyl(.03, .1, 0xd8d8d8, .41, .04, 0, g, 8);
  for (const sz of [-wide * .26, wide * .26]) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.3, .05, 8, 14, Math.PI), m);
    strap.position.set(-.3, .05, sz);
    strap.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    strap.castShadow = true;
    g.add(strap);
  }
  const loop = new THREE.Mesh(new THREE.TorusGeometry(.09, .028, 8, 16), m);
  loop.position.set(0, .52, 0);
  loop.rotation.y = Math.PI / 2;
  g.add(loop);
  g.userData.tip = "Backpack";
  return g;
}
