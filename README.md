# MST Flow Pipe

This is a helper library for writing type-safe async code in MobX State Tree.

## The Problem

[MST recommends](https://mobx-state-tree.js.org/concepts/async-actions) the use of `flow` for async code. This is great except one issue, you loose all type safety when you use yield:

```typescript
import { types, onPatch, flow, IJsonPatch } from "mobx-state-tree";

const doSomethingAsync = (input: number) => Promise.resolve("this is the result");

const store = types.model({}).actions((self) => ({
  action1: flow(function* (input: number) {
    // Unfortunately "result" here is typed as "any" instead of "string"
    const result = yield doSomethingAsync(input);

    return "result: " + result;
  }),
}));
```

This makes it awkward to use as you have to manually type the return of every yield.

## The Solution

This library attempts to solve the issue by converting the flow in a series of piped functions.

The above code now becomes:

```typescript
import { types } from "mobx-state-tree";
import { flowPipe } from "mst-flow-pipe";

const doSomethingAsync = (input: number) => Promise.resolve("this is the result");

const store = types.model({}).actions((self) => ({
  // We type the input to the flow as number

  action1: flowPipe((input: number) => doSomethingAsync(input))
    // Result here is now correctly typed as "string"
    .then((result) => "result: " + result)

    // Note, we must also "end" the flow
    .end(),
}));
```

You can then chain together as many of these async steps as you wish. You can update the state mid-flow just fine:

```typescript
import { types } from "mobx-state-tree";
import { flowPipe } from "mst-flow-pipe";

const loadUserName = (userId: string) => Promise.resolve("mike");

const loadUserAge = (userId: string) => Promise.resolve(36);

const User = types
  .model({
    name: types.string,
    age: types.number,
  })
  .actions((self) => ({
    action1: flowPipe(
      // We load the user name
      (userId: string) =>
        loadUserName(userId)
          // We also need the userId in the next step of the flow so we "map" the result of
          // this async step into the next step of the flow
          .then((name) => ({ name, userId }))
    )
      .then((result) => {
        // We can now safely set the name on the model because we are now in an "action"
        self.name = result.name;

        // We can then continue the flow with another async step
        return loadUserAge(result.userId);
      })
      .then((result) => {
        self.age = result;
      })

      // End the flow to return a valid action
      .end(),
  }));
```

If you want handle errors during the flow you can do that using the `catch` method.

```typescript
import { types } from "mobx-state-tree";
import { flowPipe } from "mst-flow-pipe";

const loadUserName = (userId: string) => Promise.resolve("mike");

const loadUserAge = (userId: string) => Promise.resolve(36);

const reportErrorToServer = (err: Error) => Promise.resolve(err);

const User = types
  .model({
    name: types.string,
    age: types.number,
  })
  .actions((self) => ({
    // The type of this function is:
    // `(userId: string) => Promise<number | "error reported to server">`

    action1: flowPipe((userId: string) => loadUserName(userId).then((name) => ({ name, userId })))
      .then((result) => {
        self.name = result.name;
        return loadUserAge(result.userId);
      })
      .then((result: number) => {
        self.age = result;
        return result;
      })

      // If any of the above steps error then we can catch then and continue on
      .catch((error) => reportErrorToServer(new Error("could not load user, error: " + error)))

      // The type of result is now "number" or "Error"
      .then((result) => (result instanceof Error ? "error reported to server" : result))

      .end(),
  }));
```

## More Examples

Checkout [the tests](https://github.com/mikecann/flowPipe/blob/master/test/index.test.ts) for more examples of how to use this library

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.mikecann.co.uk"><img src="https://avatars3.githubusercontent.com/u/215033?v=4" width="100px;" alt=""/><br /><sub><b>Mike Cann</b></sub></a><br /><a href="https://github.com/mikecann/mst-flow-pipe/commits?author=mikecann" title="Code">💻</a></td>
    <td align="center"><a href="https://lorefnon.tech/"><img src="https://avatars1.githubusercontent.com/u/1449492?v=4" width="100px;" alt=""/><br /><sub><b>Lorefnon</b></sub></a><br /><a href="https://github.com/mikecann/mst-flow-pipe/commits?author=lorefnon" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
