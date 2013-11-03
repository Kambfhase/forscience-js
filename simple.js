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

onmessage = function( event){
	var data = event.data;
    var m = data.m, n = data.n;
    
    var formula = randFormula(m, n);
    
    postMessage({
    	type: "simple",
    	arg: {
    		m:m,
    		n:n,
    		satisfiable: randomKSAT(formula, m, n)
    	}
    });
};

