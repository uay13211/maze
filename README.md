# Maze

This program builds a maze.
The maze has one path between any two cells.
Breadth-first search finds the shortest path from the top-left cell to the bottom-right cell.
The page shows each step of that search.

You need Node.js 24 or later.
The file `.nvmrc` selects Node.js 24.

## Run the program

1. Run `npm install`.
2. Run `npm run dev`.
3. Open the local address that Vite prints.

You can also run `npm start`.

## Use the program

1. Choose a size: 30×30, 100×100, or 300×300. The program builds a new maze.
2. Choose a speed. Slow is the default. On a 30×30 maze, Slow moves one step at a time.
3. Click Play. The search starts.
4. Read the step view under the maze. The view shows the step number, a description, the queue, and the visited-cell count.
5. Click Pause to stop the timer. Click Step to move one step. Click Resume to continue.
6. Wait for the end of the search, or use a faster speed. The page shows the shortest path.
7. Click Reset. The program stops the search and builds a new maze of the same size.

## Build the program

1. Run `npm install`.
2. Run `npm run build`.
3. The program writes the files to the `dist` folder.

## Test the program

1. Run `npm install`.
2. Run `npm test`.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` on Node.js 24.
