"use strict";

var Plumber = (function() {
    const MaxRows = 10;
    const MaxCols = 15;
    const BLOCK_TYPE_CROSS = 1;
    const BLOCK_TYPE_ELBOW_NE = 2;
    const BLOCK_TYPE_ELBOW_NW = 3;
    const BLOCK_TYPE_ELBOW_SE = 4;
    const BLOCK_TYPE_ELBOW_SW = 5;
    const BLOCK_TYPE_HORIZONTAL = 6;
    const BLOCK_TYPE_VERTICAL = 7;
    const AllPipes = [
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
	{ 'img':"pipe_cross.jpg",
	  'score':50,
	  'pipetype':BLOCK_TYPE_CROSS,
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
    var ROW_START;
    var COL_START;
    var ROW_DRAIN;
    var COL_DRAIN;
    var currentPipeType;


    function initGame(randomStart) {
	//alert('initGame');
	if (randomStart) {
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
	    COL_DRAIN = 12;
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
        cellStart.setAttribute("data", 1);
	
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

    async function getScore(obj) {
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
		score -= 10;
		obj.value = score;
		flowActive = false;
		cell.style.background = "red";
		break;
	    }
	    var str = cell.innerHTML;
	    var newstr = str.replace(/.jpg/, '_fill.jpg');
	    cell.innerHTML = newstr;
	    switch (parseInt(pipetype)) {
	    case 0:
		break;
	    case BLOCK_TYPE_CROSS:
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
		score += getPipeScore(pipetype);
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
