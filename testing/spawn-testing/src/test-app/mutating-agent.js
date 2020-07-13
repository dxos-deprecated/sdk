import { ObjectModel } from '@dxos/echo-db';

const TYPE = 'example.com/Test';

export class MutatingAgent {
  static config = {
    model: ObjectModel,
    options: { type: TYPE }
  }

  /** @type {ObjectModel} */
  _model;

  constructor (model) {
    this._model = model;
  }

  tick () {
    if (Math.random() > 0.5) {
      console.log('creating');
      this._model.createItem(TYPE, { foo: 1 });
    } else {
      const items = this._model.getObjectsByType(TYPE);
      if (items.length === 0) {
        console.log('creating cause empty');
        this._model.createItem(TYPE, { foo: 1 });
      } else {
        console.log('mutating');
        const item = items[Math.floor(Math.random() * items.length)];
        this._model.updateItem(item.id, { foo: item.properties.foo + 1 });
      }
    }
  }
}
