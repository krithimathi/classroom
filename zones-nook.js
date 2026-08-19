// Reading nook on the left-hand wall: a daylight window with a gathered
// valance, a plushie shelf, bean bags, and the cork board carrying the feelings,
// rules and quote posters.
import * as THREE from 'three';
import {
  ROOM_W, mat, decal, softBox, box, cyl, makeGroup, registerZone, woodStd, woodLightStd,
} from './kit.js';
import { bookSpineTex } from './tex.js';
import {
  windowViewTex, valanceTex, corkTex, feelingsPosterTex, characterRulesTex, quotePosterTex,
} from './tex-nook.js';

/**
 * Daylight window. The wall stays solid; an emissive view plane sits just inside
 * the frame, which reads as glare through glass and costs nothing to render.
 */
function window6Pane(g, w, h, y) {
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      map: windowViewTex(), emissiveMap: windowViewTex(),
      emissive: 0xffffff, emissiveIntensity: 1.35, roughness: .9,
    })
  );
  view.position.set(0, y, .07);
  g.add(view);

  // Frame: outer casing, sill, and muntins splitting the light into six panes
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: .55 });
  const rail = (bw, bh, bx, by) => {
    const m = softBox(bw, bh, .16, 0xffffff, bx, by, .09, g, .02, frameMat);
    m.castShadow = false;
    return m;
  };
  rail(w + .34, .17, 0, y + h / 2 + .08);
  rail(w + .34, .22, 0, y - h / 2 - .1);
  rail(.17, h + .3, -w / 2 - .08, y);
  rail(.17, h + .3, w / 2 + .08, y);
  rail(.09, h, 0, y);                       // vertical muntin
  rail(w, .09, 0, y + h * .16);             // upper horizontal
  rail(w, .09, 0, y - h * .18);             // lower horizontal
  // sill board
  softBox(w + .5, .1, .42, 0xffffff, 0, y - h / 2 - .22, .2, g, .02, woodLightStd);

  // Gathered sheer valance across the head of the window
  const valanceMap = valanceTex();
  valanceMap.wrapS = valanceMap.wrapT = THREE.RepeatWrapping;
  valanceMap.repeat.set(3, 1);
  const valance = new THREE.Mesh(
    new THREE.CylinderGeometry(.42, .34, w + .6, 64, 1, true, Math.PI * .15, Math.PI * .8),
    new THREE.MeshStandardMaterial({
      map: valanceMap, roughness: .95, side: THREE.DoubleSide,
      transparent: true, opacity: .95,
    })
  );
  // Lay the tube horizontally and turn its open face toward the wall.
  valance.rotation.set(0, 0, Math.PI / 2);
  valance.position.set(0, y + h / 2 - .22, .34);
  valance.userData.tip = "Window valance";
  g.add(valance);
  cyl(.04, w + .8, 0xa9846a, 0, y + h / 2 + .2, .36, g, 12).rotation.z = Math.PI / 2;
}

/** Soft toy: rounded body, head, ears and stubby limbs. */
function plushie(color, x, y, z, parent, scale = 1, seed = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  g.rotation.y = (seed % 5) * .3 - .6;
  parent.add(g);
  const fur = mat(color, .95);
  const body = new THREE.Mesh(new THREE.SphereGeometry(.24, 18, 14), fur);
  body.scale.set(1, .92, .85);
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.19, 18, 14), fur);
  head.position.set(0, .3, .02);
  head.castShadow = true;
  g.add(head);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(seed % 2 ? .08 : .06, 12, 10), fur);
    ear.position.set(s * .13, seed % 2 ? .43 : .45, 0);
    if (seed % 3 === 0) ear.scale.set(.7, 1.6, .7);   // long ears on some
    g.add(ear);
    const arm = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 10), fur);
    arm.position.set(s * .24, .04, .06);
    g.add(arm);
    const leg = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 10), fur);
    leg.position.set(s * .13, -.18, .12);
    g.add(leg);
  }
  const snout = new THREE.Mesh(new THREE.SphereGeometry(.085, 12, 10), mat(0xf0e0c4, .9));
  snout.position.set(0, .26, .16);
  g.add(snout);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 8), mat(0x2b1f18, .3));
    eye.position.set(s * .07, .33, .17);
    g.add(eye);
  }
  g.userData.tip = "Soft toy";
  return g;
}

/** Slouched bean bag: a squashed sphere with a seam ring and a top dent. */
function beanBag(color, x, z, parent, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  parent.add(g);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(.95, 28, 20), mat(color, .92));
  shell.scale.set(1.05, .62, 1.0);
  shell.position.y = .58;
  shell.castShadow = true;
  shell.receiveShadow = true;
  g.add(shell);
  // backrest lump so it reads as a chair rather than a ball
  const back = new THREE.Mesh(new THREE.SphereGeometry(.62, 22, 16), mat(color, .92));
  back.scale.set(1.0, .95, .6);
  back.position.set(0, .95, -.5);
  back.castShadow = true;
  g.add(back);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(.93, .035, 8, 32),
    mat(new THREE.Color(color).multiplyScalar(.75).getHex(), .8));
  seam.rotation.x = Math.PI / 2;
  seam.position.y = .55;
  g.add(seam);
  g.userData.tip = "Bean bag chair";
  return g;
}

/** Low bookcase with spine-out books and room for toys on top. */
function lowBookcase(g, x, z, w = 3.0) {
  const u = new THREE.Group();
  u.position.set(x, 0, z);
  g.add(u);
  const H = 1.5, D = .62;
  softBox(w, .14, D, 0xffffff, 0, .1, 0, u, .02, woodStd);
  softBox(w, .12, D + .06, 0xffffff, 0, H, 0, u, .03, woodLightStd).userData.tip = "Book shelf";
  for (const s of [-1, 1]) box(.1, H, D, 0xffffff, s * (w / 2 - .05), H / 2, 0, u).material = woodStd;
  box(w, H, .06, 0xffffff, 0, H / 2, -D / 2, u).material = woodStd;
  softBox(w - .2, .08, D - .06, 0xffffff, 0, .8, 0, u, .02, woodStd);

  // two rows of packed spines
  [.26, .96].forEach((rowY, row) => {
    let cursor = -w / 2 + .18;
    let i = row * 40;
    while (cursor < w / 2 - .22) {
      const bw = .07 + Math.random() * .07;
      const bh = .38 + Math.random() * .12;
      const bk = softBox(bw, bh, D - .16, 0xffffff, cursor + bw / 2, rowY + bh / 2, .02, u, .01,
        new THREE.MeshStandardMaterial({ map: bookSpineTex(i), roughness: .8 }));
      bk.rotation.z = Math.random() < .12 ? .09 : 0;
      bk.userData.tip = "Picture book";
      cursor += bw + .012;
      i++;
    }
  });
  return u;
}

export function buildNookZone() {
  const g = makeGroup("Reading Nook", -ROOM_W / 2 + .1, -2.0);
  g.rotation.y = Math.PI / 2;   // the whole nook faces into the room off the left wall

  window6Pane(g, 3.2, 3.0, 4.0);

  // Cork board with the rules chart pinned to it, between window and door
  {
    const board = new THREE.Group();
    board.position.set(2.55, 4.05, .12);
    g.add(board);
    softBox(2.3, 3.2, .1, 0x8a6136, 0, 0, 0, board, .03).userData.tip = "Notice board";
    const cork = decal(corkTex(), 2.08, 2.96);
    cork.position.z = .06;
    board.add(cork);
    const chart = decal(characterRulesTex([
      "Be Kind",
      "Listen Carefully",
      "Share and Take Turns",
      "Walking Feet Inside",
      "Try Your Best",
    ]), 1.6, 2.3);
    chart.position.z = .075;
    chart.userData.tip = "Classroom rules";
    board.add(chart);
    // push pins
    [[-.92, 1.32], [.92, 1.32], [-.92, -1.32], [.92, -1.32]].forEach(([px, py]) => {
      cyl(.05, .08, 0xd94f6e, px, py, .1, board, 10).rotation.x = Math.PI / 2;
    });
  }

  // Feelings poster between window and board
  {
    const p = softBox(1.5, 1.9, .07, 0xf4f1e6, -2.15, 4.15, .12, g, .02);
    p.userData.tip = "I feel... poster";
    const face = decal(feelingsPosterTex(), 1.38, 1.76);
    face.position.set(-2.15, 4.15, .17);
    face.userData.tip = "I feel... poster";
    g.add(face);
  }

  // Quote poster left of the window
  {
    const p = softBox(1.55, 2.1, .08, 0x1b2b3d, -4.15, 4.35, .12, g, .02);
    p.userData.tip = "Curiosity quote";
    const face = decal(quotePosterTex([
      "WHEN YOU'RE",
      "CURIOUS, YOU",
      "FIND LOTS OF",
      "INTERESTING",
      "THINGS TO DO.",
    ], "- Walt Disney"), 1.4, 1.94);
    face.position.set(-4.15, 4.35, .17);
    face.userData.tip = "Curiosity quote";
    g.add(face);
  }

  // Bookcase directly under the window, with a row of soft toys on its top board
  lowBookcase(g, 0, .42, 3.4);
  const toys = [0xd94f6e, 0xf2b53c, 0x5f9ed6, 0x7fc6bb, 0xc9a2d8, 0xc79a63];
  toys.forEach((c, i) => plushie(c, -1.35 + i * .54, 1.78, .42, g, .82 + (i % 3) * .1, i));

  // Teddies on the window sill and bean bags out on the floor
  plushie(0xc79a63, -.75, 2.66, .28, g, 1.0, 2);
  plushie(0xe0b070, .78, 2.66, .28, g, .8, 4);
  beanBag(0x3c5a78, 2.0, 1.7, g, 1.0);
  beanBag(0xe8c53c, 3.3, 2.5, g, .8);

  // A folded blanket basket, as in the reference
  softBox(1.0, .5, .8, 0x8a6a4a, .9, .3, 2.1, g, .05).userData.tip = "Blanket basket";
  softBox(.9, .22, .7, 0x6b7f96, .9, .62, 2.1, g, .08).userData.tip = "Folded blanket";

  registerZone("nook", "Reading Nook", [-13.2, 2.2, -2.0], [-6.0, 4.6, 1.0], 0xe89f4c);
}
