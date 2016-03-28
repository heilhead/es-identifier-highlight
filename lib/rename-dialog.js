'use babel';

import { $, TextEditorView, View } from 'atom-space-pen-views';

export default class RenameDialog extends View {
    initialize({ name = '', iconClass = 'icon-arrow-right' }) {
        if (iconClass) {
            this.promptText.addClass(iconClass);
        }

        atom.commands.add(this.element, {
          'core:confirm': () => this.onConfirm(this.miniEditor.getText()),
          'core:cancel': () => this.cancel()
        });

        this.miniEditor.on('blur', () => {
            if (document.hasFocus()) {
                this.close();
            }
        });

        this.miniEditor.getModel().onDidChange(() => this.showError());
        this.miniEditor.getModel().setText(name);

        let range = [[0, 0], [0, name.length]];

        this.miniEditor.getModel().setSelectedBufferRange(range);
    };

    attach() {
        this.panel = atom.workspace.addModalPanel({
            item: this.element
        });

        this.miniEditor.focus();

        this.miniEditor.getModel().scrollToCursorPosition();
    }

    close() {
        if (this.panel) {
            this.panel.destroy();
        }

        this.panel = null;

        atom.workspace.getActivePane().activate();
    }

    cancel() {
        this.close();
    }

    showError(message) {
        if (!message) {
            message = '';
        }

        this.errorMessage.text(message);

        if (message) {
            this.flashError();
        }
    }

    onConfirm(value) {
        if (!value) {
            return this.showError('Invalid value');
        }

        this.close();

        this.trigger('confirmed', value);
    }
}

RenameDialog.content = function({ prompt }) {
    this.div(
        { class: 'es-id-hl-dialog' },
        () => {
            this.label(prompt, { class: 'icon', outlet: 'promptText' });
            this.subview('miniEditor', new TextEditorView({ mini: true }));
            this.div({ class: 'error-message', outlet: 'errorMessage' });
        }
    );
};
