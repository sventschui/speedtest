import Bacon from 'baconjs';

export default function createAction() {
  const bus = new Bacon.Bus();
  const action = value => bus.push(value);
  action.$ = bus;
  return action;
}
