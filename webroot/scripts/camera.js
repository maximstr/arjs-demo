define(['jquery'], function($) {



	/* 
	 *	camera
	 */

	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	var onError = function(e) {
		console.log('ERROR! navigator.getUserMedia() - ', e);
	};

	navigator.getUserMedia({video: true}, function(localMediaStream) {
		var video = $('#video-screen');
		video[0].src = window.URL.createObjectURL(localMediaStream);

		video.onloadedmetadata = function(e) {
			console.log('video.onloadedmetadata DONE');
		};
	}, onError);



	/* 
	 *	jsartoolkit
	 */

	// Create a RGB raster object for the 2D canvas.
	// JSARToolKit uses raster objects to read image data.
	// Note that you need to set canvas.changed = true on every frame.
	var raster = new NyARRgbRaster_Canvas2D(canvas);

	// FLARParam is the thing used by FLARToolKit to set camera parameters.
	// Here we create a FLARParam for images with 320x240 pixel dimensions.
	var param = new FLARParam(320, 240);

	// The FLARMultiIdMarkerDetector is the actual detection engine for marker detection.
	// It detects multiple ID markers. ID markers are special markers that encode a number.
	var detector = new FLARMultiIdMarkerDetector(param, 120);

	// For tracking video set continue mode to true. In continue mode, the detector
	// tracks markers across multiple frames.
	detector.setContinueMode(true);

	// Copy the camera perspective matrix from the FLARParam to the WebGL library camera matrix.
	// The second and third parameters determine the zNear and zFar planes for the perspective matrix.
	param.copyCameraMatrix(display.camera.perspectiveMatrix, 10, 10000);




	/* 
	 *	detecting
	 */

	// Draw the video frame to the raster canvas, scaled to 320x240.
	canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);

	// Tell the raster object that the underlying canvas has changed.
	canvas.changed = true;

	// Do marker detection by using the detector object on the raster object.
	// The threshold parameter determines the threshold value
	// for turning the video frame into a 1-bit black-and-white image.
	//
	var markerCount = detector.detectMarkerLite(raster, threshold);



	// Create a NyARTransMatResult object for getting the marker translation matrices.
	var resultMat = new NyARTransMatResult();

	var markers = {};

	// Go through the detected markers and get their IDs and transformation matrices.
	for (var idx = 0; idx < markerCount; idx++) {
	  // Get the ID marker data for the current marker.
	  // ID markers are special kind of markers that encode a number.
	  // The bytes for the number are in the ID marker data.
	  var id = detector.getIdMarkerData(idx);

	  // Read bytes from the id packet.
	  var currId = -1;
	  // This code handles only 32-bit numbers or shorter.
	  if (id.packetLength <= 4) {
	    currId = 0;
	    for (var i = 0; i < id.packetLength; i++) {
	      currId = (currId << 8) | id.getPacketData(i);
	    }
	  }

	  // If this is a new id, let's start tracking it.
	  if (markers[currId] == null) {
	    markers[currId] = {};
	  }
	  // Get the transformation matrix for the detected marker.
	  detector.getTransformMatrix(idx, resultMat);

	  // Copy the result matrix into our marker tracker object.
	  markers[currId].transform = Object.asCopy(resultMat);
	}








	function copyMarkerMatrix(arMat, glMat) {
	  glMat[0] = arMat.m00;
	  glMat[1] = -arMat.m10;
	  glMat[2] = arMat.m20;
	  glMat[3] = 0;
	  glMat[4] = arMat.m01;
	  glMat[5] = -arMat.m11;
	  glMat[6] = arMat.m21;
	  glMat[7] = 0;
	  glMat[8] = -arMat.m02;
	  glMat[9] = arMat.m12;
	  glMat[10] = -arMat.m22;
	  glMat[11] = 0;
	  glMat[12] = arMat.m03;
	  glMat[13] = -arMat.m13;
	  glMat[14] = arMat.m23;
	  glMat[15] = 1;
	}	


});