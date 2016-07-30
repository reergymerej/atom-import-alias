'use babel';

import AtomImportAliasView from './atom-import-alias-view';
import { CompositeDisposable } from 'atom';
import importAlias from 'import-alias';

export default {

  atomImportAliasView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomImportAliasView = new AtomImportAliasView(state.atomImportAliasViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomImportAliasView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-import-alias:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomImportAliasView.destroy();
  },

  serialize() {
    return {
      atomImportAliasViewState: this.atomImportAliasView.serialize()
    };
  },

  toggle() {
    console.log('AtomImportAlias was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
