function Factory( stdlib, foreign, heap){
    "use asm";

    var HU32 = new stdlib.Uint32Array(heap);
    var rand = foreign.random;
    var K = 3;
    var formulaOffset = 0;
    var valuesOffset = 1024;
    var imul = stdlib.Math.imul;
    var floor = stdlib.Math.floor;

    function rnd( max){
        max = +max;
        var temp = 0.0;
        var t2=0;
        temp = +rand();
        temp = temp * max;
        t2 = ~~temp;
        return t2|0;
    }

    function randValues( n){
        n=n|0;
        var i=0, temp=0;
        i=i|0;
        for(; (i|0)<(n|0); i=i+1|0){
            temp = (+rand()) > 0.5;
            HU32[(i<<2+valuesOffset)>>2] = temp;
            HU32[((i+n)<<2+valuesOffset)>>2] = !temp;
        }
    }

    function randomKSAT( m, n){
        m=m|0;
        n=n|0;
        var r = 1000;
        var truthy=0;
        var l=0,i=0,k=0;
        var num = 0.0;
        var idx=0;
        var size=0;
        var temp=0;
        var lit =0, nlit=0;
        //num = 2.0*
        K=K|0;
        size= imul(K,m)|0;

        while( r){
            r = r-1|0;
            randValues( n);

            l = 3*n;
            while(l){
                l=l-1|0;
                i=0|0;
                for( ; (i>>>0)< (size>>>0); i = i+K|0){
                    truthy = 0;
                    idx = 0;
                    idx = idx|0;
                    k=0;
                    k=~~k;

                    for(; ~~k<~~K; k = k+1|0){
                        idx = HU32[((i+k)<<2+formulaOffset)>>2]|0;
                        truthy = truthy | HU32[(idx<<2 +valuesOffset)>>2];
                    }

                    if(truthy) continue;

                    temp=0;
                    temp = rnd(+(K>>0))|0;

                    lit = HU32[((temp+i)<<2+formulaOffset)>>2]|0;
                    nlit = ~~lit < ~~n ? (lit + n)|0 : (lit - n)|0;

                    HU32[(lit<<2 +valuesOffset)>>2] = !( HU32[(lit<<2 +valuesOffset)>>2]|0);
                    HU32[(nlit<<2 +valuesOffset)>>2]= !( HU32[(nlit<<2 +valuesOffset)>>2]|0);
                    break;
                }


                if( i>>>0 >= size>>>0) {
                    return 1;
                }
            }
        }

        return 0;
    }

    function randFormula( m, n){
        m=m|0;
        n=n|0;
        var i=0;
        var size=0;
        var temp = 0;
        var dn = 0.0;
        size = imul(K,m)|0;
        i=size|0;
        //dn = +dn;
        dn = +(n>>0);

        for( ; i; ){
            temp = rnd(dn*2.0)|0;
            HU32[((i)<<2+formulaOffset)>>2] = temp | 0;
            i=i-1|0;
        }
    }

    function sigma100(m, n){
        m=m|0;
        n=n|0;
        var i=100, count = 0;
        while(i){
            randFormula(m, n);

            if( randomKSAT( m, n)|0){
                count = count + 1 |0;
            }

            i=i-1|0;
        }

        return count|0;
    }

    function get(idx){
        idx = idx|0;
        return HU32[(idx)>>2]|0;
    }

    return {
        sigma100: sigma100,
        rnd:rnd,
        randFormula:randFormula,
        randValues:randValues,
        randomKSAT:randomKSAT,
        get:get
    };
}

var mod = Factory( self, Math, new ArrayBuffer(4096<<2));

onmessage = function( event){
    var m = 0, n = event.data;


    while (mod.sigma100(m,n) > 50 && m < 200){
        m++;
    }

    postMessage(m);
    
};

