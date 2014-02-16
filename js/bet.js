/*
 * A class to provide basic menu functionally to SimplyJS pebble apps.
 * Pass in an array of menu item objects, each with a 'label' field, and
 * a handler for what happens when an item is selected, and Menu takes
 * care of scrolling, rerendering, and calling your handler on select.
 */
function Menu(title, menuItems, itemClickHandler) {
  
  this.title = title;
  this.items = menuItems;
  this.onItemClick = itemClickHandler;
  this.body = '';
  this.curItem = 0;
  this.ARROW_STICKY_INDEX = 2; // where the menu arrow sticks in the general case

  this.updateBody = function() {
    this.body = '';
    var startItem = this.curItem >= this.ARROW_STICKY_INDEX ? this.curItem - this.ARROW_STICKY_INDEX : 0;

    for (var i = startItem; i < this.items.length; i++) {
      if (i === this.curItem)
        this.body += '> ';
      this.body += this.items[i].label + '\n';
    }
  };

  this.render = function() {
    this.updateBody();
    simply.title(this.title);
    simply.body(this.body);
  };

  this.scrollUp = function() {
    if (this.curItem === 0) // already at the top of the menu
      return;
    this.curItem--;
    this.render();
  };

  this.scrollDown = function() {
    if (this.curItem === this.items.length - 1) // already at the bottom of the menu
      return;
    this.curItem++;
    this.render();
  };

  this.handleClick = function(e) {
    if (e.button === 'up')
      this.scrollUp();
    else if (e.button === 'down')
      this.scrollDown();
    else if (e.button === 'select')
      this.onItemClick();
  };
}

var betAmounts = [1, 5, 10, 20, 50, 100];
var Modes = {
  'MENU': 0,
  'SELECT_BET': 1,
  'SET_BET_AMOUNT': 2,
  'WAIT_FOR_HAND_SHAKE': 3,
  'WAIT_FOR_CONFIRMATION': 4,
  'BET_CONFIRMED': 5
};
var BET_TYPES = [
  {
    'label': 'Facebook',
    'id': 0
  },
  {
    'label': 'Twitter',
    'id': 1
  },
  {
    'label': 'Angry Birds',
    'id': 2
  },
  {
    'label': 'Web page',
    'id': 3
  },
  {
    'label': 'PennApps',
    'id': 4
  },
  {
    'label': 'Reddit',
    'id': 5
  },
  {
    'label': 'Hacker News',
    'id': 6
  }
];
var curMode = Modes.SELECT_BET;
var curMenu;
var curBet = {
  'amountIndex': 0,
  'amount': betAmounts[0],
  'betType': 'Test'
};

function start() {
  curMode = Modes.SELECT_BET;
  renderBetSelection();
}

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
  simply.title('Set bet amount:');
  simply.subtitle('$' + curBet.amount + '.00');
}

function renderHandshakePrompt() {
  simply.title('Shake hands to bet $' + curBet.amount + '.00 on ' + curBet.betType);
  simply.subtitle('');
}

function renderWaitScreen() {
  simply.title('Processing...');
}

function renderBetConfirmed() {
  simply.title('Bet confirmed!');
  simply.body('Now go win it.');
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
  if (curMode === Modes.MENU)
    curMenu.handleClick(e);
  else if (curMode === Modes.SELECT_BET)
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

// start();

clearScreen();
curMode = Modes.MENU;
curMenu = new Menu('Select a bet', BET_TYPES, function() {
  console.log('I was clicked');
});
curMenu.render();