// MIT License
var FORSCIENE = {
	nthreads: 1
};

function Buffer() {
	var arr = [],
		handler = {
			empty: [],
			next: [],
		}, that;

	return that = {
		push: function (arg) {
			arr.push(arg);
			for (var i = 0, h = handler.next, ii = h.length; i < ii; i++) {
				h[i](that);
			}
		},
		shift: function () {
			try {
				return arr.shift();
			} catch (e) {} finally {
				if (!arr.length) {
					for (var i = 0, h = handler.empty, ii = h.length; i < ii; i++) {
						h[i](that);
					}
				}
			}
		},
		size: function () {
			return arr.length;
		},
		on: function (event, callback) {
			if (event in handler) {
				handler[event].push(callback);
			}
		}
	};
}

function Thread(sharedInput, sharedOutput) {
	var w = new Worker("simple.js"),
		busy = false;

	w.onmessage = function (arg) {
		sharedOutput.push(arg.data);
		busy = false;
		next();
	};

	function next() {
		if (!sharedInput.size() || busy) return;

		var input = sharedInput.shift();
		busy = true;
		w.postMessage(input);
	}

	sharedInput.on('next', next);

	var _interface = {
		go: function () {
			next();
		},
		die: function () {
			w.terminate();
		}
	};

	return _interface;
}

function sigma100(m, n, callback) {
	var T = 100,
		i;
	var sharedInput = Buffer(),
		sharedOutput = Buffer();

	var pool = [];
	for (i = 0; i < FORSCIENE.nthreads; i++) {
		pool[i] = Thread(sharedInput, sharedOutput);
	}

	sharedOutput.on('next', function (buffer) {
		var l = buffer.size();

		if (l == T) {
			var count = 0,
				i = 0;
			for (; i < T; i++) {
				var foo = buffer.shift();
				if (foo.arg.satisfiable) {
					count++;
				}
			}
			for (i = 0; i < pool.length; i++) {
				pool[i].die();
				pool[i] = null;
			}
			callback(count);
		}
	});


	for (i = 1; i <= T; i++) {
		sharedInput.push({
			m: m,
			n: n
		});
	}
}

function sigma100Task(inputBuffer, outputBuffer) {
	var busy = false;

	function next(arg) {
		if (!arg.size() || busy) return;

		busy = true;
		var cmd = arg.shift();
		sigma100(cmd.m, cmd.n, function (ret) {

			outputBuffer.push(ret);
			busy = false;
			next(inputBuffer);
		});
	}

	inputBuffer.on('next', next);
}