define(function(){
	

	var canvas = document.createElement('canvas');
	canvas.width = 320;
	canvas.height = 240;
	document.body.appendChild(canvas);

	var videoCanvas = document.createElement('canvas');
	videoCanvas.width = video.width;
	videoCanvas.height = video.width * 3 / 4;

	var ctx = canvas.getContext('2d');
	ctx.font = "24px URW Gothic L, Arial, Sans-serif";
	
	// AR
	var raster = new NyARRgbRaster_Canvas2D(canvas),
		param = new FLARParam(320, 240),
		// Create a NyARTransMatResult object for getting the marker translation matrices.
		resultMat = new NyARTransMatResult(),
		detector = new FLARMultiIdMarkerDetector(param, 120);
	
	detector.setContinueMode(true);
	
	var tmp = new Float32Array(16);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(960, 720);
	var glCanvas = renderer.domElement;
	var s = glCanvas.style;
	document.body.appendChild(glCanvas);
	var scene = new THREE.Scene();
	var light = new THREE.PointLight(0xffffff);
	light.position.set(400, 500, 100);
	scene.add(light);
	var light = new THREE.PointLight(0xffffff);
	light.position.set(-400, -500, -100);
	scene.add(light);
	var camera = new THREE.Camera();
	scene.add(camera);
	param.copyCameraMatrix(tmp, 10, 10000);
	camera.projectionMatrix.setFromArray(tmp);
	var videoTex = new THREE.Texture(videoCanvas);
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 0), new THREE.MeshBasicMaterial({
		map: videoTex
	}));
	plane.material.depthTest = false;
	plane.material.depthWrite = false;
	var videoCam = new THREE.Camera();
	var videoScene = new THREE.Scene();
	videoScene.add(plane);
	videoScene.add(videoCam);
	var times = [];
	var markers = {};


	setInterval(function() {

		// Draw the video frame to the raster canvas, scaled to 320x240.
		videoCanvas.getContext('2d').drawImage(video, 0, 0);
		ctx.drawImage(videoCanvas, 0, 0, 320, 240);

		// var dt = new Date().getTime();
		// Tell the raster object that the underlying canvas has changed.
		canvas.changed = true;
		videoTex.needsUpdate = true;

		var t = new Date();

		// Do marker detection by using the detector object on the raster object.
		// The threshold parameter determines the threshold value
		// for turning the video frame into a 1-bit black-and-white image.
		var detected = detector.detectMarkerLite(raster, threshold);
		// Go through the detected markers and get their IDs and transformation matrices.
		for(var idx = 0; idx < detected; idx++) {
			// Get the ID marker data for the current marker.
			// ID markers are special kind of markers that encode a number.
			// The bytes for the number are in the ID marker data.
			var id = detector.getIdMarkerData(idx);
			// Read bytes from the id packet.
			var currId;

			// This code handles only 32-bit numbers or shorter.
			if(id.packetLength > 4) {
				currId = -1;
			} else {
				currId = 0;
				for(var i = 0; i < id.packetLength; i++) {
					currId = (currId << 8) | id.getPacketData(i);
				}
			}
			if(!markers[currId]) {
				markers[currId] = {};
			}
			// Get the transformation matrix for the detected marker.
			detector.getTransformMatrix(idx, resultMat);
			markers[currId].age = 0;
			markers[currId].transform = Object.asCopy(resultMat);
		}
		for(var i in markers) {
			var r = markers[i];
			if(r.age > 1) {
				delete markers[i];
				scene.remove(r.model);
			}
			r.age++;
		}
		for(var i in markers) {
			var m = markers[i];
			if(!m.model) {
				m.model = new THREE.Object3D();
				var cube = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), new THREE.MeshLambertMaterial({
					color: 0 | (0xffffff * Math.random())
				}));
				cube.position.z = -50;
				cube.doubleSided = true;
				m.model.matrixAutoUpdate = false;
				m.model.add(cube);
				scene.add(m.model);
			}
			copyMatrix(m.transform, tmp);
			m.model.matrix.setFromArray(tmp);
			m.model.matrixWorldNeedsUpdate = true;
		}
		renderer.autoClear = false;
		renderer.clear();
		renderer.render(videoScene, videoCam);
		renderer.render(scene, camera);
	}, 15);


	THREE.Matrix4.prototype.setFromArray = function(m) {
		return this.set(m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]);
	};

	function copyMatrix(mat, cm) {
		cm[0] = mat.m00;
		cm[1] = -mat.m10;
		cm[2] = mat.m20;
		cm[3] = 0;
		cm[4] = mat.m01;
		cm[5] = -mat.m11;
		cm[6] = mat.m21;
		cm[7] = 0;
		cm[8] = -mat.m02;
		cm[9] = mat.m12;
		cm[10] = -mat.m22;
		cm[11] = 0;
		cm[12] = mat.m03;
		cm[13] = -mat.m13;
		cm[14] = mat.m23;
		cm[15] = 1;
	}




});