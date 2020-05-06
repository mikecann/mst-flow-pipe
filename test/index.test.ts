import { flowPipe, FlowFn } from "../src/index";
import { types, onPatch, IJsonPatch } from "mobx-state-tree";

it("returns the last resolved value from the pipe", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe(() => 123),
      action2: flowPipe(() => Promise.resolve("456")),
      action3: flowPipe(
        () => Promise.resolve("456"),
        (x) => Promise.resolve(x + "789")
      ),
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
      action1: flowPipe((input: string) => "hello " + input),
      action2: flowPipe(
        (input: number) => Promise.resolve(input),
        (next) => next + 100,
        (next) => Promise.resolve(next + 100),
        (next) => Promise.resolve(next + "")
      ),
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
      action1: flowPipe(
        (input: number) => {
          self.value = input + "";
          return input + 100;
        },
        (next) => {
          self.setValue(next + "");
          return Promise.resolve(next + 100);
        }
      ),
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
      action1: flowPipe(
        (input: number) => Promise.resolve(input),
        (num) => (num > 100 ? Promise.reject("naa") : num + 100),
        (num) => Promise.resolve(num + "")
      ),
      action2: flowPipe(
        (input: number) => Promise.resolve(input),
        (num) => {
          if (num > 100) throw new Error("nope");
          return num + 100;
        },
        (num) => Promise.resolve(num + "")
      ),
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
      action1: flowPipe(
        [
          (input: number) => Promise.resolve(input),
          (num) => (num > 100 ? Promise.reject("naa") : num + 100),
        ],
        (err) => {
          return "something bad happened";
        }
      ),
    }))
    .create({});

  await expect(store.action1(99)).resolves.toBe(199);
  await expect(store.action1(101)).resolves.toBe("something bad happened");
});

it("can optionally handle errors with no input", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe(
        [
          () => Promise.resolve({ a: "anon", b: 123 }),
          (o) => {
            if (o.b < 9999) throw new Error("oops");
            return o.b;
          },
        ],
        (err) => {
          return "oopsie";
        }
      ),
    }))
    .create({});

  await expect(store.action1()).resolves.toBe("oopsie");
});

it("can nest flow functions", async () => {
  const store = types
    .model({})
    .actions((self) => ({
      action1: flowPipe((input: number) => Promise.resolve(input + 100)),
    }))
    .actions((self) => ({
      action2: flowPipe([
        (input: number) => Promise.resolve(input + 10),
        (next) => self.action1(next + 10),

        // Todo: work out why next here is typed at "unknown", if you forcefully type it to number
        // its happy and string its not happy so thats good, but it should auto-type to number
        (next) => next + "",
      ]),
    }))
    .create({});

  await expect(store.action1(1)).resolves.toBe(101);
  await expect(store.action2(1)).resolves.toBe("121");
});
