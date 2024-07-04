import { createContext, useReducer, Dispatch } from "react";
import { RoomState, RoomStateAction, RoomStateType } from "types/room.type";

const initialState = {
  authPeer: null,
  producers: [],
  consumers: [],
  peers: [],
};

const reducer = (state: RoomState, action: RoomStateAction): RoomState => {
  switch (action.type) {
    case RoomStateType.SET_AUTH_PEER:
      return { ...state, authPeer: action.payload };
    case RoomStateType.ADD_PRODUCER:
      return { ...state, producers: [...state.producers, action.payload] };
    case RoomStateType.ADD_CONSUMER:
      return { ...state, consumers: [...state.consumers, action.payload] };
    case RoomStateType.ADD_PEER:
      return { ...state, peers: [...state.peers, action.payload] };
    default:
      return state;
  }
};

export default function RoomStateProvider({ children }: any) {
  const [roomState, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <RoomStateContext.Provider value={{ roomState, dispatch }}>
        {children}
      </RoomStateContext.Provider>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const RoomStateContext = createContext<RoomStateContextType>(null);

export type RoomStateContextType = {
  roomState: RoomState;
  dispatch: Dispatch<RoomStateAction>;
};
