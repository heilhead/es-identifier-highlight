'use babel';

import AbstractHandler from './abstract.js';
import { walk, walkBase } from '../acorn.js';

export default class LiteralHandler extends AbstractHandler {
    constructor(inspector) {
        super(inspector);

        inspector.registerHandler(['Literal'], (node) => {
            return this._findUsagesByLiteral(node);
        });

        inspector.registerHandler(['MethodDefinition'], (node) => {
            return this._findUsagesByMethodDefinition(node);
        });

        inspector.registerHandler(['Property'], (node) => {
            return this._findUsagesByProperty(node);
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

    _findUsagesByProperty(node) {
        if (node.computed) {
            return false;
        }

        return {
            isLiteral: true,
            usages: this._getLiteralUsages(
                node.key.type === 'Identifier' ?
                    node.key.name :
                    node.key.value
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

        walk.recursive(this.getProgramNode(), {}, {
            VariablePattern: walk.skipThrough,

            Literal(node, state, c) {
                if (node.value !== text) {
                    return;
                }

                result.push({
                    node,
                    start: node.start,
                    end: node.end
                });
            },

            MethodDefinition(node, state, c) {
                c(node.value, state, "Expression");

                if (node.computed || node.key.name !== text) {
                    return;
                }

                result.push({
                    node: node.key,
                    start: node.key.start,
                    end: node.key.end
                });
            },

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
            },

            Property(node, state, c) {
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
            }
        }, walkBase);

        return result;
    }
}
