"use strict";

var Plumber = (function() {
    const BLOCK_TYPE_CROSS = 1;
    const BLOCK_TYPE_ELBOW_NE = 2;
    const BLOCK_TYPE_ELBOW_NW = 3;
    const BLOCK_TYPE_ELBOW_SE = 4;
    const BLOCK_TYPE_ELBOW_SW = 5;
    const BLOCK_TYPE_HORIZONTAL = 6;
    const BLOCK_TYPE_VERTICAL = 7;
    const AllPipes = [
	{ 'img':"pipe_cross.jpg",
	  "percent": 40,
	  'score':50,
	  'pipetype':BLOCK_TYPE_CROSS,
	},
	{ 'img':"pipe_horizontal.jpg",
	  "percent": 10,
	  'score':40,
	  'pipetype':BLOCK_TYPE_HORIZONTAL,
	},
	{ 'img':"pipe_vertical.jpg",
	  "percent": 10,
	  'score':40,
	  'pipetype':BLOCK_TYPE_VERTICAL,
	},
	{ 'img':"pipe_elbow_ne.jpg",
	  "percent": 10,
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_NE,
	},
	{ 'img':"pipe_elbow_nw.jpg",
	  "percent": 10,
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_NW,
	},
	{ 'img':"pipe_elbow_se.jpg",
	  "percent": 10,
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_SE,
	},
	{ 'img':"pipe_elbow_sw.jpg",
	  "percent": 10,
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_SW,
	},
    ];
    var ROW_START;
    var COL_START;
    var ROW_DRAIN;
    var COL_DRAIN;
    var currentPipeType;
    var MaxRows;
    var MaxCols;


    function initGame(initRows, initCols, randomBeginEnd) {
	//alert('initGame');
	MaxRows = initRows;
	MaxCols = initCols;
	//alert('initGame MacRows=' + MaxRows + ' MaxCols=' + MaxCols + ' randomBeginEnd=' + randomBeginEnd);
	if (randomBeginEnd) {
	    ROW_START = Math.floor(Math.random() * MaxRows);
	    COL_START = Math.floor(Math.random() * (MaxCols-1));
	    ROW_DRAIN = Math.floor(Math.random() * MaxRows);
	    COL_DRAIN = Math.floor(Math.random() * MaxCols);
	    while ((ROW_START == ROW_DRAIN) && (COL_START == COL_DRAIN)) {
		ROW_DRAIN = Math.floor(Math.random() * MaxRows);
		COL_DRAIN = Math.floor(Math.random() * MaxCols);
	    }
	} else {
	    ROW_START = 4;
	    COL_START = 2;
	    ROW_DRAIN = 4;
	    COL_DRAIN = MaxCols - 3;
	}
	document.getElementById('control-score').value = 0;

	var gameTable = document.getElementById('VisibleTable');
	// clean out old rows
	for (var i = gameTable.rows.length; i > 0; i--) {
		gameTable.deleteRow(i - 1);
	}
	//while (gameTable.hasChildNodes()) {
	//    gameTable.removeChild(gameTable.firstChild);
	//}
	//gameTable.innerHTML = "";
	for (var row=0; row<MaxRows; row++) {
	    var tr = document.createElement('TR');
	    gameTable.appendChild(tr);
	    for (var col=0; col<MaxCols; col++) {
		var td = document.createElement('TD');
		td.setAttribute("id", 'cell-' + row + '-' + col);
		// install the onclick handler
		td.onclick = selectCell;
		tr.appendChild(td);
	    }
	}

	var cellStartID = 'cell-' + ROW_START + '-' +  COL_START;
	var cellStart = document.getElementById(cellStartID);
	cellStart.innerHTML = '<img class="pipe-image" src="img/right-arrow.png">';	
	cellStart.onclick = doNothing;
        cellStart.setAttribute("data", 10);
	
	var cellDrainID = 'cell-' + ROW_DRAIN + '-' +  COL_DRAIN;
	var cellEnd = document.getElementById(cellDrainID);
	cellEnd.innerHTML = '<img class="pipe-image" src="img/drain.png">';	
	cellEnd.onclick = doNothing;
    }
    
    function doNothing(event) {
	return;
    }

    function getPipeType() {
	return currentPipeType;
    }
    
    function pickRandomPipe() {
        var share = 100;
        var idx = 0;
        var prob = Math.floor(100 * Math.random());
        while (idx < AllPipes.length) {
            share -= AllPipes[idx].percent;
            if (share < 0) {
                alert("ExpandString: rule percent totals over 100.");
                share = 0;
            }
            if (prob >= share) break;
            idx += 1;
        }
        if (idx == AllPipes.length)
            idx = AllPipes.length - 1;
	currentPipeType = AllPipes[idx].pipetype;
        return '<img class="pipe-image" src="img/' + AllPipes[idx].img + '">';	
    }

    function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getScore(obj) {
	//alert("getScore");
	var cellStartID = 'cell-' + ROW_START + '-' +  COL_START;
	var cellStart = document.getElementById(cellStartID);
	var startData = parseInt(cellStart.getAttribute("data"));
	if (startData == 0) {
	    // already got score, user probably clicked button twice
	    return;
	}
	cellStart.setAttribute("data", 0); // mark as scored
	var score = parseInt(obj.value); // get game's current score
	var row = ROW_START;
	var col = COL_START;
	var flowDirection = 'e'; // move east from start
	var flowActive = true;

	while (flowActive) {
	    switch (flowDirection) {
	    case 'n': // north/up
		row -= 1;
		break;
	    case 's': // south/down
		row += 1;
		break;
	    case 'e': // east/right
		col += 1;
		break;
	    case 'w': // west/left
		col -= 1;
		break;
	    default:
		alert("flowdirection=" + flowdirection);
	    }
	    //alert("calcScore row=" + row + " col=" + col);
	    
	    if ((row < 0) || (row >= MaxRows)) {
		// show spill?
		break;
	    }
	    if ((col < 0) || (col >= MaxCols)) {
		// show spill?
		break;
	    }

	    if (row == ROW_DRAIN && col == COL_DRAIN) {
		//alert("reached drain");
		score += 800;
		obj.value = score;
		break;
	    }

	    var cellID = 'cell-' + row + '-' +  col;
	    var cell = document.getElementById(cellID);
	    var pipetype = cell.getAttribute("data");
	    if (pipetype == null) {
		score -= 100;
		obj.value = score;
		flowActive = false;
		cell.style.background = "red";
		break;
	    }
	    var str = cell.innerHTML;
	    var newstr = str.replace(/.jpg/, '_fill.jpg');
	    cell.innerHTML = newstr;
	    switch (parseInt(pipetype)) {
	    case BLOCK_TYPE_CROSS:
		// flow direction unchanged
		break;
	    case BLOCK_TYPE_ELBOW_NE:
		if (flowDirection == 'n') {
		    flowDirection = 'w';
		} else if (flowDirection == 'e') {
		    flowDirection = 's';
		} else {
		    flowActive = false;
		}
		break;
	    case BLOCK_TYPE_ELBOW_NW:
		if (flowDirection == 'n') {
		    flowDirection = 'e';
		} else if (flowDirection == 'w') {
		    flowDirection = 's';
		} else {
		    flowActive = false;
		}
		break;
	    case BLOCK_TYPE_ELBOW_SE:
		if (flowDirection == 's') {
		    flowDirection = 'w';
		} else if (flowDirection == 'e') {
		    flowDirection = 'n';
		} else {
		    flowActive = false;
		}
		break;
	    case BLOCK_TYPE_ELBOW_SW:
		if (flowDirection == 's') {
		    flowDirection = 'e';
		} else if (flowDirection == 'w') {
		    flowDirection = 'n';
		} else {
		    flowActive = false;
		}
		break;
	    case BLOCK_TYPE_HORIZONTAL:
		if ((flowDirection == 'n') || (flowDirection == 's')) {
		    flowActive = false;
		}
		break;
	    case BLOCK_TYPE_VERTICAL:
		if ((flowDirection == 'e') || (flowDirection == 'w')) {
		    flowActive = false;
		}
		break;
	    default:
		alert("unknown pipetype=" + pipetype);
	    }
	    if (flowActive) {
		score += AllPipes[pipetype-1].score;
		obj.value = score;
		await sleep(100);
	    } else {
		cell.style.background = "red";
	    }
	}
    }

    
    return {
	'initGame': initGame,
	'pickRandomPipe': pickRandomPipe,
	'getPipeType': getPipeType,
	'getScore': getScore
    };
})();
