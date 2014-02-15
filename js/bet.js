var betAmounts = [1, 5, 10, 20, 50, 100];
var Modes = {
  'SELECT_BET': 0,
  'SET_BET_AMOUNT': 1,
  'WAIT_FOR_HAND_SHAKE': 2
};
var curMode = Modes.SELECT_BET;
var totalButtonClicks = 0;

function renderBetSelection() {
  simply.title('Select a bet:');
  simply.subtitle('(click to select example)');
  simply.body('');
}

function renderBetAmount(amount) {
  simply.title('Set bet amount:');
  simply.subtitle('$' + betAmounts[amount] + '.00');
}

function setBetAmount() {
  curMode = Modes.SET_BET_AMOUNT;
  var startAmount = 0;
  localStorage.setItem('betAmount', startAmount);
  renderBetAmount(startAmount);
}

function handleBetSelectClick(e) {
  if (e.button === 'select')
    setBetAmount();
}

function handleBetAmountClick(e) {
  var amount = localStorage.getItem('betAmount') || 0;
  if (e.button === 'up') {
    amount++;
  } else if (e.button === 'down') {
    amount--;
  }
  if (amount >= betAmounts.length) amount = 0;
  if (amount < 0) amount = betAmounts.length - 1;

  simply.body(totalButtonClicks + ', e.button: ' + e.button + '. setting amount from ' + oldAmount + ' to: ' + amount);
  localStorage.setItem('betAmount', amount);
  renderBetAmount(amount);
}

simply.on('singleClick', function(e) {
  console.log("SingleClick called: " + JSON.stringify(e));
  totalButtonClicks++;
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