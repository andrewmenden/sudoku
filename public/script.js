import { settings } from './settings.js';

window.post = function(url, data) {
    return fetch(url, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
}

class Sudoku {
    constructor() {
        this.board = Array(81).fill({
            value: 0,
            default: false,
        });
        this.incorrect = [];
        this.difficulty = 0;
        this.data = Array(81).fill(null); //for use with the npm sudoku package
        this.solution = Array(81).fill(null);
    }

    async generate() {
        let response = await fetch('/sudoku/generate');
        let data = await response.json();
        this.data = data.puzzle;
        this.board = data.puzzle.map((value, index) => ({
            value: (value === null) ? 0 : value+1,
            default: (value !== null),
        }));
        response = await post('/sudoku/difficulty', { puzzle: this.data });
        let difficulty = await response.json();
        this.difficulty = difficulty.difficulty;

        response = await post('/sudoku/solve', { puzzle: this.data });
        let solution = await response.json();
        this.solution = solution.solution.map((value) => (value+1));
    }

    set(row, col, value) {
        if (this.board[row * 9 + col].default) return;
        this.board[row * 9 + col].value = value;
    }

    indexToRowCol(index) {
        return {
            row: Math.floor(index / 9),
            col: index % 9,
        };
    }

    get(row, col) {
        return this.board[row * 9 + col];
    }

    getIndex(index) {
        return this.board[index];
    }

    setIndex(index, value) {
        this.board[index] = value;
    }

    updateIncorrect() {
        this.incorrect = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.checkCellIncorrect(i, j)) {
                    this.setCellIncorrect(i, j);
                }
            }
        }
    }

    checkCellIncorrect(row, col) {
        const value = this.get(row, col).value;
        if (value === 0) return false;
        for (let i = 0; i < 9; i++) {
            if (i !== col && this.get(row, i).value === value) return true;
            if (i !== row && this.get(i, col).value === value) return true;
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (i === row && j === col) continue;
                if (this.get(i, j).value === value) return true;
            }
        }
        return false;
    }

    setIncorrect(incorrect) {
        this.incorrect = incorrect;
    }

    setCellIncorrect(row, col) {
        this.incorrect.push(row * 9 + col);
    }
}

class SudokuCanvas {
    constructor(sudoku, canvasElement) {
        this.sudoku = sudoku;
        this.theme = settings.appearance.theme;
        this.colors = settings.appearance.themes[this.theme].sudokuColors;
        this.style = settings.appearance.sudokuProperties;
        this.mode = {
            selectedCell: {row: -1, col: -1},
            pencilMode: 'none' //corners, center, none
        }
        this.pencils = {
            //index: {valuesCorner: arr9, valuesCenter: arr9}
        }
        this.preferences = settings.preferences;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.pencilMarksLocations = settings.preferences.pencilMarksLocations;
        this.pencilMarksLocationsA = settings.preferences.pencilMarksLocationsA;
    }

    setDigit(row, col, digit) {
        if (this.sudoku.get(row, col).default) return;
        if (this.mode.pencilMode === 'none') {
            this.sudoku.set(row, col, digit);
            this.removeAllPencilMarks(row, col);
            if (this.preferences.updatePencilMarks) {
                this.updatePencilMarks({row, col, value: digit});
            }
        } else {
            this.addPencilMark(row, col, digit);
        }
    }

    //placedDigit {row, col, value}
    updatePencilMarks(placedDigit) {
        for (const [index, cell] of Object.entries(this.pencils)) {
            const row = Math.floor(index / 9);
            const col = index % 9;
            if (row === placedDigit.row || col === placedDigit.col) {
                this.removePencilMark(row, col, placedDigit.value);
            }
            const boxRow = Math.floor(placedDigit.row / 3) * 3;
            const boxCol = Math.floor(placedDigit.col / 3) * 3;
            if (row >= boxRow && row < boxRow + 3 && col >= boxCol && col < boxCol + 3) {
                this.removePencilMark(row, col, placedDigit.value, 'both');
            }
        }
    }

    draw() {
        this.sudoku.updateIncorrect();
        this.ctx.fillStyle = this.colors.backgroundColor;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.preferences.highlightMode === 0) {
            this.drawHighlights(this.sudoku.incorrect);
        } else if (this.preferences.highlightMode === 1) {
            this.drawHighlights2(this.sudoku.incorrect);
        }
        this.drawGrid();
        this.drawPencilMarks();
        this.drawNumbers(this.sudoku.incorrect);
    }

    drawGrid() {
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const { minorLineWidth, majorLineWidth } = this.style;
        const cellSize = width / 9;

        ctx.strokeStyle = this.colors.lineColor;
        ctx.lineWidth = 2;

        const step = (width-majorLineWidth) / 9;
        for (let i = 0; i < 10; i++)
        {
            let x = i * step;
            if (i % 3 === 0){
                ctx.lineWidth = majorLineWidth;
                x += majorLineWidth / 2;
            } else {
                ctx.lineWidth = minorLineWidth;
                x += minorLineWidth / 2;
            }
            ctx.beginPath();
            ctx.moveTo(0, x);
            ctx.lineTo(width, x);
            ctx.stroke();
        
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    drawNumbers(markIncorrect = []) {
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const { defaultColor, errorColor, valueColor } = this.colors;
        const { minorLineWidth, majorLineWidth } = this.style;
        const cellSize = width / 9;

        ctx.fillStyle = defaultColor;
        ctx.font = `${cellSize * 0.75}px Lucida Console Regular`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const step = (width-majorLineWidth) / 9;
        for (let i = 0; i < 9; i++)
        {
            for (let j = 0; j < 9; j++)
            {
                const curr = this.sudoku.get(j, i);
                if (curr.value === 0 || curr.value === null) continue;
                const x = i * step + majorLineWidth / 2 + step/2;
                const y = j * step + majorLineWidth / 2 + step/2;
                if (curr.default) {
                    ctx.fillStyle = defaultColor;
                } else {
                    ctx.fillStyle = valueColor;
                }
                if (markIncorrect.includes(j*9+i)) {
                    ctx.fillStyle = errorColor;
                }
                ctx.fillText(curr.value, x, y);
            }
        }
        ctx.fillStyle = 'black';
    }

    drawCornerPencilMarksAt(row, col, values) {
        if (values.length === 0) return;
        if (this.sudoku.get(row, col).default) return;
        if (this.sudoku.get(row, col).value !== 0) return;

        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const { minorLineWidth, majorLineWidth } = this.style;
        const cellSize = width / 9;

        ctx.fillStyle = this.colors.pencilColor1;
        ctx.font = `${cellSize / 6}px Lucida Console Regular`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const step = (width-majorLineWidth) / 9;
        for (let i = 0; i < values.length; i++) {
            const x = col * step + this.decidePencilMarkLocation(row,col).x[i] * (step-minorLineWidth*2) + majorLineWidth;
            const y = row * step + this.decidePencilMarkLocation(row,col).y[i] * (step-minorLineWidth*2) + majorLineWidth;
            ctx.fillText(values[i], x, y);
        }
        ctx.fillStyle
    }

    decidePencilMarkLocation(row, col) {
        if (this.pencils[row*9+col] === undefined) {
            return this.pencilMarksLocations;
        }
        if (this.pencils[row*9+col].valuesCorner.length > 3 &&
            this.pencils[row*9+col].valuesCenter.length > 4) {
            return this.pencilMarksLocationsA;
        }
        return this.pencilMarksLocations;
    }

    drawCenterPencilMarksAt(row, col, values) {
        if (values.length === 0) return;
        if (this.sudoku.get(row, col).default) return;
        if (this.sudoku.get(row, col).value !== 0) return;

        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const { minorLineWidth, majorLineWidth } = this.style;
        const cellSize = width / 9;

        ctx.fillStyle = this.colors.pencilColor2;
        ctx.font = `${cellSize / 6}px Lucida Console Regular`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const step = (width-majorLineWidth) / 9;
        let string = '';
        for (let i = 0; i < values.length; i++) {
            string += values[i];
        }
        const x = col * step + step/2;
        const y = row * step + step/2;
        ctx.fillText(string, x, y);
    }

    addPencilMark(row, col, value) {
        if (this.pencils[row*9+col] === undefined) {
            this.pencils[row*9+col] = {valuesCorner: [], valuesCenter: []};
        }
        if (this.mode.pencilMode === 'corners') {
            if (this.pencils[row*9+col].valuesCorner.includes(value)) {
                this.removePencilMark(row, col, value);
                return;
            }
            this.pencils[row*9+col].valuesCorner.push(value);
            this.pencils[row*9+col].valuesCorner.sort((a, b) => a > b);
        } else  if (this.mode.pencilMode === 'center') {
            if (this.pencils[row*9+col].valuesCenter.includes(value)) {
                this.removePencilMark(row, col, value);
                return;
            }
            this.pencils[row*9+col].valuesCenter.push(value);
            this.pencils[row*9+col].valuesCenter.sort((a, b) => a > b);
        }
    }

    removePencilMark(row, col, value, mode = 'use-mode') {
        let compare;
        if (mode === 'use-mode') {
            compare = this.mode.pencilMode;
        } else {
            compare = mode;
        }
        if (this.pencils[row*9+col] === undefined) return;
        if (compare === 'corners') {
            this.pencils[row*9+col].valuesCorner = this.pencils[row*9+col].valuesCorner.filter(v => v !== value);
        } else if (compare === 'center') {
            this.pencils[row*9+col].valuesCenter = this.pencils[row*9+col].valuesCenter.filter(v => v !== value);
        } else if (compare === 'both') {
            this.pencils[row*9+col].valuesCorner = this.pencils[row*9+col].valuesCorner.filter(v => v !== value);
            this.pencils[row*9+col].valuesCenter = this.pencils[row*9+col].valuesCenter.filter(v => v !== value);
        }

        if (this.pencils[row*9+col].valuesCorner.length === 0 && this.pencils[row*9+col].valuesCenter.length === 0) {
            delete this.pencils[row*9+col];
        }
    }

    removeAllPencilMarks(row, col) {
        delete this.pencils[row*9+col];
    }

    drawPencilMarks() {
        for (let i = 0; i < 9; i++)
        {
            for (let j = 0; j < 9; j++)
            {
                if (this.sudoku.get(i, j).value === 0) {
                    if (this.pencils[i*9+j] !== undefined) {
                        this.drawCornerPencilMarksAt(i, j, this.pencils[i*9+j].valuesCorner);
                        this.drawCenterPencilMarksAt(i, j, this.pencils[i*9+j].valuesCenter);
                    }
                }
            }
        }
    }

    highlightCell(row, col, color) {
        const { ctx, canvas } = this;
        ctx.fillStyle = color;
        const bounds = this.getCellBounds(row, col);
        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.fillStyle = 'black';
    }

    highlightRow(row, color) {
        for (let i = 0; i < 9; i++) {
            this.highlightCell(row, i, color);
        }
    }

    highlightCol(col, color) {
        for (let i = 0; i < 9; i++) {
            this.highlightCell(i, col, color);
        }
    }

    highlightBox(row, col, color) {
        const x = Math.floor(col / 3);
        const y = Math.floor(row / 3);
        for (let i = 0; i < 3; i++)
        {
            for (let j = 0; j < 3; j++)
            {
                this.highlightCell(y*3+i, x*3+j, color);
            }
        }
    }

    //draws selected cell hits
    drawHighlights(markIncorrect) {
        const { selectedCell } = this.mode;
        const { backgroundColor, selectedBackgroundColor, selectedBackgroundColor2 } = this.colors;

        if (selectedCell.row !== -1 && selectedCell.col !== -1) {
            this.highlightRow(selectedCell.row, selectedBackgroundColor2);
            this.highlightCol(selectedCell.col, selectedBackgroundColor2);
            this.highlightBox(selectedCell.row, selectedCell.col, selectedBackgroundColor2);
            this.highlightCell(selectedCell.row, selectedCell.col, selectedBackgroundColor);
        }
        for (const mark of markIncorrect) {
            const row = Math.floor(mark / 9);
            const col = mark % 9;
            if (this.sudoku.getIndex(mark).value === 0) continue;
            if (this.sudoku.getIndex(mark).default) continue;
            this.highlightCell(row, col, this.colors.errorBackgroundColor);
        }
    }

    //draws all numbers and what they hit
    drawHighlights2(markIncorrect) {
        //find all selected numbers
        const { row, col } = this.mode.selectedCell;
        if (row === -1 || col === -1) {
            return;
        }
        const value = this.sudoku.get(row, col).value;
        if (value === 0 || value === null) {
            this.drawHighlights(markIncorrect);
            return;
        }
        for (let i = 0; i < 81; i++) {
            const { row: r, col: c } = this.sudoku.indexToRowCol(i);
            if (this.sudoku.get(r, c).value === value) {
                this.highlightRow(r, this.colors.selectedBackgroundColor4);
                this.highlightCol(c, this.colors.selectedBackgroundColor4);
                this.highlightBox(r, c, this.colors.selectedBackgroundColor4);
                this.highlightCell(r,c, this.colors.selectedBackgroundColor3);
            }
        }

        this.drawHighlights(markIncorrect);
    }

    getCellBounds(row, col) {
        const { width, height } = canvas;
        const { minorLineWidth, majorLineWidth } = sudokuCanvas.style;

        const step = (width-majorLineWidth) / 9;
        return {
            x: col * step,
            y: row * step,
            width: step,
            height: step,
        };
    }

    getCellByCoordinates(x, y) {
        const rect = canvas.getBoundingClientRect();
        const col = Math.floor((x - rect.left) / rect.width*9);
        const row = Math.floor((y - rect.top) / rect.height*9);
        if (col > 8) col = 8;
        if (row > 8) row = 8;
        return { row, col };
    }
}

const sudoku = new Sudoku();
const canvas = document.getElementById('board');
const sudokuCanvas = new SudokuCanvas(sudoku, canvas);

canvas.addEventListener('click', (event) => {
    const { row, col } = sudokuCanvas.getCellByCoordinates(event.clientX, event.clientY);
    sudokuCanvas.mode.selectedCell = { row, col };
    sudokuCanvas.draw();
});

document.addEventListener('keydown', (event) => {
    if (sudokuCanvas.mode.selectedCell.row === -1 || sudokuCanvas.mode.selectedCell.col === -1) {
        return;
    }

    const { key } = event;
    if (key === 'ArrowLeft') {
        sudokuCanvas.mode.selectedCell.col = (sudokuCanvas.mode.selectedCell.col - 1 + 9) % 9;
    } else if (key === 'ArrowRight') {
        sudokuCanvas.mode.selectedCell.col = (sudokuCanvas.mode.selectedCell.col + 1) % 9;
    } else if (key === 'ArrowUp') {
        sudokuCanvas.mode.selectedCell.row = (sudokuCanvas.mode.selectedCell.row - 1 + 9) % 9;
    } else if (key === 'ArrowDown') {
        sudokuCanvas.mode.selectedCell.row = (sudokuCanvas.mode.selectedCell.row + 1) % 9;
    } else if (key >= '1' && key <= '9') {
        sudokuCanvas.setDigit(sudokuCanvas.mode.selectedCell.row, sudokuCanvas.mode.selectedCell.col, parseInt(key));
    } else if (key === 'Backspace' || key === 'Delete') {
        sudoku.set(sudokuCanvas.mode.selectedCell.row, sudokuCanvas.mode.selectedCell.col, 0);
        sudokuCanvas.removeAllPencilMarks(sudokuCanvas.mode.selectedCell.row, sudokuCanvas.mode.selectedCell.col);
    } else if (key === 'q') {
        sudokuCanvas.mode.pencilMode = 'corners';
    } else if (key === 'w') {
        sudokuCanvas.mode.pencilMode = 'center';
    } else if (key === 'e') {
        sudokuCanvas.mode.pencilMode = 'none';
    }

    sudokuCanvas.draw();
});

sudoku.generate().then(() => {
    sudokuCanvas.draw();
});

