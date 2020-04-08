var f, w;
var selectedWall;
var selectedFloor;

var directLight = new THREE.DirectionalLight(0xfff2dd, 1);
directLight.name = 'directLight';
directLight.position.set(0, 0, 6);
directLight.lookAt(0, 0, 0);

var viewer = new Viewer(document.getElementById('3d'), {
  'type': 'ORBIT',
  'lights': [new THREE.AmbientLight(0x404040), directLight],
  'bgColor': 0xF7E1D7
});

viewer.sload('files/room.glb').then((result) => {
  viewer.setEnvironment('assets/environment/SwedishRoyalCastle/', '.jpg');
  w = viewer.content.getObjectByName('Cube.001_1');
  f = viewer.content.getObjectByName('Cube.001_2');
});

function setTexture(obj, diff, norm, repeat) {
  viewer.textureLoader.load(diff, function(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repeat, repeat);
    obj.material.map = map;
  });

  viewer.textureLoader.load(norm, function(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    obj.material.normalMap = map;
  });
}

function selectWall(e) {
  if (selectedWall) {
    selectedWall.classList.remove('selected');
  }

  const el = e.target.classList.contains('item') ? e.target : e.target.parentElement;

  el.classList.add('selected');
  selectedWall = el;

  setTexture(w, 'files/preview/w' + el.dataset.t + 'd.jpg',
    'files/preview/w' + el.dataset.t + 'n.jpg', el.dataset.r);
}

function selectFloor(e) {
  if (selectedFloor) {
    selectedFloor.classList.remove('selected');
  }

  const el = e.target.classList.contains('item') ? e.target : e.target.parentElement;

  el.classList.add('selected');
  selectedFloor = el;

  setTexture(f, 'files/preview/f' + el.dataset.t + 'd.jpg',
    'files/preview/f' + el.dataset.t + 'n.jpg', el.dataset.r);
}

document.getElementById('wall1').addEventListener('click', selectWall);
document.getElementById('wall2').addEventListener('click', selectWall);
document.getElementById('wall3').addEventListener('click', selectWall);
document.getElementById('floor1').addEventListener('click', selectFloor);
document.getElementById('floor2').addEventListener('click', selectFloor);
document.getElementById('floor3').addEventListener('click', selectFloor);
