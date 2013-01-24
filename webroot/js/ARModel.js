define("ARModel", ["/js/libs/TweenLite.min.js"], function() {

	function ARModel(id) {
		this.id = id;
		this.object3d;
		this.mesh;
		this.mat;
		this.pos2d={x:0, y:0};
	}

	ARModel.prototype.load = function(data, callback) {
		
		this.object3d = new THREE.Object3D();
		this.object3d.matrixAutoUpdate = false;

		// if (data.mat) {
		// 	var texture = THREE.ImageUtils.loadTexture(data.mat);
		// 	this.mat = new THREE.MeshBasicMaterial({ map: texture });
		// }
		// else
		{
			this.mat = new THREE.MeshPhongMaterial( { color: 0xcccccc, specular:0xffffff, shininess:100, wireframe: false} );
		}

		var loader = new THREE.JSONLoader();
		loader.load(data.url, function(geometry, materials) { 

			// create mesh
			this.mat = new THREE.MeshFaceMaterial( materials );
			this.mesh = new THREE.Mesh(geometry, this.mat);

			var s = 150;
			this.mesh.rotation.y = 0;
			this.mesh.rotation.x = 5;
			this.mesh.rotation.z = 0;
			this.mesh.scale.set(s, s, s);
			// mesh.doubleSided = true;
			this.object3d.add(this.mesh);

			// hide
			this.mat.opacity = 0;

			callback(this);
		}.bind(this));
	}

	ARModel.prototype.show = function(callback) {
		TweenLite.killTweensOf(this.mat);
		TweenLite.to(this.mat, 1, {opacity:1, onComplete:callback.bind(this)});
	}

	ARModel.prototype.hide = function(callback) {
		TweenLite.killTweensOf(this.mat);
		TweenLite.to(this.mat, 2, {opacity:0, onComplete:callback.bind(this)});
	}

	ARModel.prototype.update = function(matrix, camera) {
		this.object3d.matrix.copy(matrix);
		this.object3d.matrixWorldNeedsUpdate = true;
		// console.log(this.object3d.matrixWorld.getPosition().x);

		// (?) calculate 2d coordinates
		var widthHalf = 640 / 2, 
			heightHalf = 480 / 2,
			projector = new THREE.Projector(),
			vector = projector.projectVector( this.object3d.matrixWorld.getPosition().clone(), camera );

		this.pos2d.x = -(vector.x * widthHalf) + widthHalf;
		this.pos2d.y = -(vector.y * heightHalf) + heightHalf;
	}


	return ARModel;

});