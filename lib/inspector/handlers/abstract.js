'use babel';

export default class AbstractHandler {
    constructor(inspector) {
        this._inspector = inspector;
    }

    getInspector() {
        return this._inspector;
    }

    getProgramNode() {
        return this.getInspector().getGlobalScope().getNode();
    }
}
