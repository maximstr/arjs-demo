require.config({
     paths: {
          'jquery' : 'http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min'
     }
});
require(['jquery', 'info-bar'], function($, info) {
	console.log($);
	console.log(info)
     info.set('pos', 'hello')
});