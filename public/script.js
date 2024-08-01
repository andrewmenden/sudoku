class Sudoku {
    constructor() {
        this.board = Array(81).fill({
            value: 0,
            default: false,
        });
    }

    generate() {
        return fetch('/sudoku/generate')
            .then(res => res.json())
            .then(data => {
                this.board = data.puzzle.map((value, index) => ({
                    value,
                    default: value !== null,
                }));
        });
    }

    set(row, col, value) {
        this.board[row * 9 + col] = value;
    }

    get(row, col) {
        return this.board[row * 9 + col];
    }
}

class SudokuCanvas {
    constructor(sudoku, canvasElement) {
        this.sudoku = sudoku;
        this.colors = {
            defaultColor: 'black',
            errorColor: 'red',
            valueColor: 'blue',
            
            backgroundColor: 'rgba(0,0,0,0)',
            selectedBackgroundColor: 'rgba(0,0,0,0.5)',
            selectedBackgroundColor2: 'rgba(0,0,0,0.2)',

            lineColor: 'black',
        };
        this.style = {
            minorLineWidth: 10,
            majorLineWidth: 20,
        }
        this.mode = {
            selectedCell: {row: -1, col: -1},
        }
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawHighlights();
        this.drawGrid();
        this.drawNumbers();
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

    drawNumbers() {
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
                ctx.fillText(curr.value, x, y);
            }
        }
        ctx.fillStyle = 'black';
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

    drawHighlights() {
        const { selectedCell } = this.mode;
        const { backgroundColor, selectedBackgroundColor, selectedBackgroundColor2 } = this.colors;

        if (selectedCell.row !== -1 && selectedCell.col !== -1) {
            this.highlightCell(selectedCell.row, selectedCell.col, selectedBackgroundColor);
            this.highlightRow(selectedCell.row, selectedBackgroundColor2);
            this.highlightCol(selectedCell.col, selectedBackgroundColor2);
            this.highlightBox(selectedCell.row, selectedCell.col, selectedBackgroundColor2);
        }
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

sudoku.generate().then(() => {
    sudokuCanvas.draw();
});

