import /*#1*/imp1 from './imp1';
import { /*#2*/imp2 } from './imp2';
import { imp3 as /*#3*/imp3 } from './imp3';
import * as /*#4*/imp4 from 'imp4';

/*#5*/imp1;
/*#6*/imp2;
/*#7*/imp3;
/*#8*/imp4;

function es6test1() {
    var foo = ["one", "two", "three"];

    var [/*#9*/one, /*#10*/two, three] = foo;

    return { /*#11*/one, /*#12*/two, three };
}

function es6test2() {
    var /*#13*/a = 1;
    var /*#14*/b = 3;

    [/*#15*/a, /*#16*/b] = [/*#17*/b, /*#18*/a];
}

function es6test3() {
    var o = {p: 42, q: true};
    var {/*#19*/p, /*#20*/q} = o;

    console.log(/*#21*/p); // 42
    console.log(/*#22*/q); // true

    // Assign new variable names
    var {p: /*#23*/foo, q: /*#24*/bar} = o;

    console.log(/*#25*/foo); // 42
    console.log(/*#26*/bar); // true

    var /*#27*/a, /*#28*/b;

    ({/*#29*/a, /*#30*/b} = {a:1, b:2});
}

function es6test4() {
    function drawES6Chart({/*#31*/size = 'big', /*#32*/cords = { x: 0, y: 0 }, radius = 25} = {})
    {
        console.log(/*#33*/size, /*#34*/cords, radius);
        // do some chart drawing
    }

    drawES6Chart({
        cords: { x: 18, y: 30 },
        radius: 30
    });
}

function es6test5() {
    var metadata = {
        title: "Scratchpad",
        translations: [
            {
                locale: "de",
                localization_tags: [ ],
                last_edit: "2014-04-14T08:43:37",
                url: "/de/docs/Tools/Scratchpad",
                title: "JavaScript-Umgebung"
            }
        ],
        url: "/en-US/docs/Tools/Scratchpad"
    };

    var { title: /*#35*/englishTitle, translations: [{ title: /*#36*/localeTitle }] } = metadata;

    console.log(/*#37*/englishTitle); // "Scratchpad"
    console.log(/*#38*/localeTitle);  // "JavaScript-Umgebung"
}

function es6test6() {
    function userId({id}) {
        return id;
    }

    function whois({displayName: /*#39*/displayName, fullName: {firstName: /*#40*/name}}){
        console.log(/*#41*/displayName + " is " + /*#42*/name);
    }

    var user = {
        id: 42,
        displayName: "jdoe",
        fullName: {
            firstName: "John",
            lastName: "Doe"
        }
    };

    console.log("userId: " + userId(user)); // "userId: 42"
    whois(user); // "jdoe is John"
}
