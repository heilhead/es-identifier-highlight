'use babel';

import assign from 'lodash.assign';
import { allowUnsafeNewFunction } from 'loophole';

export default {
    setInspectorData(node, params = {}, context = {}) {
        node._inspector = assign(
            node._inspector || {},
            { params, context }
        );
    },

    getInspectorData(node, param) {
        let data = node._inspector;

        if (typeof data !== 'object') {
            return null;
        }

        return param ? data.params[param] : data.params;
    },

    getInspectorContext(node, param) {
        let data = node._inspector;

        if (typeof data !== 'object') {
            return null;
        }

        return param ? data.context[param] : data.context;
    }
};

export function unsafeRequire(moduleName) {
    return allowUnsafeNewFunction(() => require(moduleName));
}

export function debug(...params) {
    if (!atom.config.get('es-identifier-highlight.enableDebugOutput')) {
        return;
    }

    console.log(...params);
}
