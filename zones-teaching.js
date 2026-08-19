// Zones 12-14: math manipulative centre + easel, small-group instruction table,
// and the teacher's area against the right-hand wall. Built from the shared kit
// so this module stays independent of the other zone files.
import * as THREE from 'three';
import { signTex, mathBoardTex, firstAidTex, hazardTapeTex } from './tex.js';
import {
  mat, decal, softBox, box, cyl, makeGroup, woodStd, woodLightStd, white,
  fabricBin, registerZone, ROOM_W,
} from './kit.js';

/** Flat strip of red/white hazard tape lying on the floor. */
function tapeStrip(len, x, z, alongZ, parent) {
  const strip = decal(hazardTapeTex(Math.max(2, Math.round(len * 1.6))), len, .22);
  // Euler XYZ applies z first, so rotation.z spins the strip inside the floor plane.
  strip.rotation.set(-Math.PI / 2, 0, alongZ ? Math.PI / 2 : 0);
  strip.position.set(x, .015, z);
  strip.userData.tip = "Off limits — teacher's area";
  parent.add(strip);
  return strip;
}

/** Open tub of loose counters: rounded shell plus a scatter of beads inside. */
function counterTub(w, h, d, color, x, y, z, parent, kind = 'sphere') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const shell = softBox(w, h, d, color, 0, 0, 0, g, .06, mat(color, .55));
  shell.userData.tip = "Math manipulatives";
  // Recessed rim reads as an open tub without needing a hollow mesh.
  const inner = softBox(w - .12, h * .72, d - .12, 0x2b2b2b, 0, h * .2, 0, g, .04,
    mat(new THREE.Color(color).multiplyScalar(.55).getHex(), .9));
  inner.userData.tip = shell.userData.tip;
  const cols = [0xe4572e, 0xf2b53c, 0x3f8fc4, 0x5f9e6a, 0x8e5fa8, 0xe2718f];
  for (let i = 0; i < 16; i++) {
    const c = mat(cols[i % cols.length], .5);
    const piece = new THREE.Mesh(
      kind === 'cube'
        ? new THREE.BoxGeometry(.075, .075, .075)
        : new THREE.SphereGeometry(.045, 10, 8),
      c
    );
    piece.position.set(
      (Math.random() - .5) * (w - .3),
      h * .38 + Math.random() * .04,
      (Math.random() - .5) * (d - .3)
    );
    piece.rotation.set(Math.random(), Math.random(), Math.random());
    piece.castShadow = true;
    piece.userData.tip = shell.userData.tip;
    g.add(piece);
  }
  return g;
}

/** Shallow tray of printed number tiles. */
function numberTray(x, y, z, parent) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  softBox(1.15, .1, .78, 0xf3ede0, 0, 0, 0, g, .03).userData.tip = "Number tiles";
  for (let i = 0; i < 8; i++) {
    const tx = -.42 + (i % 4) * .28;
    const tz = i < 4 ? -.17 : .17;
    const tile = softBox(.22, .045, .22, 0xfffdf4, tx, .07, tz, g, .015);
    tile.rotation.y = (Math.random() - .5) * .3;
    tile.userData.tip = "Number tile";
    const face = decal(signTex(String(i + 1), { ratio: 1, border: '#c9c2b2' }), .2, .2);
    face.rotation.set(-Math.PI / 2, 0, tile.rotation.y);
    face.position.set(tx, .095, tz);
    g.add(face);
  }
  return g;
}

/** A-frame easel: two splayed front legs, a rear leg, a tray rail, a whiteboard. */
function easel(x, z, parent) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  const H = 2.35;
  // Front pair splays outward and forward; rear leg braces the frame.
  for (const s of [-1, 1]) {
    const leg = box(.13, H, .13, 0xffffff, s * .72, H / 2, .34, g);
    leg.material = woodStd;
    leg.rotation.set(-.16, 0, s * .17);
    leg.userData.tip = "Easel";
  }
  const rear = box(.13, H, .13, 0xffffff, 0, H / 2, -.5, g);
  rear.material = woodStd;
  rear.rotation.x = .22;
  rear.userData.tip = "Easel";
  // Cross brace low down, then the marker tray
  const brace = box(1.5, .09, .09, 0xffffff, 0, .5, .29, g);
  brace.material = woodStd;
  const tray = box(1.62, .09, .3, 0xffffff, 0, .92, .38, g);
  tray.material = woodLightStd;
  tray.userData.tip = "Marker tray";
  const lip = box(1.62, .13, .05, 0xffffff, 0, 1.0, .52, g);
  lip.material = woodLightStd;
  const markers = [0xd94a38, 0x2777c7, 0x2e9d50, 0x2b2b2b];
  markers.forEach((c, i) => {
    const m = cyl(.045, .5, c, -.52 + i * .34, 1.01, .38, g, 12);
    m.rotation.z = Math.PI / 2;
    m.rotation.y = (Math.random() - .5) * .2;
    m.userData.tip = "Dry-erase marker";
  });
  // Whiteboard panel, tipped back a touch the way a real easel sits
  const panel = new THREE.Group();
  panel.position.set(0, 1.78, .3);
  panel.rotation.x = -.1;
  g.add(panel);
  softBox(1.66, 1.28, .07, 0xffffff, 0, 0, 0, panel, .02, woodStd);
  const face = decal(mathBoardTex(), 1.5, 1.12);
  face.position.z = .042;
  face.userData.tip = "Let's do math!";
  panel.add(face);
  return g;
}

/** Desk chair: 5-spoke castor base, gas cylinder, padded seat and back. */
function deskChair(x, z, rotY, parent) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);
  const metal = mat(0x50565e, .4);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(.5, .07, .12), metal);
    spoke.position.set(Math.sin(a) * .27, .1, Math.cos(a) * .27);
    spoke.rotation.y = a + Math.PI / 2;
    spoke.castShadow = true;
    g.add(spoke);
    const castor = cyl(.055, .05, 0x2b2b2b, Math.sin(a) * .5, .055, Math.cos(a) * .5, g, 10);
    castor.rotation.z = Math.PI / 2;
  }
  cyl(.075, .5, 0x9aa1a8, 0, .35, 0, g, 14).material.roughness = .35;
  cyl(.13, .08, 0x50565e, 0, .62, 0, g, 16);
  const seat = softBox(.86, .16, .82, 0x30363d, 0, .7, 0, g, .07, mat(0x30363d, .9));
  seat.userData.tip = "Teacher's chair";
  const back = softBox(.8, .9, .14, 0x30363d, 0, 1.22, .36, g, .07, mat(0x30363d, .9));
  back.rotation.x = -.12;
  back.userData.tip = seat.userData.tip;
  for (const s of [-1, 1]) {
    const arm = softBox(.09, .3, .5, 0x2b2b2b, s * .45, .9, .05, g, .03);
    arm.userData.tip = seat.userData.tip;
  }
  return g;
}

/** Open laptop: base, hinged screen, dark screen decal. */
function laptop(x, y, z, rotY, parent) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  const shell = mat(0xb9bec4, .35);
  const base = softBox(1.1, .05, .78, 0xb9bec4, 0, 0, 0, g, .015, shell);
  base.userData.tip = "Teacher's laptop";
  // keyboard well + trackpad
  softBox(.94, .012, .5, 0x3a3f45, 0, .032, -.08, g, .01);
  softBox(.3, .01, .18, 0x8f959b, 0, .032, .26, g, .01);
  const lid = new THREE.Group();
  lid.position.set(0, .02, -.38);
  lid.rotation.x = -.2;   // lid built pointing up, so this is just the recline
  g.add(lid);
  softBox(1.1, .76, .04, 0xb9bec4, 0, .38, 0, lid, .015, shell);
  const screen = decal(signTex("LESSON PLAN", { bg: '#101820', fg: '#7fd8ff', border: '#101820', ratio: .68 }), .98, .66);
  screen.position.set(0, .38, .026);
  screen.userData.tip = base.userData.tip;
  lid.add(screen);
  return g;
}

/** Folded towel stack: three offset slabs. */
function towelStack(x, y, z, parent) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const tones = [0xf2f2ee, 0xd9e6ef, 0xf4e6d9];
  tones.forEach((c, i) => {
    const t = softBox(.52, .1, .4, c, (Math.random() - .5) * .04, i * .11, 0, g, .03);
    t.rotation.y = (Math.random() - .5) * .12;
    t.userData.tip = "Folded towels";
  });
  return g;
}

/** Tissue box with a white tuft poking out of the slot. */
function tissueBox(x, y, z, color, parent) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  softBox(.5, .3, .34, color, 0, 0, 0, g, .04).userData.tip = "Tissues";
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), white);
  tuft.scale.set(1.3, .6, .8);
  tuft.position.y = .16;
  g.add(tuft);
  return g;
}

/**
 * Build zones 12-14.
 * @param {{chair: (parent: THREE.Object3D, x: number, z: number, color: number,
 *          name: string, rot?: number) => THREE.Group}} deps app.js chair factory
 */
export function buildTeachingZones({ chair }) {

  // ------------------------------------------- Zone 12: math centre + easel
  // Low open shelf unit facing +z (the zone camera sits on that side) holding
  // manipulative tubs, a number-tile tray, and two labelled fabric bins.
  {
    const g = makeGroup("Math Manipulative Center", 8.6, -5.4);
    const W = 3.2, H = 2.0, D = 1.15;
    const PLINTH = .2, SHELF_Y = 1.0, TOP_RAIL = .3;

    // Carcass: two ends, a back, the plinth, the deck, one mid shelf, the top.
    for (const s of [-1, 1]) {
      box(.08, H - PLINTH, D, 0xffffff, s * (W / 2 - .04), PLINTH + (H - PLINTH) / 2, 0, g)
        .material = woodStd;
    }
    box(W, H - PLINTH, .07, 0xffffff, 0, PLINTH + (H - PLINTH) / 2, -D / 2 + .04, g)
      .material = woodStd;
    box(W - .5, PLINTH, D - .2, 0xffffff, 0, PLINTH / 2, 0, g).material = woodStd;
    box(W - .1, .08, D - .06, 0xffffff, 0, PLINTH + .04, 0, g).material = woodStd;
    box(W - .1, .08, D - .06, 0xffffff, 0, SHELF_Y, 0, g).material = woodStd;
    softBox(W + .1, .12, D + .1, 0xffffff, 0, H, 0, g, .03, woodLightStd)
      .userData.tip = "Math centre top";
    // Divider between the two bays on each level
    box(.06, H - PLINTH - TOP_RAIL, D - .1, 0xffffff, 0, PLINTH + (H - PLINTH - TOP_RAIL) / 2, 0, g)
      .material = woodStd;

    // Printed label board across the top front rail
    const rail = softBox(W - .06, TOP_RAIL, .07, 0xfffdf7, 0, H - TOP_RAIL / 2 - .1, D / 2 - .02, g, .02);
    rail.userData.tip = "Math Manipulative Center";
    const railFace = decal(signTex("Math Manipulative Center", { ratio: .1, fg: '#1f6f9f' }), W - .16, TOP_RAIL - .05);
    railFace.position.set(0, H - TOP_RAIL / 2 - .1, D / 2 + .02);
    railFace.userData.tip = rail.userData.tip;
    g.add(railFace);

    // Upper bays: counters and cubes
    counterTub(1.1, .5, .78, 0xe4572e, -.78, 1.3, .06, g, 'sphere');
    counterTub(1.1, .5, .78, 0x3f8fc4, .78, 1.3, .06, g, 'cube');
    // Lower bays: number tiles plus two labelled fabric bins
    numberTray(-.78, .34, .06, g);
    fabricBin(.68, .58, .8, "Counters", .52, .58, .06, g, '#f2c94c', '+z');
    fabricBin(.68, .58, .8, "Shapes", 1.28, .58, .06, g, '#a8d5a2', '+z');

    // A few tubs stacked on the top surface, as the reference shows
    counterTub(.8, .34, .6, 0x8e5fa8, -1.0, 2.24, -.02, g, 'cube');
    counterTub(.8, .34, .6, 0x5f9e6a, 1.0, 2.24, -.02, g, 'sphere');

    easel(-2.4, .1, g);

    registerZone("math", "Math Manipulative Center", [8.6, 1.3, -5.4], [8.6, 5.5, 3], 0xf1c40f);
  }

  // ------------------------------------------- Zone 13: small group instruction
  // Round table on a splayed 4-star pedestal with five chairs around it and the
  // zone name printed flat on the tabletop.
  {
    const g = makeGroup("Small Group Instruction", 0, 7.4);
    const R = 2.15, TH = .16, TY = 1.35;

    const top = new THREE.Mesh(new THREE.CylinderGeometry(R, R, TH, 64), woodLightStd);
    top.position.y = TY;
    top.castShadow = true;
    top.receiveShadow = true;
    top.userData.tip = "Small group table";
    g.add(top);
    // Bullnose edge band so the top does not read as a bare disc
    const edge = new THREE.Mesh(new THREE.TorusGeometry(R, TH / 2, 10, 64), mat(0xf28c28, .6));
    edge.rotation.x = Math.PI / 2;
    edge.position.y = TY;
    edge.userData.tip = top.userData.tip;
    g.add(edge);

    // Pedestal: central column, collar, and four splayed feet with toe pads
    cyl(.24, TY - TH / 2 - .12, 0x9aa1a8, 0, (TY - TH / 2 - .12) / 2 + .12, 0, g, 24)
      .material.roughness = .4;
    cyl(.34, .1, 0x6b7076, 0, TY - .16, 0, g, 24);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const foot = softBox(.22, .14, 1.55, 0x6b7076, Math.sin(a) * .62, .16, Math.cos(a) * .62, g, .05);
      foot.rotation.y = a;
      foot.rotation.x = .07;  // slight splay so the base flares to the floor
      foot.userData.tip = top.userData.tip;
      cyl(.09, .09, 0x2b2b2b, Math.sin(a) * 1.28, .05, Math.cos(a) * 1.28, g, 12);
    }

    // Printed decal lying flat on the surface, lifted clear of the top face
    const deck = decal(signTex("SMALL GROUP INSTRUCTION", { ratio: .17, fg: '#b05c12' }), 2.6, .44);
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, TY + TH / 2 + .006, .05);
    deck.userData.tip = "Small Group Instruction";
    g.add(deck);

    const seatNames = ["Amelia", "Ethan", "Mia", "Noah", "Sophia"];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      // Backrest sits on +z in chair-local space, so rotating by `a` faces it outward.
      chair(g, Math.sin(a) * 2.8, Math.cos(a) * 2.8, 0xf28c28, seatNames[i], a);
    }

    registerZone("smallGroup", "Small Group Instruction", [0, 1.2, 7.4], [0, 6.2, 15], 0xf28c28);
  }

  // ------------------------------------------- Zone 14: teacher's area
  // Against the right-hand wall, so the front of everything faces -x and all
  // signage is turned by -90 degrees.
  {
    const g = makeGroup("Teacher's Area", 12.2, 5.0);
    const WALL_X = ROOM_W / 2 - .09 - 12.2;   // inner wall face in group-local space
    const DESK_D = 2.3, DESK_W = 4.4, DESK_Y = 1.5, DESK_Z = -1.0;
    const frontX = WALL_X - DESK_D;

    // Desk slab + coloured edge, modesty panel on the open side, boxy legs
    const deskTop = softBox(DESK_D, .13, DESK_W, 0xffffff, WALL_X - DESK_D / 2, DESK_Y, DESK_Z, g, .03, woodLightStd);
    deskTop.userData.tip = "Teacher's desk";
    softBox(DESK_D + .04, .07, DESK_W + .04, 0x8a6136, WALL_X - DESK_D / 2, DESK_Y - .1, DESK_Z, g, .02)
      .userData.tip = deskTop.userData.tip;
    // L return wing on the far end, giving the desk its L footprint
    const wing = softBox(1.8, .13, 1.35, 0xffffff, frontX - .8, DESK_Y, DESK_Z - DESK_W / 2 + .68, g, .03, woodLightStd);
    wing.userData.tip = deskTop.userData.tip;
    softBox(1.84, .07, 1.39, 0x8a6136, frontX - .8, DESK_Y - .1, DESK_Z - DESK_W / 2 + .68, g, .02);

    const modesty = box(.09, DESK_Y - .5, DESK_W - .3, 0xffffff, frontX + .12, (DESK_Y - .5) / 2 + .35, DESK_Z, g);
    modesty.material = woodStd;
    modesty.userData.tip = deskTop.userData.tip;
    for (const lz of [DESK_Z - DESK_W / 2 + .3, DESK_Z + DESK_W / 2 - .3]) {
      box(.14, DESK_Y - .14, DESK_D - .5, 0xffffff, frontX + .3, (DESK_Y - .14) / 2, lz, g).material = woodStd;
    }
    box(.14, DESK_Y - .14, .5, 0xffffff, frontX - 1.5, (DESK_Y - .14) / 2, DESK_Z - DESK_W / 2 + .68, g)
      .material = woodStd;
    // Pedestal drawer unit under the wall end of the desk
    const ped = softBox(DESK_D - .5, DESK_Y - .2, 1.2, 0xf1ead8, WALL_X - DESK_D / 2 - .1, (DESK_Y - .2) / 2, DESK_Z + DESK_W / 2 - .75, g, .03);
    ped.userData.tip = "Desk drawers";
    for (let i = 0; i < 3; i++) {
      const pull = cyl(.03, .34, 0x8f959b, frontX + .32, .3 + i * .38, DESK_Z + DESK_W / 2 - .75, g, 10);
      pull.rotation.x = Math.PI / 2;
    }

    // Red sign printed on the desk front
    const signBoard = softBox(.07, .62, 2.6, 0xd94a38, frontX + .02, 1.0, DESK_Z + .1, g, .02);
    signBoard.userData.tip = "Teacher's Area (Off Limits)";
    const signFace = decal(signTex("TEACHER'S AREA (OFF LIMITS)", { bg: '#d94a38', fg: '#fffdf7', border: '#a8352a', ratio: .2 }), 2.6, .54);
    signFace.rotation.y = -Math.PI / 2;
    signFace.position.set(frontX - .02, 1.0, DESK_Z + .1);
    signFace.userData.tip = signBoard.userData.tip;
    g.add(signFace);

    laptop(WALL_X - 1.25, DESK_Y + .09, DESK_Z - .5, -Math.PI / 2, g);
    tissueBox(WALL_X - .55, DESK_Y + .22, DESK_Z + 1.35, 0xbcdce9, g);
    deskChair(frontX - 1.55, DESK_Z + 1.25, Math.PI / 2, g);

    // Green reward bucket of hair bands, kept on the desk
    {
      const bucket = new THREE.Group();
      bucket.position.set(WALL_X - 1.75, DESK_Y + .07, DESK_Z + 1.15);
      g.add(bucket);
      const pail = new THREE.Mesh(new THREE.CylinderGeometry(.3, .23, .34, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x2e9d50, roughness: .6, side: THREE.DoubleSide }));
      pail.position.y = .17;
      pail.castShadow = true;
      pail.userData.tip = "Reward bucket — hair bands";
      bucket.add(pail);
      cyl(.23, .03, 0x25803f, 0, .015, 0, bucket, 24);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(.29, .022, 8, 20, Math.PI), mat(0x9aa1a8, .35));
      handle.position.y = .33;
      handle.rotation.y = Math.PI / 2;
      bucket.add(handle);
      for (let i = 0; i < 9; i++) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(.055, .016, 8, 16), mat(0x15151a, .55));
        band.position.set((Math.random() - .5) * .34, .22 + Math.random() * .06, (Math.random() - .5) * .34);
        band.rotation.set(Math.random() * .8, Math.random() * Math.PI, Math.random() * .8);
        band.userData.tip = pail.userData.tip;
        bucket.add(band);
      }
    }

    // Lower storage unit with four labelled compartments, front facing -x
    {
      const SU_W = 3.2, SU_H = 1.65, SU_D = 1.0, RAIL = .24;
      const suZ = 3.4, suX = WALL_X - SU_D / 2, deckY = .2, cellW = SU_W / 4;
      // Open carcass: ends, back, plinth, deck, top slab, dividers, label rail.
      for (const s of [-1, 1]) {
        box(SU_D, SU_H - .14, .08, 0xffffff, suX, .14 + (SU_H - .14) / 2, suZ + s * (SU_W / 2 - .04), g)
          .material = woodStd;
      }
      const backPanel = box(.07, SU_H - .14, SU_W, 0xffffff, WALL_X - .04, .14 + (SU_H - .14) / 2, suZ, g);
      backPanel.material = woodStd;
      backPanel.userData.tip = "Teacher storage";
      box(SU_D - .2, .14, SU_W - .5, 0xffffff, suX, .07, suZ, g).material = woodStd;
      box(SU_D - .04, .1, SU_W - .1, 0xffffff, suX, deckY - .05, suZ, g).material = woodStd;
      softBox(SU_D + .08, .12, SU_W + .08, 0xffffff, suX, SU_H, suZ, g, .03, woodLightStd)
        .userData.tip = "Teacher storage";
      for (let i = 1; i < 4; i++) {
        box(SU_D - .06, SU_H - RAIL - deckY, .06, 0xffffff, suX,
          deckY + (SU_H - RAIL - deckY) / 2, suZ - SU_W / 2 + i * cellW, g).material = woodStd;
      }
      const suRail = softBox(.08, RAIL, SU_W - .06, 0xfffdf7, WALL_X - SU_D + .04, SU_H - RAIL / 2 - .1, suZ, g, .02);
      suRail.userData.tip = "Teacher storage";

      const labels = ["FIRST AID KIT", "HAND SANITIZER", "EXTRA SUPPLIES", "TISSUES / TOWELS"];
      labels.forEach((t, i) => {
        const cz = suZ - SU_W / 2 + cellW * (i + .5);
        const face = decal(signTex(t, { ratio: .14, fg: '#3a4652' }), cellW - .12, RAIL - .07);
        face.rotation.y = -Math.PI / 2;
        face.position.set(WALL_X - SU_D - .005, SU_H - RAIL / 2 - .1, cz);
        face.userData.tip = t;
        g.add(face);
      });

      // Props, one set per compartment
      {
        const caseG = new THREE.Group();
        caseG.position.set(suX - .06, deckY + .24, suZ - SU_W / 2 + cellW * .5);
        g.add(caseG);
        const shell = softBox(.62, .48, .58, 0xfafafa, 0, 0, 0, caseG, .05, mat(0xfafafa, .5));
        shell.userData.tip = "First aid kit";
        const cross = decal(firstAidTex(), .42, .38);
        cross.rotation.y = -Math.PI / 2;
        cross.position.x = -.315;
        cross.userData.tip = shell.userData.tip;
        caseG.add(cross);
        const grip = new THREE.Mesh(new THREE.TorusGeometry(.1, .022, 8, 14, Math.PI), mat(0xd0d4d8, .5));
        grip.position.y = .25;
        grip.rotation.y = Math.PI / 2;
        caseG.add(grip);
      }
      {
        const pz = suZ - SU_W / 2 + cellW * 1.5;
        const bottle = cyl(.14, .46, 0xf6f6f4, suX - .05, deckY + .23, pz, g, 20);
        bottle.userData.tip = "Hand sanitizer";
        cyl(.06, .12, 0x2777c7, suX - .05, deckY + .52, pz, g, 14).userData.tip = bottle.userData.tip;
        const nozzle = cyl(.022, .18, 0x2777c7, suX - .14, deckY + .56, pz, g, 8);
        nozzle.rotation.z = Math.PI / 2;
        nozzle.userData.tip = bottle.userData.tip;
        const tag = decal(signTex("SANITIZE", { ratio: .5, fg: '#1f6f9f' }), .2, .2);
        tag.rotation.y = -Math.PI / 2;
        tag.position.set(suX - .195, deckY + .23, pz);
        g.add(tag);
      }
      {
        const pz = suZ - SU_W / 2 + cellW * 2.5;
        [0xe4572e, 0xf2b53c, 0x8e5fa8].forEach((c, i) => {
          const bx = softBox(.66, .32, .62, c, suX - .04, deckY + .17 + i * .34, pz, g, .04);
          bx.rotation.y = (Math.random() - .5) * .14;
          bx.userData.tip = "Extra supplies";
        });
      }
      {
        const pz = suZ - SU_W / 2 + cellW * 3.5;
        tissueBox(suX - .06, deckY + .16, pz - .17, 0xbcdce9, g);
        tissueBox(suX - .06, deckY + .5, pz - .17, 0xe8c7cf, g);
        towelStack(suX - .06, deckY + .06, pz + .19, g);
      }
    }

    // Trash bin beside the desk
    {
      const bin = new THREE.Mesh(new THREE.CylinderGeometry(.34, .27, .82, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x4d5560, roughness: .6, side: THREE.DoubleSide }));
      bin.position.set(frontX + .1, .41, DESK_Z + DESK_W / 2 + .55);
      bin.castShadow = true;
      bin.userData.tip = "Trash bin";
      g.add(bin);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.34, .028, 8, 24), mat(0x3a4149, .5));
      rim.rotation.x = Math.PI / 2;
      rim.position.set(frontX + .1, .82, DESK_Z + DESK_W / 2 + .55);
      g.add(rim);
    }

    // Hazard-tape border marking the off-limits floor area (open on the wall side)
    {
      const x0 = frontX - 2.1, z0 = DESK_Z - DESK_W / 2 - .8, z1 = 5.4;
      tapeStrip(z1 - z0, x0, (z0 + z1) / 2, true, g);
      tapeStrip(WALL_X - x0, (x0 + WALL_X) / 2, z0, false, g);
      tapeStrip(WALL_X - x0, (x0 + WALL_X) / 2, z1, false, g);
    }

    registerZone("teacher", "Teacher's Area", [12.2, 1.1, 5.0], [6.0, 5.5, 11.5], 0xd94a38);
  }
}
