define('AR', ["ARModel", "libs/JSARToolKit", "libs/three", "libs/threex.jsartoolkit"], function(ARModel) {

	// const
	AR.SCREEN_WIDTH = 640;
	AR.SCREEN_HEIGHT = 480;
	AR.MAX_AR_ELEMENTS = 7;
	AR.DURATION = 1000;
	AR.KEYFRAMES = 14;
	AR.INTERPOLATION = AR.DURATION / AR.KEYFRAMES;
	AR.THRESHOLD = 128;

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
			renderer = new THREE.WebGLRenderer({ antialias: false });
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

			if(type === "update") onUpdate(e);
			else if(type === "create") onCreate(e);
			else if(type === "delete") onDelete(e);
			else console.error("unknown event type:" + type);
		}

		function onUpdate(e) {

			var marker = markers[e.markerId];

			if (marker) {
				marker.model.update(e.matrix, camera);
				var p0 = marker.model.pos2d, p1;
				for (var id in markers) {
					if (id != marker.id) {
						var m = markers[id];

						//
						// calculate distance
						p1 = m.model.pos2d;
						var dist = Math.sqrt(Math.pow(p0.x-p1.x, 2) + Math.pow(p0.y-p1.y, 2));

						//
						// debug out
						var c = document.getElementById('debug-canva');
						if (!c) {
							c = document.createElement("canvas")
							c.setAttribute('id', 'debug-canva');
							c.width = AR.SCREEN_WIDTH;
							c.height = AR.SCREEN_HEIGHT;
							container.appendChild(c);
						}
						c.width = c.width;
						var ctx=c.getContext("2d");
						ctx.strokeStyle = 'rgba(255,0,0,0.7)';
						ctx.lineWidth = 2;
						ctx.moveTo(p0.x,p0.y);
						ctx.lineTo(p1.x,p1.y);
						ctx.stroke();
					}
				}
			}
		}

		function onCreate(e) {

			if (!markers[e.markerId]) {
				// create new marker

				var data = e.markerId == 0 ? 
					{url:"assets/models/monkey.js"} :
					{
						url:"assets/models/engine1.js",
						mat:null
					};

				new ARModel(e.markerId).load(data, function(mod){
		
					var marker = {
						id:e.markerId,
						model:mod,
						object3d:mod.object3d
					};

					scene.add(marker.object3d);
					mod.show(function(){
						console.log("model is visible now");
					});
					markers[e.markerId] = marker;
				});
			}
			else
			{
				// unveil old one
				markers[e.markerId].model.show(function(mod){

				});
			}
		}

		function onDelete(e) {
			var marker = markers[e.markerId];
			if (marker) {
				marker.model.hide(function(){
					scene.remove(marker.object3d);
					delete markers[e.markerId];
				}.bind(this));
			}
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

	return AR;

});