'use babel';

import utils from './utils.js';

export default class Scope {
    constructor(id, node, parent) {
        this._id = id;
        this._vars = {};
        this._node = node;
        this._parent = parent;

        utils.setInspectorData(node, {
            scope: this
        });
    }

    destroy() {
        this._vars = null;
        this._node = null;
        this._parent = null;
    }

    getId() {
        return this._id;
    }

    getNode() {
        return this._node;
    }

    addVarDef(name, node) {
        this._vars[name] = node;
    }

    getVarDef(name) {
        return this._vars[name];
    }

    getParent() {
        return this._parent;
    }
}
