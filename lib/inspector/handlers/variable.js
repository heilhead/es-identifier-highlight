'use babel';

import AbstractHandler from './abstract.js';
import { recursive, skipThrough, base } from '../walk.js';
import utils, { debug } from '../utils.js';

export default class LiteralHandler extends AbstractHandler {
    constructor(inspector) {
        super(inspector);

        inspector.registerHandler([
            'Function'
        ], (node) => {
            return this._findVarById(node.id);
        });

        inspector.registerHandler([
            'ImportSpecifier',
            'ImportDefaultSpecifier',
            'ImportNamespaceSpecifier'
        ], (node) => {
            return this._findVarById(node.local);
        });

        inspector.registerHandler([
            'JSXIdentifier',
            'VariablePattern',
            'Identifier'
        ], (node) => {
            return this._findVarById(node);
        });
    }

    _findVarById(node) {
        console.warn('_findVarById', node);

        if (!node) {
            return false;
        }

        let result = {
            definition: null,
            usages: null,
            isGlobal: false
        };

        let def = this._findVarDefinition(node);

        if (def) {
            result.definition = def;
            result.usages = this._getVarUsages(def);
        } else {
            result.isGlobal = true;
            result.usages = this._getGlobalVarUsages(node);
        }

        debug('Inspector::_findVarById()', result);

        return result;
    }

    _findVarDefinition(node) {
        let params = utils.getInspectorData(node);

        if (!params) {
            return false;
        }

        let name = node.name;
        let scope = params.scope;

        if (!params.isDefinition) {
            do {
                if (node = scope.getVarDef(name)) {
                    break;
                }
            } while (scope = scope.getParent());
        }

        if (!node) {
            return false;
        }

        let { start, end } = node;

        return {
            start, end, node, name, scope
        };
    }

    _getGlobalVarUsages(node) {
        let result = [];
        let name = node.name;

        recursive(this.getProgramNode(), {}, {
            VariablePattern: skipThrough,

            ScopeBody(node, state, c) {
                let scope = utils.getInspectorData(node).scope;

                // skip scope if it has it's own variabile definition
                if (scope.getVarDef(name)) {
                    return;
                }

                c(node, state);
            },

            Identifier(node) {
                if (node.name !== name || utils.getInspectorData(node).isDefinition) {
                    return;
                }

                result.push({
                    node,
                    start: node.start,
                    end: node.end
                });
            },

            JSXIdentifier(node) {
                if (node.name !== name || !utils.getInspectorData(node).isVariable) {
                    return;
                }

                result.push({
                    node,
                    start: node.start,
                    end: node.end
                });
            }
        }, base);

        return result;
    }

    _getVarUsages(def) {
        let result = [];

        recursive(def.scope.getNode(), {}, {
            VariablePattern: skipThrough,

            ScopeBody(node, state, c) {
                let scope = utils.getInspectorData(node).scope;

                // skip scope if it has it's own variabile definition
                if (scope.getVarDef(def.name)) {
                    return;
                }

                c(node, state);
            },

            Identifier(node) {
                if (node.name !== def.name || node === def.node) {
                    return;
                }

                result.push({
                    node,
                    start: node.start,
                    end: node.end
                });
            },

            JSXIdentifier(node) {
                if (node.name !== def.name || !utils.getInspectorData(node).isVariable) {
                    return;
                }

                result.push({
                    node,
                    start: node.start,
                    end: node.end
                });
            }
        }, base);

        return result;
    }
}
