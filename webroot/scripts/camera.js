define(function() {

	/* 
	 *	web camera class
	 */
	 return function(width, height, readyCallback) {

		window.URL = window.URL || window.webkitURL;
		window.URL.createObjectURL = window.URL.createObjectURL || function(obj) {return obj;}; // opera bug: http://my.opera.com/community/forums/topic.dml?id=1589432&t=1358318617&page=1#comment13564572		
		navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		if (!window.URL || !window.URL.createObjectURL || !navigator.getUserMedia) {
			console.error("no webcam support");
			return;
		}

		var video = window.document.createElement('video');
		video.width = width;
		video.height = height;
		video.style.display = 'none';

	    var onError = function(e) {
			console.error('ERROR! navigator.getUserMedia() - ', e);
	    };

	    navigator.getUserMedia({video: true}, function(localMediaStream) {
			video.src = window.URL.createObjectURL(localMediaStream);
	    	readyCallback(video);
			video.onloadedmetadata = function(e) {};
	    }, onError);
	};

});