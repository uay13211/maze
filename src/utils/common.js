export const randomSelect = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const directions = ["top", "right", "bottom", "left"];

export const oppositeDirection = (direction) => {
  switch (direction) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
};

export class Box {
  constructor({ id, size, topBoxId, rightBoxId, bottomBoxId, leftBoxId }) {
    this.id = id;
    this.visited = false;
    this.size = size;
    this.topWall = true;
    this.rightWall = true;
    this.bottomWall = true;
    this.leftWall = true;
    this.topBoxId = topBoxId;
    this.rightBoxId = rightBoxId;
    this.bottomBoxId = bottomBoxId;
    this.leftBoxId = leftBoxId;
    this.getVisitedDirection = null;
  }

  isVisited = () => {
    return this.visited;
  };

  visit = () => {
    if (this.visited) return;

    this.visited = true;
  };

  removeWall = (direction) => {
    if (!this[`${direction}Wall`]) return;

    this[`${direction}Wall`] = false;
  };

  visitNext = (boxs) => {
    const unVisitedDir = this.unVisitedDirection(boxs);

    if (unVisitedDir.length === 0) return this.backTracking(boxs);

    const direction = randomSelect(unVisitedDir);
    const nextBoxId = this[`${direction}BoxId`];
    const nextBox = boxs[nextBoxId];

    this.visit();
    this.removeWall(direction);

    nextBox.getVisited(oppositeDirection(direction));

    return nextBox.visitNext(boxs);
  };

  backTracking = (boxs) => {
    // starting point
    if (!this.getVisitedDirection) return boxs;
    const previousBoxId = this[`${this.getVisitedDirection}BoxId`];

    return boxs[previousBoxId].visitNext(boxs);
  };

  unVisitedDirection = (boxs) => {
    return directions.filter((direction) => {
      if (direction !== this.getVisitedDirection) {
        const nextBoxId = this[`${direction}BoxId`];
        // outside Maze
        if (!nextBoxId) return false;
        const nextBox = boxs[nextBoxId];
        if (nextBox.isVisited()) return false;

        return true;
      }
    });
  };

  getVisited = (direction) => {
    this.visit();
    this.removeWall(direction);
    this.getVisitedDirection = direction;
  };

  initPath = () => {
    this.isPath = true;
  };
}
