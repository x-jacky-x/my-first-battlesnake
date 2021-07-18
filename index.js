// TODO: Connect to GitHub
// TODO: Local dev environment
// TODO: Find free always-on hosting --> host myself on raspberry?
// TODO: Understand how express() works
// TODO: Add test cases


const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))

function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Jacky B',
    color: '#ff1a75',
    head: 'tongue',
    tail: 'freckled'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body

  console.log('START')
  response.status(200).send('ok')
}

function handleMove(request, response) {

  var gameData = request.body
  var mySnake = gameData.you
  var myHead = mySnake.head
  var gameBoard = gameData.board

  // Log current turn and shouts if available
  console.log('\nTURN: ' + gameData.turn)
  gameBoard.snakes.forEach(snake => 
  {
    if(snake.shout)
    {
      console.log('SNAKE: ' + snake.name + ' SHOUTS: ' + snake.shout)
    }
  })

  var shout = null
  var move = null
  var possibleMoves = getNextMoves(myHead)
  
  var safeMoves = possibleMoves.filter(move => checkMoveIsSafe(move, mySnake, gameBoard))

  // look ahead: has move after next any safe moves?
  // used to avoid going onto a square which can't be exited
  var safeLookAheadMoves = []

  if(safeMoves.length > 0)
  {
    for(var i = 0; i < safeMoves.length; i++)
    {
      // TODO: check to see if snake is about to collide with the head of another snake
      //       --> head: first element in snake.body-array; length of snake: length of array
      //       --> avoid if about to lose, prioritize if about to win

      var nextMoves = getNextMoves(safeMoves[i])

      var safeNextMoves = nextMoves.filter(move => checkMoveIsSafe(move, mySnake, gameBoard))

      if(safeNextMoves.length > 0)
      {
        safeLookAheadMoves.push(safeMoves[i])
      }
    }

    // the following commented-out code is the previous for-loop with less lines of code
    // it's way harder to read though, in my opinion
    // BUT it works! I'm finally getting javascript arrays!
    // safeMoves.forEach(move => getNextMoves(move).filter(move => checkMoveIsSafe(move, mySnake, gameBoard)).length > 0 ? safeLookAheadMoves.push(move) : null)
  }

  // if there are safe moves with look ahead, choose a random one of those
  // otherwise choose a random safe move, if possible
  // otherwise the default move will be up
  if(safeLookAheadMoves.length > 0)
  {
    move = safeLookAheadMoves[Math.floor(Math.random() * safeLookAheadMoves.length)].string
    shout = 'Snek!'
  }
  else if (safeMoves.length > 0)
  {
    move = safeMoves[Math.floor(Math.random() * safeMoves.length)].string
    shout = 'Oh no.'
  }
  else
  {
    move = 'up'
  }

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move,
    shout: shout
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}

function getNextMoves(position)
{
  const moves = [
    {'string':'left', 'x':position.x - 1, 'y':position.y},
    {'string':'right', 'x':position.x + 1, 'y':position.y},
    {'string':'up', 'x':position.x, 'y':position.y + 1},
    {'string':'down', 'x':position.x, 'y':position.y - 1}
  ]

  return moves
}

function checkMoveIsSafe(move, mySnake, gameBoard)
{
  var myBody = mySnake.body
  var snakes = gameBoard.snakes
  var maxX = gameBoard.width - 1
  var maxY = gameBoard.height - 1

  // Check for walls
  if (move.x < 0 || move.x > maxX || move.y < 0 || move.y > maxY)
  {
    return false
  }

  // Check for self --> included in all snakes
  // if (myBody.some(bodyPart => bodyPart.x === move.x && bodyPart.y === move.y))
  // {
  //   return false
  // }

  // Check for all snakes
  if (snakes.filter(snake => snake.body.some(bodyPart => bodyPart.x === move.x && bodyPart.y === move.y)).length > 0)
  {
    return false
  }

  return true
}
