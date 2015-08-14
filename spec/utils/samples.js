'use babel';

import fs from 'fs';
import path from 'path';

function getMarkerLength(id) {
    // marker format is /*#1*/
    return ('' + id).length + 5;
}

export default {
    getSource(filename) {
        return fs.readFileSync(path.join(__dirname, '../', filename), 'utf-8');
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
