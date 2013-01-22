require.config({
     paths: {
          'jquery' : 'http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min'
     }
});

require(["jquery", "libs/Stats", "libs/Detector", "libs/JSARToolKit", "libs/three", "libs/threex.jsartoolkit"], function() {

	if (!Detector.webgl) {
		alert('no webgl support');
		return;
	}

	// stats
	stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms
	stats.domElement.setAttribute('id', 'stat-monitor');
	document.body.appendChild( stats.domElement );

	require(["initAR"], function(){

	});

	$(function() {
		window.onresize = resizeARVCanvas;
		resizeARVCanvas();
	});

	function resizeARVCanvas() {
		var view,
			ww = window.fullScreen ? screen.width : window.innerWidth,
			wh = window.fullScreen ? screen.height : window.innerHeight,
			ow = 640,
			oh = 480,
			p = Math.min(ww/ow, wh/oh);
		
		view = document.getElementById('ar_container');
		var newW = ow * p,
			newH = oh * p,
			newX = Math.round((ww - newW) / 2),
			newY = Math.round((wh - newH) / 2);
		
		view.style.width = newW+"px";
		view.style.height = newH+"px";
		view.style.left = newX+"px";
		view.style.top = newY+"px";
	}

});