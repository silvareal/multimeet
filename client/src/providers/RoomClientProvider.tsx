import { useState, createContext } from "react";
import { RoomClient } from "../configs/room-client.config";

export default function RoomClientProvider({ children }: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const [roomClient, setRoomClient] = useState<RoomClient>(null);

  return (
    <>
      <RoomClientContext.Provider value={{ roomClient, setRoomClient }}>
        {children}
      </RoomClientContext.Provider>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const RoomClientContext = createContext<RoomClientContextType>(null);

export type RoomClientContextType = {
  roomClient: RoomClient | null;
  setRoomClient: React.Dispatch<React.SetStateAction<RoomClient>>;
};
