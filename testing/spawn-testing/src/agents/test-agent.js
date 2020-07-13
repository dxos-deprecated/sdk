import { Agent } from './agent';

export default class TestAgent extends Agent {
  tick () {
    this._model.createItem('example.com/Test', { foo: 1 });
  }
}
