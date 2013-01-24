define("ARModel", ["/js/libs/TweenLite.min.js"], function() {

	function ARModel(id) {
		this.id = id;
		this.object3d;
		this.mesh;
		this.mat;
	}

	ARModel.prototype.load = function(url, callback) {
		
		this.object3d = new THREE.Object3D();
		this.object3d.matrixAutoUpdate = false;

		// load engine test model
		this.mat = new THREE.MeshPhongMaterial( { color: 0xcccccc, specular:0xffffff, shininess:100, wireframe: false} );
		var loader = new THREE.JSONLoader();
		loader.load(url, function(geometry) { 

			// create mesh
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
		TweenLite.to(this.mat, 1, {opacity:1, onComplete:callback});
	}

	ARModel.prototype.hide = function(callback) {
		TweenLite.killTweensOf(this.mat);
		TweenLite.to(this.mat, 2, {opacity:0, onComplete:callback});
	}


	return ARModel;

});