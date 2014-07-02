var queue = function queue() {

	var jobs          = {};
	var queueSettings = {
		timeout: 30		
	};
	var triggers      = {
		init: [],
		add: [],
		jobCallback: []
	};
	var runningJob	 = false;
	var queueClass   = this;

	this.init = function init(settings) {

		if (settings !== undefined && typeof settings === 'object') {
			mergeSettings(settings);
		}

		emit('init', settings);

		return this;
	};

	this.add = function add(name, userFunction, timeout) {
		var unique = name+'-'+(new Date()).getTime();

		jobs[unique] = {
			userFunction: (userFunction === undefined ? function() { } : userFunction),
			timeout: (timeout === undefined ? 0 : timeout),
			status: 'added'
		}

		emit('add', jobs[unique]);

		return this;
	};

	var jobCallback = function jobCallback(job) {

		if (job === undefined && runningJob) {
			job = runningJob;
		}

		if (jobs[job] === undefined) {
			new Error('This job doenst exists');
		}

		//Stop timer
		if (jobs[job]['timer'] !== undefined) {
			clearTimeout(jobs[job]['timer']);
			delete jobs[job]['timer'];
		}

		jobs[job].status = 'completed';

		emit('jobCallback', job);

		//Start next cron
		queueClass.run();
	};

	var emit = function emit(event, params) {
		if (triggers[event] === undefined ) {
			new Error('No valid event');
			return false;
		}

		var totalTriggers = triggers[event].length;

		if (totalTriggers === 0) {
			return false;
		}

		for(var i=0; i<triggers[event].length; ++i) {
			triggers[event][i](params);
		}

		return true;
	};

	this.on = function on(event, userFunction) {
		if (triggers[event] === undefined ) {
			new Error('No valid event');
		}

		if (userFunction === undefined || typeof userFunction !== 'function' ) {
			new Error('Callback function has to be an function');
		}

		if (event.indexOf(' ') !== -1) {
			var events = event.split(' ');
			for (var e in events) {
				triggers[e].push(userFunction);
			}
		} else {
			triggers[event].push(userFunction);
		}

		return this;
	};

	this.run = function run() {
		for (var job in jobs) {

			if (jobs[job].status === 'added') {
				runningJob = job;

				jobs[job].userFunction(jobCallback, job);

				if (jobs[job].timeout !== undefined && jobs[job].timeout > 0) {

					jobs[job]['timer'] = setTimeout(function () {
						jobs[job].status = 'timeout';
						emit('timeout', job);
						queueClass.run();
					}, jobs[job].timeout);

				} else if (queueSettings.timeout !== undefined && queueSettings.timeout > 0) {

					jobs[job]['timer'] = setTimeout(function () {
						jobs[job].status = 'timeout';
						emit('timeout', job);
						queueClass.run();
					}, queueSettings.timeout);
				}

				emit('run', job);
				break;
			}
		}
	};

	this.clearTrigger = function clearTrigger(trigger) {
		if (triggers[trigger] !== undefined) {
			delete triggers[trigger];
		}
		return this;
	}

	this.clearTriggers = function clearTriggers() {
		for ( var trigger in triggers) {
			triggers[trigger] = [];
		}
		return this;
	}

	var mergeSettings = function mergeSettings(settings) {
		for(var setting in queueSettings) {
			if (settings[setting] !== undefined) {
				queueSettings[setting] = settings[setting];
			}
		}
	}
};

module.exports = (new queue());