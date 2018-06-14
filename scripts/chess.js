/**
 * Developed by Ademilson
 * ademilsonssilva1@gmail.com
 *	  _______ ______________  ________   __  _______
 *	 / ___/ // / __/ __/ __/ / ___/ _ | /  |/  / __/
 *	/ /__/ _  / _/_\ \_\ \  / (_ / __ |/ /|_/ / _/  
 *	\___/_//_/___/___/___/  \___/_/ |_/_/  /_/___/  
 *
 * jQuery chess game	                                               
 */
var activeTurn = "white";

$(document).ready(function () {
	
	buildGameTable($("#gameDIV"));

	player1 = createPlayer("Ademilson", "white");
	player2 = createPlayer("Opponent", "black");

	organizeBoard(player1);
	organizeBoard(player2);

	bindPieceActions();
});

function buildGameTable(target)
{
	table = $("<table class='gameTable'></table>");

	for(row=1; row<9; row++) {
		tr = $("<tr class='gameTR'></tr>");

		for(col=1; col < 9; col++) {
			td = $("<td class='gameTD' id=" + row + "-" + col + "> </td>");
			if ((col + row) % 2 == 1) {
				td.addClass("darkBackground");
			}

			tr.append(td);
		}
		table.append(tr);
	}

	target.append(table);
}

function focusRow (row)
{
	row.addClass("selectedFocus");
}

function unfocusAllRows()
{
	$(".gameTD").each(function () {
		$(this).removeClass("selectedFocus");
		unbindAvaliableMoveAction();
		$(this).removeClass("avaliableMove");
		$(this).removeClass("specialMove");
		$(this).removeClass("opponentPiece");
		bindPieceActions();
	});
}

function createPlayer (playerName, color)
{
	player = {
		name: playerName, 
		color: color,
		pieces: createPieces(),
	}
	return player;
}

function createPieces() 
{
	pieces = {
		king: _createPiece("king"),
		queen: _createPiece("queen"),
		bishop: [_createPiece("bishop"), _createPiece("bishop")],
		knight: [_createPiece("knight"), _createPiece("knight")],
		rook: [_createPiece("rook"), _createPiece("rook")],
		pawn: [],
	};

	for(i = 0; i < 8; i++) {
		pawn = _createPiece("pawn");
		pieces.pawn.push(pawn);
	}

	return pieces;
}

function _createPiece(name)
{
	piece = {
		name: name, 
		atualPosition: '',
		ID: Math.floor((Math.random() * 1000000) + 1),
	}

	return piece;
}

function organizeBoard(player)
{
	if (player.color == "white"){
		front_row = "2";
		back_row = "1";
	} 
	else if (player.color == "black") {
		front_row = "7";
		back_row = "8"
	}

	//front row
	for (var i = 1; i <= player.pieces.pawn.length ; i++) {
		showPiece($("#"+front_row+"-"+i), player.color, "pawn");
	}

	//back_row
	for (var i = 1; i <= 8 ; i++) {
		switch (i){
			case 1:
			case 8:
				piece = "rook";
				break;
			case 2:
			case 7:
				piece = "knight";
				break;
			case 3:
			case 6:
				piece = "bishop";
				break;
			case 4:
				piece = "king";
				break;
			case 5:
				piece = "queen"
				break;
		}

		showPiece($("#"+back_row+"-"+i), player.color, piece);
	}
}

function showPiece(row, color, piece)
{
	row.addClass("piece "+color+"_"+piece);
	row.attr("piece", piece);
	row.attr("color", color);
}

function bindPieceActions()
{
	$(".piece").each(function () {
		$(this).unbind("click");
	});
	$(".piece").bind("click", function () {
		if (activeTurn == $(this).attr("color")) {
			if ($(this).hasClass("selectedFocus")) {
				unfocusAllRows();
			}
			else {
				unfocusAllRows();
				focusRow($(this));
				showAvaliablePositions($(this));
			}
		}
		else {
			alert(activeTurn.toUpperCase()+" TURN!");
		}
	});
}

function showAvaliablePositions(target)
{
	position = target.attr("id").split("-");
	row = position[0];
	col = position[1];
	piece = target.attr("piece");
	color = target.attr("color");

	positionInfo = {row: row, col: col, piece: piece, color: color};
	avaliablePositions = {allowed: [], color: color};
	
	if (piece == "pawn") {
		pawnMove(avaliablePositions, positionInfo);
	}
	else if (piece == "rook") {
		horizontalMoves(avaliablePositions, positionInfo, false);
	}
	else if (piece == "king") {
		horizontalMoves(avaliablePositions, positionInfo, true);
		diagonalMoves(avaliablePositions, positionInfo, true);
	}
	else if (piece == "queen") {
		horizontalMoves(avaliablePositions, positionInfo, false);
		diagonalMoves(avaliablePositions, positionInfo, false);
	}
	else if (piece == "bishop") {
		diagonalMoves(avaliablePositions, positionInfo, false);	
	}
	else if (piece == "knight") {
		knightMove(avaliablePositions, positionInfo);
	}

	for (i=0; i< avaliablePositions.allowed.length; i++) {
		if ($("#"+avaliablePositions.allowed[i]).hasClass("piece")) {
			$("#"+avaliablePositions.allowed[i]).addClass("avaliableMove opponentPiece");
		}
		else {
			$("#"+avaliablePositions.allowed[i]).addClass("avaliableMove");	
		}
		if (piece == "pawn") {
			avaliablePositionSplitted = avaliablePositions.allowed[i].split("-");
			if (avaliablePositionSplitted[0] == 1 || avaliablePositionSplitted[0] == 8) {
				$("#"+avaliablePositions.allowed[i]).addClass("specialMove");
			}
		}
	}

	bindAvaliableMoveAction();
}

function bindAvaliableMoveAction()
{
	unbindAvaliableMoveAction();
	$(".avaliableMove").each(function () {
		$(this).bind("click", function () {
			movePiece($(".selectedFocus"), $(this));
		});
	});
	
}

function unbindAvaliableMoveAction ()
{
	$(".avaliableMove").each(function () {
		$(this).unbind("click");
	});
}

function verifyAllowedMove(array, position)
{
	if ($("#"+position).hasClass("piece")) {
		if ($("#"+position).attr("color") != array.color) {
			array.allowed.push(position);
			return -1;
		}
		else {
			return -1;
		}
	}	
	else {
		array.allowed.push(position);
	}
}

function movePiece(selected, target)
{
	selected = getPositionInfo(selected);
	target = getPositionInfo(target);
	if ($("#"+target.id).hasClass("piece")) {
		removePiece($("#"+target.id));
	}
	
	if ($("#"+target.id).hasClass("specialMove")) {
		if (selected.piece == "pawn") {
			pawnPromotionDialog(selected, target);
		}
	}

	removePiece($("#"+selected.id));
	showPiece($("#"+target.id), selected.color, selected.piece);
	
	toggleTurn();
	
	unbindAvaliableMoveAction();
	unfocusAllRows();
}

function getPositionInfo(row)
{
	return {piece: row.attr("piece"), color: row.attr("color"), id: row.attr("id")};
}

function logPosition(row)
{
	selected = getPositionInfo(row);
	console.log("SELECTED ROW: "+ selected.id + " - SELECTED PIECE: "+ selected.piece + " - SELECTED COLOR: " + selected.color);
}

function removePiece (row)
{
	selected = getPositionInfo(row);
	row.removeClass("piece selectedFocus "+selected.color + "_" + selected.piece);
	row.removeAttr("color");
	row.removeAttr("piece");
	row.unbind("click");
}

function horizontalMoves (array, target, limit)
{
	initialRow = target.row;
	initialCol = target.col;
	_recursiveMove("up", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
	_recursiveMove("down", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
	_recursiveMove("left", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
	_recursiveMove("right", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
}

function diagonalMoves (array, target, limit)
{
	initialRow = target.row;
	initialCol = target.col;
	_recursiveMove("northwest", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
	_recursiveMove("northeast", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
	_recursiveMove("southwest", array, target, limit);
	target.row = initialRow;
	target.col = initialCol;
	_recursiveMove("southeast", array, target, limit);	
}

function _recursiveMove (direction, array, target, limit)
{
	if (direction == "up") {
		if(target.row -1 >= 1) {
			if (verifyAllowedMove(array, (target.row -1 )+"-"+ target.col) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.row = target.row-1;
					_recursiveMove("up", array, target, false);
				}
			}
		}
	}
	else if (direction == "down") {
		if(parseInt(target.row) +1 <= 8) {
			if (verifyAllowedMove(array, (parseInt(target.row) +1 )+"-"+ target.col) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.row = parseInt(target.row)+1;
					_recursiveMove("down", array, target, false);
				}
			}
		}
	}
	else if (direction == "left") {
		if(target.col -1 >= 1) {
			if (verifyAllowedMove(array, target.row +"-"+ (target.col -1)) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.col = target.col - 1;
					_recursiveMove("left", array, target, false);
				}
			}
		}
	}
	else if (direction == "right") {
		if(parseInt(target.col) +1 <= 8) {
			if (verifyAllowedMove(array, target.row +"-"+ (parseInt(target.col) +1)) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.col = parseInt(target.col) + 1;
					_recursiveMove("right", array, target, false);
				}
			}
		}
	}
	else if (direction == "northwest") {
		if (target.row -1 >= 1 && target.col -1 >= 1) {
			if (verifyAllowedMove(array, (target.row -1 )+"-"+ (target.col -1)) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.row = target.row-1;
					target.col = target.col-1;
					_recursiveMove("northwest", array, target, false);
				}
			}
		}
	}
	else if (direction == "northeast") {
		if (target.row -1 >= 1 && parseInt(target.col) +1 <= 8) {
			if (verifyAllowedMove(array, (target.row -1 )+"-"+ (parseInt(target.col) +1)) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.row = target.row-1;
					target.col = parseInt(target.col)+1;
					_recursiveMove("northeast", array, target, false);
				}
			}
		}
	}
	else if (direction == "southwest") {
		if (parseInt(target.row) +1 <= 8 && target.col -1 >= 1) {
			if (verifyAllowedMove(array, (parseInt(target.row) +1 )+"-"+ (target.col -1)) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.row = parseInt(target.row)+1;
					target.col = target.col-1;
					_recursiveMove("southwest", array, target, false);
				}
			}
		}
	}
	else if (direction == "southeast") {
		if (parseInt(target.row) +1 <= 8 && parseInt(target.col) +1 <= 8) {
			if (verifyAllowedMove(array, (parseInt(target.row) +1 )+"-"+ (parseInt(target.col) +1)) == -1) {
				return;
			}
			else {
				if (limit) {
					return;
				}
				else {
					target.row = parseInt(target.row)+1;
					target.col = parseInt(target.col)+1;
					_recursiveMove("southeast", array, target, false);
				}
			}
		}
	}
}

function pawnMove(array, target)
{
	if(target.color == "black") {
		initialPawnRow = 7;

		if (initialPawnRow == target.row) {
			initialRow = target.row;
			_recursiveMove("up", array, target, true);
			target.row = target.row -1;
			_recursiveMove("up", array, target, true);
			target.row = initialRow;
		}
		else {
			_recursiveMove("up", array, target, true);
		}

		_recursiveMove("northeast", array, target, true);
		_recursiveMove("northwest", array, target, true);
	}
	else {
		initialPawnRow = 2;

		if (initialPawnRow == target.row) {
			initialRow = target.row;
			_recursiveMove("down", array, target, true);
			target.row = parseInt(target.row) +1;
			_recursiveMove("down", array, target, true);
			target.row = initialRow;
		}
		else {
			_recursiveMove("down", array, target, true);
		}

		_recursiveMove("southeast", array, target, true);
		_recursiveMove("southwest", array, target, true);
	}

	verifyPawnMove(array, target);

}

function knightMove (array, target)
{
	//up
	if (target.row - 2 >= 1) {
		if (target.col -1 >= 1) {
			verifyAllowedMove(array, parseInt(target.row -2) + "-" + parseInt(target.col - 1));
		}
		if (parseInt(target.col) + 1 <= 8){
			verifyAllowedMove(array, parseInt(target.row -2) + "-" + (parseInt(target.col) + 1));
		}
	}
	//down
	if (parseInt(target.row) + 2 <= 8) {
		if (target.col -1 >= 1) {
			verifyAllowedMove(array, (parseInt(target.row) + 2) + "-" + parseInt(target.col - 1));
		}
		if (parseInt(target.col) + 1 <= 8){
			verifyAllowedMove(array, (parseInt(target.row) + 2) + "-" + (parseInt(target.col) + 1));
		}
	}
	//left
	if (target.col - 2 >= 1) {
		if (target.row - 1 >= 1) {
			verifyAllowedMove(array, parseInt(target.row -1) + "-" + parseInt(target.col - 2));
		}
		if (parseInt(target.row) + 1 <= 8){
			verifyAllowedMove(array, (parseInt(target.row) +1) + "-" + (parseInt(target.col) - 2));
		}
	}
	//right
	if (parseInt(target.col) + 2 <= 8) {
		if (target.row - 1 >= 1) {
			verifyAllowedMove(array, parseInt(target.row -1) + "-" + (parseInt(target.col) + 2));
		}
		if (parseInt(target.row) + 1 <= 8){
			verifyAllowedMove(array, (parseInt(target.row) +1) + "-" + (parseInt(target.col) + 2));
		}
	}
}

function verifyPawnMove(array, target)
{
	reallyAllowed = []
	allowedInitialPawnMove = true;
	for (i = 0; i < array.allowed.length; i++) {
		verifiedPosition = array.allowed[i].split("-");
		if (verifiedPosition[1] != target.col) {
			if ($("#"+array.allowed[i]).hasClass("piece")) {
				reallyAllowed.push(array.allowed[i]);
			}
		}
		else {
			if (!$("#"+array.allowed[i]).hasClass("piece")) {
				if (allowedInitialPawnMove){
					reallyAllowed.push(array.allowed[i]);
				}
			}
			else {
				allowedInitialPawnMove = false;
			}
		}
	}
	array.allowed = reallyAllowed;
}

function castlingMove()
{

}

function pawnPromotionDialog(selected, target)
{
	$("#dialogPawnPromotion").html("Choose a piece to promote pawn");
	var selectedPiece = "queen";
	$("#dialogPawnPromotion").dialog({
		modal: true,
		closeOnEscape: false,
		dialogClass: "no-close",
		buttons: {
			'QUEEN': function () {
				selectedPiece = "queen";
				$(this).dialog("close");
			},
			'KNIGHT': function () {
				selectedPiece = "knight";
				$(this).dialog("close");
			}, 
			'ROOK': function () {
				selectedPiece = "rook";
				$(this).dialog("close");
			},
			'BISHOP': function () {
				selectedPiece = "bishop";
				$(this).dialog("close");
			}
		},
		close: function () {
			removePiece($("#"+target.id));
			showPiece($("#"+target.id), selected.color, selectedPiece);
			unfocusAllRows();
		}
	});
	console.log("ja retornou " +selectedPiece);
	return selectedPiece;
}

function toggleTurn()
{
	activeTurn = toggleColor(activeTurn);
}

function toggleColor(color)
{
	return (color == "white" ? "black" : "white");
}