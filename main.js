const request = require('request')
const inquirer = require('inquirer')
const fuzzy = require('fuzzy');
const Ora = require('ora');

const spinner = new Ora({
	text: 'Downloading video',
	spinner: process.argv[2]
});

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
		validate: val => val ? true : 'Type something!'
	    }
	]).then(answer => {
	    videos.map(video => {
		if (answer.title == video.title) {
		    const dl = spawn( 'youtube-dl', [video.link] );
		    var text = ''
		    dl.stdout.on( 'data', data => {
			text = data.toString()
			var perc = text.match(/[0-9].[0-9]\%|[0-9][0-9].[0-9]\%/)
			if (perc) {
			    spinner.text = `Downloading video ${perc}`
			}
			spinner.start();
		    });
		    dl.stderr.on( 'data', data => {
			spinner.text = 'Download fail'
			spinner.fail()
		    });
		    dl.on( 'close', code => {
			spinner.text = 'Done'
			spinner.succeed();
		    })
		}
	    })
	});
    }).catch(err => console.log(err))



