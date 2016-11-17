const /*#1*/BAR = 0;

class Foo {
  static /*#2*/bar = /*#3*/BAR;
  /*#4*/foo = /*#5*/'foo';

  /*#6*/randomMethod() {

  }
}

const /*#12*/someObject = { /*#7*/foo: /*#8*/'bar' };

// spread properties
const anotherObject = { .../*#9*/someObject, /*#10*/prop: /*#11*/'randomMethod' };

// more complicated spread
const { className, childProps = {}, .../*#13*/optsRest } = anotherObject;

/*#14*/optsRest.test;
