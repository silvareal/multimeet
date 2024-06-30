import { useState, createContext } from "react";
import { RoomClient } from "../configs/room-client.config";

export default function RoomProvider({ children }: any) {
  const [roomClient, setRoomClient] = useState<RoomClient>(null);

  return (
    <>
      <RoomContext.Provider value={{ roomClient, setRoomClient }}>
        {children}
      </RoomContext.Provider>
    </>
  );
}

export const RoomContext = createContext<RoomContextType>(null);

export type RoomContextType = {
  roomClient: RoomClient | null;
  setRoomClient: React.Dispatch<React.SetStateAction<RoomClient>>;
};
