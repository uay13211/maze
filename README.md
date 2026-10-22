# Maze

This program builds a maze on a 30 by 30 grid.
The maze has one path between any two cells.
Breadth-first search finds the shortest path from the top-left cell to the bottom-right cell.
The page shows each step of that search.

You need Node.js 20 or later.

## Run the program

1. Run `npm install`.
2. Run `npm run dev`.
3. Open the local address that Vite prints.

You can also run `npm start`.

## Use the program

1. Click Play. The search starts.
2. Read the step view under the maze. The view shows the step number, a description, the queue, and the visited-cell count.
3. Wait for the end of the search. The page shows the shortest path.
4. Click Reset. The program stops the search and builds a new maze.

## Build the program

1. Run `npm install`.
2. Run `npm run build`.
3. The program writes the files to the `dist` folder.

## Test the program

1. Run `npm install`.
2. Run `npm test`.
