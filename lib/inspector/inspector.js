'use babel';

import { acorn, walk, walkBase } from './acorn.js';
import Scope from './scope.js';
import utils from './utils.js';

export default class Inspector {
    constructor() {
        this._scopes = {};
        this._isReady = false;
    }

    destroy() {
        this._scopes = null;
        this._ast = null;
    }

    _setIsReady(val) {
        this._isReady = val;
    }

    isReady() {
        return this._isReady;
    }

    parse(code) {
        this._setIsReady(false);

        if (!this._createAST(code)) {
            return false;
        }

        this._inspect();

        this._setIsReady(true);

        return true;
    }

    _createAST(code) {
        try {
            this._ast = acorn.parse(code, {
                ranges: true,
                ecmaVersion: 6,
                sourceType: 'module',
                plugins: { jsx: true }
            });

            return true;
        } catch(e) {
            console.warn('Failed to parse source: ', e);

            this._ast = null;

            return false;
        }
    }

    _inspect() {
        let scopeId = 0;
        let scope = new Scope(scopeId, this._ast);

        let scopes = this._scopes = [];

        walk.recursive(this._ast, {}, {
            VariablePattern: walk.skipThrough,

            ScopeBody(node, state, c) {
                scope = new Scope(++scopeId, node, scope);

                scopes.push(scope);

                if (node.type !== 'Program') {
                    c(node, state, 'Statement');
                } else {
                    node.body.forEach(child => c(child, state));
                }

                scope = scope.getParent();
            },

            Program(node, state, c) {
                c(node, state, 'ScopeBody');
            },

            Identifier(node, { isDefinition = false, isAssignment = false }) {
                utils.setInspectorData(node, { scope, isDefinition, isAssignment });

                if (isDefinition) {
                    scope.addVarDef(node.name, node);
                }
            },

            Function(node, state, c) {
                if (node.id) {
                    c(node.id, { isDefinition: true });
                }

                scope = new Scope(++scopeId, node.body, scope);

                scopes.push(scope);

                node.params.forEach(child => c(child, { isDefinition: true }));

                c(node.body, state);

                scope = scope.getParent();
            },

            ImportSpecifier(node, state, c) {
                c(node.local, { isDefinition: true });
            },

            ImportDefaultSpecifier(node, state, c) {
                c(node.local, { isDefinition: true });
            },

            ImportNamespaceSpecifier(node, state, c) {
                c(node.local, { isDefinition: true });
            },

            ExportNamedDeclaration(node, state, c) {
                if (node.declaration) {
                    c(node.declaration, state);
                }

                node.specifiers.forEach(child => c(child, state));
            },

            AssignmentExpression(node, state, c) {
                c(node.left, { isAssignment: true }, 'Pattern');
                c(node.right, state, 'Expression');
            },

            VariableDeclaration(node, state, c) {
                node.declarations.forEach(child => {
                    c(child.id, { isDefinition: true });

                    if (child.init) {
                        c(child.init, state);
                    }
                });
            },

            ClassDeclaration(node, state, c) {
                c(node.id, { isDefinition: true });

                c(node.body, state, 'BlockStatement');
            },

            JSXIdentifier(node, { isVariable = false }) {
                utils.setInspectorData(node, { scope, isVariable });
            },

            JSXElementName(node, state, c) {
                c(node, { isVariable: true });
            },

            JSXAttributeValue(node, state, c) {
                c(node, { isVariable: true });
            }
        }, walkBase);

        //console.log('scopes', scopes);
    }

    _getGlobalScope() {
        return this._scopes[0];
    }

    _findVarDefinition(node) {
        let params = utils.getInspectorData(node);
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

        let [ start, end ] = node.range;

        return {
            start, end, node, name, scope
        };
    }

    findOccurrences(offset) {
        if (!this.isReady()) {
            throw new Error('AST is not defined');
        }

        let ancestors = walk.ancestorNodesAtOffset(this._ast, offset);

        if (!ancestors.length) {
            return false;
        }

        let { node, type } = ancestors[0];

        //console.log('ancestors', ancestors);

        switch (type) {
            case 'Function':
                return this._findVarById(node.id);
            case 'ImportSpecifier':
            case 'ImportDefaultSpecifier':
            case 'ImportNamespaceSpecifier':
                return this._findVarById(node.local);
            case 'JSXIdentifier':
            case 'VariablePattern':
            case 'Identifier':
                return this._findVarById(node);
            default:
                return false;
        }
    }

    _findVarById(node) {
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

        //console.log('Inspector::_findVarById()', result);

        return result;
    }

    _getGlobalVarUsages(node) {
        let result = [];
        let name = node.name;

        walk.recursive(this._getGlobalScope().getNode(), {}, {
            VariablePattern: walk.skipThrough,

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
        }, walkBase);

        return result;
    }

    _getVarUsages(def) {
        let result = [];

        walk.recursive(def.scope.getNode(), {}, {
            VariablePattern: walk.skipThrough,

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
        }, walkBase);

        return result;
    }
}
