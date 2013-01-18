require.config({
     paths: {
          'jquery' : 'http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min'
     }
});

require(['Camera', 'jquery'], function(Camera, $) {



	C = function() {
		v = 'hello';

		foo1();

		function foo1() {
			console.log(this.v);
		};

		this.foo2 = function() {
			return 'hhh';
		};
	};

	var c = new C();
	console.log(c.v);
	console.log(c.foo2());




	return;
	$(function() {
		console.log();
		var cam = new Camera(640, 480, function(video) {
			console.log('cam ready:' + video);
		});
	});

});