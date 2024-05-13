import { useReducer } from "react";

import { UnionToIntersection } from "./../types/util";

export type Machine<State> = {
  [k: string]: {
    [k: string]: State;
  };
};
export type MachineState<M> = keyof M;
export type MachineAction<M> = keyof UnionToIntersection<M[keyof M]>;

export const useStateMachine = <M>(
  stateMachine: M & Machine<MachineState<M>>,
  initialState: MachineState<M>
) =>
  useReducer(
    (state: MachineState<M>, action: MachineAction<M>): MachineState<M> => {
      const nextState =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stateMachine[state] as any)[action];

      return nextState ?? state;
    },
    initialState
  );
