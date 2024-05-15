const express = require('express')
const app = express()

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

const dbPath = (__dirname, 'cricketMatchDetails.db')

let db = null

const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Started...')
    })
  } catch (e) {
    console.log(`error found is ${e.message}`)
    process.exit(1)
  }
}

initializeServer()

app.get('/players/', async (request, response) => {
  const playerQuery = `
    select player_id as playerId ,
    player_name as playerName
    from player_details;
    `

  const dbResponse = await db.all(playerQuery)
  response.send(dbResponse)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const playerQuery = `
    select player_id as playerId ,
    player_name as playerName
    from player_details
    where player_id = ${playerId};
    `

  const dbResponse = await db.get(playerQuery)
  response.send(dbResponse)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body

  const playerQuery = `
  update player_details
  set 
    player_name = '${playerName}'
  where 
    player_id = ${playerId};
  `

  await db.run(playerQuery)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const matchDetails = `
  select 
  match_id as matchId,
  match , year
   from  match_details where match_id = ${matchId};
  `

  const dbResponse = await db.get(matchDetails)
  response.send(dbResponse)
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params

  const playerQuery = `
  select m.match_id as matchId , 
  m.match as match , 
  m.year as year 
  from match_details m inner join  player_match_score pm 
  on m.match_id = pm.match_id 
  where pm.player_id = ${playerId};
  `

  const dbResponse = await db.all(playerQuery)
  response.send(dbResponse)
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params

  const matchQuery = `
  select p.player_id as playerId , 
  p.player_name as playerName
  from  player_details p inner join player_match_score  pm
  on p.player_id = pm.player_id 
  where pm.match_id = ${matchId};
  `

  const dbResponse = await db.all(matchQuery)
  response.send(dbResponse)
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params

  const queryParameters = `
  select p.player_id as playerId,
  p.player_name as playerName ,
  sum(pm.score) as totalScore , 
  sum(pm.fours) as totalFours ,
  sum(pm.sixes) as totalSixes
  from player_match_score pm inner join player_details p
  on pm.player_id = p.player_id 
  where pm.player_id = ${playerId};
  `

  const dbResponse = await db.get(queryParameters)
  response.send(dbResponse)
})

module.exports = app
