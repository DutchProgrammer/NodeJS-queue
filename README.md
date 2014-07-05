NodeJS queue manager
=========

With this NodeJS module you can stack functions so they will execute after each other.

  - Stack functions
  - Execute after each other
  - Add your own params to the callBack
  - Can use triggers on every step

Version
----

1.0

Requirements
----
No requirements this module is only using native NodeJS modules

> For the demo i used [NodeJS download] (http://dutchprogrammer.github.io/NodeJS-download/)

Installation
--------------

```sh
mkdir modules
git clone https://github.com/DutchProgrammer/NodeJS-queue.git ./modules/NodeJS-queue
```

##### Examples


```sh
var queue       = require('./queue');
var fs          = require('fs');
var download    = require('./download');

var httpZipFile      = 'http://domain.com/all.csv';
var localZipFileName = 'all.csv';
var localZipFile     = './tmp/'+localZipFileName;

//Available triggers

//When settings has been set
queue.on('init', function (settings) {
    console.log(settings);
});

//When an job has been added
queue.on('add', function (jobDetails) {
    console.log(jobDetails);
});

//When an job has executed
queue.on('jobCallback', function (jobDetails) {
    console.log(jobDetails);
});

//When the timeout has been triggers for an job
queue.on('timeout', function (jobDetails) {
    console.log(jobDetails);
});

//When job has started
queue.on('run', function (jobDetails) {
    console.log(jobDetails);
});

fs.exists(localZipFile, function (exists) {
    if (!exists) {
		queue.add('Downloading '+localZipFile, download.downloadFile, [httpZipFile, localZipFile]);
		queue.add('Parse '+localZipFile, parseAllProducts, [localZipFile]);
		queue.run();
		return;
	}

	fs.stat(localZipFile, function(err, stats) {

		var now = (new Date()).getTime()/1000;

		if (now-(new Date(stats.mtime)).getTime()/1000 > maxFileTime) {

			queue.add('Downloading '+localZipFile, download.downloadFile, [httpZipFile, localZipFile]);
			queue.add('Parse '+localZipFile, parseAllProducts, [localZipFile]);
		} else {
			queue.add('Parse '+localZipFile, parseAllProducts, [localZipFile]);
		}

		queue.run();
	});
});

parseAllProducts = function (done, jobName, csvFile) {
	done();

	fs.readFile(csvFile, function (err, data) {
		if (err) {
			console.log('parseAllProducts errr: %s '.error, err);
			process.exit();
			return;
		}
		
		//do you thing
	});
};
```


License
----

MIT
