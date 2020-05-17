import { flowPipe } from "../src/index";
import { types, onPatch, IJsonPatch } from "mobx-state-tree";

it("returns the last resolved value from the pipe", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe(() => 123).end(),
      action2: flowPipe(() => Promise.resolve("456")).end(),
      action3: flowPipe(() => Promise.resolve("456"))
        .then((x) => Promise.resolve(x + "789"))
        .end(),
    }))
    .create({});

  await expect(store.action1()).resolves.toBe(123);
  await expect(store.action2()).resolves.toBe("456");
  await expect(store.action3()).resolves.toBe("456789");
});

it("can take an initial typed input", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe((input: string) => "hello " + input).end(),
      action2: flowPipe((input: number) => Promise.resolve(input))
        .then((next) => next + 100)
        .then((next) => Promise.resolve(next + 100))
        .then((next) => Promise.resolve(next + ""))
        .end(),
    }))
    .create({});

  await expect(store.action1("foo")).resolves.toBe("hello foo");
  await expect(store.action2(1)).resolves.toBe("201");
});

it("allows modification the model mid-flow", async () => {
  const store = types
    .model({
      value: types.optional(types.string, ""),
    })
    .actions((self) => ({
      setValue(val: string) {
        self.value = val;
      },
    }))
    .actions((self) => ({
      action1: flowPipe((input: number) => {
        self.value = input + "";
        return input + 100;
      })
        .then((next) => {
          self.setValue(next + "");
          return Promise.resolve(next + 100);
        })
        .end()
    }))
    .create({});

  let patches: IJsonPatch[] = [];
  onPatch(store, (p) => patches.push(p));

  await expect(store.action1(1)).resolves.toBe(201);

  expect(store.value).toBe("101");

  expect(patches).toEqual([
    {
      op: "replace",
      path: "/value",
      value: "1",
    },
    {
      op: "replace",
      path: "/value",
      value: "101",
    },
  ]);
});

it("returns errors as promise rejections", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe((input: number) => Promise.resolve(input))
        .then((num) => (num > 100 ? Promise.reject("naa") : num + 100))
        .then((num) => Promise.resolve(num + ""))
        .end(),
      action2: flowPipe((input: number) => Promise.resolve(input))
        .then((num) => {
          if (num > 100) throw new Error("nope");
          return num + 100;
        })
        .then((num) => Promise.resolve(num + ""))
        .end()
    }))
    .create({});

  await expect(store.action1(99)).resolves.toBe("199");
  await expect(store.action1(101)).rejects.toEqual("naa");

  await expect(store.action2(99)).resolves.toBe("199");
  await expect(store.action2(101)).rejects.toThrow("nope");
});

it("can optionally handle errors", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe((input: number) => Promise.resolve(input))
        .then((num) => (num > 100 ? Promise.reject("naa") : num + 100))
        .catch((err) => {
          return "something bad happened";
        })
        .end()
    }))
    .create({});

  await expect(store.action1(99)).resolves.toBe(199);
  await expect(store.action1(101)).resolves.toBe("something bad happened");
});

it("can optionally handle errors with no input", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe(() => Promise.resolve({ a: "anon", b: 123 }))
        .then((o) => {
          if (o.b < 9999) throw new Error("oops");
          return o.b;
        })
        .catch((err) => {
          return "oopsie";
        })
        .end()
    }))
    .create({});

  await expect(store.action1()).resolves.toBe("oopsie");
});

it("can nest flow functions", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe((input: number) => Promise.resolve(input + 100)).end(),
    }))
    .actions((self) => ({
      action2: flowPipe((input: number) => Promise.resolve(input + 10))
        .then((next) => self.action1(next + 10))
        .then((next) => next + "")
        .end()
    }))
    .create({});

  await expect(store.action1(1)).resolves.toBe(101);
  await expect(store.action2(1)).resolves.toBe("121");
});
