/*#1*/global1 = function(){};
/*#2*/global1();

function scopedFunc(/*#3*/global1) {
    /*#4*/global1();

    function nestedFunc() {
        let /*#5*/global1 = 'local';

        /*#6*/global1;
    }
}