import * as THREE from 'three';
import { TrackballControls } from 'TrackballControls';
import { OBJLoader } from 'OBJLoader';
import { stats, addStatsObject } from 'fps-stats';

import InteractiveTool from 'interactive-tool';
import { getMeshObjects } from 'helper';

// Global variables
let WIDTH, HEIGHT, aspectRatio;
let scene, camera, renderer;
let controls;

// Info panels
let appInfo, hotkeysInfo, statsContainer;

// Interactive tool
let interactiveTool;

// Objects
let ground,
  station,
  mountain,
  rails,
  helicopter,
  propeller,
  littlePropeller,
  ufoOrbitHolder,
  ufoHolder,
  sun,
  moon,
  aLight,
  sLight,
  slightHelper,
  pLight;

// Moving variables
let moveForward, moveBackward, moveLeft, moveRight, moveUp, moveDown;

init();

// Rendering only one frame
// render();

// Start animation
// animate();

function init() {
  //////////////////////////
  //      Preparation     //
  //////////////////////////

  // Info panel definitions
  appInfo = document.getElementById('appinfo');
  hotkeysInfo = document.getElementById('hotkeysinfo');

  // Initialization of window sizes
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  aspectRatio = WIDTH / HEIGHT;

  // Initialization of Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor(0x000000);
  // Enable shadowMap
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // PerspectiveCamera initialization
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

  // Scene initialization
  scene = new THREE.Scene();

  // FPS display insert
  statsContainer = addStatsObject();

  // Resource manager
  const manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    console.log(
      'Manager onProgress: loading of',
      item,
      'finished; ',
      loaded,
      ' of ',
      total,
      ' objects loaded.'
    );
  };
  manager.onLoad = function () {
    console.log('Manager onLoad called, render started.');
    animate();

    //
    // Default object setting
    //
    interactiveTool.setDefaultGuiParamsByObject('Chair');

    //
    // Interactive tool insert
    //
    interactiveTool.addFunctionalControlGui();
    interactiveTool.addControlGui();
    interactiveTool.addAnimationControlGui();
  };

  // Object loader initialization
  const objLoader = new OBJLoader(manager);

  // Key press listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  ////////////////////////////
  //      Modify/Create     //
  ////////////////////////////

  //
  // Adding AxesHelper
  //
  scene.add(new THREE.AxesHelper(20));

  //
  // Camera position initialization
  //
  camera.position.set(0, 45, 5);
  camera.lookAt(scene.position);

  //
  // Ground
  //
  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 30, 30),
    new THREE.MeshLambertMaterial({
      color: 0x008000,
      wireframe: false,
      side: THREE.DoubleSide
    })
  );
  ground.name = 'Ground';
  ground.rotation.x = (-1.0 * Math.PI) / 2;
  ground.castShadow = false;
  ground.receiveShadow = true;
  scene.add(ground);

  //
  // Station
  //
  station = new THREE.Group();
  station.name = 'Station';
  station.position.set(-15, 2.5, -5);
  scene.add(station);

  // Station base
  const stationFundamentum = new THREE.Mesh(
    new THREE.BoxGeometry(2, 5, 20),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: false
    })
  );
  stationFundamentum.name = 'Station base';
  stationFundamentum.castShadow = true;
  stationFundamentum.receiveShadow = true;
  station.add(stationFundamentum);

  // Station roof
  const stationTop = new THREE.Mesh(
    new THREE.ConeGeometry(1.42, 6, 4, undefined, true),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: false
    })
  );
  stationTop.name = 'Station roof';
  stationTop.position.y = 5.5;
  stationTop.rotation.y = THREE.MathUtils.degToRad(45);
  stationTop.castShadow = true;
  stationTop.receiveShadow = true;
  station.add(stationTop);

  //
  // Rails
  //
  rails = new THREE.Group();
  rails.name = 'Rail';
  rails.position.set(-8, 0, 0);
  scene.add(rails);

  // Rail elements
  const rail1 = new THREE.Mesh(
    new THREE.BoxGeometry(120, 0.8, 0.8),
    new THREE.MeshPhongMaterial({
      color: 0xa2a2a2,
      wireframe: false
    })
  );
  rail1.name = 'TrainRails-Rail-1';
  rail1.position.y = 0.4;
  rail1.rotation.y = Math.PI / 2;
  rail1.castShadow = true;
  rail1.receiveShadow = true;
  rails.add(rail1);

  const rail2 = new THREE.Mesh(
    new THREE.BoxGeometry(120, 0.8, 0.8),
    new THREE.MeshPhongMaterial({
      color: 0xa2a2a2,
      wireframe: false
    })
  );
  rail2.name = 'TrainRails-Rail-2';
  rail2.position.y = 0.4;
  rail2.position.x = 3.5;
  rail2.rotation.y = Math.PI / 2;
  rail2.castShadow = true;
  rail2.receiveShadow = true;
  rails.add(rail2);

  // Beams
  [...Array(30).keys()].map(function (val, i) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.6, 0.6),
      new THREE.MeshPhongMaterial({
        color: 0x200d06,
        wireframe: false
      })
    );
    beam.name = 'TrainRails-Beam-' + (i + 1);
    beam.position.set(1.75, 0.4, -58 + i * 4);
    beam.castShadow = true;
    beam.receiveShadow = true;
    rails.add(beam);
  });

  // Mountain
  mountain = new THREE.Mesh(
    new THREE.ConeGeometry(24, 64, 32, 1, true),
    new THREE.MeshPhongMaterial({
      color: 0x8effff,
      wireframe: false
    })
  );
  mountain.name = 'Mountain';
  mountain.position.set(27, 32, 12);
  mountain.castShadow = true;
  mountain.receiveShadow = true;
  scene.add(mountain);

  //
  // Chair
  //
  objLoader.load(
    'assets/models/chair.obj',
    function (loaded) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x200d06,
        wireframe: false
      });

      const seat = loaded.children.find(function (mesh) {
        return mesh.name === 'Cube';
      });

      // Adding Material
      seat.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });

      seat.name = 'Chair';
      seat.position.set(-18, 0.697, 8);
      seat.rotation.y = Math.PI / 2;

      scene.add(seat);
    },
    function () {},
    function (err) {
      console.error("Can't load assets!");
      console.log(err);
    }
  );

  //
  // Desk
  //
  const desk = new THREE.Group();
  desk.name = 'Desk';
  desk.position.set(-15, 1.6, 8);
  scene.add(desk);

  // Desktop
  const desktop = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.2, 2.5),
    new THREE.MeshPhongMaterial({
      color: 0x5f3810,
      wireframe: false
    })
  );
  desktop.name = 'Desk-Desktop';
  desktop.castShadow = true;
  desktop.receiveShadow = true;
  desk.add(desktop);

  // Legs
  [...Array(4).keys()].map(function (val, i) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.5, 0.3),
      new THREE.MeshPhongMaterial({
        color: 0x5f3810,
        wireframe: false
      })
    );
    leg.name = 'Desk-Leg-' + (i + 1);

    let posX = -1.25;
    let posY = -0.85;
    let posZ = -1;

    if (i === 1 || i === 3) {
      posX = 1.25;
    }
    if (i === 2 || i === 3) {
      posZ = 1;
    }

    leg.position.set(posX, posY, posZ);

    leg.castShadow = true;
    leg.receiveShadow = true;

    desk.add(leg);
  });

  //
  // Storage
  //
  objLoader.load(
    'assets/models/storage.obj',
    function (loaded) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xa09600,
        wireframe: false
      });

      const storageBox = loaded.children.find(function (mesh) {
        return mesh.name === 'Cube';
      });

      // Anyag hozzárendelés
      storageBox.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });

      storageBox.name = 'Storage';
      storageBox.position.set(-16, 0.1, 11);

      scene.add(storageBox);
    },
    function () {},
    function (err) {
      console.error("Can't load assets!");
      console.log(err);
    }
  );

  //
  // Helicopter
  //
  helicopter = new THREE.Group();
  helicopter.name = 'Helicopter';
  helicopter.position.set(6, 42, 0);
  scene.add(helicopter);

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1, 3),
    new THREE.MeshPhongMaterial({
      color: 0x8e0000,
      wireframe: false
    })
  );
  body.name = 'Helicopter-Body';
  body.castShadow = true;
  body.receiveShadow = true;
  helicopter.add(body);

  // Tail
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.63, 3.6),
    new THREE.MeshPhongMaterial({
      color: 0x8e0000,
      wireframe: false
    })
  );
  tail.name = 'Helicopter-Tails';
  tail.position.y = 0.2;
  tail.position.z = -3.3;
  tail.castShadow = true;
  tail.receiveShadow = true;
  helicopter.add(tail);

  // Propeller
  propeller = new THREE.Mesh(
    new THREE.BoxGeometry(6.75, 0.1, 0.3),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: false
    })
  );
  propeller.name = 'Helicopter-Propeller';
  propeller.position.y = 0.55;
  propeller.rotation.y = THREE.MathUtils.degToRad(30);
  propeller.castShadow = true;
  propeller.receiveShadow = true;
  helicopter.add(propeller);

  // Little propeller
  littlePropeller = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 0.1),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: false
    })
  );
  littlePropeller.name = 'Helicopter-LittlePropeller';
  littlePropeller.position.x = 0.35;
  littlePropeller.position.y = 0.2;
  littlePropeller.position.z = -4.5;
  littlePropeller.rotation.x = THREE.MathUtils.degToRad(-30);
  littlePropeller.castShadow = true;
  littlePropeller.receiveShadow = true;
  helicopter.add(littlePropeller);

  // Legs
  const leg1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.225, 2.25),
    new THREE.MeshPhongMaterial({
      color: 0x8e0000,
      wireframe: false
    })
  );
  leg1.name = 'Helicopter-Leg-1';
  leg1.position.x = -0.5;
  leg1.position.y = -0.9;
  leg1.castShadow = true;
  leg1.receiveShadow = true;
  helicopter.add(leg1);

  const leg2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.225, 2.25),
    new THREE.MeshPhongMaterial({
      color: 0x8e0000,
      wireframe: false
    })
  );
  leg2.name = 'Helicopter-Leg-1';
  leg2.position.x = 0.5;
  leg2.position.y = -0.9;
  leg2.castShadow = true;
  leg2.receiveShadow = true;
  helicopter.add(leg2);

  // Leg connectors
  [...Array(4).keys()].map(function (val, i) {
    const connector = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.2875, 0.225),
      new THREE.MeshPhongMaterial({
        color: 0x8e0000,
        wireframe: false
      })
    );
    connector.name = 'Helicopter-LegConnector-' + (i + 1);

    let posX = -0.5;
    let posY = -0.64375;
    let posZ = -0.7;

    if (i === 1 || i === 3) {
      posX = 0.5;
    }
    if (i === 2 || i === 3) {
      posZ = 0.7;
    }

    connector.position.set(posX, posY, posZ);

    connector.castShadow = true;
    connector.receiveShadow = true;

    helicopter.add(connector);
  });

  //
  // UFO OrbitHolder
  //
  ufoOrbitHolder = new THREE.Object3D();
  ufoOrbitHolder.name = 'UFO-Orbit animation';
  ufoOrbitHolder.position.set(0, 38, 0);
  ufoOrbitHolder.add(new THREE.AxesHelper(20));
  scene.add(ufoOrbitHolder);

  //
  // UFO rotation holder
  //
  ufoHolder = new THREE.Object3D();
  ufoHolder.name = 'UFO-Rotation animation';
  ufoHolder.position.set(73, 0, -22);
  ufoHolder.add(new THREE.AxesHelper(30));
  ufoOrbitHolder.add(ufoHolder);

  //
  // UFO
  //
  const ufo = new THREE.Group();
  ufo.name = 'UFO';
  ufoHolder.add(ufo);

  // Roof
  const ufoTop = new THREE.Mesh(
    new THREE.ConeGeometry(5, 2, undefined, undefined, true),
    new THREE.MeshPhongMaterial({
      color: 0x45d8fa,
      wireframe: false
    })
  );
  ufoTop.name = 'UFO-Roof';
  ufoTop.position.y = 1;
  ufoTop.castShadow = true;
  ufoTop.receiveShadow = true;
  ufo.add(ufoTop);

  // UFO Bottom
  const ufoBottom = new THREE.Mesh(
    new THREE.ConeGeometry(5, 2, undefined, undefined, true),
    new THREE.MeshPhongMaterial({
      color: 0x45d8fa,
      wireframe: false
    })
  );
  ufoBottom.name = 'UFO-Bottom';
  ufoBottom.position.y = -1;
  ufoBottom.rotation.z = THREE.MathUtils.degToRad(180);
  ufoBottom.castShadow = true;
  ufoBottom.receiveShadow = true;
  ufo.add(ufoBottom);

  //
  // AmbientLight creation
  //
  aLight = new THREE.AmbientLight(0xff0000, 0.5);
  aLight.name = 'Ambiens fény';
  scene.add(aLight);

  //
  // PointLight creation
  //
  pLight = new THREE.PointLight(0xffffff, 2, 70, 2);
  pLight.name = 'PointLight';
  pLight.position.set(3.6, 21, 23.1);
  scene.add(pLight);
  const plightHelper = new THREE.PointLightHelper(pLight, 2.5);
  plightHelper.name = 'PointLight-Helper';
  scene.add(plightHelper);

  //
  // Spot light creation
  //
  sLight = new THREE.SpotLight(0xffffff, 35, 134, Math.PI / 6, 0.8);
  sLight.name = 'SpotLight';
  sLight.position.set(100, 58, 0);
  sLight.target = stationFundamentum;
  sLight.castShadow = true;
  sLight.shadow.mapSize.width = 128; // Default 512x512
  sLight.shadow.mapSize.height = 128;
  scene.add(sLight);
  slightHelper = new THREE.SpotLightHelper(sLight);
  slightHelper.name = 'SpotLight-Helper';
  scene.add(slightHelper);

  //
  // Sun
  //
  sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xfffe0f,
      wireframe: false
    })
  );
  sun.name = 'Sun';
  sun.position.set(100, 58, 0);
  scene.add(sun);

  //
  // Moon
  //
  const textureLoader = new THREE.TextureLoader(manager);
  const moonTexture = textureLoader.load('assets/texture/moon.jpg');
  const moonMaterial = new THREE.MeshBasicMaterial();
  moonMaterial.map = moonTexture;
  moon = new THREE.Mesh(new THREE.SphereGeometry(5, 15, 15), moonMaterial);
  moon.name = 'Moon';
  moon.position.set(-100, 58, 0);
  moon.visible = false;
  scene.add(moon);

  //
  // Interactive tool initialization
  //
  interactiveTool = new InteractiveTool(scene);

  ////////////////////////////////////
  //    Post Actions and Controls   //
  ////////////////////////////////////

  //
  // Specifying a function that can be called back if the window is resized later
  //
  window.addEventListener('resize', handleWindowResize, false);

  //
  // Camera controll
  //
  controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 5.0;
  controls.panSpeed = 1.0;

  //
  // Camera look at ...
  //
  controls.target = helicopter.position;
}

function handleKeyDown(event) {
  switch (event.keyCode) {
    case 38 /*arrowup*/:
      moveForward = true;
      break;

    case 40 /*arrowdown*/:
      moveBackward = true;
      break;

    case 37 /*arrowleft*/:
      moveLeft = true;
      break;

    case 39 /*arrowright*/:
      moveRight = true;
      break;

    case 87:
      /*W*/ moveUp = true;
      break;
    case 83:
      /*S*/ moveDown = true;
      break;
  }
}

function handleKeyUp(event) {
  switch (event.keyCode) {
    case 38 /*arrowup*/:
      moveForward = false;
      break;

    case 37 /*arrowleft*/:
      moveLeft = false;
      break;

    case 40 /*arrowdown*/:
      moveBackward = false;
      break;

    case 39 /*arrowright*/:
      moveRight = false;
      break;

    case 87:
      /*W*/ moveUp = false;
      break;
    case 83:
      /*S*/ moveDown = false;
      break;

    case 'I'.charCodeAt(0):
      appInfo.style.display = appInfo.style.display === 'none' ? 'block' : 'none';
      hotkeysInfo.style.display = hotkeysInfo.style.display === 'none' ? 'block' : 'none';
      statsContainer.style.display = statsContainer.style.display === 'none' ? 'block' : 'none';
      break;
  }
}

// If the window is resized, the camera projection parameters are recalculated
function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  aspectRatio = WIDTH / HEIGHT;
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  render();
}

function animate() {
  // Request to draw another frame
  // Max. 60 FPS
  requestAnimationFrame(animate);

  // Camera movement control
  controls.update();

  // FPS display update
  stats.update();

  ////////////////////////////////
  // Rotation/Moving of objects //
  ////////////////////////////////

  // Helicopter propellers animation
  propeller.rotation.y += 0.05;
  littlePropeller.rotation.x += 0.2;

  // Helicopter moving
  if (moveForward) {
    helicopter.position.z += 0.1;
  }
  if (moveBackward) {
    helicopter.position.z -= 0.1;
  }
  if (moveLeft) {
    helicopter.position.x += 0.1;
  }
  if (moveRight) {
    helicopter.position.x -= 0.1;
  }
  if (moveUp) {
    helicopter.position.y += 0.1;
  }
  if (moveDown) {
    helicopter.position.y -= 0.1;
  }

  // Update functional GUI params by interactive tool
  const ctrlFunctional = interactiveTool.getFunctionalGuiParams();

  if (ctrlFunctional) {
    // Disable Walls
    if (ctrlFunctional.hasOwnProperty('disableWalls')) {
      getMeshObjects(scene).map((mesh) => {
        mesh.material.wireframe = ctrlFunctional.disableWalls;
      });
    }

    // Illumination
    if (ctrlFunctional.hasOwnProperty('illumination')) {
      if (ctrlFunctional.illumination === 'day') {
        aLight.intensity = 0.5;
        sLight.color.setHex(0xffffff);
        sLight.intensity = 15;
        sLight.position.x = 100;
        slightHelper.update();
        sun.visible = true;
        moon.visible = false;
      } else if (ctrlFunctional.illumination === 'night') {
        aLight.intensity = 0.05;
        sLight.color.setHex(0x6bffff);
        sLight.intensity = 0.5;
        sLight.position.x = -100;
        slightHelper.update();
        sun.visible = false;
        moon.visible = true;
      }
    }

    if (ctrlFunctional.hasOwnProperty('enableSpotLight')) {
      if (ctrlFunctional.enableSpotLight) {
        sLight.visible = true;
      } else {
        sLight.visible = false;
      }
    }

    if (ctrlFunctional.hasOwnProperty('enablePointLight')) {
      if (ctrlFunctional.enablePointLight) {
        pLight.visible = true;
      } else {
        pLight.visible = false;
      }
    }
  }

  // Update objects by interactive tool
  const ctrl = interactiveTool.getGuiParams();
  if (ctrl && ctrl.object) {
    const object = scene.getObjectByName(ctrl.object);

    if (object.type === 'Mesh') {
      object.material.color = new THREE.Color(ctrl.color);
      object.material.wireframe = ctrl.disableWalls;
    }

    object.position.x = ctrl.positionX;
    object.position.y = ctrl.positionY;
    object.position.z = ctrl.positionZ;
    object.rotation.x = THREE.MathUtils.degToRad(ctrl.rotationX);
    object.rotation.y = THREE.MathUtils.degToRad(ctrl.rotationY);
    object.rotation.z = THREE.MathUtils.degToRad(ctrl.rotationZ);
    object.scale.x = ctrl.scaleX;
    object.scale.y = ctrl.scaleY;
    object.scale.z = ctrl.scaleZ;
  }

  // Update animation by interactive tool
  const ctrlAnimation = interactiveTool.getAnimationGuiParams();
  if (ctrlAnimation) {
    // UFO animálása
    ufoOrbitHolder.rotation.y -= ctrlAnimation.orbitSpeed;
    ufoHolder.rotation.y -= ctrlAnimation.rotationalSpeed;
  }

  // Render new frame
  render();
}

function render() {
  renderer.render(scene, camera);
}
