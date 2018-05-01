#!/usr/bin/env node

const moduleName = process.argv[2];
const exportVariable = process.argv[3];

if (!moduleName) {
  console.log('Usage: xstate-plantuml <module> [<variable>]\n\n  xstate-plantuml ./on-off\n  xstate-plantuml ./stateMachines lightStates');
  return;
}

let machine = require(moduleName);
if (exportVariable) {
  machine = machine[exportVariable];
}

let indentation = 0;

function print(name, state) {
  startCompound(name);
  indentation++
  initial(state.initial);
  events(name, state);
  entry(name, state);
  exit(name, state);
  const children = state.states || {};
  Object.keys(children).forEach(name => print(name, children[name]));
  indentation--
  endCompound(name);
}

print("", machine);


function echo(val) {
  console.log(Array(indentation*2).join(" ") + val);
}

function startCompound(name) {
  if (name == '') { // root state
    echo('left to right direction');
    echo(`@startuml`);
  }
  else {
    echo(`state ${name} {`);
  }
}

function initial(name) {
  if (name) {
    echo(`[*] --> ${name}`);
  }
}

function event(name, e, target) {
  echo(`${name} --> ${target}: ${e}`);
}

function events(name, state) {
  const on = state.on || {};
  Object.keys(on).forEach(e => event(name, e, on[e]));
}

function action(name, when, action) {
  if (Object.keys(action).length > 0) {
    echo(`${name}: on${when} / ${action.type}`);
  }
}

function actions(name, when, actions) {
  if (Array.isArray(actions)) {
    actions.forEach(a => action(name, when, a));
  }
  else {
    action(name, when, actions);
  }
}

function entry(name, state) {
  actions(name, 'entry',  state.onEntry || {});
}

function exit(name, state) {
  actions(name, 'exit', state.onExit || {});
}

function endCompound(name) {
  if (name == '') { // root state
    echo(`@enduml`);
  }
  else {
    echo(`}`);
  }
}
