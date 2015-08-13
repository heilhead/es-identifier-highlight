'use babel';

import assign from 'lodash.assign';
import { unsafeRequire } from './utils.js';

let acornLoose = unsafeRequire('acorn/dist/acorn_loose');
let walk = require('acorn/dist/walk');

import jsxInject from 'acorn-jsx/inject';

let acorn = jsxInject(unsafeRequire('acorn'));

walk.ancestorNodesAtOffset = function(node, offset, visitors = {}) {
    let result = [];

    walk.findNodeAround(node, offset, (nodeType, node) => {
        result.push({
            type: nodeType,
            node: node
        });

        if (visitors[nodeType]) {
            visitors[nodeType](node);
        }
    }, walkBase);

    return result;
};

walk.skipThrough = function(node, st, c) {
    c(node, st);
};

// add support for jsx & some other stuff
let ignore = function(n,s,c){};

let walkBase = assign({}, walk.base, {
    ExportSpecifier(node, state, c) {
        c(node.local, state);
    },

    JSXElementName: walk.skipThrough,
    JSXAttributeName: walk.skipThrough,
    JSXAttributeValue: walk.skipThrough,
    JSXIdentifier: ignore,
    JSXEmptyExpression: ignore,

    JSXElement(node, state, c) {
        c(node.openingElement, state);

        node.children.forEach(child => c(child, state));

        if (node.closingElement) {
            c(node.closingElement, state);
        }
    },

    JSXOpeningElement(node, state, c) {
        c(node.name, state, 'JSXElementName');

        node.attributes.forEach(attr => c(attr, state));
    },

    JSXClosingElement(node, state, c) {
        c(node.name, state, 'JSXElementName');
    },

    JSXAttribute(node, state, c) {
        c(node.name, state, 'JSXAttributeName');

        if (node.value) {
            c(node.value, state, 'JSXAttributeValue');
        }
    },

    JSXExpressionContainer(node, state, c) {
        c(node.expression, state, 'Expression');
    },

    JSXSpreadAttribute(node, state, c) {
        c(node.argument, state, 'Expression');
    },

    JSXNamespacedName(node, state, c) {
        c(node.namespace, state);
        c(node.name, state);
    },

    JSXMemberExpression(node, state, c) {
        c(node.object, state);
        c(node.property, state);
    }
});

export default acorn;
export { walk, acorn, acornLoose, walkBase };
