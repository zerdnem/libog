var express = require('express')
var WPAPI = require( 'wpapi' );
var morgan = require('morgan')

var app = express()

var wp = new WPAPI({ endpoint: 'http://liboggirls.net/wp-json' });

app.use(morgan('combined'))

app.get('/api', (req, res) => {
	var api = []
	wp.posts().perPage(100).then(function( data ) {
		data.map(d => {
			var title = d.slug
			var content = d.content.rendered
			var regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
			var video = content.match(regexp)
			api.push({title, link:video[0]})
		})
		res.json(api)
	}).catch(function( err ) {
	    console.log(err)
	});
})

app.listen(3210)
