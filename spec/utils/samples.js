'use babel';

import fs from 'fs';

function getMarkerLength(id) {
    // marker format is /*#1*/
    return ('' + id).length + 5;
}

export default {
    getSource(path) {
        return fs.readFileSync(path, 'utf-8');
    },

    getMarkers(src) {
        let re = /\/\*#(\d+)\*\//g;
        let result = {};
        let match;

        while (match = re.exec(src)) {
            let id = match[1];

            if (result[id]) {
                throw new Error('Duplicate marker "' + id + '"');
            }

            result[id] = match.index + getMarkerLength(id);
        }

        return result;
    }
};
