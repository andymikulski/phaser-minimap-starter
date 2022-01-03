import Phaser from "phaser";
import { MiniMapController } from "./MiniMapController";
import { throttle } from "./throttle";

const NUM_MARIOS = 10;

// Dictates how much world space a single pixel in the minimap represents.
// e.g. here, 1px in the minimap represents 16 units in world space
const MINIMAP_GRID_SIZE = 16;
// Setting the grid size to a higher number results in a less accurate minimap, but also
// increases how fast the minimap can be drawn.
export default class MainScene extends Phaser.Scene {
  private marios: Phaser.GameObjects.Image[] = [];

  // used for example purposes
  private walls: { x: number; y: number }[] = [];

  // This is the reference to the minimap
  minimap: MiniMapController;

  preload = () => {
    this.load.image("mario", "https://i.imgur.com/nKgMvuj.png");
    this.load.image("background", "https://i.imgur.com/dzpw15B.jpg");
  };

  create = () => {
    this.setupExampleStuff();

    this.minimap = new MiniMapController(this)
      // Convert the map's world size to the 'grid' size
      .setMapSize(
        Math.ceil(1024 / MINIMAP_GRID_SIZE),
        Math.ceil(768 / MINIMAP_GRID_SIZE)
      )
      .clearMap()
      // Display the map at 1/4 of the canvas scale (arbitrary)
      .setDisplaySize(1024 / 4, 768 / 4);

    // Create some walls for demo purposes
    for (let i = 0; i < Math.PI * 2; i += Math.PI / 8) {
      // Note these are grid coordinates - NOT world positions
      this.walls.push({
        x: /* offset */ 4 + /* arc */ (4 + Math.cos(i) * 4),
        y: /* offset */ 4 + /* arc */ (4 + Math.sin(i) * 4),
      });
    }
  };

  update = (time: number, delta: number) => {
    // do something every tick here
    this.updateMarioPositions(delta);

    // Trigger a minimap update (MAYBE! This is throttled; see below)
    this.updateMiniMap();

    // Follow the first mario
    // const firstMario = this.marios[0];
    // this.minimap.camera.centerOn(
    //   firstMario.x / MINIMAP_GRID_SIZE,
    //   firstMario.y / MINIMAP_GRID_SIZE
    // );
    // this.minimap.camera.setZoom(3); // zoom in
    // this.minimap.camera.setZoom(0.5); // zoom out
  };

  updateMiniMap = throttle(() => {
    // wipe the map
    this.minimap.clearMap();

    const users = this.marios.map((mario, idx) => ({
      // Convert mario's world position into the grid position
      x: mario.x / MINIMAP_GRID_SIZE,
      y: mario.y / MINIMAP_GRID_SIZE,
      // Assign arbitrary color based on index so we can follow individual 'users'
      color: idx * 255 * (idx * idx),
    }));

    // Send the positions in for users + walls so the minimap can update its texture
    this.minimap.drawMap(users, this.walls);
  }, 1000 / 10); // only run 10 times a second; change as necessary. keep low for better perf!

  private setupExampleStuff() {
    this.add.text(0, 0, "Main Scene - no physics", {
      color: "#fff",
      fontSize: "16px",
    });

    this.add
      .image(0, 0, "background")
      .setOrigin(0, 0) // Anchor to top left so (0,0) is flush against the corner
      .setDisplaySize(1024, 768) // Fit background image to window
      .setDepth(-1); // Behind everything

    let mario;
    for (let i = 0; i < NUM_MARIOS; i++) {
      mario = this.add
        .image(32, 32, "mario")
        .setData("velocity", { x: Math.random() * 500, y: Math.random() * 500 })
        .setDisplaySize(32, 32);
      this.marios.push(mario);
    }
  }

  private updateMarioPositions(delta: number) {
    let mario;
    let velocity;
    for (let i = 0; i < this.marios.length; i++) {
      mario = this.marios[i];
      velocity = mario.getData("velocity") as { x: number; y: number };

      // Move the thing
      mario.x += velocity.x * delta * 0.001;
      mario.y += velocity.y * delta * 0.001;

      // Check if we hit a boundary and bounce
      if (mario.x > 1024 || mario.x < 0) {
        velocity.x *= -1;
      }
      if (mario.y > 768 || mario.y < 0) {
        velocity.y *= -1;
      }
      mario.setData("velocity", velocity);
    }
  }
}
