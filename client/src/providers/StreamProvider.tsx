import { useState, createContext } from "react";

export default function StreamProvider({ children }: any) {
  const [stream, setStream] = useState<MediaStream>(null);

  return (
    <>
      <StreamContext.Provider value={{ stream, setStream }}>
        {children}
      </StreamContext.Provider>
    </>
  );
}

export const StreamContext = createContext<StreamContextType>(null);

export type StreamContextType = {
  stream: MediaStream;
  setStream: React.Dispatch<React.SetStateAction<MediaStream>>;
};
