const request = require('request')
const inquirer = require('inquirer')
const fuzzy = require('fuzzy');

const { spawn, exec } = require( 'child_process' )

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

function fetch() {
    var api = []
    return new Promise((resolve, reject) => {
	request('http://178.128.80.84:3210/api', (err, res, body) => {
	    if (err) {
		reject('Server is down')
	    } else {
		var result = JSON.parse(body)
		result.map(choices => {
		    api.push({title:choices.title,link:choices.link})
		    resolve(api)
		})
	    }
	})
    })
}


fetch()
    .then(videos => {
	inquirer.prompt([
	    {
		type: 'autocomplete',
		name: 'title',
		message: "press enter to select video.",
		suggestOnly: true,
		source: (answers, input) => {
		    input = input || '';
		    return new Promise((resolve, reject) => {
			var fuzzyResult = fuzzy.filter(input, videos.map(video => video.title));
			resolve(
			    fuzzyResult.map(el => el.original)
			)
		    })
		},
		validate: (val) => {
		    return val ? true : 'Type something!';
		},
	    }
	]).then(answer => {
	    videos.map(video => {
		if (answer.title == video.title) {
		    const dl = spawn( 'youtube-dl', [video.link] );
		    dl.stdout.on( 'data', data => {
			console.log( `stdout: ${data}` );
		    });
		    dl.stderr.on( 'data', data => {
			console.log( `stderr: ${data}` );
		    });
		    dl.on( 'close', code => {
			console.log( `child process exited with code ${code}` );
		    })
		}
	    })
	});
    }).catch(err => console.log(err))



