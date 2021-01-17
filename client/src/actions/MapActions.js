import { MercatorCoordinate } from 'mapbox-gl';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

let playerLayers = [];
let treeLayers = [];

export const setPlayerLocation = (map, lat, lng) => async dispatch => {

  // parameters to ensure the model is georeferenced correctly on the map
  const modelOrigin = [lng, lat];
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, - Math.PI / 4 + 0.1, 0];

  const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since our 3D model is in real world meters, a scale transform needs to be
    * applied since the CustomLayerInterface expects units in MercatorCoordinates.
    */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
  };
  
  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;

  let labelLayerId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'custom') {
    labelLayerId = layers[i].id;
    break;
    }
  }

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
const customLayer = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
  this.camera = new THREE.Camera();
  this.scene = new THREE.Scene();

  var light = new THREE.AmbientLight(0x404040);
  this.scene.add(light);
   
  // use the three.js GLTF loader to add the player model to the three.js scene
  var loader = new GLTFLoader();
  loader.load(
  './player/scene.gltf',
  function (gltf) {
  this.scene.add(gltf.scene);
  }.bind(this)
  );
  this.map = map;
   
  // use the Mapbox GL JS map canvas for three.js
  this.renderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: gl,
  antialias: true
  });
   
  this.renderer.autoClear = false;
  this.renderer.gammaOutput = true;
  this.renderer.gammaFactor = 2.2;
  },
  render: function (gl, matrix) {
  var rotationX = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(1, 0, 0),
  modelTransform.rotateX
  );
  var rotationY = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 1, 0),
  modelTransform.rotateY
  );
  var rotationZ = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 0, 1),
  modelTransform.rotateZ
  );
   
  var m = new THREE.Matrix4().fromArray(matrix);
  var l = new THREE.Matrix4()
  .makeTranslation(
  modelTransform.translateX,
  modelTransform.translateY,
  modelTransform.translateZ
  )
  .scale(
  new THREE.Vector3(
  modelTransform.scale,
  -modelTransform.scale,
  modelTransform.scale
  )
  )
  .multiply(rotationX)
  .multiply(rotationY)
  .multiply(rotationZ);
   
  this.camera.projectionMatrix = m.multiply(l);
  this.renderer.state.reset();
  this.renderer.render(this.scene, this.camera);
  this.map.triggerRepaint();
  }
  };

    console.log('HERE');

  try {
    clearMap();
    map.addLayer(customLayer, labelLayerId);
    playerLayers.push(customLayer.id);
    window.map = map;
  }
  catch (error) {
    console.log('error')
  }
}

export const loadTrees = (map, pines, birches, daisies) => {
  console.log('load');
  for (let i = 0; i < pines.length; i++) {
    const tree = pines[i];
    addPine(map, tree[0], tree[1]);
  }
  for (let i = 0; i < birches.length; i++) {
    const tree = birches[i];
    addBirch(map, tree[0], tree[1]);
  }
  for (let i = 0; i < daisies.length; i++) {
    const tree = daisies[i];
    addDaisy(map, tree[0], tree[1]);
  }
}

const addPine = (map, lat, lng) => {
  // parameters to ensure the model is georeferenced correctly on the map
  const modelOrigin = [lng, lat];
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, - Math.PI / 4 + 0.1, 0];

  const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since our 3D model is in real world meters, a scale transform needs to be
    * applied since the CustomLayerInterface expects units in MercatorCoordinates.
    */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 30
  };

  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;

  let labelLayerId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'custom') {
    labelLayerId = layers[i].id;
    break;
    }
  }

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
  id: 'tree' + lng.toString() + lat.toString(),
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
  this.camera = new THREE.Camera();
  this.scene = new THREE.Scene();

  // create two three.js lights to illuminate the model
var directionalLight = new THREE.DirectionalLight(0xc0c0c0);
directionalLight.position.set(0, -70, 100).normalize();
this.scene.add(directionalLight);
 
var directionalLight2 = new THREE.DirectionalLight(0xc0c0c0);
directionalLight2.position.set(0, 70, 100).normalize();
this.scene.add(directionalLight2);
  
  // use the three.js GLTF loader to add the player model to the three.js scene
  var loader = new GLTFLoader();
  loader.load(
  './pine_tree/scene.gltf',
  function (gltf) {
  gltf.scene.rotation.y = Math.random() * 2 * Math.PI;
  this.scene.add(gltf.scene);
  }.bind(this)
  );
  this.map = map;
  
  // use the Mapbox GL JS map canvas for three.js
  this.renderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: gl,
  antialias: true
  });
  
  this.renderer.autoClear = false;
  this.renderer.gammaOutput = true;
  this.renderer.gammaFactor = 22;
  },
  render: function (gl, matrix) {
  var rotationX = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(1, 0, 0),
  modelTransform.rotateX
  );
  var rotationY = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 1, 0),
  modelTransform.rotateY
  );
  var rotationZ = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 0, 1),
  modelTransform.rotateZ
  );
  
  var m = new THREE.Matrix4().fromArray(matrix);
  var l = new THREE.Matrix4()
  .makeTranslation(
  modelTransform.translateX,
  modelTransform.translateY,
  modelTransform.translateZ
  )
  .scale(
  new THREE.Vector3(
  modelTransform.scale,
  -modelTransform.scale,
  modelTransform.scale
  )
  )
  .multiply(rotationX)
  .multiply(rotationY)
  .multiply(rotationZ);
  
  this.camera.projectionMatrix = m.multiply(l);
  this.renderer.state.reset();
  this.renderer.render(this.scene, this.camera);
  this.map.triggerRepaint();
  }
  };

  try {
    map.addLayer(customLayer, labelLayerId);
    treeLayers.push(customLayer.id);
    window.map = map;
  }
  catch (error) {
    console.log('error')
  }
}

const addBirch = (map, lat, lng) => {
  // parameters to ensure the model is georeferenced correctly on the map
  const modelOrigin = [lng, lat];
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, - Math.PI / 4 + 0.1, 0];

  const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since our 3D model is in real world meters, a scale transform needs to be
    * applied since the CustomLayerInterface expects units in MercatorCoordinates.
    */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 30
  };

  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;

  let labelLayerId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'custom') {
    labelLayerId = layers[i].id;
    break;
    }
  }

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
  id: 'birch' + lng.toString() + lat.toString(),
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
  this.camera = new THREE.Camera();
  this.scene = new THREE.Scene();

  // create two three.js lights to illuminate the model
var directionalLight = new THREE.DirectionalLight(0xc0c0c0);
directionalLight.position.set(0, -70, 100).normalize();
this.scene.add(directionalLight);
 
var directionalLight2 = new THREE.DirectionalLight(0xc0c0c0);
directionalLight2.position.set(0, 70, 100).normalize();
this.scene.add(directionalLight2);
  
  // use the three.js GLTF loader to add the player model to the three.js scene
  var loader = new GLTFLoader();
  loader.load(
  './birch_tree/scene.gltf',
  function (gltf) {
  gltf.scene.rotation.y = Math.random() * 2 * Math.PI;
  gltf.scene.position.x -= 20;
  this.scene.add(gltf.scene);
  }.bind(this)
  );
  this.map = map;
  
  // use the Mapbox GL JS map canvas for three.js
  this.renderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: gl,
  antialias: true
  });
  
  this.renderer.autoClear = false;
  this.renderer.gammaOutput = true;
  this.renderer.gammaFactor = 22;
  },
  render: function (gl, matrix) {
  var rotationX = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(1, 0, 0),
  modelTransform.rotateX
  );
  var rotationY = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 1, 0),
  modelTransform.rotateY
  );
  var rotationZ = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 0, 1),
  modelTransform.rotateZ
  );
  
  var m = new THREE.Matrix4().fromArray(matrix);
  var l = new THREE.Matrix4()
  .makeTranslation(
  modelTransform.translateX,
  modelTransform.translateY,
  modelTransform.translateZ
  )
  .scale(
  new THREE.Vector3(
  modelTransform.scale,
  -modelTransform.scale,
  modelTransform.scale
  )
  )
  .multiply(rotationX)
  .multiply(rotationY)
  .multiply(rotationZ);
  
  this.camera.projectionMatrix = m.multiply(l);
  this.renderer.state.reset();
  this.renderer.render(this.scene, this.camera);
  this.map.triggerRepaint();
  }
  };

  try {
    map.addLayer(customLayer, labelLayerId);
    treeLayers.push(customLayer.id);
    window.map = map;
  }
  catch (error) {
    console.log('error')
  }
}


const addDaisy = (map, lat, lng) => {
  // parameters to ensure the model is georeferenced correctly on the map
  const modelOrigin = [lng, lat];
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, - Math.PI / 4 + 0.1, 0];

  const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since our 3D model is in real world meters, a scale transform needs to be
    * applied since the CustomLayerInterface expects units in MercatorCoordinates.
    */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 30
  };

  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;

  let labelLayerId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'custom') {
    labelLayerId = layers[i].id;
    break;
    }
  }

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
  id: 'tree' + lng.toString() + lat.toString(),
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
  this.camera = new THREE.Camera();
  this.scene = new THREE.Scene();

  // create two three.js lights to illuminate the model
var directionalLight = new THREE.DirectionalLight(0xc0c0c0);
directionalLight.position.set(0, -70, 100).normalize();
this.scene.add(directionalLight);
 
var directionalLight2 = new THREE.DirectionalLight(0xc0c0c0);
directionalLight2.position.set(0, 70, 100).normalize();
this.scene.add(directionalLight2);
  
  // use the three.js GLTF loader to add the player model to the three.js scene
  var loader = new GLTFLoader();
  loader.load(
  './daisy_tree/scene.gltf',
  function (gltf) {
  gltf.scene.rotation.y = Math.random() * 2 * Math.PI;
  this.scene.add(gltf.scene);
  }.bind(this)
  );
  this.map = map;
  
  // use the Mapbox GL JS map canvas for three.js
  this.renderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: gl,
  antialias: true
  });
  
  this.renderer.autoClear = false;
  this.renderer.gammaOutput = true;
  this.renderer.gammaFactor = 22;
  },
  render: function (gl, matrix) {
  var rotationX = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(1, 0, 0),
  modelTransform.rotateX
  );
  var rotationY = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 1, 0),
  modelTransform.rotateY
  );
  var rotationZ = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 0, 1),
  modelTransform.rotateZ
  );
  
  var m = new THREE.Matrix4().fromArray(matrix);
  var l = new THREE.Matrix4()
  .makeTranslation(
  modelTransform.translateX,
  modelTransform.translateY,
  modelTransform.translateZ
  )
  .scale(
  new THREE.Vector3(
  modelTransform.scale,
  -modelTransform.scale,
  modelTransform.scale
  )
  )
  .multiply(rotationX)
  .multiply(rotationY)
  .multiply(rotationZ);
  
  this.camera.projectionMatrix = m.multiply(l);
  this.renderer.state.reset();
  this.renderer.render(this.scene, this.camera);
  this.map.triggerRepaint();
  }
  };

  try {
    map.addLayer(customLayer, labelLayerId);
    treeLayers.push(customLayer.id);
    window.map = map;
  }
  catch (error) {
    console.log('error')
  }
}

const clearMap = () => {
  const map = window.map;

  for (let i = 0; i < playerLayers.length; i++) {
    map.removeLayer(playerLayers[i]);
  }

  playerLayers = [];
}