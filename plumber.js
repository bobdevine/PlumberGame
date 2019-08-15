"use strict";

var Plumber = (function() {
    const MaxRows = 10;
    const MaxCols = 15;
    const ROW_START = 4;
    const COL_START = 2;
    const ROW_DRAIN = 4;
    const COL_DRAIN = 12;
    const BLOCK_TYPE_CROSS = 1;
    const BLOCK_TYPE_ELBOW_NE = 2;
    const BLOCK_TYPE_ELBOW_NW = 3;
    const BLOCK_TYPE_ELBOW_SE = 4;
    const BLOCK_TYPE_ELBOW_SW = 5;
    const BLOCK_TYPE_HORIZONTAL = 6;
    const BLOCK_TYPE_VERTICAL = 7;
    const AllPipes = [
	{ 'img':"pipe_cross.jpg",
	  'score':50,
	  'pipetype':BLOCK_TYPE_CROSS,
	},
	{ 'img':"pipe_elbow_ne.jpg",
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_NE,
	},
	{ 'img':"pipe_elbow_nw.jpg",
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_NW,
	},
	{ 'img':"pipe_elbow_se.jpg",
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_SE,
	},
	{ 'img':"pipe_elbow_sw.jpg",
	  'score':30,
	  'pipetype':BLOCK_TYPE_ELBOW_SW,
	},
	{ 'img':"pipe_horizontal.jpg",
	  'score':40,
	  'pipetype':BLOCK_TYPE_HORIZONTAL,
	},
	{ 'img':"pipe_vertical.jpg",
	  'score':40,
	  'pipetype':BLOCK_TYPE_VERTICAL,
	},
    ];
    var flowDirection = null;
    var currentPipeType = 0;


    function initGame() {
	//alert('initGame');
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
        cellStart.setAttribute("data", 100);
	flowDirection = 'e';
	
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
	const pos = Math.floor(Math.random() * AllPipes.length);
	currentPipeType = AllPipes[pos].pipetype;
        return '<img class="pipe-image" src="img/' + AllPipes[pos].img + '">';	
    }

    function getPipeScore(pipetype) {
	return AllPipes[pipetype-1].score;
	/***
	for (var i=0; i<AllPipes.length; i++) {
	    if (AllPipes[i].pipetype == pipetype) {
		return AllPipes[i].score;
	    }
	}
	alert("getPipeScore: unmatched pipetype=" + pipetype);
	return 0;
	***/
    }
    
    function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function calcScore(obj) {
	var cellStartID = 'cell-' + ROW_START + '-' +  COL_START;
	var cell = document.getElementById(cellStartID);
	var score = parseInt(obj.value);
	score += parseInt(cell.getAttribute("data")); // initial score

	var row = ROW_START;
	var col = COL_START;
	var flowEnded = false;
	while (!flowEnded) {
	    switch (flowDirection) {
	    case 'n':
		row -= 1;
		break;
	    case 's':
		row += 1;
		break;
	    case 'e':
		col += 1;
		break;
	    case 'w':
		col -= 1;
		break;
	    default:
		alert("flowdirection=" + flowdirection);
	    }
	    //alert("calcScore row=" + row + " col=" + col);
	    
	    if ((row < 0) || (row >= MaxRows)) {
		break;
	    }
	    if ((col < 0) || (col >= MaxCols)) {
		break;
	    }

	    if (row == ROW_DRAIN && col == COL_DRAIN) {
		//alert("reached drain");
		score += 500;
		break;
	    }

	    var cellID = 'cell-' + row + '-' +  col;
	    var cell = document.getElementById(cellID);
	    //cell.style.background = 'orange';
	    var pipetype = cell.getAttribute("data");
	    if (pipetype == null) {
		score -= 10;
		flowEnded = true;
		break;
	    }
	    var str = cell.innerHTML;
	    var newstr = str.replace(/.jpg/, '_fill.jpg');
	    cell.innerHTML = newstr;
	    switch (parseInt(pipetype)) {
	    case BLOCK_TYPE_CROSS:
		break;
	    case BLOCK_TYPE_ELBOW_NE:
		if (flowDirection == 'n') {
		    flowDirection = 'w';
		} else if (flowDirection == 'e') {
		    flowDirection = 's';
		} else {
		    flowEnded = true;
		}
		break;
	    case BLOCK_TYPE_ELBOW_NW:
		if (flowDirection == 'n') {
		    flowDirection = 'e';
		} else if (flowDirection == 'w') {
		    flowDirection = 's';
		} else {
		    flowEnded = true;
		}
		break;
	    case BLOCK_TYPE_ELBOW_SE:
		if (flowDirection == 's') {
		    flowDirection = 'w';
		} else if (flowDirection == 'e') {
		    flowDirection = 'n';
		} else {
		    flowEnded = true;
		}
		break;
	    case BLOCK_TYPE_ELBOW_SW:
		if (flowDirection == 's') {
		    flowDirection = 'e';
		} else if (flowDirection == 'w') {
		    flowDirection = 'n';
		} else {
		    flowEnded = true;
		}
		break;
	    case BLOCK_TYPE_HORIZONTAL:
		if ((flowDirection == 'n') || (flowDirection == 's')) {
		    flowEnded = true;
		}
		break;
	    case BLOCK_TYPE_VERTICAL:
		if ((flowDirection == 'e') || (flowDirection == 'w')) {
		    flowEnded = true;
		}
		break;
	    default:
		alert("unknown pipetype=" + pipetype);
	    }
	    if (!flowEnded) {
		score += getPipeScore(pipetype);
		obj.value = score;
		await sleep(100);
	    }
	}

	return score;
    }

    
    return {
	'initGame': initGame,
	'pickRandomPipe': pickRandomPipe,
	'getPipeType': getPipeType,
	'getScore': calcScore
    };
})();
