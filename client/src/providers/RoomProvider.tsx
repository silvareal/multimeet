/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { createContext, useReducer, Dispatch } from "react";
import {
  PeerActionTypeEnum,
  RoomState,
  RoomStateAction,
  RoomStateType,
} from "types/room.type";

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
    case RoomStateType.UPDATE_PEER:
      const newPeers = [...state.peers];
      const peerIndex = newPeers.findIndex(
        (peer) => peer.id === action.payload.peerId
      );

      if (peerIndex >= 1) {
        switch (action.payload.type) {
          case PeerActionTypeEnum.video:
            newPeers[peerIndex].peerVideo = action.payload.action;
            break;
          case PeerActionTypeEnum.audio:
            newPeers[peerIndex].peerAudio = action.payload.action;
            break;
          case PeerActionTypeEnum.screenShare:
            newPeers[peerIndex].peerScreenShare = action.payload.action;
            break;
          case PeerActionTypeEnum.raiseHand:
            newPeers[peerIndex].peerRaisedHand = action.payload.action;
            break;
          case PeerActionTypeEnum.rec:
            newPeers[peerIndex].peerScreenRecord = action.payload.action;
            break;
        }
      }

      console.log({ newPeers });

      return { ...state, peers: [...newPeers] };

    case RoomStateType.REMOVE_PRODUCER:
      const newProducers = [
        ...state.producers.filter(
          (producer) => producer.id !== action.payload.producerId
        ),
      ];
      return { ...state, producers: newProducers };
    case RoomStateType.PAUSE_PRODUCER:
      const newState = {
        ...state,
        ...(state.authPeer
          ? { authPeer: { ...state.authPeer, peerVideo: false } }
          : {}),
      };

      console.log({ newState });
      return newState;
    case RoomStateType.RESUME_PRODUCER:
      return {
        ...state,
        ...(state.authPeer
          ? { authPeer: { ...state.authPeer, peerVideo: true } }
          : {}),
      };

    case RoomStateType.ADD_CONSUMER:
      return { ...state, consumers: [...state.consumers, action.payload] };

    case RoomStateType.ADD_PEER:
      if (state.peers.find((peer) => peer.id === action.payload.id)) {
        return state;
      }
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
