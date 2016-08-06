import * as I from 'immutable';
import * as R from 'ramda';
import * as Util from '../util/index';
import executeForm from './execute-form';

const evaluate = R.curry((env, form) => {
  if (typeof form === 'symbol') {
    return env[form];
  }

  if (Util.canExecuteForm(form)) {
    return executeForm(env, form);
  }

  return evaluateColl(env, form);
});

function evaluateColl(env, form) {
  if (shouldMap(form)) {
    return form.map(evaluate(env));
  }

  if (shouldMapEntries(form)) {
    return form.mapEntries(([k, v]) => [
      evaluate(env, k),
      evaluate(env, v),
    ]);
  }

  return form;
}

const shouldMapEntries = or(
  I.OrderedMap.isOrderedMap,
  I.Map.isMap,
);

const shouldMap = or(
  I.List.isList,
  I.Set.isSet,
  I.OrderedSet.isOrderedSet,
  I.Seq.isSeq,
);

function or(...fns) {
  return (x) => {
    return Util.reduce((old, fn) => old || fn(x), false, fns);
  };
}

export default evaluate;