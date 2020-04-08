THREE.DRACOLoader.setDecoderPath('lib/draco/');

var selectedObject;
var selObjMatColor = new THREE.Color();
var origMatColor = new THREE.Color();

var rcObject;
var rcRect;
var rcNeedsUpdate = true;

var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();

function onDocumentMouseMove(event) {
	event.preventDefault();

	if (rcNeedsUpdate) {
		rcRect = event.target.getBoundingClientRect();
		rcNeedsUpdate = false;
	}

	if (rcObject) {
		if (rcObject != selectedObject) {
			rcObject.material.color.copy(origMatColor);
		}
		rcObject = null;
	}

	var intersects = getIntersects(event.offsetX, event.offsetY);
	if (intersects.length > 0) {
		var res = intersects.filter(function (res) {
			return res && res.object;
		})[0];

		if (res && res.object) {
			rcObject = res.object;
			origMatColor.copy(rcObject.material.color);
			rcObject.material.color.set("lime");
		}
	}
}

function getIntersects(x, y) {
	x = (x / rcRect.width) * 2 - 1;
	y = - (y / rcRect.height) * 2 + 1;
	mouseVector.set(x, y, 0.5);
	raycaster.setFromCamera(mouseVector, viewer.activeCamera);
	return raycaster.intersectObject(viewer.content, true);
}

function onCanvasClick() {
	if (rcObject && !selectedObject) {
		selectObject(rcObject);
	} else if (rcObject) {
		selectedObject.material.color.copy(selObjMatColor);
		selectObject(rcObject);
	} else if (selectedObject) {
		selectedObject.material.color.copy(selObjMatColor);
		selectedObject = null;
	}
}

function selectObject(rcObject) {
	selectedObject = rcObject;
	selObjMatColor.copy(origMatColor);
}

function setTexture(diff, norm=null) {
	const diffuse = viewer.textureLoader.load(diff);
	selectedObject.material.map = diffuse;
	if (norm) {
		const normal = viewer.textureLoader.load(norm);
		selectedObject.material.normalMap = normal;
	}
}

const scroll = new SmoothScroll('a[href*="#"]', {
	speed: 280
});

var directLight = new THREE.DirectionalLight(0xffffff, 1);
directLight.name = 'directLight';
directLight.position.set(0, 0, 1);
directLight.lookAt(0, 0, 0);

var viewer = new Viewer(document.getElementById("3d"), {
	'lights': [new THREE.AmbientLight(0x404040, 2), directLight],
	'bgColor': 0x3C93B4
});

viewer.sload("files/armchair.glb");
