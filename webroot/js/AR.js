define('AR', ["libs/JSARToolKit", "libs/three", "libs/threex.jsartoolkit"], function() {


	// const
	AR.SCREEN_WIDTH = 640;
	AR.SCREEN_HEIGHT = 480;
	AR.MAX_AR_ELEMENTS = 7;
	AR.DURATION = 1000;
	AR.KEYFRAMES = 14;
	AR.INTERPOLATION = AR.DURATION / AR.KEYFRAMES;
	AR.THRESHOLD = 50//128;

	function AR(container, stats) {

		var	// webcam
			video,
			// threejs
			renderer,
			scene,
			camera,
			videoTexture,
			videoScene,
			videoCamera,
			// objects
			mesh,
			// ar
			threexAR,
			markers;

		var ARElement = 1,
			lastKeyframe = 0,
			currentKeyframe = 0;


		// initialization
		initWebGL();
		createWebCamVideo();
		initWebCam();
		createVideo3D();
		initAR();

		/* * * * * * * * * * * * * * * * * ** * * * * * *
		 *                                              *
		 *   INIT FUNCTIONS                             * 
		 *                                              *
		 * * * * * * * * * * * * * * * * * ** * * * * * */

		/**
		 * Create renderer, scene, light, camera for 3D
		 */
		function initWebGL() {

			// Create webgl renderer
			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setSize(AR.SCREEN_WIDTH, AR.SCREEN_HEIGHT);
			container.appendChild(renderer.domElement);

			// create scene
			scene = new THREE.Scene();

			// light 1
			var ambient = new THREE.AmbientLight( 0x222222 );
			scene.add( ambient );
			// light 2
			var light = new THREE.DirectionalLight( 0xffffff, 1.65 );
			light.position.set( 0, 140, 500 );
			light.position.multiplyScalar( 1.1 );
			scene.add( light );
			light.castShadow = false;

			// camera
			camera = new THREE.PerspectiveCamera(35, renderer.domElement.width / renderer.domElement.height, 1, 10000);
			camera.position.set(0, 0, 0);
			scene.add(camera);
		}

		/**
		 * Create the video dom element for the webcam
		 */
		function createWebCamVideo() {
			video = document.createElement("video");
			video.width = AR.SCREEN_WIDTH;
			video.height = AR.SCREEN_HEIGHT;
			video.loop = true;
			video.volume = 0;
			video.autoplay = true;
		}

		/**
		 * Init WebCam using getUserMedia
		 */
		function initWebCam() {

			var url = window.URL || window.webkitURL,
				createObjectURL = url.createObjectURL || url.createObjectURL;
			if (!url || !createObjectURL) throw new Error("Can't init User Media");
			// getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

			navigator.webkitGetUserMedia(
				{video:true},
				function(stream) {
					video.src = createObjectURL(stream);
				},
				function(error) {
					throw new Error("User Media Initialisation Error");
				}
			);
		}

		/**
		 * Create 3d plane for video out
		 */
		function createVideo3D() {
			videoTexture = new THREE.Texture(video);
			var geometry = new THREE.PlaneGeometry(2, 2, 0);
			var material = new THREE.MeshBasicMaterial({
				map: videoTexture,
				depthTest: false,
				depthWrite: false
			});
			var plane = new THREE.Mesh(geometry, material);
			videoScene = new THREE.Scene();
			videoCamera = new THREE.Camera();
			videoScene.add(plane);
			videoScene.add(videoCamera);
		}

		/**
		 * Init Augmented Reality (threexAR)
		 */
		function initAR() {

			markers = { };

			threexAR = new THREEx.JSARToolKit({
				srcElement: video,
				//canvasRasterW	: AR.SCREEN_WIDTH,
				//canvasRasterH	: AR.SCREEN_HEIGHT,
				threshold: AR.THRESHOLD,
				debug: false,
				camera: camera,
				callback: onARChange
			});

			threexAR.canvasRaster().id = "canvasRaster";
			animate();
		}

		/* * * * * * * * * * * * * * * * * ** * * * * * *
		 *                                              *
		 *   AUGMENTED REALITY FUNCTIONS                * 
		 *                                              *
		 * * * * * * * * * * * * * * * * * ** * * * * * */

		 // e = {type: "update", markerId: 64, matrix: THREE.Matrix4}
		function onARChange(e) {

			var type = e.type;

			console.log(e);

			if(type === "update") onUpdate(e);
			else if(type === "create") onCreate(e);
			else if(type === "delete") onDelete(e);
			else console.error("unknown event type:" + type);
		}

		function onUpdate(e) {
			var markerId = e.markerId,
				marker = markers[markerId];

			marker.object3d.matrix.copy(e.matrix);
			marker.object3d.matrixWorldNeedsUpdate = true;
		}

		function onCreate(e) {

			var marker = { },
				object3d = new THREE.Object3D();
			markers[e.markerId] = marker;

			marker.object3d = object3d;
			object3d.matrixAutoUpdate = false;
			scene.add(object3d);

			var texture, loader, material;

			// load engine test model
			material = new THREE.MeshPhongMaterial( { color: 0xcccccc, specular:0xffffff, shininess:100, wireframe: false} );
			loader = new THREE.JSONLoader();
			loader.load("assets/models/engine1.js", function(geometry) { 
				// create mesh
				mesh = new THREE.Mesh(geometry, material);
				var s = 150;
				mesh.rotation.y = 0;
				mesh.rotation.x = 5;
				mesh.rotation.z = 0;
				mesh.scale.set(s, s, s);
				// mesh.doubleSided = true;
				object3d.add(mesh);
			});
		}

		function onDelete(e) {
			var markerId = e.markerId,
				marker = markers[markerId];

			scene.remove(marker.object3d);
			delete markers[markerId];
		}

		function render() {
			
			if(video instanceof HTMLVideoElement && video.readyState === video.HAVE_ENOUGH_DATA){
				videoTexture.needsUpdate = true;
				threexAR.update();
			}

			renderer.autoClear = false;
			renderer.clear();
			renderer.render(videoScene, videoCamera);
			renderer.render(scene, camera);
		}

		function animate() {

			if (stats) stats.begin();

			requestAnimationFrame(animate);

			// if (mesh && ARElement == 2) {
			// 	var time = Date.now() % AugmentedReality.DURATION;
			// 	var keyframe = Math.floor(time / AugmentedReality.INTERPOLATION);

			// 	if (keyframe != this.currentKeyframe) {
			// 		this.mesh.morphTargetInfluences[this.lastKeyframe] = 0;
			// 		this.mesh.morphTargetInfluences[this.currentKeyframe] = 1;
			// 		this.mesh.morphTargetInfluences[keyframe] = 0;

			// 		this.lastKeyframe = this.currentKeyframe;
			// 		this.currentKeyframe = keyframe;
			// 	}

			// 	this.mesh.morphTargetInfluences[keyframe] = (time % AugmentedReality.INTERPOLATION) / AugmentedReality.INTERPOLATION;
			// 	this.mesh.morphTargetInfluences[this.lastKeyframe] = 1 - this.mesh.morphTargetInfluences[keyframe];
			// }

			render();

			if (stats) stats.end();
		}

	}


	// function animate() {
	// 	requestAnimationFrame(animate.bind(this));

	// 	if (this.mesh && this.ARElement == 2) {
	// 		var time = Date.now() % AugmentedReality.DURATION;
	// 		var keyframe = Math.floor(time / AugmentedReality.INTERPOLATION);

	// 		if (keyframe != this.currentKeyframe) {
	// 			this.mesh.morphTargetInfluences[this.lastKeyframe] = 0;
	// 			this.mesh.morphTargetInfluences[this.currentKeyframe] = 1;
	// 			this.mesh.morphTargetInfluences[keyframe] = 0;

	// 			this.lastKeyframe = this.currentKeyframe;
	// 			this.currentKeyframe = keyframe;
	// 		}

	// 		this.mesh.morphTargetInfluences[keyframe] = (time % AugmentedReality.INTERPOLATION) / AugmentedReality.INTERPOLATION;
	// 		this.mesh.morphTargetInfluences[this.lastKeyframe] = 1 - this.mesh.morphTargetInfluences[keyframe];
	// 	}

	// 	render.call(this);
	// }



	return AR;

});