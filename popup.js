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
    inventory = [
      { name: "StoneItem", quantity: 10 },
      { name: "CopperItem", quantity: 10 },
      { name: "GoldItem", quantity: 10 },
      { name: "IronItem", quantity: 10 },
      { name: "DiamondItem", quantity: 10 },
      { name: "CoalItem", quantity: 10 },
    ]
  ) {
    super(x, y, width, height, image);
    this.xPos = 0;
    this.maxXPos = maxXPos;
    this.animate = false;
    this.inventory = inventory;
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
}
class Block extends Entity {
  constructor(x, y, width, depth = 1) {
    // have it randomly choose the blocks here

    super(x, y, width, width, assets.images["Stone"]);
    this.type = "Stone";
    this.xPos = getRandomInt(6);
    for (let i = 0; i < ORE_TYPES.length; i++) {
      if (Math.random() < (0.01 * depth * (i + 1)) / 100) {
        this.image = assets.images[ORE_TYPES[i]];
        console.log(ORE_TYPES[i]);
        this.type = ORE_TYPES[i];
        this.xPos = 0;
        return;
      }
    }
  }
}

class World {
  constructor(depth = 0) {
    this.depth = depth;
    this.width = 7;
    this.height = 3;
    this.blocks = [];
    for (let i = 0; i < this.height; i++) {
      this.blocks.push([]);
      for (let j = 0; j < this.width; j++) {
        this.blocks[i].push(
          new Block(BLOCK_WIDTH * j, BLOCK_WIDTH * i, BLOCK_WIDTH, this.depth)
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
    c.fillRect(1, 32, 128, 32);
    c.globalAlpha = 1.0;
  }
  hitBlock() {
    // have the broken block drop
    this.depth++;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        // every block will need to move
        this.blocks[i][j].x -= BLOCK_WIDTH;
        if (this.blocks[i][j].x == -32) {
          j--;
          console.log("remove one");
          this.blocks[i].shift();
          this.blocks[i].push(
            new Block(
              BLOCK_WIDTH * this.width,
              BLOCK_WIDTH * i,
              BLOCK_WIDTH,
              this.depth
            )
          );
        }
      }
    }
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
        c.drawImage(
          assets.images[player.inventory[[row * column]].name],
          BLOCK_WIDTH + BLOCK_WIDTH * column,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * row
        );
        c.drawImage(
          assets.images.TextBackdrop,
          BLOCK_WIDTH + BLOCK_WIDTH * column,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * row
        );
        c.font = "10px arial";
        c.fillStyle = "black";
        c.fillText(
          player.inventory[[row * column]].quantity,
          BLOCK_WIDTH + BLOCK_WIDTH * column + 2,
          Popup.height * BLOCK_WIDTH - BLOCK_WIDTH * row + 10
        );
      }
    }
    c.resetTransform();
  }
}
// view Functions
function PlayView() {
  world.draw();
  player.draw();
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
const player = new Player(90, 32, 32, 32, assets.images["Player3"], 9);
const world = new World();
const cartPopup = new Popup();
const VIEWS = [PlayView, CartView];
var view = VIEWS[1];

function gameloop() {
  setTimeout(() => {
    window.requestAnimationFrame(gameloop);
  }, 1000 / FPS);
  c.clearRect(0, 0, canvas.width, canvas.height);
  view();
}
gameloop();

window.addEventListener("click", () => {
  player.startAnimation();
  world.hitBlock();
});
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "1":
      view = VIEWS[0];
      break;
    case "2":
      view = VIEWS[1];
      break;
  }
});
