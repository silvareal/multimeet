/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { createContext, useReducer, Dispatch } from "react";
import {
  MediaType,
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

      if (peerIndex !== -1) {
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

      return { ...state, peers: [...newPeers] };

    case RoomStateType.REMOVE_PRODUCER:
      const newProducers = [
        ...state.producers.filter(
          (producer) => producer.id !== action.payload.producerId
        ),
      ];
      return { ...state, producers: newProducers };

    case RoomStateType.PAUSE_PRODUCER:
      const newPauseState = { ...state };
      const pauseProducer = state.producers.find(
        (producer) => producer.id === action.payload.producerId
      );

      if (!newPauseState.authPeer || !pauseProducer) return newPauseState;

      if (pauseProducer?.appData.mediaType === MediaType.VIDEO) {
        newPauseState.authPeer.peerVideo = false;
      }
      if (pauseProducer?.appData.mediaType === MediaType.AUDIO) {
        newPauseState.authPeer.peerAudio = false;
      }
      return newPauseState;

    case RoomStateType.RESUME_PRODUCER:
      const newResumeState = { ...state };
      const resumeProducer = state.producers.find(
        (producer) => producer.id === action.payload.producerId
      );

      if (!newResumeState.authPeer || !resumeProducer) return newResumeState;

      if (resumeProducer?.appData.mediaType === MediaType.VIDEO) {
        newResumeState.authPeer.peerVideo = true;
      }
      if (resumeProducer?.appData.mediaType === MediaType.AUDIO) {
        newResumeState.authPeer.peerAudio = true;
      }
      return newResumeState;

    case RoomStateType.ADD_CONSUMER:
      return { ...state, consumers: [...state.consumers, action.payload] };

    case RoomStateType.REMOVE_CONSUMER:
      const consumer = state.consumers.find(
        (consumer) => consumer.id === action.payload.consumerId
      );
      consumer?.close();

      const newConsumers = [
        ...state.consumers.filter(
          (consumer) => consumer.id !== action.payload.consumerId
        ),
      ];

      const peers = [
        ...state.peers.filter((peer) => peer.id !== consumer?.appData.peerId),
      ];

      return { ...state, peers: [...peers], consumers: newConsumers };

    case RoomStateType.ADD_PEER:
      if (state.peers.find((peer) => peer.id === action.payload.id)) {
        return state;
      }
      return { ...state, peers: [...state.peers, action.payload] };

    case RoomStateType.REMOVE_PEER:
      const updatedPeers = [
        ...state.peers.filter((peer) => peer.id !== action.payload.peerId),
      ];
      return { ...state, peers: [...updatedPeers] };

    case RoomStateType.LEAVE_ROOM:
      return { ...initialState };

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
