const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');

const arr = [
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
];

const mode = {
    place: "value",
    currCell: {x: -1, y: -1}, //indices
    currPuzzle: {}
};

async function loadJson(jsonFileUrl) {
    try {
        const response = await fetch(jsonFileUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function initCtx() {
    ctx.font = '400px Lucida Console Regular';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = settings.majorLineWidth;
}

function initBoard() {
    for (let i = 0; i < 9; i++)
    {
        for (let j = 0; j < 9; j++)
        {
            arr[i][j].default = 0;
            arr[i][j].value = 0;
            arr[i][j].color = 'black';
            arr[i][j].highlight = '';
        }
    }
}

function drawGridLines() {
    const step = (canvas.width-settings.majorLineWidth) / 9;
    for (let i = 0; i < 10; i++)
    {
        let x = i * step;
        if (i % 3 === 0){
            ctx.lineWidth = settings.majorLineWidth;
            x += settings.majorLineWidth / 2;
        } else {
            ctx.lineWidth = settings.minorLineWidth;
            x += settings.minorLineWidth / 2;
        }
        ctx.beginPath();
        ctx.moveTo(0, x);
        ctx.lineTo(canvas.width, x);
        ctx.stroke();
    
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function drawNumbers() {
    const step = (canvas.width-settings.majorLineWidth) / 9;
    for (let i = 0; i < 9; i++)
    {
        for (let j = 0; j < 9; j++)
        {i
            if (arr[j][i].value === 0) continue;
            const x = i * step + settings.majorLineWidth / 2 + step/2;
            const y = j * step + settings.majorLineWidth / 2 + step/2;
            // ctx.beginPath();
            // ctx.arc(x, y, 20, 0, Math.PI*2);
            // ctx.stroke();
            // ctx.fill();
            ctx.fillStyle = arr[j][i].color;
            ctx.fillText(arr[j][i].value, x, y);
        }
    }
    ctx.fillStyle = 'black';
}

function INTERNALhighlightCell(x,y,color)
{
    if (x < 0 || x > 8 || y < 0 || y > 8) return;
    const step = (canvas.width-settings.majorLineWidth) / 9;
    ctx.fillStyle = color;
    ctx.fillRect(x*step + settings.majorLineWidth / 2, y*step + settings.majorLineWidth / 2, step, step);
    ctx.fillStyle = 'black';
}

function drawHighlights() {
    for (let i = 0; i < 9; i++)
    {
        for (let j = 0; j < 9; j++)
        {
            if (arr[j][i].highlight === '') continue;
            INTERNALhighlightCell(i, j, arr[j][i].highlight);
        }
    }
}

function highlightCell(x, y, color)
{
    arr[y][x].highlight = color;
    if (arr[y][x].default !== 0) {
        arr[y][x].color = settings.colors.default2;
    } else if (arr[y][x].value !== 0) {
        arr[y][x].color = settings.colors.value2;
    }
}

function highlightRow(y, color)
{
    for (let i = 0; i < 9; i++)
    {
        arr[y][i].highlight = color;
    }
}

function highlightColumn(x, color) {
    for (let i = 0; i < 9; i++)
    {
        arr[i][x].highlight = color;
    }
}

function highlightSquare(x, y, color) {
    x = Math.floor(x / 3);
    y = Math.floor(y / 3);
    for (let i = 0; i < 3; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            arr[y*3+i][x*3+j].highlight = color;
        }
    }
}

function clearHighlights() {
    for (let i = 0; i < 9; i++)
    {
        for (let j = 0; j < 9; j++)
        {
            arr[j][i].highlight = '';
            if (arr[j][i].default !== 0) {
                arr[j][i].color = settings.colors.default;
            } else if (arr[j][i].value !== 0) {
                arr[j][i].color = settings.colors.value;
            }
        }
    }
}

function setHighlights(x, y) {
    if (x < 0 || x > 8 || y < 0 || y > 8) return;
    clearHighlights();
    highlightColumn(x, settings.colors.highlight);
    highlightRow(y, settings.colors.highlight);
    highlightSquare(x, y, settings.colors.highlight);
    highlightCell(x, y, settings.colors.highlight2);
}

function updateColors() {
    setHighlights(mode.currCell.x, mode.currCell.y);
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[j][i].default !== 0) {
                arr[j][i].color = settings.colors.default;
            } else if (arr[j][i].value !== 0) {
                arr[j][i].color = settings.colors.value;
            }
            if (mode.currCell.x === i && mode.currCell.y === j) {
                if (arr[j][i].default !== 0) {
                    arr[j][i].color = settings.colors.default2;
                } else if (arr[j][i].value !== 0) {
                    arr[j][i].color = settings.colors.value2;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateColors();
    drawHighlights();
    drawGridLines();
    drawNumbers();
}

async function fetchChunk(url, start, end) {
    const response = await fetch(url, {
        headers: {
        'Range': `bytes=${start}-${end}`
        }
    });

    if (response.ok) {
        const blob = await response.blob();
        const text = await blob.text();
        // Process the chunk of text here
        return text;
    } else {
        console.error('Failed to fetch chunk:', response.status);
    }
}

async function fetchSudoku(index) {
    //35\n 81,81,~2,3\n
    let step = 81+1+81+1+2+1+3+1;
    let start = index * step + 36;
    if (start<0) start = 0;
    let end = start + step + 600 + 36;
    let attempt;
    let lines;
    let line; //this is what we want
    let indexFound=1;
    for (let i = 0; i < 10; i++) {
        attempt = await fetchChunk("sudoku-3m.csv", start, end);
        lines = attempt.split('\n');
        indexFound = Number(lines[1].split(',')[0])
        if (indexFound === index) {
            line = lines[1];
            break;
        }
        let difference = index - Number(lines[1].split(',')[0]);
        start += difference * step;
        end += difference * step;
    }
    if (indexFound !== index) {
        //in this case, we go back a bit, traverse the chunk,
        //and if it's still not found, give up.
        attempt = await fetchChunk("sudoku-3m.csv", start - 600, start);
        lines = attempt.split('\n');
        for (let i = 1; i < lines.length; i++) {
            indexFound = Number(lines[i].split(',')[0]);
            if (indexFound === index) {
                line = lines[i];
                break;
            }
        }
        console.log("Cannot find sudoku");
    }
    return line.split(',');
}

async function setPuzzle(index) {
    let puzzle = await fetchSudoku(index);
    mode.currPuzzle.index = puzzle[0];
    mode.currPuzzle.setup = puzzle[1];
    mode.currPuzzle.solution = puzzle[2];
    mode.currPuzzle.clues = puzzle[3];
    mode.currPuzzle.rating = puzzle[4];
    console.log(mode.currPuzzle);

    for (let i = 0; i < 81; i++) {
        let x = i % 9;
        let y = Math.floor(i / 9);
        let value;
        if (mode.currPuzzle.setup[i] === '.') {
            value = 0;
        } else {
            value = parseInt(mode.currPuzzle.setup[i]);
        }
        arr[y][x].default = value;
        arr[y][x].value = value;
    }
    draw();
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / canvas.getBoundingClientRect().width*9);
    const y = Math.floor((event.clientY - rect.top) / canvas.getBoundingClientRect().height*9);
    if (x > 8) x = 8;
    if (y > 8) x = 8;
    mode.currCell.x = x;
    mode.currCell.y = y;
    setHighlights(x, y);
    draw();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && mode.currCell.y > 0) {
        mode.currCell.y--;
    } else if (event.key === 'ArrowDown' && mode.currCell.y < 8) {
        mode.currCell.y++;
    } else if (event.key === 'ArrowLeft' && mode.currCell.x > 0) {
        mode.currCell.x--;
    } else if (event.key === 'ArrowRight' && mode.currCell.x < 8) {
        mode.currCell.x++;
    }

    if (event.key >= '1' && event.key <= '9') {
        if (mode.place === 'value') {
            if (arr[mode.currCell.y][mode.currCell.x].default === 0) {
                arr[mode.currCell.y][mode.currCell.x].value = parseInt(event.key);
            }
        } else if (mode.place = 'default') {
            arr[mode.currCell.y][mode.currCell.x].default = parseInt(event.key);
            arr[mode.currCell.y][mode.currCell.x].value = parseInt(event.key);
        }
    }
    if (event.key === 'delete' || event.key === 'Backspace') {
        if (mode.place === 'value') {
            if (arr[mode.currCell.y][mode.currCell.x].default === 0) {
                arr[mode.currCell.y][mode.currCell.x].value = 0;
            }
        } else if (mode.place = 'default') {
            arr[mode.currCell.y][mode.currCell.x].default = 0;
            arr[mode.currCell.y][mode.currCell.x].value = 0;
        }
    }
    draw();
});

let settings = {};
loadJson('settings.json').then((data) => {
    settings = data;
    initCtx();
    initBoard();
    draw();
});