import Phaser from "phaser";
import MainScene from "./MainScene";
import { MiniMapController } from "./MiniMapController";

const game = new Phaser.Game({
  pixelArt: true,
  transparent: false,
  width: 1024,
  height: 768,
  backgroundColor: 0xa1e064,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  // Remove or comment to disable physics
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 100,
      },
    },
  },
  // Entry point
  scene: MainScene, // or PhysicsScene
});

// Example of embedding the minimap controller into a standalone scene
// (note that communicating changes to `minimapTexture` is left as an exercise for the reader right now!)
const minimap = new Phaser.Game({
  transparent: true,
  pixelArt: true,
  width: 500,
  height: 500,
  scene: class extends Phaser.Scene {
    public minimapTexture: MiniMapController;

    create = () => {
      console.log("minimap phaser instance started!");
      this.minimapTexture = new MiniMapController(this)
        .clearMap(0, 0)
        .setPosition(0, 0)
        .setMapSize(Math.ceil(1024 / 32), Math.ceil(768 / 32))
        .setDisplaySize(500, 500);
    };

    update = (time: number, delta: number) => {
      this.minimapTexture.clearMap(0xa1e064, 0);
      this.minimapTexture.drawMap([], [{ x: 0, y: 0 }]);
    };
  },
});
