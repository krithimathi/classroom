// Zones 9-11: the three supply centres that line the right-hand half of the
// back wall (arts, phonics/library) and the right-hand wall (technology).
// Every unit is built from the same open-shelf carcass so the centres read as
// one furniture family, the way a real classroom's shelving does.
import * as THREE from 'three';
import {
  signTex, bookCoverTex, namePlateTex, kidArtTex, digraphCardTex,
} from './tex.js';
import {
  ROOM_W, ROOM_D,
  mat, decal, wallBoard, softBox, box, cyl, makeGroup,
  woodStd, woodLightStd, white, plant, fabricBin, registerZone,
} from './kit.js';

const WALL_Z = -ROOM_D / 2 + .09;   // inner face of the back wall
const WALL_X = ROOM_W / 2 - .09;    // inner face of the right-hand wall

/**
 * Open shelf unit: back panel, two gable ends, a proud top, a kicked plinth and
 * evenly spaced shelf boards. Faces local +z.
 * @param {THREE.Object3D} parent
 * @param {{w:number,h:number,d:number,x?:number,z?:number,rotY?:number,shelves?:number,tip?:string}} o
 * @returns {{g:THREE.Group, bays:{y:number,h:number}[], w:number, d:number, h:number}}
 */
function shelfUnit(parent, o) {
  const { w, h, d, x = 0, z = 0, rotY = 0, shelves = 3, tip = "Shelf unit" } = o;
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  box(w, h, .05, 0xffffff, 0, h / 2, -d / 2 + .025, g).material = woodStd;
  for (const s of [-1, 1]) {
    box(.07, h, d, 0xffffff, s * (w / 2 - .035), h / 2, 0, g).material = woodStd;
  }
  softBox(w + .1, .12, d + .07, 0xffffff, 0, h - .06, .02, g, .03, woodLightStd).userData.tip = tip;
  // Plinth is set back so the unit looks like it sits on a rail, not flat on the floor
  box(w - .16, .18, d - .1, 0xffffff, 0, .09, -.02, g).material = woodStd;

  const floorY = .18, ceilY = h - .12, pitch = (ceilY - floorY) / (shelves + 1);
  const bays = [{ y: floorY, h: pitch - .06 }];
  for (let i = 0; i < shelves; i++) {
    const y = floorY + pitch * (i + 1);
    box(w - .16, .06, d - .04, 0xffffff, 0, y - .03, .01, g).material = woodStd;
    // Front lip catches the light and hides the shelf's end grain
    softBox(w - .16, .07, .04, 0xffffff, 0, y - .02, d / 2 - .02, g, .015, woodLightStd);
    bays.push({ y, h: pitch - .06 });
  }
  return { g, bays, w, d, h };
}

/** Upright pot crammed with paintbrushes: coloured handle, ferrule, bristle tip. */
function brushPot(x, y, z, parent, potColor = 0x3f8fc4, count = 9) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const pot = cyl(.115, .26, potColor, 0, .13, 0, g, 20);
  pot.userData.tip = "Paintbrushes";
  const handles = [0xe4572e, 0xf2b53c, 0x3f8fc4, 0x5f9e6a, 0x8e5fa8, 0xe2718f];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = .045 + (i % 3) * .022;
    const lean = .1 + (i % 4) * .045;
    const b = new THREE.Group();
    b.position.set(Math.cos(a) * r, .24, Math.sin(a) * r);
    b.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean);
    g.add(b);
    const L = .38 + (i % 3) * .05;
    cyl(.014, L, handles[i % handles.length], 0, L / 2, 0, b, 8).userData.tip = "Paintbrush";
    cyl(.018, .05, 0xb9bdc2, 0, L + .025, 0, b, 8);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.02, .07, 8), mat(0x4a3626, .9));
    tip.position.y = L + .085;
    b.add(tip);
  }
  return g;
}

/** Stack of shallow paper trays with a slip of paper showing in each. */
function paperTrays(x, y, z, parent, n = 4) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const shells = [0x89aec4, 0xd9b06a, 0x9dbf86, 0xb79ac4];
  for (let i = 0; i < n; i++) {
    const ty = i * .115;
    const tray = softBox(.86, .05, .58, shells[i % shells.length], 0, ty + .025, 0, g, .015);
    tray.userData.tip = "Paper trays";
    for (const s of [-1, 1]) {
      softBox(.86, .07, .03, shells[i % shells.length], 0, ty + .06, s * .28, g, .012);
      softBox(.03, .07, .58, shells[i % shells.length], s * .42, ty + .06, 0, g, .012);
    }
    const sheet = softBox(.78, .025, .5, 0xffffff, 0, ty + .065, 0, g, .004, white);
    sheet.userData.tip = "Paper";
  }
  return g;
}

/** Open tub of upright crayons or markers in one bright colour family. */
function supplyTub(x, y, z, parent, tubColor, sticks = 14, stickH = .16) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const tub = softBox(.34, .22, .3, tubColor, 0, .11, 0, g, .04);
  tub.userData.tip = "Crayons & markers";
  const cols = [0xe4572e, 0xf2b53c, 0x3f8fc4, 0x5f9e6a, 0x8e5fa8, 0xe2718f, 0x39a3a3, 0x2b2b2b];
  for (let i = 0; i < sticks; i++) {
    const cx = -.1 + (i % 5) * .05, cz = -.08 + Math.floor(i / 5) * .07;
    const c = cyl(.017, stickH, cols[(i * 3) % cols.length], cx, .2 + stickH / 2, cz, g, 7);
    c.rotation.set((Math.random() - .5) * .18, 0, (Math.random() - .5) * .18);
    c.userData.tip = tub.userData.tip;
  }
  return g;
}

/** Roll of paper lying on its side, kraft core visible at the ends. */
function paperRoll(x, y, z, parent, len = .74, r = .11, color = 0xe8dcc2) {
  const roll = cyl(r, len, color, x, y + r, z, parent, 20);
  roll.rotation.z = Math.PI / 2;
  roll.userData.tip = "Roll of paper";
  cyl(r * .34, len + .02, 0x9a7c52, x, y + r, z, parent, 12).rotation.z = Math.PI / 2;
  return roll;
}

/** Small card box with a printed index label and the cards standing proud of it. */
function cardBox(x, y, z, parent, labelText, color = 0xd9b06a, w = .5, h = .3, d = .4) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const body = softBox(w, h, d, color, 0, h / 2, 0, g, .025);
  body.userData.tip = `${labelText} cards`;
  const face = decal(namePlateTex(labelText, { accent: '#3d4a57', bg: '#fdfaf1' }), w * .8, h * .5);
  face.position.set(0, h * .5, d / 2 + .004);
  face.userData.tip = body.userData.tip;
  g.add(face);
  // Divider cards with coloured tabs poking above the rim
  const tabs = [0xe4572e, 0xf2b53c, 0x3f8fc4, 0x5f9e6a, 0x8e5fa8];
  for (let i = 0; i < 5; i++) {
    const c = softBox(w * .82, .13, .012, 0xfdfaf1, 0, h + .055, -d * .3 + i * .06, g, .004, white);
    c.rotation.x = -.05 - i * .015;
    c.userData.tip = body.userData.tip;
    const tab = softBox(w * .2, .05, .014, tabs[i], -w * .28 + i * w * .14, h + .13, -d * .3 + i * .06, g, .004);
    tab.userData.tip = body.userData.tip;
  }
  return g;
}

/** Forward-facing reader: cover decal tilted back on a shallow display ledge. */
function facingBook(x, y, z, parent, seed, w = .38, h = .48) {
  const b = new THREE.Group();
  b.position.set(x, y, z);
  b.rotation.x = -.14;
  parent.add(b);
  const block = softBox(w, h, .05, 0xf0ece2, 0, h / 2, 0, b, .01);
  block.userData.tip = "Levelled reader";
  const cover = decal(bookCoverTex(seed), w, h);
  cover.position.set(0, h / 2, .027);
  cover.userData.tip = block.userData.tip;
  b.add(cover);
  return b;
}

/** Over-ear headphones: torus headband with a padded cup at each end. */
function headphones(x, y, z, parent, color = 0x2f3640) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const m = mat(color, .6);
  const band = new THREE.Mesh(new THREE.TorusGeometry(.15, .026, 8, 20, Math.PI), m);
  band.position.y = .1;
  band.castShadow = true;
  band.userData.tip = "Headphones";
  g.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .07, 18), m);
    cup.position.set(s * .15, .09, 0);
    cup.rotation.z = Math.PI / 2;
    cup.castShadow = true;
    cup.userData.tip = "Headphones";
    g.add(cup);
    const pad = new THREE.Mesh(new THREE.TorusGeometry(.062, .022, 8, 16), mat(0x1b1f24, .95));
    pad.position.set(s * .118, .09, 0);
    pad.rotation.y = Math.PI / 2;
    g.add(pad);
  }
  return g;
}

/** Charging caddy: slotted tray with coiled cables and a brick dropped in beside it. */
function chargingCaddy(x, y, z, parent) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const body = softBox(.72, .2, .42, 0x4a5560, 0, .1, 0, g, .03);
  body.userData.tip = "Charging caddy";
  for (let i = 0; i < 5; i++) {
    softBox(.02, .13, .38, 0x39424c, -.26 + i * .13, .21, 0, g, .008);
  }
  for (let i = 0; i < 3; i++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(.07, .015, 6, 18), mat(0xf2f2f2, .5));
    coil.position.set(-.2 + i * .2, .24, .08);
    coil.rotation.x = Math.PI / 2 + (Math.random() - .5) * .3;
    coil.userData.tip = "Charging cable";
    g.add(coil);
  }
  const brick = softBox(.16, .1, .12, 0xf5f5f5, .26, .27, -.1, g, .02);
  brick.userData.tip = "Charging cable";
  return g;
}

/** Classroom tablet standing on edge in a rack slot. */
function tablet(x, y, z, parent, h = .5, d = .36) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = (Math.random() - .5) * .05;
  parent.add(g);
  const shell = softBox(.05, h, d, 0x2b3038, 0, h / 2, 0, g, .012);
  shell.userData.tip = "Class tablet";
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(d * .86, h * .88),
    new THREE.MeshStandardMaterial({ color: 0x3a6c96, roughness: .14, metalness: .18 })
  );
  screen.rotation.y = Math.PI / 2;
  screen.position.set(.027, h / 2, 0);
  screen.userData.tip = "Class tablet";
  g.add(screen);
  return g;
}

/** Electric pencil sharpener: rounded body, tapered nose, shavings drawer. */
function sharpener(x, y, z, parent, color = 0x37474f) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const body = softBox(.3, .26, .38, color, 0, .13, 0, g, .05);
  body.userData.tip = "Electric pencil sharpener";
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, .07, 16), mat(0xc9ccd1, .5));
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, .17, .2);
  g.add(nose);
  const drawer = softBox(.26, .09, .34, 0xdfe3e7, 0, .05, .03, g, .02);
  drawer.userData.tip = body.userData.tip;
  return g;
}

/** Builds Zone 9 (arts), Zone 10 (phonics/library) and Zone 11 (technology). */
export function buildCentreZones() {
  // ------------------------------------------------- Zone 9: arts centre
  {
    const g = makeGroup("Arts Centre", 6.6, -9.6);
    const zWall = WALL_Z + 9.6;                       // back wall in local space
    const U = shelfUnit(g, { w: 2.8, h: 3.2, d: .85, z: zWall + .425, tip: "Arts shelf" });
    const [b0, b1, b2, b3] = U.bays;

    // Bottom bay: labelled fabric bins
    fabricBin(1.2, b0.h - .04, .68, "Paper", -.65, b0.y + (b0.h - .04) / 2, .04, U.g, '#e7d3b8', '+z');
    fabricBin(1.2, b0.h - .04, .68, "Paint", .65, b0.y + (b0.h - .04) / 2, .04, U.g, '#cfe0e8', '+z');

    // Second bay: paper trays plus a run of supply tubs
    paperTrays(-.75, b1.y, .02, U.g, 4);
    supplyTub(.36, b1.y, .04, U.g, 0xe4572e);
    supplyTub(.78, b1.y, .04, U.g, 0x3f8fc4, 12, .19);
    supplyTub(1.16, b1.y, .04, U.g, 0x5f9e6a, 10, .14);

    // Third bay: brush pots and tubs of markers
    brushPot(-1.0, b2.y, .02, U.g, 0x3f8fc4);
    brushPot(-.62, b2.y, .06, U.g, 0xe2718f, 7);
    brushPot(-.24, b2.y, 0, U.g, 0xf2b53c, 11);
    supplyTub(.3, b2.y, .02, U.g, 0x8e5fa8);
    supplyTub(.72, b2.y, .02, U.g, 0xf2b53c, 12, .2);
    softBox(.5, .3, .5, 0xe9e6df, 1.16, b2.y + .15, .02, U.g, .04).userData.tip = "Glue sticks";

    // Top bay: rolled paper stock and a pot of scissors
    paperRoll(-.6, b3.y, -.05, U.g, .9);
    paperRoll(-.6, b3.y + .23, .12, U.g, .9, .1, 0xf0e6d2);
    paperRoll(.52, b3.y, 0, U.g, .62, .12, 0xdcd0b4);
    brushPot(1.12, b3.y, 0, U.g, 0x39a3a3, 8);

    // Top surface props
    plant(-1.05, U.h, zWall + .5, g, .8, 0xc9a17a);
    softBox(.44, .3, .34, 0xf0e2c8, 1.05, U.h + .15, zWall + .5, g, .04).userData.tip = "Smocks";

    wallBoard(signTex("ARTS CENTRE", { ratio: .26 }), 2.35, .61, 0, 3.88, zWall + .05, g,
      0xefe7d6, "Arts Centre");

    // Children's paintings pinned up either side of the sign, clear of the
    // neighbouring library unit
    [[-1.62, 4.42, 0], [1.62, 4.45, 1]].forEach(([x, y, i]) => {
      const art = wallBoard(kidArtTex(i), .72, .58, x, y, zWall + .05, g, 0xf6f2e6,
        "Child's painting");
      art.rotation.z = (i ? -1 : 1) * .035;
    });

    registerZone("arts","Arts Centre",[6.6,1.6,-9.6],[6.6,5.2,-1.2],0xe74c7b);
  }

  // ------------------------------------------------- Zone 10: phonics centre & library
  {
    const g = makeGroup("Phonics Centre", 10.2, -9.6);
    const zWall = WALL_Z + 9.6;
    const U = shelfUnit(g, { w: 2.9, h: 3.3, d: .85, z: zWall + .425, tip: "Phonics shelf" });
    const [b0, b1, b2, b3] = U.bays;

    // Bottom bay: labelled bins for the loose word work
    fabricBin(1.25, b0.h - .04, .68, "Letters", -.7, b0.y + (b0.h - .04) / 2, .04, U.g, '#d9e5cf', '+z');
    fabricBin(1.25, b0.h - .04, .68, "Words", .7, b0.y + (b0.h - .04) / 2, .04, U.g, '#e6dbe9', '+z');

    // Second bay: forward-facing readers behind a display ledge
    softBox(2.6, .05, .06, 0xffffff, 0, b1.y + .06, .38, U.g, .02, woodLightStd);
    for (let i = 0; i < 6; i++) {
      facingBook(-1.08 + i * .43, b1.y + .02, .18, U.g, i);
    }

    // Third bay: rows of phonics card boxes
    ["Aa-Ff","Gg-Ll","Mm-Rr","Ss-Zz"].forEach((t, i) => {
      cardBox(-1.05 + i * .7, b2.y, .1, U.g, t, [0xd9b06a, 0x89aec4, 0xc98f8f, 0x9dbf86][i]);
    });

    // Top bay: guided-reading stacks plus blend and rhyme boxes
    for (let i = 0; i < 5; i++) {
      const stack = softBox(.5, .06, .38, [0xe4572e,0x3f8fc4,0x5f9e6a,0xf2b53c,0x8e5fa8][i],
        -1.02, b3.y + .03 + i * .065, .02, U.g, .01);
      stack.rotation.y = (Math.random() - .5) * .06;
      stack.userData.tip = "Guided reading books";
    }
    cardBox(-.1, b3.y, .1, U.g, "Blends", 0xd9905f);
    cardBox(.62, b3.y, .1, U.g, "Rhymes", 0x7fa6bf);
    softBox(.46, .34, .4, 0xe9e6df, 1.2, b3.y + .17, .04, U.g, .04).userData.tip = "Pointers";

    // Top surface: a flat stack with two readers propped up facing the room
    for (let i = 0; i < 4; i++) {
      const s = softBox(.5, .06, .36, [0x3f8fc4, 0xe4572e, 0xf2b53c, 0x5f9e6a][i],
        -.95, U.h + .04 + i * .065, zWall + .5, g, .012);
      s.rotation.y = (i - 1.5) * .05;
      s.userData.tip = "Class readers";
    }
    for (let i = 0; i < 2; i++) {
      facingBook(-.15 + i * .46, U.h + .02, zWall + .42, g, i + 5, .4, .5);
    }
    plant(1.15, U.h, zWall + .5, g, .75, 0xdcdcd4);

    wallBoard(signTex("PHONICS CENTRE & LIBRARY", { ratio: .2 }), 2.6, .52, 0, 4.08, zWall + .05, g,
      0xefe7d6, "Phonics Centre & Library");

    // Digraph cards mounted in a row above the sign
    ["sh","ch","th","wh"].forEach((t, i) => {
      const c = wallBoard(digraphCardTex(t), .56, .56, -.93 + i * .62, 4.95, zWall + .05, g,
        0xf3ecdb, `Digraph "${t}"`);
      c.rotation.z = (i % 2 ? 1 : -1) * .02;
    });

    registerZone("phonics","Phonics Centre",[10.2,1.7,-9.6],[10.2,5,-1.4],0x2ca25f);
  }

  // ------------------------------------------------- Zone 11: technology supplies
  {
    const g = makeGroup("Technology Supplies", 13.45, -7.0);
    const xWall = WALL_X - 13.45;                     // right-hand wall in local space
    // Quarter-turned so the 2.9 run lies along z and the unit's face looks into the room
    const U = shelfUnit(g, {
      w: 2.9, h: 3.2, d: 1.4, x: xWall - .7, rotY: -Math.PI / 2, tip: "Technology cabinet",
    });
    const [b0, b1, b2, b3] = U.bays;

    // Bottom bay: sharpeners and a cable bin, all within reach
    sharpener(-1.05, b0.y, .1, U.g);
    sharpener(-.6, b0.y, .1, U.g, 0x5d6d7e);
    fabricBin(1.4, b0.h - .04, 1.1, "Cables", .58, b0.y + (b0.h - .04) / 2, .04, U.g, '#c3cfd9', '+z');

    // Second bay: labelled bins for the small consumables
    fabricBin(1.3, b1.h - .06, 1.1, "Mice", -.72, b1.y + (b1.h - .06) / 2, .04, U.g, '#d9c6a4', '+z');
    fabricBin(1.3, b1.h - .06, 1.1, "Styluses", .72, b1.y + (b1.h - .06) / 2, .04, U.g, '#aebfcc', '+z');

    // Third bay: tablets on edge in a slotted rack
    {
      const rack = new THREE.Group();
      rack.position.set(0, b2.y, .06);
      U.g.add(rack);
      softBox(2.5, .06, 1.0, 0x8d99a6, 0, .03, 0, rack, .02).userData.tip = "Tablet rack";
      for (let i = 0; i <= 10; i++) {
        softBox(.025, .16, .96, 0xaab3bd, -1.2 + i * .24, .13, 0, rack, .008);
      }
      for (let i = 0; i < 10; i++) {
        tablet(-1.08 + i * .24, .06, 0, rack);
      }
    }

    // Top bay: stacked headphones and the charging caddy
    for (let i = 0; i < 4; i++) {
      // Nested pairs: two stacks of two, the way sets end up on a class shelf
      const hp = headphones(-1.05 + Math.floor(i / 2) * .52, b3.y + (i % 2) * .15,
        .1 - (i % 2) * .05, U.g, i % 2 ? 0x2f3640 : 0x455a64);
      hp.scale.setScalar(1.25);
      hp.rotation.y = (i % 2 ? 1 : -1) * .16;
    }
    chargingCaddy(.68, b3.y, .1, U.g);
    softBox(.3, .22, .3, 0xd9b06a, .08, b3.y + .11, -.3, U.g, .04).userData.tip = "Spare batteries";

    // Top surface props
    plant(xWall - .95, U.h, -1.15, g, .8, 0xd8dfe6);
    softBox(.42, .3, .46, 0xdde4ea, xWall - .95, U.h + .15, 1.05, g, .04).userData.tip = "Screen wipes";

    const sign = wallBoard(signTex("TECHNOLOGY SUPPLIES", { ratio: .22 }), 2.5, .55,
      xWall - .04, 3.92, 0, g, 0xefe7d6, "Technology Supplies");
    sign.rotation.y = -Math.PI / 2;

    registerZone("tech","Technology Supplies",[13.2,1.7,-6.8],[7.0,5.3,0],0x6c5ce7);
  }
}
