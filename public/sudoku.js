const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');

const minorLineWidth = 20;
const majorLineWidth = 40;

//indices of the selected cell
const selectedCell = {x: -1, y: -1};

const arr = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [8, 0, 0, 0, 0, 0, 0, 0, 8],
    [8, 0, 0, 0, 0, 0, 0, 0, 8],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 2, 3, 4, 5, 6, 7, 8, 9]
];

ctx.font = '400px Lucida Console Regular';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

ctx.fillStyle = 'black';
ctx.strokeStyle = 'black';
ctx.lineWidth = majorLineWidth;

function drawGridLines() {
    const step = (canvas.width-majorLineWidth) / 9;
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
        ctx.lineTo(canvas.width, x);
        ctx.stroke();
    
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function drawNumbers() {
    const step = (canvas.width-majorLineWidth) / 9;
    for (let i = 0; i < 9; i++)
    {
        for (let j = 0; j < 9; j++)
        {i
            if (arr[j][i] === 0) continue;
            const x = i * step + majorLineWidth / 2 + step/2;
            const y = j * step + majorLineWidth / 2 + step/2;
            // ctx.beginPath();
            // ctx.arc(x, y, 20, 0, Math.PI*2);
            // ctx.stroke();
            // ctx.fill();
            ctx.fillText(arr[j][i], x, y);
        }
    }
}

function highlightCell(x,y,color)
{
    if (x < 0 || x > 8 || y < 0 || y > 8) return;
    const step = (canvas.width-majorLineWidth) / 9;
    ctx.fillStyle = color;
    ctx.fillRect(x*step + majorLineWidth / 2, y*step + majorLineWidth / 2, step, step);
    ctx.fillStyle = 'black';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridLines();
    drawNumbers();
    highlightCell(selectedCell.x, selectedCell.y, 'rgba(0,0,0,0.4)');
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / canvas.getBoundingClientRect().width*9);
    const y = Math.floor((event.clientY - rect.top) / canvas.getBoundingClientRect().height*9);
    if (x > 8) x = 8;
    if (y > 8) x = 8;
    selectedCell.x = x;
    selectedCell.y = y;
    draw();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && selectedCell.y > 0) {
        selectedCell.y--;
    } else if (event.key === 'ArrowDown' && selectedCell.y < 8) {
        selectedCell.y++;
    } else if (event.key === 'ArrowLeft' && selectedCell.x > 0) {
        selectedCell.x--;
    } else if (event.key === 'ArrowRight' && selectedCell.x < 8) {
        selectedCell.x++;
    }

    if (event.key >= '1' && event.key <= '9') {
        arr[selectedCell.y][selectedCell.x] = parseInt(event.key);
    }
    draw();
});

draw();