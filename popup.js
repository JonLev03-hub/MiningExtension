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
  Stone: "assets/Stone.png",
  Diamond: "assets/Diamond.png",
  Gold: "assets/Gold.png",
  Iron: "assets/Iron.png",
  Copper: "assets/Copper.png",
  Coal: "assets/Coal.png",
});

// this is an entity class that can be used to draw animated and unanimated images, this will be extended for specific items that have hover actions, or click functions since they will be distinct per object
class Entity {
  constructor(x, y, width, height, image) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }
  draw() {
    // draws the image in the correct frame, and iterates the image frame
    c.drawImage(
      this.image,
      0 + this.width,
      0,
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
  constructor(x, y, width, height, image, maxFrame = 0) {
    super(x, y, width, height, image);
    this.frame = 0;
    this.maxFrame = maxFrame;
    this.animate = false;
    this.inventory = [];
    this.maxInventory = 18;
  }
  startAnimation() {
    this.animate = true;
  }
  stopAnimation() {
    this.animate = false;
    this.frame = 0;
  }
  draw() {
    // draws the image in the correct frame, and iterates the image frame
    c.drawImage(
      this.image,
      0 + this.width * this.frame,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.animate) {
      this.frame++;
      if (this.frame >= this.maxFrame - 1) {
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
    for (let i = 0; i < ORE_TYPES.length; i++) {
      if (Math.random() < (0.01 * depth * (i + 1)) / 100) {
        this.image = assets.images[ORE_TYPES[i]];
        console.log(ORE_TYPES[i]);
        this.type = ORE_TYPES[i];
        return;
      }
    }
  }
  draw() {
    c.drawImage(
      this.image,
      0,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
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
canvas = document.getElementById("gamecanvas");
const c = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 300;
const FPS = 10;
const BLOCK_WIDTH = 32;
const ORE_TYPES = ["Coal", "Copper", "Iron", "Gold", "Diamond"].reverse();
const player = new Player(90, 32, 32, 32, assets.images["Player1"], 9);
const world = new World();
function gameloop() {
  setTimeout(() => {
    window.requestAnimationFrame(gameloop);
  }, 1000 / FPS);
  c.clearRect(0, 0, canvas.width, canvas.height);
  world.draw();
  player.draw();
}
gameloop();

window.addEventListener("click", () => {
  player.startAnimation();
  world.hitBlock();
});
