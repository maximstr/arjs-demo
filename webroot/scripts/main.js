require.config({
     paths: {
          'jquery' : 'http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min'
     }
});

require(['jquery', 'camera'], function($, camera) {
	console.log($);
	console.log(camera);
});