simply.title('Hello World!');


simply.on('accelTap', function(e) {
      var id = Pebble.getAccountToken();
      simply.subtitle('You tapped across ' + (e.direction > 0 ? '+' : '-') + e.axis + '! (id = ' + id);

      // ajax({ url: 'http://simplyjs.meiguro.com/?id='+id }, function(data){
      //       var headline = data.match(/<h1>(.*?)<\/h1>/)[1];
      //       simply.title("Got reply");
      // });
});
