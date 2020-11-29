// require in keys
const keys = require('./keys')

// express app setup
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// create new express app that will receive and respond to any http requests from react app
const app = express()

// use middleware using app.use()
// cors allows us to make requests from one domain/port to another
app.use(cors())
// parses incoming requests from react app and turns body of post request into a json value
// remember when using bodyParser to do .json()
app.use(bodyParser.json())

// postgres client setup
const { Pool } = require('pg')
const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort
})

pgClient.on('connect', () => {
	pgClient
		.query('CREATE TABLE IF NOT EXISTS values (number INT)')
		.catch(err => console.log(err))
})

// redis client setup
const redis = require('redis')
const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	//reconnect every 1 second
	retry_strategy: () => 1000
})

//create a redis publisher to broadcast (publish) any updates
// we are making these duplicate connections because when a connection is turned into a connection
// that can listen or subscribe or publish info, it cannot be used for other purposes
const redisPublisher = redisClient.duplicate()

// express route handlers
app.get('/', (req, res) => {
	res.send('Hi')
})

// async handler that gets all fibonacci queries and returns them
app.get('/values/all', async (req, res) => {
	const values = await pgClient.query('SELECT * from values')

	//.rows means that we'll only get back info that's retrieved from db
	// and no other info contained in values object i.e. info about the query itself
	res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
	// look at a hashed value inside a redis instance and get all the info from it
	redisClient.hgetall('values', (err, values) => {
		res.send(values)
	})
})

app.post('/values', async (req, res) => {
	// get value from body of post request
	const index = req.body.index
	if (parseInt(index) > 40) {
		return res.status(422).send('index too high')
	}

	redisClient.hset('values', index, 'Nothing yet!')
	// publishing a new insert event to the subscribed duplicate redis client in the worker
	redisPublisher.publish('insert', index)
	pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

	res.send({ working: true })
})

app.listen(5000, err => {
	console.log('Listening')
})
