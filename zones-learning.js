// Zone 7 (numbers carpet) and Zone 8 (classroom library).
// Both are self-contained: they only touch the shared kit and the texture factory,
// so this module can be rebuilt without disturbing the other zone files.
import * as THREE from 'three';
import {
  mat, decal, wallBoard, softBox, box, makeGroup,
  woodStd, woodLightStd, plant, fabricBin, registerZone, ROOM_D,
} from './kit.js';
import { numbersCarpetTex, bookSpineTex, bookCoverTex, signTex } from './tex.js';

const RUG_W = 8.6, RUG_D = 5.6;

/** Zone 7: one printed 1-100 rug lying on the floor, with a darker pile edge. */
function numbersCarpet() {
  const g = makeGroup("Numbers Carpet", 0, -5.8);

  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(RUG_W, .03, RUG_D),
    new THREE.MeshStandardMaterial({ color: 0x241e18, roughness: .98 })
  );
  rug.position.y = .02;
  rug.receiveShadow = true;
  rug.userData.tip = "Numbers carpet 1-100";
  g.add(rug);

  const print = decal(numbersCarpetTex(), RUG_W, RUG_D);
  print.rotation.x = -Math.PI / 2;
  print.position.y = .036;
  print.userData.tip = rug.userData.tip;
  g.add(print);

  // Low pile edge: four bars framing the perimeter so the rug has thickness.
  const edge = new THREE.MeshStandardMaterial({ color: 0x1b1611, roughness: .99 });
  const EW = .1;
  for (const [w, d, x, z] of [
    [RUG_W + EW * 2, EW, 0, -RUG_D / 2 - EW / 2],
    [RUG_W + EW * 2, EW, 0, RUG_D / 2 + EW / 2],
    [EW, RUG_D, -RUG_W / 2 - EW / 2, 0],
    [EW, RUG_D, RUG_W / 2 + EW / 2, 0],
  ]) {
    softBox(w, .06, d, 0xffffff, x, .03, z, g, .02, edge).userData.tip = rug.userData.tip;
  }

  registerZone("carpet","Numbers Carpet",[0,.15,-5.8],[0,7.0,2.2],0xf39c12);
}

/** A single spine-out book: coloured block plus a printed spine on its front edge. */
function spineBook(w, h, seed, x, shelfY, parent) {
  const b = new THREE.Group();
  b.position.set(x, shelfY, 0);
  parent.add(b);
  const body = softBox(w, h, .58, 0xffffff, 0, h / 2, -.02, b, .012,
    mat(new THREE.Color().setHSL((seed * .13) % 1, .34, .38).getHex(), .85));
  body.userData.tip = "Picture book";
  const spine = decal(bookSpineTex(seed), w * .84, h * .9);
  spine.position.set(0, h / 2, .272);
  spine.userData.tip = body.userData.tip;
  b.add(spine);
  return b;
}

/** A forward-facing picture book, leaning back against the shelf as in the reference. */
function faceOutBook(seed, x, shelfY, parent) {
  const b = new THREE.Group();
  b.position.set(x, shelfY + .01, -.08);
  b.rotation.set(-.15, (seed % 3 - 1) * .04, 0);
  parent.add(b);
  const body = softBox(.44, .54, .05, 0xffffff, 0, .27, 0, b, .01, mat(0xf1ece0, .8));
  body.userData.tip = "Picture book";
  const cover = decal(bookCoverTex(seed), .42, .52);
  cover.position.set(0, .27, .028);
  cover.userData.tip = body.userData.tip;
  b.add(cover);
  return b;
}

/** Zone 8: back-wall bookcase, packed shelves, labelled bins and a printed sign. */
function classroomLibrary() {
  const g = makeGroup("Classroom Library", 2.2, -9.6);
  const WALL_Z = -ROOM_D / 2 + .09 - g.position.z;   // wall inner face, group-local

  const W = 4.6, H = 3.4, D = .8;
  const unit = new THREE.Group();
  unit.position.set(0, 0, WALL_Z + D / 2 + .04);
  g.add(unit);

  // Carcass
  const PLINTH = .14;
  softBox(W - .12, PLINTH, D - .14, 0xffffff, 0, PLINTH / 2, 0, unit, .02,
    mat(0x8a6a48, .8)).userData.tip = "Bookcase plinth";
  box(W, .12, D, 0xffffff, 0, PLINTH + .06, 0, unit).material = woodStd;
  for (const s of [-1, 1]) {
    box(.08, H - PLINTH, D, 0xffffff, s * (W / 2 - .04), PLINTH + (H - PLINTH) / 2, 0, unit)
      .material = woodStd;
  }
  box(W - .16, H - PLINTH, .05, 0xffffff, 0, PLINTH + (H - PLINTH) / 2, -D / 2 + .025, unit)
    .material = woodLightStd;
  softBox(W + .12, .14, D + .08, 0xffffff, 0, H, 0, unit, .03, woodLightStd)
    .userData.tip = "Bookcase top";

  // Five compartments: bins, two spine-out rows, two face-out rows.
  const baseY = PLINTH + .12, topY = H - .07;
  const bay = (topY - baseY) / 5;
  const shelfY = [1, 2, 3, 4].map(k => baseY + k * bay);
  for (const y of shelfY) {
    box(W - .16, .06, D - .06, 0xffffff, 0, y - .03, 0, unit).material = woodStd;
  }

  // Spine-out rows, packed left to right with varying width/height and a lean at the end.
  let seed = 0;
  for (const y of [shelfY[0], shelfY[1]]) {
    let x = -W / 2 + .12;
    while (x < W / 2 - .22) {
      const bw = .06 + Math.random() * .08;
      const bh = .32 + Math.random() * .2;
      if (x + bw > W / 2 - .12) break;
      const b = spineBook(bw, bh, seed++, x + bw / 2, y, unit);
      // every so often a book leans into the gap the way a browsed shelf does
      if (Math.random() < .12) b.rotation.z = (Math.random() < .5 ? 1 : -1) * .13;
      x += bw + .006 + (Math.random() < .1 ? .09 : 0);
    }
  }

  // Face-out picture books on the top two shelves.
  for (const y of [shelfY[2], shelfY[3]]) {
    for (let i = 0; i < 8; i++) {
      faceOutBook(seed++, -W / 2 + .38 + i * .55, y, unit);
    }
  }

  // Labelled fabric bins in the bottom compartment.
  ["MATH","LETTERS","STORIES"].forEach((name, i) => {
    fabricBin(1.32, .5, .58, name, -1.44 + i * 1.44, baseY + .25, .04, unit,
      ['#dfe6ea','#eae2d4','#e2e6da'][i], '+z');
  });

  // Printed sign mounted on the wall above the unit.
  wallBoard(signTex("CLASSROOM LIBRARY", { ratio: .2 }), 3.2, .64,
    0, H + .78, WALL_Z + .045, g, 0xe0d3ba, "Classroom Library");

  // Two books lying flat on the top surface, plus a plant.
  [[-1.5, .1], [-1.32, -.5]].forEach(([bx, rot], i) => {
    const b = new THREE.Group();
    b.position.set(bx, H + .07 + .04 + i * .07, .02);
    b.rotation.y = rot;
    unit.add(b);
    softBox(.5, .07, .62, 0xffffff, 0, 0, 0, b, .012, mat(0xefe7d6, .8))
      .userData.tip = "Picture book";
    const cover = decal(bookCoverTex(20 + i), .48, .6);
    cover.rotation.x = -Math.PI / 2;
    cover.position.y = .037;
    cover.userData.tip = "Picture book";
    b.add(cover);
  });
  plant(1.6, H + .07, .02, unit, .95, 0xc9a17a);

  registerZone("library","Classroom Library",[2.2,1.8,-9.6],[2.2,5.2,-1.0],0x7cb342);
}

/** Build both learning-area zones into the shared scene. */
export function buildLearningZones() {
  numbersCarpet();
  classroomLibrary();
}
