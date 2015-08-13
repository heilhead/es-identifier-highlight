'use babel';

import View from './view.js';

export default {
    config: {
        minimapLine: {
            type       : 'boolean',
            default    : true,
            description: 'Highlight lines instead of words on the minimap'
        },
        lightTheme: {
            type       : 'boolean',
            default    : false,
            description: 'Use light theme styles'
        }
    },

    activate(state) {
        this._view = new View();
    },

    deactivate() {
        this._view.destroy();
        this._view = null;
    },

    consumeMinimapServiceV1(minimap1) {
        this._view.registerMinimap(minimap1);
    }
};
