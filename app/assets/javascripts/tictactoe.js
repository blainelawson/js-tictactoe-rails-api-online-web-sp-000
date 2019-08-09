
// Code your JavaScript / jQuery solution here
var turn = 0
var currentGameId = 0;
var previousStartIndex = 0


var winningCombos = [
                     [0,1,2],
                     [3,4,5],
                     [6,7,8],
                     [0,3,6],
                     [1,4,7],
                     [2,5,8],
                     [0,4,8],
                     [6,4,2]
                    ]

function player() {
    if (turn % 2 === 0) {
        return "X";
      } else {
        return "O";
      }
}

function updateState(square) {
    var token = player()
    square.innerHTML = token;
}

function setMessage(message) {
    $("#message").text(message);
}

function checkWinner() {
    for (let i = 0; i < winningCombos.length; i++) {
        if (won()) {
            turn -= 1
            setMessage(`Player ${player()} Won!`)
            turn = 0
            return true
        }
    }
    return false
}

function won(){
    var squares = $("td")

    for (let i = 0; i < winningCombos.length; i++) {
        if (squares[winningCombos[i][0]].innerText !== "" && 
            squares[winningCombos[i][0]].innerText === squares[winningCombos[i][1]].innerText &&
            squares[winningCombos[i][1]].innerText === squares[winningCombos[i][2]].innerText) {
            return true
        }
    }

    return false
}

function resetBoard() {
    var squares = $("td")

    for (let i = 0; i < squares.length; i++) {
        squares[i].innerText = ""
    }

    turn = 0
    currentGameId = null
}

function doTurn(square) {
    if (validMove(square) && won() === false && turn !== 9){
        updateState(square)  
        turn++

        if (checkWinner()) {
            document.getElementById("save").click()
            resetBoard()
        } else if (turn === 9) {
            setMessage("Tie game.")
            document.getElementById("save").click()
            resetBoard()
        }
    }
}

function validMove(square) {
    if (square.innerText === "") {
        return true 
    } else {
        return false
    }
}

function setPreviousStartIndex(){
    if (document.getElementById("games").lastChild !== null) {
         return document.getElementById("games").lastChild.innerText
    } else {
        return 0;
    }
}

function makeSavedGameButtons(startIndex){

}

function attachListeners() {
    var squares = $("td")

    for (let i = 0; i < squares.length; i++){
        squares[i].addEventListener('click', function(element){
            doTurn(this)
        })
    }

    $("#save").click(function() {
        var board = [];
        $('td').text((i, square) => {
            board.push(square)
          });
          var gameBoard = { state: board }
          
          if (currentGameId){
              $.ajax({
                  url: '/games/' + currentGameId,
                  data: gameBoard,
                  type: 'PATCH',
              })
          } else {
              $.post('/games', gameBoard, function(data){
              currentGameId = data.data.id
          })}
    })

    $("#clear").click(function(){
        resetBoard()
        setMessage("")
    })

    $("#previous").click(function() {
        $.get('/games', function(data){
            previousStartIndex = setPreviousStartIndex()

            for (let i = previousStartIndex; i < data.data.length; i++) {
                    var gameId = data.data[i].id
                    // debugger
                    $("#games").append(`<button id="${gameId}">${gameId}</button>`)
                    $(`#${gameId}`).on('click', function(element){
                        // debugger
                        $.get('/games/' + element.target.id, function(game) {
                        turn = 0
                        for (let index = 0; index < squares.length; index++){
                            // debugger
                            squares[index].innerText = game.data.attributes.state[index]
                            if (squares[index].innerText !== ""){
                                turn++
                            }

                        }
                        currentGameId = game.data.id
                    })
                })

                
            }
        //     $(`#${gameId}`).on('click', function(element){
        //         // debugger
        //             console.log("Game id: ",gameId) // WHY IS THIS ID NOT FINE?
        //         $.get('/games/' + gameId, function(game) {
        //         turn = 0
        //         for (let index = 0; index < squares.length; index++){
        //             // debugger
        //             squares[index].innerText = game.data.attributes.state[index]
        //             if (squares[index].innerText !== ""){
        //                 turn++
        //             }

        //         }
        //         currentGameId = game.data.id
        //     })
        // })
        })
    })

}

$(document).ready(function() {
    attachListeners();
})