# Small sudoku player

## Download

1. If you dont have nodejs install [nodejs](https://nodejs.org/en).
2. Open a command prompt where you want to install.
3. `git clone https://github.com/andrewmenden/sudoku.git`
4. `cd sudoku`
5. `npm install express`
6. `npm start`
7. Go to your browser and open http://localhost:3000

**If you want puzzles**, you need to download a dataset. Currently only csv files formatted with id,puzzle,solution,clues,difficulty columns work (although it might be possible to get away with just id,puzzle,solution). I used [this](https://www.kaggle.com/datasets/radcliffe/3-million-sudoku-puzzles-with-ratings)

Once you've downloaded the puzzles. Name the file "puzzles.csv" and put it inside the *public* folder.

Unfortunately loading puzzles does not yet have any easy buttons to click, so you need to open the browser console and run `setPuzzle(5)` (replace 5 with any number 1 to 3,000,000 if you've downloaded the same file as me).