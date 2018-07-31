const request = require('request')
const inquirer = require('inquirer')
const { spawn, exec } = require( 'child_process' )

request('http://178.128.80.84:3210/api', (err, res, body) => {
    if (err) {
	console.log('Server is down')
    } else {
	var result = JSON.parse(body)
	var title = []
	result.map(choices => {
	    title.push(choices.title)
	    
	})

	var select = "press enter to select video.";
	var questions = [
	    {
		type: 'list',
		name: 'title',
		message: select,
		choices: title,
	    }
	];
	inquirer.prompt(questions).then(answer => {
	    result.map(video => {
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

    }
})



