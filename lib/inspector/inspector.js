'use babel';

import { acorn, walk, walkBase } from './acorn.js';
import Scope from './scope.js';
import utils from './utils.js';
import { debug } from './utils.js';

// handlers
import LiteralHandler from './handlers/literal.js';
import VariableHandler from './handlers/variable.js';

export default class Inspector {
    constructor() {
        this._scopes = {};
        this._handlers = {};
        this._isReady = false;

        this._registerHandlers([
            LiteralHandler,
            VariableHandler
        ]);
    }

    destroy() {
        this._scopes = null;
        this._ast = null;
        this._handlers = null;
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
                allowReserved: true,
                ranges: true,
                ecmaVersion: 6,
                sourceType: 'module',
                plugins: { jsx: true }
            });

            return true;
        } catch(e) {
            debug('Failed to parse source: ', e);

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

                if (node.superClass) {
                    c(node.superClass, state, 'Expression');
                }
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

        debug('scopes', scopes);
    }

    getGlobalScope() {
        return this._scopes[0];
    }

    getScopes() {
        return this._scopes;
    }

    _registerHandlers(handlers) {
        handlers.forEach(Handler => new Handler(this));
    }

    registerHandler(types, handler) {
        types.forEach(type => {
            if (this._handlers[type]) {
                throw new Error('Handler for node type ' + type +
                    ' is already defined');
            }

            this._handlers[type] = handler
        });
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

        debug('ancestors', ancestors);

        if (!this._handlers[type]) {
            return false;
        }

        return this._handlers[type](node);
    }
}
