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
	var w = new Worker("simple.js");

	Iterator( sharedInput, sharedOutput, function( invalue, callback){
		w.onmessage = function(arg){
			callback(arg.data);
		};

		w.postMessage(invalue);
	});

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


function Iterator( input, output, mapfn){
	var busy = false;

	function next(input){
		if(!input.size() || busy) return;

		busy = true;
		mapfn( input.shift(), function(valout){
			output.push(valout);
			busy = false;
			next(input);
		});
	}

	input.on('next', next);
	next(input);
}

function sigma100Task(inputBuffer, outputBuffer) {
	Iterator( inputBuffer, outputBuffer,
		function( inval, callback){
		
		var m = inval.m,
			n = inval.n;
		sigma100( m, n, callback);
	}); 
}
