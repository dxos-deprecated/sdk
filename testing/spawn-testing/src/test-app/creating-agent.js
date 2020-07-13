import { ObjectModel } from '@dxos/echo-db';

export class CreatingAgent {
  static config = {
    model: ObjectModel,
    options: { type: 'example.com/Test' }
  }

  /** @type {ObjectModel} */
  _model;

  constructor (model) {
    this._model = model;
  }

  tick () {
    this._model.createItem('example.com/Test', { foo: 1 });
  }
}
