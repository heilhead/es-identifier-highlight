'use babel';

import { CompositeDisposable, Range } from 'atom';
import Inspector from './inspector/inspector.js';
import debounce from 'lodash.debounce';
import classNames from 'classnames';

const minimapPluginID = 'identifier-highlight';
const grammarScopes = ['source.js', 'source.js.jsx', 'source.babel', 'source.js-semantic'];

export default class View {
    constructor() {
        this._subscriptions = new CompositeDisposable();
        this._editorSubscriptions = new CompositeDisposable();

        this._subscriptions.add(
            atom.workspace.onDidChangeActivePaneItem(this._handleEditorChange.bind(this))
        );

        this._inspector = new Inspector();
        this._markers = [];

        this._debouncedHighlight = debounce(
            this._highlightOccurrences.bind(this),
            300,
            {
                leading: true,
                trailing: true
            }
        );

        this._minimapActive = false;

        this._handleEditorChange();
    }

    destroy() {
        this._subscriptions.dispose();
        this._editorSubscriptions.dispose();

        this._inspector.destroy();
        this._inspector = null;

        if (this._minimap) {
            this._minimap.unregisterPlugin(minimapPluginID);
            this._minimap = null;
        }
    }

    registerMinimap(minimap) {
        this._minimap = minimap;

        this._minimap.registerPlugin(minimapPluginID, {
            activatePlugin: () => {
                this._minimapActive = true;
            },

            deactivatePlugin: () => {
                this._minimapActive = false;
            },

            isActive: () => this._minimapActive
        });
    }

    _handleEditorChange() {
        this._editorSubscriptions.dispose();

        let editor = atom.workspace.getActiveTextEditor();

        if (!editor) {
            return;
        }

        let grammar = editor.getGrammar();

        if (grammarScopes.indexOf(grammar.scopeName) === -1) {
            return;
        }

        this._lastCursorOffset = null;

        this._editorSubscriptions = new CompositeDisposable();

        this._editorSubscriptions.add(
            editor.onDidChangeCursorPosition(this._handleCursorChanged.bind(this))
        );
        this._editorSubscriptions.add(
            editor.onDidStopChanging(this._handleSourceChange.bind(this))
        );

        this._editor = editor;

        this._handleSourceChange();
        this._debouncedHighlight();
    }

    _handleSourceChange() {
        this._inspector.parse(this._editor.getText());
    }

    _handleCursorChanged() {
        this._debouncedHighlight();
    }

    _getRange(start, end) {
        let buf = this._editor.getBuffer();

        return new Range(
            buf.positionForCharacterIndex(start),
            buf.positionForCharacterIndex(end)
        );
    }

    _createMarker(editor, range, type, classes) {
        let marker = editor.markBufferRange(range, {
            invalidate: 'touch'
        });

        let isLightTheme = atom.config.get('es-identifier-highlight.lightTheme');

        editor.decorateMarker(marker, {
            type: type,
            class: classNames(
                'es-identifier-highlight',
                classes,
                {
                    'line': type === 'line',
                    'light-theme': isLightTheme
                }
            )
        });

        this._markers.push(marker);

        return marker;
    }

    _mark(start, end, classes) {
        let range = this._getRange(start, end);

        this._createMarker(this._editor, range, 'highlight', classes);

        if (this._minimapActive) {
            this._createMarker(
                this._minimap.getActiveMinimap(),
                range,
                atom.config.get('es-identifier-highlight.minimapLine') ? 'line' : 'highlight',
                classes
            );
        }
    }

    _highlightOccurrences() {
        this._markers.forEach(marker => marker.destroy());
        this._markers.length = 0;

        if (!this._inspector.isReady()) {
            return;
        }

        let pos = this._editor.getCursorBufferPosition();
        let offset = this._editor.getBuffer().characterIndexForPosition(pos);

        if (offset === this._lastCursorOffset) {
            return;
        }

        this._lastCursorOffset = offset;

        let res = this._inspector.findOccurrences(offset);

        if (!res) {
            return;
        }

        if (!res.isGlobal) {
            this._mark(res.definition.start, res.definition.end, 'definition');
        }

        res.usages.forEach(usage => {
            this._mark(usage.start, usage.end, {
                global: res.isGlobal
            });
        });
    }
}
