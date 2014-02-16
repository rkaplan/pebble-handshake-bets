var betAmounts = [1, 5, 10, 20, 50, 100];
var Modes = {
  'SELECT_BET': 0,
  'SET_BET_AMOUNT': 1,
  'WAIT_FOR_HAND_SHAKE': 2,
  'WAIT_FOR_CONFIRMATION': 3,
  'BET_CONFIRMED': 4
};
var curMode = Modes.SELECT_BET;
var curBet = {
  'amountIndex': 0,
  'amount': betAmounts[0],
  'betType': 'Test'
};

/*
 * Rendering functions
 */
function clearScreen() {
  simply.title('');
  simply.subtitle('');
  simply.body('');
}

function renderBetSelection() {
  clearScreen();
  simply.title('Select a bet:');
  simply.subtitle('(click to select example)');
}

function renderBetAmount() {
  clearScreen();
  simply.title('Set bet amount:');
  simply.subtitle('$' + curBet.amount + '.00');
}

function renderHandshakePrompt() {
  clearScreen();
  simply.title('Shake hands to bet $' + curBet.amount + '.00 on ' + curBet.betType);
}

function renderWaitScreen() {
  clearScreen();
  simply.title('Processing...');
}

function renderBetConfirmed() {
  clearScreen();
  simply.title('Bet confirmed!');
}

/*
 * Handler functions
 */
function handleBetSelectClick(e) {
  if (e.button === 'select')
    setBetAmount();
}

function handleBetAmountClick(e) {
  if (e.button === 'select') {
    promptHandshake();
  } else {
    var newAmountIndex = curBet.amountIndex;
    if (e.button === 'up') {
      newAmountIndex++;
    } else if (e.button === 'down') {
      newAmountIndex--;
    }
    if (newAmountIndex >= betAmounts.length) newAmountIndex = 0;
    if (newAmountIndex < 0) newAmountIndex = betAmounts.length - 1;

    // simply.body(totalButtonClicks + ', e.button: ' + e.button + '. setting amount to: ' + amount);
    curBet.amountIndex = newAmountIndex;
    curBet.amount      = betAmounts[newAmountIndex];
    renderBetAmount();
  }
}

simply.on('singleClick', function(e) {
  if (curMode === Modes.SELECT_BET)
    handleBetSelectClick(e);
  else if (curMode === Modes.SET_BET_AMOUNT)
    handleBetAmountClick(e);
});

// respond to handshake event
simply.on('accelTap', function(e) {
  if (curMode == Modes.WAIT_FOR_HAND_SHAKE)
    sendBet();
});

/*
 * Logic functions
 */
function setBetAmount() {
  curMode = Modes.SET_BET_AMOUNT;
  renderBetAmount();
}

function promptHandshake() {
  curMode = Modes.WAIT_FOR_HAND_SHAKE;
  renderHandshakePrompt();
}

function sendBet() {
  var id = Pebble.getAccountToken();
  ajax({
        url: 'http://betsonapp.com/shake',
        method: 'POST',
        data: {'pebble_token': id}
    }, receiveBetConfirmation);
  waitForConfirmation();
}

function receiveBetConfirmation(data) {
  curMode = Modes.BET_CONFIRMED;
  simply.vibe('short');
  renderBetConfirmed();
}

function waitForConfirmation() {
  curMode = Modes.WAIT_FOR_CONFIRMATION;
  renderWaitScreen();
}

clearScreen();
renderBetSelection();