const DEFAULT_CAMERA = '[default]';
const MAP_NAMES = [
  'map',
  'aoMap',
  'emissiveMap',
  'glossinessMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
];

class Viewer {
  constructor(canvas, options) {
    this.el = canvas;
	  this.textureLoader = new THREE.TextureLoader();

    this.lights = [];
    this.content = null;
    this.mixer = null;
    this.clips = [];
    this.gui = null;
    this.options = options;

    this.state = {
      background: false,
      playbackSpeed: 1.0,
      actionStates: {},
      camera: DEFAULT_CAMERA,
      wireframe: false,
      skeleton: false,
      grid: false,

      addLights: true,
      exposure: 1.0,
      textureEncoding: 'sRGB',
      ambientIntensity: 0.3,
      ambientColor: 0xFFFFFF,
      directIntensity: 0.8 * Math.PI,
      directColor: 0xFFFFFF,
      bgColor1: '#fdcbf1',
      bgColor2: '#e6dee9'
    };

    this.prevTime = 0;
    this.scene = new THREE.Scene();

    const fov = 75;
    this.defaultCamera = new THREE.PerspectiveCamera(fov, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
    this.activeCamera = this.defaultCamera;
    this.scene.add(this.defaultCamera);

    this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.5;
    const clearColor = options.bgColor || 0x383838;
    this.renderer.setClearColor(clearColor);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    switch (options.type) {
      case 'ORBIT':
        this.controls = new THREE.OrbitControls(this.defaultCamera, this.el);
        this.controls.rotateSpeed = 0.5;
        this.controls.screenSpacePanning = true;
        this.controls.enableDamping = true;
        this.controls.dynamicDampingFactor = 0.13;
        break;
      case 'EDITOR':
        this.controls = new THREE.TrackballControls(this.defaultCamera, this.el);
        this.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        this.controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        this.controls.rotateSpeed = 2;
        this.controls.dynamicDampingFactor = 1;
        this.controls.zoomSpeed = 1;
        this.controls.noPan = true;
        break;
      default:
        this.controls = new THREE.TrackballControls(this.defaultCamera, this.el);
        this.controls.dynamicDampingFactor = 0.13;
        this.controls.noPan = true;
    }

    this.cameraCtrl = null;
    this.cameraFolder = null;
    this.animFolder = null;
    this.animCtrls = [];
    this.morphFolder = null;
    this.morphCtrls = [];
    this.skeletonHelpers = [];
    this.gridHelper = null;
    this.axesHelper = null;

    THREE.RectAreaLightUniformsLib.init();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
    window.addEventListener('resize', this.resize.bind(this), false);
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    const dt = (time - this.prevTime) / 1000;
    this.controls.update();
    this.mixer && this.mixer.update(dt);
    this.render();

    this.prevTime = time;
  }

  render() {
    this.renderer.render(this.scene, this.activeCamera);
  }

  resize() {
    const {clientHeight, clientWidth} = this.el;
    this.renderer.setSize(clientWidth, clientHeight, false);
    this.defaultCamera.aspect = clientWidth / clientHeight;
    this.defaultCamera.updateProjectionMatrix();
  }

  load(url, rootPath, assetMap) {
    const baseURL = THREE.LoaderUtils.extractUrlBase(url);

    return new Promise((resolve, reject) => {
      const manager = new THREE.LoadingManager();

      manager.setURLModifier((url, path) => {
        const normalizedURL = rootPath + url
          .replace(baseURL, '')
          .replace(/^(\.?\/)/, '');

        if (assetMap.has(normalizedURL)) {
          const blob = assetMap.get(normalizedURL);
          const blobURL = URL.createObjectURL(blob);
          blobURLs.push(blobURL);
          return blobURL;
        }

        return (path || '') + url;
      });

      const loader = new THREE.GLTFLoader(manager);
      loader.setCrossOrigin('anonymous');
      const blobURLs = [];

      loader.load(url, (gltf) => {
        const scene = gltf.scene || gltf.scenes[0];
        const clips = gltf.animations || [];
        this.setContent(scene, clips);
        blobURLs.forEach(URL.revokeObjectURL);
        resolve(gltf);
      }, undefined, reject);
    });
  }

  sload(url) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      THREE.DRACOLoader.setDecoderPath('draco');
      loader.setDRACOLoader(new THREE.DRACOLoader());
      loader.load(url, (gltf) => {
        const scene = gltf.scene || gltf.scenes[0];
        const clips = gltf.animations || [];
        this.setContent(scene, clips);
        resolve(gltf);
      }, undefined, reject);
    });
  }

  setContent(object, clips) {
    this.clear();

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    this.controls.reset();

    object.position.x += (object.position.x - center.x);
    object.position.y += (object.position.y - center.y);
    object.position.z += (object.position.z - center.z);
    this.controls.maxDistance = size * 10;
    this.defaultCamera.near = size / 100;
    this.defaultCamera.far = size * 100;
    this.defaultCamera.updateProjectionMatrix();

    this.defaultCamera.position.copy(center);
    this.defaultCamera.position.x += size / 2.0;
    this.defaultCamera.position.y += size / 5.0;
    this.defaultCamera.position.z += size / 2.0;
    this.defaultCamera.lookAt(center);

    this.setCamera(DEFAULT_CAMERA);
    this.scene.add(object);
    this.content = object;
    this.state.addLights = true;
    this.content.traverse((node) => {
      if (node.isLight) {
        this.state.addLights = false;
      }
    });

    this.setClips(clips);
    this.updateLights();
    this.updateTextureEncoding();
    this.updateDisplay();
  }

  printGraph(node) {
    console.group(' <' + node.type + '> ' + node.name);
    node.children.forEach((child) => this.printGraph(child));
    console.groupEnd();
  }

  setClips(clips) {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mixer.getRoot());
      this.mixer = null;
    }

    this.clips = clips;
    if (!clips.length) return;

    this.mixer = new THREE.AnimationMixer( this.content );
  }

  playAllClips() {
    this.clips.forEach((clip) => {
      this.mixer.clipAction(clip).reset().play();
      this.state.actionStates[clip.name] = true;
    });
  }

  setCamera(name) {
    if (name === DEFAULT_CAMERA) {
      this.controls.enabled = true;
      this.activeCamera = this.defaultCamera;
    } else {
      this.controls.enabled = false;
      this.content.traverse((node) => {
        if (node.isCamera && node.name === name) {
          this.activeCamera = node;
        }
      });
    }
  }

  updateTextureEncoding() {
    const encoding = this.state.textureEncoding === 'sRGB'
      ? THREE.sRGBEncoding
      : THREE.LinearEncoding;
    this.traverseMaterials(this.content, (material) => {
      if (material.map) material.map.encoding = encoding;
      if (material.emissiveMap) material.emissiveMap.encoding = encoding;
      if (material.map || material.emissiveMap) material.needsUpdate = true;
    });
  }

  updateLights() {
    const state = this.state;
    const lights = this.lights;

    if (state.addLights && !lights.length) {
      this.addLights(this.options.lights);
    } else if (!state.addLights && lights.length) {
      this.removeLights();
    }

    this.renderer.toneMappingExposure = state.exposure;

    if (lights.length === 2) {
      lights[0].intensity = state.ambientIntensity;
      lights[0].color.setHex(state.ambientColor);
      lights[1].intensity = state.directIntensity;
      lights[1].color.setHex(state.directColor);
    }
  }

  addLights(userLights) {
    if (userLights) {
      userLights.forEach((light) => {
        this.defaultCamera.add(light);
        this.lights.push(light);
      })
    } else {
      const ambient  = new THREE.AmbientLight(0x404040);
      this.defaultCamera.add(ambient);
    	this.lights.push(ambient);
    }
  }

  removeLights() {
    this.lights.forEach((light) => light.parent.remove(light));
    this.lights.length = 0;
  }

  setEnvironment(path, format) {
    this.getCubeMapTexture(path, format).then(({envMap, cubeMap}) => {
      if (this.state.background && this.activeCamera === this.defaultCamera) {
        this.scene.add(this.background);
      } else {
        this.scene.remove(this.background);
      }

      this.traverseMaterials(this.content, (material) => {
        if (material.isMeshStandardMaterial || material.isGLTFSpecularGlossinessMaterial) {
          material.envMap = envMap;
          material.needsUpdate = true;
        }
      });

      this.scene.background = this.state.background ? cubeMap : null;
    });
  }

  getCubeMapTexture(path, format) {
    if (!path) return Promise.resolve({envMap: null, cubeMap: null});

    const cubeMapURLs = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ];

    if (format === '.hdr') {
      return new Promise((resolve) => {
        new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, cubeMapURLs, ( hdrCubeMap ) => {

          var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
          pmremGenerator.update( this.renderer );

          var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
          pmremCubeUVPacker.update( this.renderer );

          resolve( {
            envMap: pmremCubeUVPacker.CubeUVRenderTarget.texture,
            cubeMap: hdrCubeMap
          } );
        } );
      });
    }

    const envMap = new THREE.CubeTextureLoader().load(cubeMapURLs);
    envMap.format = THREE.RGBFormat;
    return Promise.resolve( { envMap, cubeMap: envMap } );
  }

  updateDisplay() {
    if (this.skeletonHelpers.length) {
      this.skeletonHelpers.forEach((helper) => this.scene.remove(helper));
    }

    this.traverseMaterials(this.content, (material) => {
      material.wireframe = this.state.wireframe;
    });

    this.content.traverse((node) => {
      if (node.isMesh && node.skeleton && this.state.skeleton) {
        const helper = new THREE.SkeletonHelper(node.skeleton.bones[0].parent);
        helper.material.linewidth = 3;
        this.scene.add(helper);
        this.skeletonHelpers.push(helper);
      }
    });

    if (this.state.grid !== Boolean(this.gridHelper)) {
      if (this.state.grid) {
        this.gridHelper = new THREE.GridHelper();
        this.axesHelper = new THREE.AxesHelper();
        this.axesHelper.renderOrder = 999;
        this.axesHelper.onBeforeRender = (renderer) => renderer.clearDepth();
        this.scene.add(this.gridHelper);
        this.scene.add(this.axesHelper);
      } else {
        this.scene.remove(this.gridHelper);
        this.scene.remove(this.axesHelper);
        this.gridHelper = null;
        this.axesHelper = null;
      }
    }
  }

  updateBackground() {
    this.background.style({colors: [this.state.bgColor1, this.state.bgColor2]});
  }

  clear() {
    if ( !this.content ) return;
    this.scene.remove( this.content );

    this.content.traverse((node) => {
      if ( !node.isMesh ) return;
      node.geometry.dispose();
    });

    this.traverseMaterials(this.content, (material) => {
      MAP_NAMES.forEach((map) => {
        if (material[map]) material[map].dispose();
      });
    });
  }

  traverseMaterials(object, callback) {
    object.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach(callback);
    });
  }
};
