'use strict';

import * as THREE from 'three';
import { GUI } from 'gui';
import { getMeshObjects } from 'helper';

export default class InteractiveTool {
  constructor(scene) {
    this.scene = scene;

    // Interactive tool parameters
    this._guiParams = {
      rotationX: 0.0,
      rotationY: 0.0,
      rotationZ: 0.0,
      positionX: 0.0,
      positionY: 0.0,
      positionZ: 0.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      color: 0xffffff,
      object: null,
      disableWalls: false,
      reset: function () {
        this.rotationX = 0.0;
        this.rotationY = 0.0;
        this.rotationZ = 0.0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.scaleZ = 1.0;
        this.positionX = 0.0;
        this.positionY = 0.0;
        this.positionZ = 0.0;
        this.disableWalls = false;
      }
    };

    this._animationGuiParams = {
      orbitSpeed: 0.01,
      rotationalSpeed: 0.01,
      reset: function () {
        this.orbitSpeed = 0.01;
        this.rotationalSpeed = 0.01;
      }
    };

    this._functionalGuiParams = {
      disableWalls: false,
      illumination: 'day',
      enableSpotLight: true,
      enablePointLight: true,
      reset: function () {
        this.disableWalls = false;
        this.illumination = 'day';
        this.enableSpotLight = true;
        this.enablePointLight = true;
      }
    };

    // Insert interactive tool container into DOM
    this._placeContainer();

    // Size of Close Controls
    this._closeControlsHeight = 20;
  }

  _placeContainer() {
    this._container = document.createElement('div');
    this._container.setAttribute('id', 'interactive-tool-container');
    this._container.style.position = 'absolute';
    this._container.style.top = '0px';
    this._container.style.right = '0px';
    document.body.appendChild(this._container);
  }

  // Interactive tool initialization
  addControlGui() {
    let gui = new GUI({ autoPlace: false });
    // .listen() -> if the value of the variable can be changed from program code, not only by interaction
    gui
      .add(
        this._guiParams,
        'object',
        this._getMeshObjects().map(function (item) {
          return item.name;
        })
      )
      .name('Object')
      .onChange((objId) => {
        this._setGuiParamsToObject(objId);
      });
    gui.add(this._guiParams, 'scaleX', 0, 3).step(0.01).listen();
    gui.add(this._guiParams, 'scaleY', 0, 3).step(0.01).listen();
    gui.add(this._guiParams, 'scaleZ', 0, 3).step(0.01).listen();
    gui.add(this._guiParams, 'rotationX', -180, 180).step(0.1).listen();
    gui.add(this._guiParams, 'rotationY', -180, 180).step(0.1).listen();
    gui.add(this._guiParams, 'rotationZ', -180, 180).step(0.1).listen();
    gui.add(this._guiParams, 'positionX', -100, 100).step(0.1).listen();
    gui.add(this._guiParams, 'positionY', -100, 100).step(0.1).listen();
    gui.add(this._guiParams, 'positionZ', -100, 100).step(0.1).listen();
    gui.addColor(this._guiParams, 'color').listen();
    gui.add(this._guiParams, 'disableWalls').name('Disable Walls').listen();
    gui.add(this._guiParams, 'reset').name('Reset');

    this._placeControlGui(gui);

    // Setting initial values according to the parameters of the default object
    this._setGuiParamsToObject(this._guiParams.object);
  }

  _setGuiParamsToObject(id) {
    if (id) {
      const object = this.scene.getObjectByName(id);

      if (object.type === 'Mesh') {
        this._guiParams.color = object.material.color.getHex();
        this._guiParams.disableWalls = object.material.wireframe;
      }

      this._guiParams.positionX = object.position.x;
      this._guiParams.positionY = object.position.y;
      this._guiParams.positionZ = object.position.z;
      this._guiParams.rotationX = THREE.MathUtils.radToDeg(object.rotation.x);
      this._guiParams.rotationY = THREE.MathUtils.radToDeg(object.rotation.y);
      this._guiParams.rotationZ = THREE.MathUtils.radToDeg(object.rotation.z);
      this._guiParams.scaleX = object.scale.x;
      this._guiParams.scaleY = object.scale.y;
      this._guiParams.scaleZ = object.scale.z;
    }
  }

  setDefaultGuiParamsByObject(index) {
    let object;

    if (typeof index === 'undefined') {
      object = this._getMeshObjectByIndex(0);
    } else if (typeof index === 'string' && index !== '') {
      object = this._getTargetObjectById(index);
    }

    if (object) {
      this._guiParams.object = object.name;

      if (object.type === 'Mesh') {
        this._guiParams.color = object.material.color.getHex();
        this._guiParams.disableWalls = object.material.wireframe;
      }
    }
  }

  getGuiParams() {
    return JSON.parse(JSON.stringify(this._guiParams));
  }

  addAnimationControlGui() {
    let gui = new GUI({ autoPlace: false });
    gui
      .add(this._animationGuiParams, 'orbitSpeed', 0, 0.1)
      .step(0.001)
      .name('Circulation speed')
      .listen();
    gui
      .add(this._animationGuiParams, 'rotationalSpeed', 0, 0.1)
      .step(0.001)
      .name('Rotational speed')
      .listen();
    gui.add(this._animationGuiParams, 'reset').name('Reset');
    this._placeControlGui(gui);
  }

  getAnimationGuiParams() {
    return JSON.parse(JSON.stringify(this._animationGuiParams));
  }

  addFunctionalControlGui() {
    let gui = new GUI({ autoPlace: false });
    gui.add(this._functionalGuiParams, 'disableWalls').name('Disable Walls').listen();
    gui
      .add(this._functionalGuiParams, 'illumination', ['day', 'night'])
      .name('Illumination')
      .listen();
    gui.add(this._functionalGuiParams, 'enableSpotLight').name('Spot light').listen();
    gui.add(this._functionalGuiParams, 'enablePointLight').name('PointLight').listen();
    gui.add(this._functionalGuiParams, 'reset').name('Reset');

    this._placeControlGui(gui);
  }

  getFunctionalGuiParams() {
    return JSON.parse(JSON.stringify(this._functionalGuiParams));
  }

  _placeControlGui(gui) {
    gui.domElement.style.paddingBottom = this._closeControlsHeight + 'px';
    this._container.appendChild(gui.domElement);
  }

  _getMeshObjects() {
    return getMeshObjects(this.scene, true);
  }

  _getMeshObjectByIndex(index) {
    const objects = this._getMeshObjects();
    if (objects && objects.length) {
      return objects[index];
    }
  }

  _getTargetObjectById(id) {
    const objects = this._getMeshObjects();
    if (objects && objects.length) {
      return objects.find((obj) => obj.name === id);
    }
  }
}
