# FlowPipe

This is a helper library for writing type-safe async code in MobX State Tree.

## The Problem

[MST recommends](https://mobx-state-tree.js.org/concepts/async-actions) the use of `flow` for async code. This is great except one issue, you loose all type safety when you use yield:

```typescript
import { types, onPatch, flow, IJsonPatch } from "mobx-state-tree";

const doSomethingAsync = (input: number) =>
  Promise.resolve("this is the result");

const store = types.model({}).actions((self) => ({
  // the type of this function is correct:
  // number -> Promise<"string">
  action1: flow(function* (input: number) {
    // Unfortunately "result" here is typed as any
    const result = yield doSomethingAsync(input);

    return "result: " + result;
  }),
}));
```

This makes it awkward to use as you have to manually type the return of every yield.

## The Solution

This library attempts to solve that by borrowing the concept of piping from functional code.

The above code now becomes:

```
import { types } from "mobx-state-tree";
import { flowPipe } from "./src";

const doSomethingAsync = (input: number) =>
  Promise.resolve("this is the result");

const store = types.model({}).actions((self) => ({
  // the type of this function is still correct:
  // number -> Promise<"string">
  action1: flowPipe(
    (input: number) => doSomethingAsync(input),

    // Result here is now correctly typed as "string"
    (result) => "result: " + result
  ),
}));
```

You can then chain together as many of these async steps as you wish. You can update the state mid-flow just fine:

```
import { types } from "mobx-state-tree";
import { flowPipe } from "./src";

const loadUserName = (userId: string) => Promise.resolve("mike");

const loadUserAge = (userId: string) => Promise.resolve(36);

const User = types
  .model({
    name: types.string,
    age: types.number,
  })
  .actions((self) => ({
    action1: flowPipe(
      (userId: string) =>
        loadUserName(userId).then((name) => ({ name, userId })),
      (result) => {
        self.name = result.name;
        return loadUserAge(result.userId);
      },
      (result) => {
        self.age = result;
      }
    ),
  }));
```

If you want handle errors, instead of passing functions to flowPipe pass an array of functions as the first arg and an error handler as the second arg. e.g.

```
import { types } from "mobx-state-tree";
import { flowPipe } from "./src";

const loadUserName = (userId: string) => Promise.resolve("mike");

const loadUserAge = (userId: string) => Promise.resolve(36);

const User = types
  .model({
    name: types.string,
    age: types.number,
  })
  .actions((self) => ({
    action1: flowPipe([
      (userId: string) =>
        loadUserName(userId).then((name) => ({ name, userId })),
      (result) => {
        self.name = result.name;
        return loadUserAge(result.userId);
      },
      // Note: we have to type "result" as number here, im not sure why, please open an issue if
      // you know to fix it
      (result: number) => {
        self.age = result;
      },
    ], (error) => "could not load user, error: "+ error),
  }));
```

## More Examples

Checkout the tests for more examples of how to use this library

## Known issues

Currently I have only added support for 5 steps in a flowPipe but its trivial to add more, please open a PR if you want more :)

There is currently a known issue with circularly referenced promise types
