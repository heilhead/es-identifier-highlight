let /*#1*/val = 'lol';
let NestedComponent, TestComponent;

function jsxTest() {
    let spreadParams = { foo: 'bar' };

    return (
        <TestComponent>
            <NestedComponent param={/*#2*/val} />
            <Namespaced1:Component checked="" {...spreadParams} />
            {/*test comment*/}
            <Namespaced2.Comp /*comment*/ />
        </TestComponent>
    );
}
