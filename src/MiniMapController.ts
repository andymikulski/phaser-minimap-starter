import Phaser from "phaser";

export class MiniMapController extends Phaser.GameObjects.RenderTexture {
  constructor(scene: Phaser.Scene) {
    // Width and height will be updated later when maps update, just set to `1` for now
    super(scene, 0, 0, 1, 1);
    this.setOrigin(0, 0);
    this.cursorGroup = scene.add.group();
    this.cursorGroup.setOrigin(0, 0);

    scene.add.existing(this);
  }

  public setMapSize = (width: number, height: number) => {
    this.resize(width, height);
    return this;
  };

  public clearMap = (clearColor = 0x000000, alpha = 1.0) => {
    this.fill(clearColor, alpha);

    return this;
  };

  public drawMap = (
    users: { x: number; y: number; color?: number }[],
    walls: { x: number; y: number }[],
    wallColor = 0xffffff,
    wallAlpha = 1.0
  ) => {
    if (!walls.length && !users.length) {
      this.clearMap();
      return;
    }

    // Collect a bunch of `cursor`s into a group which we can throw into `draw` all at once
    this.prepareCursorGroupForDrawing(walls, wallColor);
    // // Draw all of the walls in a single pass
    this.draw(this.cursorGroup, 0, 0, wallAlpha, wallColor);
    // // Remove objects from the stage since they're no longer necessary
    this.flushCursorsToPool();

    // Note - this upcoming example assumes each user will have a unique `color` attached.
    // If they're all the same color, though, you can use basically the exact same `draw` snippet as above!

    // Group the color drawing for users
    const usersByColor = users.reduce((acc, curr) => {
      const color =
        curr.color === undefined
          ? 0xFFFFFF // default to white
          : curr.color;

      acc[color] = acc[color] || [];
      acc[color].push({
        x: curr.x,
        y: curr.y,
        color,
      });
      return acc;
    }, {} as { [color: number]: { x: number; y: number; color: number }[] });

    // console.log('usersbycolor', usersByColor);
    this.beginDraw();
    for (const color in usersByColor) {
      this.prepareCursorGroupForDrawing(usersByColor[color], parseInt(color, 10));
      this.draw(this.cursorGroup);
    }
    this.endDraw();

    // Clean up cursors
    this.flushCursorsToPool();

    return this;
  };

  /**
   * `Group` object used to collect a bunch of cursors so the `draw` call on the RT is quick.
   */
  private cursorGroup: Phaser.GameObjects.Group;

  /**
   * List of cursor cursors used in `drawMap`.
   * These don't update or interact with the stage at all - they are purely for (very quickly) drawing
   * to the internal render texture of our minimap.
   */
  private cursorPool: Phaser.GameObjects.Rectangle[] = [];

  /**
   * Returns an existing rectangle object from the pool, creates one if needed.
   */
  private getCursor = () => {
    return this.cursorPool.pop() || this.createCursor(this.scene);
  };

  /**
   * Creates a 'dummy' rectangle GameObject.
   * It does not update, it doesn't render
   */
  private createCursor = (scene: Phaser.Scene) => {
    return scene.add
      .rectangle(0, 0, 1, 1, 0xffffff, 1)
      .setOrigin(0, 0)
      .removeFromUpdateList()
      .removeFromDisplayList();
  };

  /**
   * Takes the existing cursor cursors and 'frees' them by pushing into the pool.
   * The cursor group is then cleared - to be repopulated within `revealMaskForSpace`
   */
  private flushCursorsToPool = () => {
    if (!this.cursorGroup) {
      return;
    }

    Array.prototype.push.apply(this.cursorPool, this.cursorGroup.children);
    this.cursorGroup.children.clear();
  };

  /**
   * Given a list of x,y coordinates, prepares the cursor group for drawing
   */
  private prepareCursorGroupForDrawing(points: { x: number; y: number }[], color:number) {
    let cursor;
    for (let i = 0; i < points.length; i++) {
      cursor = this.getCursor();
      cursor.x = points[i].x;
      cursor.y = points[i].y;
      cursor.fillColor = color;
      this.cursorGroup.add(cursor);
    }
  }
}
