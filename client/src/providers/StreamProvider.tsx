import { useState, createContext } from "react";

export default function StreamProvider({ children }: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const [stream, setStream] = useState<MediaStream>(null);

  return (
    <>
      <StreamContext.Provider value={{ stream, setStream }}>
        {children}
      </StreamContext.Provider>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const StreamContext = createContext<StreamContextType>(null);

export type StreamContextType = {
  stream: MediaStream;
  setStream: React.Dispatch<React.SetStateAction<MediaStream>>;
};
