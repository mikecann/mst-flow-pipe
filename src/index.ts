import { flow } from "mobx-state-tree";
import { FlowReturn } from "mobx-state-tree/dist/core/flow";

export type NoInputStepFn<TOutput> = () => Promise<TOutput> | TOutput;

export type StepFn<TInput, TOutput> = (
  input: TInput
) => Promise<TOutput> | TOutput;

export type FlowFn<TInput, TOutput> = (
  input: TInput
) => Promise<FlowReturn<TOutput>>;

export type NoInputFlowFn<TOutput> = () => Promise<FlowReturn<TOutput>>;

export type ErrorHandlerFn<E> = (error: any) => E;

export function flowPipe<T0>(step0: NoInputStepFn<T0>): NoInputFlowFn<T0>;
export function flowPipe<I, T0>(step0: StepFn<I, T0>): FlowFn<I, T0>;

export function flowPipe<T0, T1>(
  step0: NoInputStepFn<T0>,
  step1: StepFn<T0, T1>
): NoInputFlowFn<T1>;
export function flowPipe<I, T0, T1>(
  step0: StepFn<I, T0>,
  step1: StepFn<T0, T1>
): FlowFn<I, T1>;

export function flowPipe<T0, T1, T2>(
  step0: NoInputStepFn<T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>
): NoInputFlowFn<T2>;
export function flowPipe<I, T0, T1, T2>(
  step0: StepFn<I, T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>
): FlowFn<I, T2>;

export function flowPipe<T0, T1, T2, T3>(
  step0: NoInputStepFn<T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>,
  step3: StepFn<T2, T3>
): NoInputFlowFn<T3>;
export function flowPipe<I, T0, T1, T2, T3>(
  step0: StepFn<I, T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>,
  step3: StepFn<T2, T3>
): FlowFn<I, T3>;

export function flowPipe<T0, T1, T2, T3, T4>(
  step0: NoInputStepFn<T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>,
  step3: StepFn<T2, T3>,
  step4: StepFn<T3, T4>
): NoInputFlowFn<T3>;
export function flowPipe<I, T0, T1, T2, T3, T4>(
  step0: StepFn<I, T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>,
  step3: StepFn<T2, T3>,
  step4: StepFn<T3, T4>
): FlowFn<I, T3>;

export function flowPipe<T0, T1, T2, T3, T4, T5>(
  step0: NoInputStepFn<T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>,
  step3: StepFn<T2, T3>,
  step4: StepFn<T3, T4>,
  step5: StepFn<T4, T5>
): NoInputFlowFn<T3>;
export function flowPipe<I, T0, T1, T2, T3, T4, T5>(
  step0: StepFn<I, T0>,
  step1: StepFn<T0, T1>,
  step2: StepFn<T1, T2>,
  step3: StepFn<T2, T3>,
  step4: StepFn<T3, T4>,
  step5: StepFn<T4, T5>
): FlowFn<I, T3>;

export function flowPipe<T0, E>(
  steps: [NoInputStepFn<T0>],
  errorHandler?: ErrorHandlerFn<E>
): NoInputFlowFn<T0 | E>;
export function flowPipe<I, T0, E>(
  steps: [StepFn<I, T0>],
  errorHandler?: ErrorHandlerFn<E>
): FlowFn<I, T0 | E>;

export function flowPipe<T0, T1, E>(
  steps: [NoInputStepFn<T0>, StepFn<T0, T1>],
  errorHandler?: ErrorHandlerFn<E>
): NoInputFlowFn<T1 | E>;
export function flowPipe<I, T0, T1, E>(
  steps: [StepFn<I, T0>, StepFn<T0, T1>],
  errorHandler?: ErrorHandlerFn<E>
): FlowFn<I, T1 | E>;

export function flowPipe<T0, T1, T2, E>(
  steps: [NoInputStepFn<T0>, StepFn<T0, T1>, StepFn<T1, T2>],
  errorHandler?: ErrorHandlerFn<E>
): NoInputFlowFn<T2 | E>;
export function flowPipe<I, T0, T1, T2, E>(
  steps: [StepFn<I, T0>, StepFn<T0, T1>, StepFn<T1, T2>],
  errorHandler?: ErrorHandlerFn<E>
): FlowFn<I, T2 | E>;

export function flowPipe<T0, T1, T2, T3, E>(
  steps: [NoInputStepFn<T0>, StepFn<T0, T1>, StepFn<T1, T2>, StepFn<T2, T3>],
  errorHandler?: ErrorHandlerFn<E>
): NoInputFlowFn<T3 | E>;
export function flowPipe<I, T0, T1, T2, T3, E>(
  steps: [StepFn<I, T0>, StepFn<T0, T1>, StepFn<T1, T2>, StepFn<T2, T3>],
  errorHandler?: ErrorHandlerFn<E>
): FlowFn<I, T3 | E>;

export function flowPipe<T0, T1, T2, T3, T4, E>(
  steps: [
    NoInputStepFn<T0>,
    StepFn<T0, T1>,
    StepFn<T1, T2>,
    StepFn<T2, T3>,
    StepFn<T3, T4>
  ],
  errorHandler?: ErrorHandlerFn<E>
): NoInputFlowFn<T4 | E>;
export function flowPipe<I, T0, T1, T2, T3, T4, E>(
  steps: [
    StepFn<I, T0>,
    StepFn<T0, T1>,
    StepFn<T1, T2>,
    StepFn<T2, T3>,
    StepFn<T3, T4>
  ],
  errorHandler?: ErrorHandlerFn<E>
): FlowFn<I, T4 | E>;

export function flowPipe<T0, T1, T2, T3, T4, T5, E>(
  steps: [
    NoInputStepFn<T0>,
    StepFn<T0, T1>,
    StepFn<T1, T2>,
    StepFn<T2, T3>,
    StepFn<T3, T4>,
    StepFn<T3, T5>
  ],
  errorHandler?: ErrorHandlerFn<E>
): NoInputFlowFn<T5 | E>;
export function flowPipe<I, T0, T1, T2, T3, T4, T5, E>(
  steps: [
    StepFn<I, T0>,
    StepFn<T0, T1>,
    StepFn<T1, T2>,
    StepFn<T2, T3>,
    StepFn<T3, T4>,
    StepFn<T4, T5>
  ],
  errorHandler?: ErrorHandlerFn<E>
): FlowFn<I, T5 | E>;

export function flowPipe(...args: any[]) {
  if (args.length == 0) throw new Error(`must be one or more args`);

  if (typeof args[0] == "function") {
    return flowWithNoErrors(args);
  } else if (Array.isArray(args[0]) && !args[1]) {
    return flowWithNoErrors(args[0]);
  } else if (Array.isArray(args[0]) && typeof args[1] == "function") {
    return flowAndCatchErrors(args[0], args[1]);
  } else {
    throw new Error(`invalid argument at 0`);
  }
}

const flowWithNoErrors = (steps: StepFn<any, any>[]) => {
  return flow(function* (input: any) {
    for (let step of steps) {
      const result = step(input);
      input = yield isPromise(result) ? result : Promise.resolve(result);
    }
    return input;
  });
};

const flowAndCatchErrors = (
  steps: StepFn<any, any>[],
  errorHandler: ErrorHandlerFn<any>
) => {
  return flow(function* (input: any) {
    try {
      for (let step of steps) {
        const result = step(input);
        input = yield isPromise(result) ? result : Promise.resolve(result);
      }
    } catch (err) {
      return errorHandler(err);
    }
    return input;
  });
};

const isPromise = (o: any) => o != undefined && o.hasOwnProperty("then");
