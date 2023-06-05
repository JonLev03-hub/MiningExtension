// // The code below closes all other popup windows when a new one is opened
// // uncomment when its as an extension
// // Function to send a message to all other content scripts
// function sendMessageToOtherContentScripts(m) {
//   chrome.runtime.sendMessage({ message: m });
// }

// // Send a message to all other content scripts
// sendMessageToOtherContentScripts("New Window Opened");

// // Function to handle the message received in the background script
// function handleMessage(request, sender, sendResponse) {
//   window.close();
// }

// // Add a listener for messages from content scripts or other parts of the extension
// chrome.runtime.onMessage.addListener(handleMessage);

// this is the actial logic for the html page
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

class Assets {
  constructor(images, sounds) {
    this.images = {};
    for (let item in images) {
      this.images[item] = new Image();
      this.images[item].src = images[item];
    }
  }
}

let assets = new Assets({
  Player1: "assets/Player1.png",
  Player2: "assets/Player2.png",
  Player3: "assets/Player3.png",
  Stone: "assets/Stone.png",
  Diamond: "assets/Diamond.png",
  Gold: "assets/Gold.png",
  Iron: "assets/Iron.png",
  Copper: "assets/Copper.png",
  Coal: "assets/Coal.png",
  Popup: "assets/Popup.png",
  ItemSlot: "assets/ItemSlot.png",
  StoneItem: "assets/StoneItem.png",
  CoalItem: "assets/CoalItem.png",
  CopperItem: "assets/CopperItem.png",
  IronItem: "assets/IronItem.png",
  GoldItem: "assets/GoldItem.png",
  DiamondItem: "assets/DiamondItem.png",
  TextBackdrop: "assets/TextBackdrop.png",
  Shadow: "assets/Shadow.png",
  CoinIcon: "assets/CoinIcon.png",
  BagIcon: "assets/BagIcon.png",
  DepthIcon: "assets/DepthIcon.png",
  Dropdown: "assets/Dropdown.png",
  CartIcon: "assets/CartIcon.png",
  StoreIcon: "assets/StoreIcon.png",
  WorkerIcon: "assets/WorkerIcon.png",
  FurnaceIcon: "assets/FurnaceIcon.png",
  Background: "assets/Background.png",
  Minecart: "assets/Minecart.png",
});
// this is an entity class that can be used to draw animated and unanimated images, this will be extended for specific items that have hover actions, or click functions since they will be distinct per object
class Entity {
  constructor(x, y, width, height, image, xPos = 0, yPos = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.xPos = xPos;
    this.yPos = yPos;
  }
  draw() {
    c.drawImage(
      this.image,
      0 + this.width * this.xPos,
      0 + this.height * this.yPos,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
class Player extends Entity {
  static maxInventory = 14;
  constructor(
    x,
    y,
    width,
    height,
    image,
    maxXPos = 0,
    inventory = [],
    coins = 0
  ) {
    super(x, y, width, height, image);
    this.xPos = 0;
    this.maxXPos = maxXPos;
    this.animate = false;
    this.inventory = inventory;
    this.damage = 1;
    this.coins = coins;
  }
  startAnimation() {
    this.animate = true;
  }
  stopAnimation() {
    this.animate = false;
    this.xPos = 0;
  }
  draw() {
    c.drawImage(
      this.image,
      0 + this.width * this.xPos,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.animate) {
      this.xPos++;
      if (this.xPos >= this.maxXPos - 1) {
        this.stopAnimation();
      }
    }
  }
  break(type) {
    let quantity = type == "Stone" ? 1 : getRandomInt(5);
    type = type + "Item";
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].name == type) {
        this.inventory[i].quantity += quantity;
        if (this.inventory[i].quantity > 64) {
          quantity = this.inventory[i].quantity - 64;
          this.inventory[i].quantity = 64;
        } else {
          return;
        }
      }
    }
    if (quantity > 0 && this.inventory.length < Player.maxInventory) {
      player.inventory.push({ name: type, quantity: quantity });
    }
  }
}
class Block extends Entity {
  constructor(x, y, width, depth = 1) {
    // have it randomly choose the blocks here

    super(x, y, width, width, assets.images["Stone"]);
    this.type = "Stone";
    this.xPos = getRandomInt(6);
    this.health = Math.min(1 + Math.floor(depth / 300), 4);
    for (let i = 0; i < ORE_TYPES.length; i++) {
      if (Math.random() < (0.01 * depth * (i + 1)) / 100) {
        this.image = assets.images[ORE_TYPES[i]];
        this.type = ORE_TYPES[i];
        this.xPos = 0;
        return;
      }
    }
  }
}

class World {
  static yOffset = 56;
  constructor(depth = 0) {
    this.depth = depth;
    this.width = 7;
    this.height = 3;
    this.blocks = [];
    for (let i = 0; i < this.height; i++) {
      this.blocks.push([]);
      for (let j = 0; j < this.width; j++) {
        this.blocks[i].push(
          new Block(
            BLOCK_WIDTH * j,
            World.yOffset + BLOCK_WIDTH * i,
            BLOCK_WIDTH,
            this.depth
          )
        );
      }
    }
  }
  draw() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.blocks[i][j].draw();
      }
    }
    c.globalAlpha = 0.6;
    c.fillStyle = "black";
    c.fillRect(0, World.yOffset + 32, 128, 32);
    c.globalAlpha = 1.0;
    c.drawImage(
      assets.images.Shadow,
      0,
      World.yOffset,
      this.width * BLOCK_WIDTH,
      this.height * BLOCK_WIDTH
    );
    // c.drawImage();
  }
  hitBlock(damage = player.damage) {
    // have the broken block drop
    let hitBlock = this.blocks[1][4];
    // do damage to the block
    hitBlock.health -= damage;
    if (hitBlock.health >= 0) {
      return;
    }

    player.break(hitBlock.type);
    this.depth++;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        // every block will need to move
        this.blocks[i][j].x -= BLOCK_WIDTH;
        if (this.blocks[i][j].x == -32) {
          j--;
          this.blocks[i].shift();
          this.blocks[i].push(
            new Block(
              BLOCK_WIDTH * this.width,
              World.yOffset + BLOCK_WIDTH * i,
              BLOCK_WIDTH,
              this.depth
            )
          );
        }
      }
    }
    if (hitBlock.health < 0) {
      this.hitBlock(-hitBlock.health);
    }
  }
}
class Minecart extends Entity {
  static x = 90 - 32;
  static y = World.yOffset + 32;
  static image = assets.images.Minecart;
  static width = 32;
  static maxInventory = 21;
  constructor(
    purchased = false,
    inventory = [{ name: "StoneItem", quantity: 10 }]
  ) {
    super(
      Minecart.x,
      Minecart.y,
      Minecart.width,
      Minecart.width,
      Minecart.image
    );
    this.purchased = purchased;
    this.inventory = inventory;
  }
}
class Popup {
  static image = assets.images.Popup;
  static width = 7;
  static height = 6;
  constructor(content = []) {
    this.xOffset = (canvas.width - (Popup.width + 2) * BLOCK_WIDTH) / 2;
    this.yOffset = (canvas.height - (Popup.height + 2) * BLOCK_WIDTH) / 2;
    this.content = content;
  }
  draw() {
    // fill rect with background
    c.translate(this.xOffset, this.yOffset);
    c.set;
    c.fillStyle = "#ead4aa";
    c.fillRect(
      BLOCK_WIDTH / 2,
      BLOCK_WIDTH / 2,
      (1 + Popup.width) * BLOCK_WIDTH,
      (1 + Popup.height) * BLOCK_WIDTH
    );
    // draw the corners
    c.drawImage(
      Popup.image,
      0 + BLOCK_WIDTH * 0,
      0 + BLOCK_WIDTH * 0,
      BLOCK_WIDTH,
      BLOCK_WIDTH,
      0,
      0,
      BLOCK_WIDTH,
      BLOCK_WIDTH
    );
    c.drawImage(
      Popup.image,
      0 + BLOCK_WIDTH * 2,
      0 + BLOCK_WIDTH * 0,
      BLOCK_WIDTH,
      BLOCK_WIDTH,
      0 + BLOCK_WIDTH * (Popup.width + 1),
      0,
      BLOCK_WIDTH,
      BLOCK_WIDTH
    );
    c.drawImage(
      Popup.image,
      0 + BLOCK_WIDTH * 2,
      0 + BLOCK_WIDTH * 2,
      BLOCK_WIDTH,
      BLOCK_WIDTH,
      0 + BLOCK_WIDTH * (Popup.width + 1),
      0 + BLOCK_WIDTH * (Popup.height + 1),
      BLOCK_WIDTH,
      BLOCK_WIDTH
    );
    c.drawImage(
      Popup.image,
      0 + BLOCK_WIDTH * 0,
      0 + BLOCK_WIDTH * 2,
      BLOCK_WIDTH,
      BLOCK_WIDTH,
      0,
      0 + BLOCK_WIDTH * (Popup.height + 1),
      BLOCK_WIDTH,
      BLOCK_WIDTH
    );
    // draw the borders
    for (let i = 0; i < Popup.height; i++) {
      c.drawImage(
        Popup.image,
        0 + BLOCK_WIDTH * 0,
        0 + BLOCK_WIDTH,
        BLOCK_WIDTH,
        BLOCK_WIDTH,
        0,
        0 + BLOCK_WIDTH * (i + 1),
        BLOCK_WIDTH,
        BLOCK_WIDTH
      );
      c.drawImage(
        Popup.image,
        0 + BLOCK_WIDTH * 2,
        0 + BLOCK_WIDTH,
        BLOCK_WIDTH,
        BLOCK_WIDTH,
        0 + BLOCK_WIDTH * (Popup.width + 1),
        0 + BLOCK_WIDTH * (i + 1),
        BLOCK_WIDTH,
        BLOCK_WIDTH
      );
    }
    for (let i = 0; i < Popup.width; i++) {
      c.drawImage(
        Popup.image,
        0 + BLOCK_WIDTH,
        0 + BLOCK_WIDTH * 0,
        BLOCK_WIDTH,
        BLOCK_WIDTH,
        0 + BLOCK_WIDTH * (i + 1),
        0,
        BLOCK_WIDTH,
        BLOCK_WIDTH
      );
      c.drawImage(
        Popup.image,
        0 + BLOCK_WIDTH,
        0 + BLOCK_WIDTH * 2,
        BLOCK_WIDTH,
        BLOCK_WIDTH,
        0 + BLOCK_WIDTH * (i + 1),
        0 + BLOCK_WIDTH * (Popup.height + 1),
        BLOCK_WIDTH,
        BLOCK_WIDTH
      );
    }
    let itemId = 0;
    for (let row = Player.maxInventory / Popup.width; row > 0; row--) {
      for (let column = 0; column < Popup.width; column++) {
        // print all of the squares here
        c.drawImage(
          assets.images.ItemSlot,
          BLOCK_WIDTH + BLOCK_WIDTH * column,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row - 1)
        );
        if (column + (row - 1) * Popup.width > player.inventory.length - 1) {
          continue;
        }
        // print the item and count of item here

        let item = player.inventory[itemId];
        c.drawImage(
          assets.images[item.name],
          BLOCK_WIDTH + BLOCK_WIDTH * column,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row - 1)
        );
        c.drawImage(
          assets.images.TextBackdrop,
          BLOCK_WIDTH + BLOCK_WIDTH * column,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row - 1)
        );
        c.font = "10px arial";
        c.fillStyle = "black";
        c.fillText(
          item.quantity,
          BLOCK_WIDTH + BLOCK_WIDTH * column + 2,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row - 1) + 10
        );
        itemId++;
      }
    }
    // print the cart inventory or the cart purchase screen
    if (minecart.purchased == true) {
      let itemId = 0;
      for (let row = Minecart.maxInventory / Popup.width; row > 0; row--) {
        for (let column = 0; column < Popup.width; column++) {
          // print all of the squares here
          c.drawImage(
            assets.images.ItemSlot,
            BLOCK_WIDTH + BLOCK_WIDTH * column,
            Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row + 2)
          );
          if (
            column + (row - 1) * Popup.width >
            minecart.inventory.length - 1
          ) {
            continue;
          }
          // print the item and count of item here

          let item = minecart.inventory[itemId];
          c.drawImage(
            assets.images[item.name],
            BLOCK_WIDTH + BLOCK_WIDTH * column,
            Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row + 2)
          );
          c.drawImage(
            assets.images.TextBackdrop,
            BLOCK_WIDTH + BLOCK_WIDTH * column,
            Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row + 2)
          );
          c.font = "10px arial";
          c.fillStyle = "black";
          c.fillText(
            item.quantity,
            BLOCK_WIDTH + BLOCK_WIDTH * column + 2,
            Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * (row + 2) + 10
          );
          itemId++;
        }
      }
    } else {
      console.log("dont display");
    }
    c.resetTransform();
  }
}
// view Functions
function PlayView() {
  world.draw();
  player.draw();
  if (minecart.purchased) minecart.draw();
  // draw the stats at the bottom of the screen
  let statPaddingLeft = 5;
  let iconWidth = 16;
  let statWidth = 75 - statPaddingLeft - iconWidth;
  let icons = [
    assets.images.CoinIcon,
    assets.images.DepthIcon,
    assets.images.BagIcon,
  ];
  let values = [
    player.coins,
    world.depth,
    ((player.inventory.length / Player.maxInventory) * 100)
      .toFixed(0)
      .toString() + "%",
  ];
  for (let i = 0; i < icons.length; i++) {
    c.drawImage(
      icons[i],
      (i + 1) * statPaddingLeft + i * iconWidth + i * statWidth,
      canvas.height - 1.5 * iconWidth
    );
    c.fillStyle = "white";
    c.font = "bold 15px arial";
    c.fillText(
      values[i],
      (i + 1) * statPaddingLeft + (i + 1) * iconWidth + i * statWidth + 2,
      canvas.height - 0.5 * iconWidth
    );
  }

  // draw menu drop downs
  let dropdownLeftPadding = 0;
  let dropDownWidth = 48;
  let dropdownIcons = [
    assets.images.CartIcon,
    assets.images.FurnaceIcon,
    assets.images.StoreIcon,
    assets.images.WorkerIcon,
  ];
  for (let i = 0; i < dropdownIcons.length; i++) {
    // drop down draw
    c.drawImage(
      assets.images.Dropdown,
      dropdownLeftPadding * (i + 1) + dropDownWidth * i,
      0,
      dropDownWidth,
      dropDownWidth
    );
    // draw background
    c.drawImage(
      assets.images.Background,
      dropdownLeftPadding * (i + 1) + dropDownWidth * i + dropDownWidth / 4,
      dropDownWidth / 4,
      dropDownWidth / 2,
      dropDownWidth / 2
    );
    // icon draw
    c.drawImage(
      dropdownIcons[i],
      dropdownLeftPadding * (i + 1) + dropDownWidth * i + dropDownWidth / 4 + 1,
      dropDownWidth / 4 + 1,
      dropDownWidth / 2 - 2,
      dropDownWidth / 2 - 2
    );
  }
}
function PlayClick() {
  if (mouseY < 48) {
    // click the button based on x
    if (mouseX < 48) {
      canvas.height = 275;
      view = VIEWS[1];
      clickFunc = CLICKFUNCS[1];
      return;
    }
    // if (mouseX < 48 * 2) {
    //   canvas.height = 275;
    //   view = VIEWS[1];
    //   clickFunc = CLICKFUNCS[1];
    // }
    // if (mouseX < 48 * 3) {
    //   canvas.height = 275;
    //   view = VIEWS[1];
    //   clickFunc = CLICKFUNCS[1];
    // }
    // if (mouseX < 48 * 4) {
    //   canvas.height = 275;
    //   view = VIEWS[1];
    //   clickFunc = CLICKFUNCS[1];
    // }
  }
  player.startAnimation();
  world.hitBlock();
}
function CartView() {
  cartPopup.draw();
}

// setup canvas
canvas = document.getElementById("gamecanvas");
const c = canvas.getContext("2d");
c.scale(4, 4);
canvas.width = 300;
canvas.height = 275;

// set variables
const FPS = 10;
const BLOCK_WIDTH = 32;
const ORE_TYPES = ["Coal", "Copper", "Iron", "Gold", "Diamond"].reverse();
const player = new Player(
  90,
  World.yOffset + BLOCK_WIDTH,
  32,
  32,
  assets.images["Player3"],
  9
);
const world = new World();
const minecart = new Minecart(true);
const cartPopup = new Popup();
const VIEWS = [PlayView, CartView];
const CLICKFUNCS = [
  PlayClick,
  () => {
    console.log("click");
  },
];
var mouseX = 0;
var mouseY = 0;
var clickFunc = CLICKFUNCS[0];
var view = VIEWS[0];
canvas.height = 200;

function gameloop() {
  setTimeout(() => {
    window.requestAnimationFrame(gameloop);
  }, 1000 / FPS);
  c.clearRect(0, 0, canvas.width, canvas.height);
  view();
}
gameloop();

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  console.log(mouseX, mouseY);
});
window.addEventListener("click", () => {
  clickFunc();
});
window.addEventListener("keydown", (e) => {
  console.log(e.key);

  switch (e.key) {
    case "Tab":
      // check if the view changes
      if (view == VIEWS[0]) return;

      // change the screen height
      canvas.height = 200;
      // set view and click fucntions
      view = VIEWS[0];
      clickFunc = CLICKFUNCS[0];
      break;
    case "1":
      if (view == VIEWS[1]) return;
      canvas.height = 275;
      view = VIEWS[1];
      clickFunc = CLICKFUNCS[1];
      break;
    // case "2":
    //   if (view == VIEWS[1]) return;
    //   canvas.height = 275;
    //   view = VIEWS[3];
    //   break;
    // case "3":
    //   if (view == VIEWS[1]) return;
    //   canvas.height = 275;
    //   view = VIEWS[4];
    //   break;
    // case "4":
    //   if (view == VIEWS[1]) return;
    //   canvas.height = 275;
    //   view = VIEWS[1];
    //   break;
  }
});
