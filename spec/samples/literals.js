let obj = {
    /*#1*/foo: /*#2*/'bar',
    /*#3*/bar: /*#4*/'foo',
    /*#5*/test: {
        /*#6*/another: 'key'
    },
    /*#7*/testfunc() {
        return class TestClass {
            /*#8*/meth1() {

            }

            meth2() {

            }
        };
    }
};

obj./*#9*/nested = {
    /*#10*/bla: /*#11*/'lol',
    /*#12*/lol: /*#13*/'bla'
};

let tc = new (obj./*#14*/testfunc());

tc./*#15*/meth1();
tc.meth2();

/*#16*/'test';

console.log(obj[/*#17*/'foo']);
console.log(tc./*#18*/meth1);
console.log(obj./*#19*/foo);
console.log(obj./*#20*/bar);
console.log(obj./*#21*/nested./*#22*/bla);
console.log(obj./*#23*/nested./*#24*/lol);
console.log(obj./*#25*/test./*#26*/another);
