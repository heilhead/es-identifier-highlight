'use babel';

import { CompositeDisposable, Range } from 'atom';
import Inspector from './inspector/inspector.js';
import RenameDialog from './rename-dialog.js';
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

        this._subscriptions.add(
            atom.commands.add('atom-workspace', {
              'es-identifier-highlight:renameIdentifier': () => this._handleRefactorHotkey()
            })
        );

        this._subscriptions.add(
            atom.commands.add('atom-workspace', {
              'es-identifier-highlight:prevIdentifier': () => this._handlePrevIdHotkey()
            })
        );

        this._subscriptions.add(
            atom.commands.add('atom-workspace', {
              'es-identifier-highlight:nextIdentifier': () => this._handleNextIdHotkey()
            })
        );

        this._subscriptions.add(
            atom.commands.add('atom-workspace', {
              'es-identifier-highlight:jumpToDefinition': () => this._handleDefinitionHotkey()
            })
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

        this._editor = editor;

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

        this._handleSourceChange();
        this._debouncedHighlight();
    }

    _refactor(newName) {
        let occ = this._occurences,
            oldName = occ.definition.name;

        if (newName === oldName) {
            return;
        }

        let lenDiff = newName.length - oldName.length,
            totalLenDiff = 0,
            markers = [];

        [].concat(occ.definition, occ.usages)
            .forEach(usage => {
                let range = this._getRange(usage.start, usage.end);

                let marker = this._editor.markBufferRange(range, {
                    invalidate: 'touch'
                });

                markers.push(marker);
            });

        markers.forEach(marker => {
            let rng = marker.getBufferRange();

            let oldText = this._editor.getTextInBufferRange(rng);

            // just in case to not mess it up
            if (oldText !== oldName) {
                throw new Error('Code changed');
            }

            this._editor.setTextInBufferRange(
                marker.getBufferRange(),
                newName
            );

            marker.destroy();
        });

        this._forceHighlight();
    }

    _handleRefactorHotkey() {
        if (!this._occurences ||
            !this._occurences.definition ||
            this._occurences.isGlobal)
        {
            return atom.notifications.addInfo(
                'Variable definition not found.',
                {
                  dismissable: true
                }
            );
        }

        let dialog = new RenameDialog({
            prompt: 'Enter new name',
            name: this._occurences.definition.name
        });

        dialog.on('confirmed', (event, newName) => this._refactor(newName));

        dialog.attach();
    }

    _setCursorPosition(pos, silent) {
        if (silent) {
            this._skipNextParse = true;
        }

        this._editor.setCursorBufferPosition(pos);
    }

    _handlePrevIdHotkey() {
        if (!this._occurences || !this._occurences.definition || !this._editor) {
            return;
        }

        this._currentIdIndex = Math.max(0, this._currentIdIndex - 1);

        let buf = this._editor.getBuffer(),
            start = this._occurences.sorted[this._currentIdIndex].start,
            pos = buf.positionForCharacterIndex(start);

        this._setCursorPosition(pos, true);
    }

    _handleNextIdHotkey() {
        if (!this._occurences || !this._occurences.definition || !this._editor) {
            return;
        }

        this._currentIdIndex = Math.min(this._occurences.sorted.length - 1, this._currentIdIndex + 1);

        let buf = this._editor.getBuffer(),
            start = this._occurences.sorted[this._currentIdIndex].start,
            pos = buf.positionForCharacterIndex(start);

        this._setCursorPosition(pos, true);
    }

    _handleDefinitionHotkey() {
        if (!this._occurences || !this._occurences.definition || !this._editor) {
            return;
        }

        let buf = this._editor.getBuffer(),
            start = this._occurences.definition.start,
            pos = buf.positionForCharacterIndex(start);

        this._setCursorPosition(pos, true);

        this._currentIdIndex = this._getCurrentIdIndex(start, this._occurences.sorted);
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

        editor.decorateMarker(marker, {
            type: type,
            class: classNames(
                'es-identifier-highlight',
                classes,
                {
                    'line': type === 'line'
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

    _invalidateMarkers() {
        this._markers.forEach(marker => marker.destroy());
        this._markers.length = 0;

        this._occurences = null;
    }

    _forceHighlight() {
        this._lastCursorOffset = -1;

        this._invalidateMarkers();
        this._handleSourceChange();
        this._highlightOccurrences();
    }

    _getCurrentIdIndex(offset, sorted) {
        for (let i = 0; i < sorted.length; i++) {
            if (offset >= sorted[i].start && offset <= sorted[i].end) {
                return i;
            }
        }

        return 0;
    }

    _highlightOccurrences() {
        if (this._skipNextParse) {
            this._skipNextParse = false;

            return;
        }

        this._occurences = null;

        if (!this._editor || !this._inspector.isReady()) {
            return;
        }

        this._invalidateMarkers();

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

        let combined = res.definition ?
                [].concat(res.definition, res.usages) :
                [].concat(res.usages);

        res.sorted = combined.sort((a, b) => a.start - b.start);

        this._currentIdIndex = this._getCurrentIdIndex(offset, res.sorted);

        this._occurences = res;

        if (res.definition) {
            this._mark(res.definition.start, res.definition.end, 'definition');
        }

        res.usages.forEach(usage => {
            this._mark(usage.start, usage.end, {
                global: res.isGlobal,
                literal: res.isLiteral
            });
        });
    }
}
