var betAmounts = [1, 5, 10, 20, 50, 100];
var Modes = {
  'SELECT_BET': 0,
  'SET_BET_AMOUNT': 1,
  'WAIT_FOR_HAND_SHAKE': 2
};
var curMode = Modes.SELECT_BET;

function renderBetSelection() {
  simply.title('Select a bet:');
  simply.subtitle('(click to select example)');
  simply.body('');
}

function renderBetAmount(amount) {
  simply.title('Set bet amount:');
  simply.subtitle('$' + amount + '.00');
}

function setBetAmount() {
  curMode = Modes.SET_BET_AMOUNT;
  var startAmount = betAmounts[0];
  localStorage.setItem('betAmount', startAmount);
  renderBetAmount(startAmount);
}

function handleBetSelectClick(e) {
  if (e.button === 'select')
    setBetAmount();
}

function handleBetAmountClick(e) {
  var amount = localStorage.getItem('betAmount') || betAmounts[0];
  var oldAmount = amount;
  if (e.button === 'up') {
    amount++;// amount = betAmounts[(betAmounts.indexOf(amount) + 1) % betAmounts.length];
  } else if (e.button === 'down') {
    amount--;// = betAmounts[(betAmounts.indexOf(amount) - 1) % betAmounts.length];
  }

  simply.body('e.button: ' + e.button + '. setting amount from ' + oldAmount + ' to: ' + amount);
  localStorage.setItem('betAmount', amount);
  renderBetAmount(amount);
}

simply.on('singleClick', function(e) {
  if (curMode === Modes.SELECT_BET)
    handleBetSelectClick(e);
  else if (curMode === Modes.SET_BET_AMOUNT)
    handleBetAmountClick(e);
});

simply.on('accelTap', function(e) {
  if (curMode == Modes.WAIT_FOR_HAND_SHAKE) {
    var id = Pebble.getAccountToken();
    ajax({
          url: 'http://betsonapp.com/shake?challenger_token='+id,
          method: 'POST'
      }, function(data){
          // var headline = data.match(/<h1>(.*?)<\/h1>/)[1];
          simply.title("Got reply");
          simply.vibe('short');
      });
  }
});

renderBetSelection();