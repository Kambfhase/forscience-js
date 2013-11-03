var rand = Math.random;
var K = 3;

function randValues( n){
    var i=0, temp, arr = new Array(2 * n);

    for(; i<n; i++){
        temp = rand() > 0.5;
        arr[i] = temp;
        arr[i+n] = !temp;
    }

    return arr;
}

function randomKSAT( formula, m, n){
    var values;
    var r = 100;
    var l;

    while( r--){
        values = randValues( n);
        l = 3*n;
        while( l--){

            if( formula.every(function(clause){
                if( clause.some(function(literal){
                    return values[literal];
                })){
                    return true;
                }

                var lit = clause[rand() * clause.length | 0],
                    nlit = lit < n ? lit + n : lit - n;

                values[lit] = !values[lit];
                values[nlit]= !values[nlit];

                return false;
            })) {
                return true;
            }

        }
    }

    return false;
}

function randFormula( m, n){
    return Array.apply(Array,Array(m)).map(function(){
        return Array.apply(Array,Array(K)).map(function(){
            return (rand()*(2*n)) | 0;
        });
    });
}

function sigma100(m, n){
    var i, count = 0;
    for(i=0; i<100; i++){
        var formula = randFormula(m, n);

        if( randomKSAT(formula, m, n)){
            count++;
        }
    }

    return count;
}

onmessage = function( event){
    var m = 1, n = event.data;
	var ret = [];
    while (m<100){
   		ret.push(sigma100(m,n)/100);
   		postMessage({
   			type: "progress",
   			arg: m
   		});
        m++;
    }

    postMessage({
    	type: "final",
    	arg: ret
    });
};

