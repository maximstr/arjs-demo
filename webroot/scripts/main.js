require.config({
     paths: {
          'jquery' : 'http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min'
     }
});

require(['Camera', 'jquery'], function(Camera, $) {

	$(function() {
		console.log();
		var cam = new Camera(640, 480, function(video) {
			console.log('cam ready:' + video);
		});
	});

});