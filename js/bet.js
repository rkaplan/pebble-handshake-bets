/*
 * A class to provide basic menu functionally to SimplyJS pebble apps.
 * Pass in an array of menu item objects, each with a 'label' field, and
 * a handler for what happens when an item is selected, and Menu takes
 * care of scrolling, rerendering, and calling your handler on select.
 */
function Menu(title, subtitle, menuItems, itemClickHandler) {
  
  this.title = title;
  this.subtitle = subtitle;
  this.items = menuItems;
  this.onItemClick = itemClickHandler;
  this.body = '';
  this.curItem = 0;
  this.ARROW_STICKY_INDEX = 2; // index at which the menu arrow 'sticks' as we scroll through items

  this.updateBody = function() {
    this.body = '';
    var startItem = this.curItem >= this.ARROW_STICKY_INDEX ? this.curItem - this.ARROW_STICKY_INDEX : 0;
    for (var i = startItem; i < this.items.length; i++) {
      if (i === this.curItem)
        this.body += '> ';
      this.body += this.items[i].label + '\n';
    }

    // Dirty hack: append extra newlines to make sure the body is always partially clipped,
    // so that Pebble does not scale up the font as we approach the end of the menu.
    this.body += '\n\n\n';
  };

  this.render = function() {
    this.updateBody();
    simply.title(this.title);
    simply.subtitle(this.subtitle);
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
      this.onItemClick(this.items[this.curItem]);
  };
}


/*
 * Constants and global variables.
 */
var PEBBLE_TOKEN = Pebble.getAccountToken();
var BET_AMOUNTS = [1, 5, 10, 20, 50, 100];
var BET_TYPES;
var BET_TYPES_HARDCODED = [
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
var Modes = {
  'MENU': 0,
  'WAIT_FOR_HAND_SHAKE': 1,
  'WAIT_FOR_CONFIRMATION': 2,
  'WAIT_FOR_AVAILABLE_BETS': 3,
  'BET_CONFIRMED': 4
};
var curMode,
    curMenu,
    curBet,
    isBettor;


/*
 * Initialization helpers
 */
function start() {
  console.log('starting!');
  curMode = Modes.MENU;
  curMenu = new Menu('Bets On', 'Select action', [
      {
        'label': 'Create bet'
      },
      {
        'label': 'Agree to bet'
      }
    ], startMenuHandler);
  curMenu.render();
}

function createAmountMenuItems(selectedBet) {
  var items = [];
  for (var i = 0; i < BET_AMOUNTS.length; i++) {
    var dollarAmount = '$' + BET_AMOUNTS[i] + '.00';
    items.push({
      'label': dollarAmount,
      'amount': BET_AMOUNTS[i],
      'betType': selectedBet
    });
  }
  return items;
}

function createBet(selectedAmount) {
  return {
    'betType': selectedAmount.betType,
    'amountType': {
      'label': selectedAmount.label,
      'amount': selectedAmount.amount
    },
    'pebble_token': Pebble.getAccountToken()
  }
}

/*
 * Rendering functions
 */
function clearScreen() {
  simply.title('');
  simply.subtitle('');
  simply.body('');
}

function renderLoadingAvailableBets() {
  simply.title('Loading your bets...');
}

function renderHandshakePrompt(betLabel, amountLabel) {
  if (isBettor) { 
    simply.title(betLabel);
    simply.subtitle(amountLabel);
    simply.body('Shake hands to make the bet.');
  } else {
    simply.title('Shake hands!');
    simply.subtitle('');
    simply.body('Shake hands with the person creating the bet to seal the deal.');
  }
}

function renderWaitScreen() {
  simply.title('Processing...');
  simply.subtitle('');
  simply.body('');
}

function renderBetConfirmed() {
  simply.title('Bet made!');
  if (curBet)
    simply.subtitle(curBet.betType.label + ' - ' + curBet.amountType.label);
  simply.body('Now go win it.');
}

/*
 * Handler functions
 */
function startMenuHandler(itemClicked) {
  if (itemClicked.label === 'Create bet') {
    isBettor = true;
    waitForAvailableBets();
  } else if (itemClicked.label === 'Agree to bet') {
    isBettor = false;
    launchHandshakePrompt();
  }
}

function launchBetSelectionMenu(betTypes) {
  curMode = Modes.MENU;
  curMenu = new Menu('Select a bet', '', betTypes, launchAmountSelectionMenu);
  curMenu.render();
}

function launchAmountSelectionMenu(selectedBet) {
  var amnountsMenuItems = createAmountMenuItems(selectedBet);
  curMenu = new Menu(selectedBet.label, 'Select amount', amnountsMenuItems, launchHandshakePrompt);
  curMenu.render();
}

function launchHandshakePrompt(selectedAmount) {
  curMode = Modes.WAIT_FOR_HAND_SHAKE;
  if (isBettor) {
    curBet = createBet(selectedAmount);
    renderHandshakePrompt(curBet.betType.label, curBet.amountType.label);
  } else {
    renderHandshakePrompt();
  }
}

simply.on('singleClick', function(e) {
  if (curMode === Modes.MENU)
    curMenu.handleClick(e);
});

// respond to handshake event
simply.on('accelTap', function(e) {
  if (curMode === Modes.WAIT_FOR_HAND_SHAKE) {
    if (isBettor)
      sendBet();
    else
      sendBetAgreement();
  }
});

/*
 * Logic functions
 */
function waitForConfirmation() {
  curMode = Modes.WAIT_FOR_CONFIRMATION;
  renderWaitScreen();
}

function waitForAvailableBets() {
  curMode = Modes.WAIT_FOR_AVAILABLE_BETS;
  clearScreen();
  renderLoadingAvailableBets();
  getAvailableBets();
}

/*
 * Communicate with server
 */
function receiveBetConfirmation(data) {
  curMode = Modes.BET_CONFIRMED;
  simply.vibe('short');
  renderBetConfirmed();
}

function receiveAvailableBets(data) {
  console.log('data: ');
  console.log(data);

  curMode = Modes.BET_CONFIRMED;
  simply.vibe('short');
  simply.title('wow received');
  launchBetSelectionMenu(JSON.parse(data).bets);
}

function getAvailableBets() {
  ajax({
      url: 'http://betsonapp.com/bets',
      method: 'POST',
      data: {'pebble_token': PEBBLE_TOKEN}
  }, receiveAvailableBets);
  // receiveAvailableBets({'bets': BET_TYPES_HARDCODED});
}

function sendBet() {
  ajax({
      url: 'http://betsonapp.com/shake',
      method: 'POST',
      data: {'pebble_token': PEBBLE_TOKEN}
  }, receiveBetConfirmation);
  waitForConfirmation();
}

function sendBetAgreement() {
  ajax({
      url: 'http://betsonapp.com/shake',
      method: 'POST',
      data: {'pebble_token': PEBBLE_TOKEN}
  }, receiveBetConfirmation);
  waitForConfirmation();
}

start();