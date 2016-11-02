'use babel';

import AbstractHandler from './abstract.js';
import { recursive, skipThrough, base } from '../walk.js';

export default class LiteralHandler extends AbstractHandler {
    constructor(inspector) {
        super(inspector);

        inspector.registerHandler([
            'Literal',
            'StringLiteral',
            'NumericLiteral',
            'BooleanLiteral',
            'NullLiteral',
            'RegExpLiteral'
        ], (node) => {
            return this._findUsagesByLiteral(node);
        });

        inspector.registerHandler([
            'ObjectMethod',
            'ClassMethod'
        ], (node) => {
            return this._findUsagesByMethodDefinition(node);
        });

        inspector.registerHandler(['ObjectProperty'], (node) => {
            return this._findUsagesByObjectPropertyIdentifier(node.key);
        });

        inspector.registerHandler(['ClassPropertyIdentifier'], (node) => {
            return this._findUsagesByObjectPropertyIdentifier(node);
        });

        inspector.registerHandler(['MemberExpression'], (node) => {
            return this._findUsagesByMemberExpression(node);
        });
    }

    _findUsagesByLiteral(node) {
        return {
            isLiteral: true,
            usages: this._getLiteralUsages(node.value)
        };
    }

    _findUsagesByMethodDefinition(node) {
        if (node.computed) {
            return false;
        }

        return {
            isLiteral: true,
            usages: this._getLiteralUsages(node.key.name)
        };
    }

    _findUsagesByObjectPropertyIdentifier(node) {
        if (node.computed) {
            return false;
        }

        return {
            isLiteral: true,
            usages: this._getLiteralUsages(
                node.type === 'Identifier' ?
                    node.name :
                    node.value
            )
        };
    }

    _findUsagesByMemberExpression(node) {
        if (node.computed) {
            return false;
        }

        return {
            isLiteral: true,
            usages: this._getLiteralUsages(node.property.name)
        };
    }

    _getLiteralUsages(text) {
        let result = [];

        // ignore empty string literals
        if (typeof text === 'string' && !text.trim()) {
            return result;
        }

        function Literal(node, state, c) {
            if (node.value !== text) {
                return;
            }

            result.push({
                node,
                start: node.start,
                end: node.end
            });
        };

        function Method(node, state, c) {
            c(node.body, state);

            if (node.computed || node.key.name !== text) {
                return;
            }

            result.push({
                node: node.key,
                start: node.key.start,
                end: node.key.end
            });
        };

        function Property(node, state, c) {
            if (node.value) {
                c(node.value, state);
            }

            c(node.key, state);

            if (node.computed || node.key.name !== text) {
                return;
            }

            result.push({
                node: node.key,
                start: node.key.start,
                end: node.key.end
            });
        };

        recursive(this.getProgramNode(), {}, {
            VariablePattern: skipThrough,

            StringLiteral: Literal,
            NumericLiteral: Literal,
            BooleanLiteral: Literal,
            NullLiteral: Literal,
            RegExpLiteral: Literal,

            ObjectMethod: Method,
            ClassMethod: Method,

            ObjectProperty: Property,
            ClassProperty: Property,

            MemberExpression(node, state, c) {
                c(node.object, state);
                c(node.property, state);

                if (node.computed || node.property.name !== text) {
                    return;
                }

                result.push({
                    node: node.property,
                    start: node.property.start,
                    end: node.property.end
                });
            }
        }, base);

        return result;
    }
}
