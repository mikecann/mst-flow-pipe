import { flow } from "mobx-state-tree";

type StripPromise<T> = T extends Promise<infer U> ? U : T;

interface FlowContinuation<TArgs extends unknown[], TRes> {
  then<TResNext>(nextFn: (input: TRes) => TResNext): FlowContinuation<TArgs, StripPromise<TResNext>>;
  catch<TResNext>(nextFn: (input: any) => TResNext): FlowContinuation<TArgs, StripPromise<TResNext> | TRes>;
  end(): (...args: TArgs) => Promise<TRes>
}

interface UntypedStepFn {
  type: "init" | "then" | "catch",
  handle: (...inputs: unknown[]) => unknown
}

const coerceToPromise = <T>(input: T): Promise<T> =>
  isPromise(input)
    ? input
    : Promise.resolve(input);

const continueFlow = <TArgs extends unknown[], TRes>(steps: UntypedStepFn[]): FlowContinuation<TArgs, TRes> => ({
  then: (nextFn) => continueFlow([...steps, { type: "then", handle: nextFn }]),
  catch: (nextFn) => continueFlow([...steps, { type: "catch", handle: nextFn }]),
  end: () => flow(function* (...args: TArgs) {
    if (steps.length === 0) return undefined as any;
    let nextArgs: unknown[] = args;
    let isHandlingError = false;
    for (const step of steps) {
      try {
        if (isHandlingError) {
          if (step.type !== "catch") continue;
          nextArgs = [yield coerceToPromise(step.handle(...nextArgs))];
          isHandlingError = false;
        } else {
          if (step.type === "catch") continue;
          nextArgs = [yield coerceToPromise(step.handle(...nextArgs))];
        }
      } catch (e) {
        isHandlingError = true;
        nextArgs = [e];
      }
    }
    if (isHandlingError) {
      throw nextArgs[0];
    } else return nextArgs[0] as TRes;
  })
})

export const flowPipe = <TArgs extends unknown[], TRes>(initFn: (...inputs: TArgs) => TRes): FlowContinuation<TArgs, StripPromise<TRes>> =>
  continueFlow([{
    type: "init",
    handle: initFn
  }]);


const isPromise = <T extends {}>(o: T): o is T & Promise<T> => o != undefined && o.hasOwnProperty("then");
