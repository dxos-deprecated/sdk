import { BaseAgent } from "./base-agent";

export class TestAgent extends BaseAgent {
  tick() {
    this._model.createItem('example.com/Test', { foo: 1 });
  }
}