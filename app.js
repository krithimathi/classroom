import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  setMaxAnisotropy, floorTex, wallTex, namePlateTex, signTex, polkaRugTex,
  emotionChartTex, bookCoverTex, rulesTex, calendarTex, jobsChartTex,
  alphabetCardTex, bannerTex, welcomeTex,
} from './tex.js';
import {
  ROOM_W, ROOM_D, WALL_H, setScene, zones, registerZone,
  mat, decal, wallBoard, softBox, box, cyl, makeGroup, label, card,
  woodStd, woodLightStd, white,
  plant, fabricBin, lunchBox, backpack,
} from './kit.js';
import { buildLearningZones } from './zones-learning.js';
import { buildNookZone } from './zones-nook.js';
import { buildCentreZones } from './zones-centres.js';
import { buildTeachingZones } from './zones-teaching.js';

const sceneHost = document.getElementById('scene');
const tooltip = document.getElementById('tooltip');

const scene = new THREE.Scene();
setScene(scene);
scene.background = new THREE.Color(0xe8edf4);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
camera.position.set(19, 18, 28);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
sceneHost.appendChild(renderer.domElement);

setMaxAnisotropy(renderer.capabilities.getMaxAnisotropy());

// Indoor image-based lighting: without it, MeshStandardMaterial reads as flat plastic.
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();
}

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
sceneHost.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 3.5;
controls.maxDistance = 70;
controls.maxPolarAngle = Math.PI / 2.02;
controls.target.set(0, 1.5, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8578, 0.9));
const sun = new THREE.DirectionalLight(0xfff6e8, 1.5);
sun.position.set(-8, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0006;
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
scene.add(sun);



// Floor + walls
{
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_D),
    new THREE.MeshStandardMaterial({ map: floorTex(), roughness: .55, metalness: .02 })
  );
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallStd = new THREE.MeshStandardMaterial({ map: wallTex(), roughness: .95 });
  const wallBack = box(ROOM_W,WALL_H,.18,0xffffff,0,WALL_H/2,-ROOM_D/2);
  const wallLeft = box(.18,WALL_H,ROOM_D,0xffffff,-ROOM_W/2,WALL_H/2,0);
  const wallRight = box(.18,WALL_H,ROOM_D,0xffffff,ROOM_W/2,WALL_H/2,0);
  [wallBack, wallLeft, wallRight].forEach(m => { m.material = wallStd; });

  // Baseboard trim
  box(ROOM_W,.28,.08,0xe6e0d2,0,.14,-ROOM_D/2+.13);
  box(.08,.28,ROOM_D,0xe6e0d2,-ROOM_W/2+.13,.14,0);
  box(.08,.28,ROOM_D,0xe6e0d2,ROOM_W/2-.13,.14,0);
}

// Entrance door on the left-hand wall
{
  const g = makeGroup("Entrance", -ROOM_W/2 + .1, -7.4);
  g.rotation.y = Math.PI/2;
  softBox(2.5,5.0,.12,0xc9a06a,0,2.5,-.04,g,.02).userData.tip = "Door frame";
  const leaf = softBox(2.1,4.6,.14,0xa66b34,0,2.3,.06,g,.03);
  leaf.userData.tip = "Classroom entrance";
  // vision panel + handle
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(.62,2.2),
    new THREE.MeshStandardMaterial({ color: 0xd7e7ee, roughness:.15, metalness:.1 }));
  glass.position.set(.1,3.0,.14);
  g.add(glass);
  softBox(.72,2.3,.04,0x8a5427,.1,3.0,.12,g,.02);
  cyl(.05,.42,0xb9bdc2,-.78,2.3,.16,g,12).rotation.x = Math.PI/2;
}

// Ceiling-ish light panels
for (let x of [-9,0,9]) {
  for (let z of [-7,0,7]) {
    const frame = softBox(2.8,.14,1.3,0xd8dde3,x,6.78,z,scene,.03);
    frame.castShadow = false;
    const diffuser = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5,1.05),
      new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xfff4e0, emissiveIntensity: 1.6, roughness: .9,
      })
    );
    diffuser.rotation.x = Math.PI/2;   // faces down into the room
    diffuser.position.set(x, 6.7, z);
    scene.add(diffuser);
    const light = new THREE.PointLight(0xfff4e6, 14, 11);
    light.position.set(x, 6.2, z);
    scene.add(light);
  }
}



// ---------------------------------------------------------------- Zone 1: cubbies
// Left wall: 2 rows x 5 bays. Top row holds labelled fabric bins, bottom row
// holds backpacks. Name plates on every shelf edge, props across the top,
// leaning foam-board sign on the floor.
{
  const g = makeGroup("Student Cubbies", -13.9, 3.7);
  const UNIT_D = 1.1, UNIT_H = 2.9, UNIT_L = 7.2;
  const BAYS = 5, PITCH = UNIT_L / BAYS;
  const SHELF_Y = 1.5;
  const topNames = ["Amelia","Benjamin","Lucas","Ethan","Faith"];
  const botNames = ["Hannah","Johan","Mason","Kylie","Mia"];
  const packColors = [0x7b4fa8, 0xd94f6e, 0x2f7fc1, 0xe0762c, 0x2f9e8f, 0x374a63, 0xc0392b, 0x8e6fd0, 0x1f8a70, 0xd4386c];

  // Carcass
  box(.08, UNIT_H, UNIT_L, 0xffffff, -UNIT_D/2, UNIT_H/2, 0, g).material = woodStd;
  box(UNIT_D, .12, UNIT_L, 0xffffff, 0, .12, 0, g).material = woodStd;
  softBox(UNIT_D + .1, .14, UNIT_L + .12, 0xffffff, 0, UNIT_H, 0, g, .03, woodLightStd)
    .userData.tip = "Cubby top";
  box(UNIT_D - .06, .07, UNIT_L, 0xffffff, .02, SHELF_Y, 0, g).material = woodStd;
  for (let i = 0; i <= BAYS; i++) {
    box(UNIT_D - .04, UNIT_H - .3, .07, 0xffffff, .02, (UNIT_H - .3)/2 + .18, -UNIT_L/2 + i*PITCH, g)
      .material = woodStd;
  }

  for (let c = 0; c < BAYS; c++) {
    const z = -UNIT_L/2 + PITCH*(c + .5);

    // Upper row: backpacks
    backpack(packColors[c*2 % packColors.length], .06, SHELF_Y + .62, z, g, PITCH - .5);
    const p1 = decal(namePlateTex(topNames[c], {accent:'#4a5b6b'}), PITCH - .5, .2);
    p1.rotation.y = Math.PI/2;
    p1.position.set(UNIT_D/2 + .01, SHELF_Y - .02, z);
    g.add(p1);

    // Lower row: lunch boxes
    lunchBox(packColors[(c*2+1) % packColors.length], botNames[c], .06, .5, z, g, PITCH - .55);
    const p2 = decal(namePlateTex(botNames[c], {accent:'#4a5b6b'}), PITCH - .5, .2);
    p2.rotation.y = Math.PI/2;
    p2.position.set(UNIT_D/2 + .01, .14, z);
    g.add(p2);
  }

  // Every student's water bottle lined up along the front of the top surface
  const bottleCols = [0xe4547c, 0x3f8fc4, 0x5f9e6a, 0xf2b53c, 0x8e5fa8,
                      0x39a3a3, 0xe4572e, 0x2f7fc1, 0xc0392b, 0x9dbf86];
  [...topNames, ...botNames].forEach((n, i) => {
    const bz = -UNIT_L/2 + .55 + i * ((UNIT_L - 1.1) / 9);
    const b = cyl(.1, .58, bottleCols[i], .2, UNIT_H + .36, bz, g, 16);
    b.userData.tip = `${n}'s water bottle`;
    const cap = cyl(.065, .13, 0xf2f2f2, .2, UNIT_H + .71, bz, g, 16);
    cap.userData.tip = b.userData.tip;
  });

  // Back of the top surface: plants and a tissue box, as in the reference
  plant(-.28, UNIT_H + .07, -3.9, g, .95);
  plant(-.28, UNIT_H + .07, 3.9, g, .82, 0xd8dfe6);
  softBox(.5,.34,.62, 0xbcdce9, -.26, UNIT_H+.24, 0, g, .04).userData.tip = "Tissues";

  // Leaning foam-board sign on the floor
  const signPivot = new THREE.Group();
  signPivot.position.set(UNIT_D/2 + .55, .48, .6);
  signPivot.rotation.y = Math.PI/2;
  g.add(signPivot);
  const sign = decal(signTex("STUDENT CUBBIES", {ratio:.22}), 3.4, .75);
  sign.rotation.x = -.22;
  sign.userData.tip = "Student Cubbies";
  signPivot.add(sign);

  registerZone("cubbies","Student Cubbies",[-13.4,1.5,3.7],[-7.5,6.5,13],0x3fa7d6);
}

// ---------------------------------------------------------------- Zone 2: calm corner
// Hanging navy bed canopy with a front opening, oval pouf + pillows + teddy on a
// polka-dot rug, a low picture-book display, and the wall charts above it.
{
  const g = makeGroup("Calm Down Space", -12.4, -8.7);

  // Polka-dot rug
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 64),
    new THREE.MeshStandardMaterial({ map: polkaRugTex(), roughness: .95 })
  );
  rug.rotation.x = -Math.PI/2;
  rug.position.set(0, .012, .3);
  rug.scale.set(1, .78, 1);
  rug.receiveShadow = true;
  rug.userData.tip = "Calm down rug";
  g.add(rug);

  // Canopy: lathe profile revolved 300deg, leaving a front opening
  {
    const profile = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      // bell curve from a narrow crown out to a wide scalloped hem
      profile.push(new THREE.Vector2(.09 + Math.pow(t, .68) * 1.55, 3.55 - t * 3.05));
    }
    const canopy = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 48, Math.PI * .34, Math.PI * 1.66),
      new THREE.MeshStandardMaterial({ color: 0x24406b, side: THREE.DoubleSide, roughness: .92 })
    );
    canopy.castShadow = true;
    canopy.userData.tip = "Calm down canopy";
    g.add(canopy);
    // hem band + crown ring + hanging cord to the ceiling
    const hem = new THREE.Mesh(
      new THREE.TorusGeometry(1.62, .06, 8, 48, Math.PI * 1.66),
      mat(0x1b3355, .85)
    );
    hem.rotation.set(Math.PI/2, 0, -Math.PI * .34);
    hem.position.y = .5;
    g.add(hem);
    cyl(.16,.16,0x1b3355,0,3.6,0,g,20);
    cyl(.02,2.9,0x8d99a6,0,5.1,0,g,8);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(.13,16,12), mat(0xd9c07a,.4));
    finial.position.y = 3.74;
    g.add(finial);
  }

  // Floor pouf (flattened sphere reads as a squashed bean-bag pad)
  const pouf = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 32, 20),
    mat(0x9dbf86, .95)
  );
  pouf.scale.set(1.15, .34, .95);
  pouf.position.set(0, .3, .25);
  pouf.castShadow = true;
  pouf.receiveShadow = true;
  pouf.userData.tip = "Floor cushion";
  g.add(pouf);

  // Pillows against the back of the canopy
  for (const [x, z, c, rot] of [[-.62,-.42,0xf6e7cf,.35],[.5,-.5,0xbcd8e8,-.28],[-.05,-.68,0xe8c7cf,.05]]) {
    const p = softBox(.78,.24,.6,c,x,.62,z,g,.11);
    p.rotation.set(-.35, rot, 0);
  }

  // Teddy bear
  {
    const t = new THREE.Group();
    t.position.set(.62,.42,.42);
    t.rotation.y = -.5;
    g.add(t);
    const fur = mat(0xc79a63,.95);
    const body = new THREE.Mesh(new THREE.SphereGeometry(.26,20,16), fur);
    body.scale.set(1,.95,.85);
    body.castShadow = true;
    t.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.2,20,16), fur);
    head.position.set(0,.34,.02);
    head.castShadow = true;
    t.add(head);
    for (const s of [-1,1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(.075,12,10), fur);
      ear.position.set(s*.14,.47,0);
      t.add(ear);
      const arm = new THREE.Mesh(new THREE.SphereGeometry(.1,12,10), fur);
      arm.position.set(s*.26,.06,.08);
      t.add(arm);
      const leg = new THREE.Mesh(new THREE.SphereGeometry(.11,12,10), fur);
      leg.position.set(s*.14,-.19,.14);
      t.add(leg);
    }
    const snout = new THREE.Mesh(new THREE.SphereGeometry(.09,12,10), mat(0xe8cfa8,.9));
    snout.position.set(0,.3,.17);
    t.add(snout);
    t.userData.tip = "Teddy bear";
  }

  // Low picture-book display beside the canopy
  {
    const d = new THREE.Group();
    d.position.set(2.35,0,-1.4);
    d.rotation.y = -.35;
    g.add(d);
    softBox(1.9,.75,.7,0xffffff,0,.4,0,d,.04,woodStd).userData.tip = "Book display";
    for (let i = 0; i < 4; i++) {
      const bk = decal(bookCoverTex(i+3), .4, .5);
      bk.position.set(-.66 + i*.44, .62, .34);
      bk.rotation.x = -.22;
      d.add(bk);
    }
  }
  plant(-2.0, 0, -1.5, g, 1.25, 0xc9a17a);

  // Wall charts above the corner (back wall is at local z = -3.0)
  const zWall = -2.88;
  const calmSign = decal(signTex("CALM DOWN SPACE", {ratio:.34}), 2.6, .88);
  calmSign.position.set(-.2, 5.1, zWall);
  calmSign.userData.tip = "Calm Down Space";
  g.add(calmSign);
  const feel = decal(emotionChartTex(), 1.9, 2.85);
  feel.position.set(2.7, 3.7, zWall);
  feel.userData.tip = "I feel... emotion chart";
  g.add(feel);

  registerZone("calm","Calm Down Space",[-12.4,1.6,-8.7],[-6.5,5.5,-2.0],0x49a7d6);
}

// ------------------------------------------------- Zone 3: back-wall header
// A-Z picture cards running the full width, "THE LEARNING CORNER" banner beneath
// them, and the welcome poster by the door.
{
  const g = makeGroup("Learning Corner", 0, -ROOM_D/2 + .14);
  const LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  const CARD = .78;
  // Two clusters with a gap in the middle, the way the reference splits A-M / N-Z
  LETTERS.forEach((ch, i) => {
    const half = i < 13 ? 0 : 1;
    const idx = i - half * 13;
    const startX = half ? .55 : -13.35;
    const c = wallBoard(alphabetCardTex(ch), CARD, CARD,
      startX + idx * (CARD + .21), 6.4, 0, g, 0xf1ead8, `Letter ${ch}${ch.toLowerCase()}`);
    c.rotation.z = (i % 2 ? 1 : -1) * .012;
  });

  wallBoard(bannerTex("THE LEARNING CORNER"), 5.6, 1.04, .4, 5.5, 0, g,
    0xf1ead8, "The Learning Corner");

  registerZone("learning","The Learning Corner",[0.4,5.6,-10.3],[0.4,6.0,0],0x2f8f8f);
}

// Welcome poster on the back wall, left of the calendar boards
{
  const g = makeGroup("Welcome", -9.5, -ROOM_D/2 + .14);
  wallBoard(welcomeTex(), 1.9, 2.4, 0, 4.3, 0, g, 0x2b2b2b, "Welcome to our classroom!");
}

// ------------------------------------------------- Zone 4: rules + daily calendar
// Both were floating HTML panels; they are now printed boards hung on the wall.
{
  const g = makeGroup("Calendar & Rules",-4.5,-10.85);
  wallBoard(rulesTex([
    "Be Kind",
    "Keep Hands to Yourself",
    "Raise Hand Before You Speak",
    "Listen When Others Are Talking",
    "Take Care of Our Classroom",
    "Try Your Best!",
  ]), 1.85, 2.6, -2.35, 3.9, .1, g, 0xf0ead9, "Classroom rules");

  wallBoard(calendarTex({
    month: 'August', year: 2026,
    today: 'Tuesday', dateLine: 'August 18, 2026',
    weather: 'Sunny', season: 'Summer',
    highlight: 18, firstDow: 6, days: 31,
  }), 3.7, 2.55, .95, 3.95, .1, g, 0x123c60, "Daily calendar");

  // Affirmation cards in a row under the boards, as in the reference
  ["YOU MATTER!","YOU ARE CAPABLE OF GREAT THINGS!","BE KIND BE YOU!","MISTAKES HELP US GROW!"]
    .forEach((t,i)=>{
      const b = wallBoard(signTex(t,{ratio:.62,fg:'#2d4a63'}), .95, .6, -2.2+i*1.15, 2.25, .1, g, 0xefe9dc, t);
      b.rotation.z = (i%2?1:-1)*.02;
    });

  registerZone("calendar","Daily Calendar & Rules",[-4.5,3.5,-10.3],[-4.5,5.0,-2.0],0x3498db);
}

// Zones 7-14 live in their own modules so they can be built independently.
buildLearningZones();   // numbers carpet + classroom library
buildNookZone();        // window, plushies, bean bags, posters
buildCentreZones();     // arts, phonics, technology supplies

// Tables
const tableDefs = [
  {key:"redTable", name:"Red Table", color:0xd9362b, x:-6.4, z:0.8,
   names:["Amelia","Benjamin","Lucas","Ethan"], back:["Aiden","Bella","Caleb","Daisy"]},
  {key:"blueTable", name:"Blue Table", color:0x2777c7, x:0.0, z:0.8,
   names:["Faith","Hannah","Johan","Mason"], back:["Eli","Freya","Gabe","Harper"]},
  {key:"greenTable", name:"Green Table", color:0x2e9d50, x:6.4, z:0.8,
   names:["Kylie","Mia","Olivia","William"], back:["Isla","Jonah","Kai","Leah"]},
  {key:"purpleTable", name:"Purple Table", color:0x7042a6, x:-6.4, z:6.2,
   names:["Parker","Quinn","Sophia","Thomas"], back:["Micah","Nora","Owen","Pia"]},
  {key:"yellowTable", name:"Yellow Table", color:0xe1b514, x:6.4, z:6.2,
   names:["Uriah","Violet","Xavier","Zoey"], back:["Rhys","Sadie","Tess","Wren"]},
];

function chair(parent,x,z,color,name,rot=0) {
  const g=new THREE.Group();
  g.position.set(x,0,z);
  g.rotation.y=rot;
  parent.add(g);
  const seat = softBox(.8,.12,.8,color,0,.55,0,g,.05);
  const backRest = softBox(.8,.8,.12,color,0,1.0,.34,g,.06);
  seat.userData.tip = backRest.userData.tip = `${name}'s chair`;
  for (const lx of [-.3,.3]) for (const lz of [-.3,.3]) {
    const leg = cyl(.035,.55,0x6b7076,lx,.28,lz,g,10);
    leg.material.roughness = .4;
  }
  return g;
}
/** Pot of upright pencils — the caddy every table group has in the reference. */
function pencilCaddy(color, x, y, z, parent, count = 14) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  softBox(.72,.34,.6,color,0,0,0,g,.04).userData.tip = "Pencil caddy";
  const pencilCols = [0xe4572e,0xf2b53c,0x3f8fc4,0x5f9e6a,0x8e5fa8,0x2b2b2b,0xe2718f];
  for (let i = 0; i < count; i++) {
    const p = cyl(.024,.62,pencilCols[i % pencilCols.length],
      (Math.random()-.5)*.5, .3, (Math.random()-.5)*.38, g, 6);
    p.rotation.set((Math.random()-.5)*.22, Math.random()*Math.PI, (Math.random()-.5)*.22);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.024,.09,6), mat(0xe8c99b,.7));
    tip.position.copy(p.position).y += .34;
    g.add(tip);
  }
  return g;
}

function studentTable(def) {
  const g=makeGroup(def.name,def.x,def.z);
  const TW = 4.6, TD = 2.7, TY = 1.35;
  const top = softBox(TW,.16,TD,0xffffff,0,TY,0,g,.05,woodLightStd);
  top.userData.tip=def.name;
  // Coloured edge band, then legs and a stretcher rail
  const band = softBox(TW+.06,.09,TD+.06,def.color,0,TY-.11,0,g,.03);
  band.userData.tip = def.name;
  for (const lx of [-TW/2+.35, TW/2-.35]) for (const lz of [-TD/2+.35, TD/2-.35]) {
    cyl(.055,TY-.19,0x9aa1a8,lx,(TY-.19)/2,lz,g,12).material.roughness = .35;
  }
  for (const lz of [-TD/2+.35, TD/2-.35]) {
    const rail = cyl(.04,TW-.7,0x9aa1a8,0,.35,lz,g,10);
    rail.rotation.z = Math.PI/2;
    rail.material.roughness = .35;
  }

  // Two shared pencil caddies
  pencilCaddy(def.color, -.02, TY+.25, -.72, g);
  pencilCaddy(def.color, -.02, TY+.25, .72, g);

  // Four files, one per corner, bordered in the table group's colour
  const seatX = [-1.55,-.62,.62,1.55];
  [[-1.42,-.78],[1.42,-.78],[-1.42,.78],[1.42,.78]].forEach(([x,z],i)=>
    card(`${def.name} file ${i+1}`,1.05,.05,.62,def.color,g,x,TY-.08,z));

  // Name plates printed on both long edges of the tabletop
  [[1,def.names],[-1,def.back]].forEach(([s,names])=>{
    seatX.forEach((x,i)=>{
      const p = decal(namePlateTex(names[i],{accent:'#'+def.color.toString(16).padStart(6,'0')}),.82,.19);
      p.position.set(x, TY-.03, s*(TD/2+.05));
      if (s < 0) p.rotation.y = Math.PI;
      p.userData.tip = names[i];
      g.add(p);
    });
  });

  // Eight chairs: four a side, backrests outward so everyone faces the table.
  seatX.forEach((x,i)=>{
    chair(g,x,TD/2+.45,def.color,def.names[i],0);
    chair(g,x,-TD/2-.45,def.color,def.back[i],Math.PI);
  });
  registerZone(def.key,def.name,[def.x,1.3,def.z],[def.x,6.0,def.z+8],def.color);
}
tableDefs.forEach(studentTable);

buildTeachingZones({ chair });  // math + easel, small group, teacher's area


// Classroom Jobs magnetic poster
{
  const g=makeGroup("Classroom Jobs",14.45,0.5);
  const jobs = [
    ["Worksheet Distributor","Amelia"],["Supply Organizer","Benjamin"],["Line Leader","Lucas"],
    ["Door Holder","Faith"],["Book Helper","Mia"],["Table Checker","Ethan"],
    ["Clean-Up Captain","Olivia"],["Materials Collector","William"],["Technology Helper","Noah"],
    ["Calendar Helper","Hannah"],["Weather Reporter","Mason"],["Plant/Pet Helper","Kylie"],
    ["Art Supply Helper","Violet"],["Center Helper","Xavier"],["Messenger","Zoey"],
    ["Sanitation Helper","Quinn"],["Cubby Checker","Sophia"],["Classroom Greeter","Parker"],
    ["Encouragement Leader","Thomas"],["Teacher Assistant","Uriah"]
  ];
  // Printed chart hung on the right-hand wall, facing into the room.
  const board = wallBoard(jobsChartTex(jobs), 2.0, 4.2, 0, 3.5, 0, g, 0x8a6136, "Classroom jobs");
  board.rotation.y = -Math.PI/2;
  registerZone("jobs","Classroom Jobs",[14.2,3,0.5],[7.5,4.6,6.0],0x9bc53d);
}

const allZoneNames = Object.entries(zones).map(([k,v])=>({key:k,...v}));

// Sidebar
const zoneButtons=document.getElementById('zoneButtons');
allZoneNames.forEach(z=>{
  const b=document.createElement('button');
  b.className='zone-btn';
  b.innerHTML=`<span class="zone-dot" style="background:#${z.color.toString(16).padStart(6,'0')}"></span>${z.label}`;
  b.onclick=()=>focusZone(z.key);
  zoneButtons.appendChild(b);
});

// Camera animation
let anim=null;
function focusZone(key) {
  const z=zones[key];
  if(!z) return;
  anim={
    startPos: camera.position.clone(),
    endPos: z.cam.clone(),
    startTarget: controls.target.clone(),
    endTarget: z.center.clone(),
    t:0
  };
}
function homeView() {
  anim={
    startPos:camera.position.clone(),
    endPos:new THREE.Vector3(19,18,28),
    startTarget:controls.target.clone(),
    endTarget:new THREE.Vector3(0,1.5,0),
    t:0
  };
}
function floorView() {
  anim={
    startPos:camera.position.clone(),
    endPos:new THREE.Vector3(0,40,.01),
    startTarget:controls.target.clone(),
    endTarget:new THREE.Vector3(0,0,0),
    t:0
  };
}
// Collapsible sidebar: the grid column animates to zero and the canvas resizes.
const appEl = document.getElementById('app');
const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.onclick = () => {
  const collapsed = appEl.classList.toggle('sidebar-collapsed');
  sidebarToggle.textContent = collapsed ? 'Show Areas' : 'Hide Areas';
  sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  // The CSS transition runs for 220ms; resize while it plays and once at the end.
  const until = performance.now() + 260;
  const follow = () => {
    resize();
    if (performance.now() < until) requestAnimationFrame(follow);
  };
  follow();
};

document.getElementById('homeBtn').onclick=homeView;
document.getElementById('floorBtn').onclick=floorView;

let labelsVisible=false;
labelRenderer.domElement.style.display="none";
document.getElementById('labelsBtn').onclick=()=>{
  labelsVisible=!labelsVisible;
  labelRenderer.domElement.style.display=labelsVisible?'block':'none';
  document.getElementById('labelsBtn').textContent=labelsVisible?'Hide Labels':'Show Labels';
};

// Raycaster for double-click focusing / hover tooltips
const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();
function pick(event){
  const rect=renderer.domElement.getBoundingClientRect();
  mouse.x=((event.clientX-rect.left)/rect.width)*2-1;
  mouse.y=-((event.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects(scene.children,true);
  return hits.find(h=>h.object.userData.tip || h.object.parent?.userData?.tip);
}
renderer.domElement.addEventListener('pointermove',e=>{
  const hit=pick(e);
  if(hit){
    tooltip.style.display='block';
    tooltip.textContent=hit.object.userData.tip || hit.object.parent?.userData?.tip || '';
    tooltip.style.left=(e.clientX-renderer.domElement.getBoundingClientRect().left+12)+'px';
    tooltip.style.top=(e.clientY-renderer.domElement.getBoundingClientRect().top+12)+'px';
  } else tooltip.style.display='none';
});
renderer.domElement.addEventListener('dblclick',e=>{
  const hit=pick(e);
  if(!hit) return;
  const p=new THREE.Vector3();
  hit.object.getWorldPosition(p);
  anim={
    startPos:camera.position.clone(),
    endPos:p.clone().add(new THREE.Vector3(4,4,6)),
    startTarget:controls.target.clone(),
    endTarget:p.clone(),
    t:0
  };
});

// Resize
function resize(){
  const rect=sceneHost.getBoundingClientRect();
  renderer.setSize(rect.width,rect.height,false);
  labelRenderer.setSize(rect.width,rect.height);
  camera.aspect=rect.width/rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);
resize();

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=clock.getDelta();
  if(anim){
    anim.t=Math.min(1,anim.t+dt*1.5);
    const e=1-Math.pow(1-anim.t,3);
    camera.position.lerpVectors(anim.startPos,anim.endPos,e);
    controls.target.lerpVectors(anim.startTarget,anim.endTarget,e);
    if(anim.t>=1) anim=null;
  }
  controls.update();
  renderer.render(scene,camera);
  labelRenderer.render(scene,camera);
}
animate();

