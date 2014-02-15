Pebble.addEventListener("ready", function() {
  simply.title('Hello World!');
  console.log("My app has started - Doing stuff...");
  Pebble.showSimpleNotificationOnPebble("CoolApp", "I am running!");
});

simply.on('accelTap', function(e) {
  var id = Pebble.getAccountToken();
      // simply.subtitle('You tapped across ' + (e.direction > 0 ? '+' : '-') + e.axis + '! (id = ' + id);

  ajax({
        url: 'http://betsonapp.com/shake?challenger_token='+id,
        method: 'POST'
    }, function(data){
        // var headline = data.match(/<h1>(.*?)<\/h1>/)[1];
        simply.title("Got reply");
    });
});
