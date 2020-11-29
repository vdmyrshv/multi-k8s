const keys = require('./keys')
const redis = require('redis')

/**
 * This project outlines how to make a very simple worker that
 * watches redis for any new values inputted into the cache and
 * then performs an action on them
 */
const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	// how redis client should behave if it loses connection to redis server
	// in this case try reconnecting every 1000 ms
	retry_strategy: () => 1000
})

//sub stands for "subscription" meaning we'll watch redis for any time a new value shows up
const sub = redisClient.duplicate()

const fib = index => {
	if (index < 2) return 1
	return fib(index - 1) + fib(index - 2)
}

//event handler for when the subscription returns a new message
sub.on('message', (channel, message) => {
	//hash set aka more than one key for a value
	redisClient.hset('values', message, fib(parseInt(message)))
})

//this is where we subscribe our duplicate client to redis and listen for new values to be added
sub.subscribe('insert')
