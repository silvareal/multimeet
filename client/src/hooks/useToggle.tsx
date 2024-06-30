import { useState, useCallback } from "react";

const useToggle = (initialState: boolean = false) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => setState((s) => !s), []);

  return [state, toggle, setState] as const;
};

export default useToggle;
