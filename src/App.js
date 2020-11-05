import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { v4 as uuid } from "uuid";
import styled from "styled-components";

const DisplayToast = styled.div`
  opacity: 0;
  max-height: 0rem;
  @keyframes fadeaway {
    0%,
    80% {
      opacity: 1;
      max-height: 10rem;
    }
    100% {
      opacity: 0;
      max-height: 0rem;
    }
  }

  animation-name: fadeaway;
  animation-duration: ${(props) => props.duration ?? "5s"};
  animation-timing-function: ease-out;
  animation-delay: 0s;
  animation-direction: normal;
  animation-iteration-count: 1;
  animation-fill-mode: none;
`;

const ToasterContext = createContext();

function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  return (
    <ToasterContext.Provider value={[toasts, setToasts]}>
      {children}
    </ToasterContext.Provider>
  );
}

function useCreateToast() {
  const toastContext = useContext(ToasterContext);

  console.log(toastContext);
  const setToasts = toastContext[1];
  const id = uuid();
  return function (msg) {
    setToasts((t) => [...t, { msg, id }]);
  };
}

function useClearToast() {
  const toastContext = useContext(ToasterContext);
  const setToasts = toastContext[1];

  return function (removeId) {
    setToasts((t) => t.filter(({ id }) => id !== removeId));
  };
}

const ToastContext = React.createContext(null);

function useToastMessage() {
  const cxt = React.useContext(ToastContext);
  return cxt?.msg ?? "";
}

function useToastClose() {
  const cxt = React.useContext(ToastContext);
  return cxt?.clear ?? Function.prototype;
}

function Toast({ toastId, msg, children, duration }) {
  const clearToast = useClearToast();
  const displayRef = useRef(null);

  const doClearToast = useCallback(() => {
    clearToast(toastId);
  }, [clearToast, toastId]);

  useLayoutEffect(() => {
    const e = displayRef.current;
    e.addEventListener("animationend", doClearToast);
    return () => e.removeEventListener("animationend", doClearToast);
  }, [doClearToast]);
  return (
    <DisplayToast ref={displayRef} duration={duration}>
      <ToastContext.Provider value={{ clear: doClearToast, msg }}>
        {children}
      </ToastContext.Provider>
    </DisplayToast>
  );
}

function Toaster({ children, duration }) {
  const toastContext = useContext(ToasterContext);
  const toasts = toastContext[0];

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <>
      {[...toasts].reverse().map(({ id, msg }) => {
        return (
          <Toast duration={duration} key={id} toastId={id} msg={msg}>
            {children}
          </Toast>
        );
      })}
    </>
  );
}

function AddToastButton() {
  const addToast = useCreateToast();

  return (
    <button
      onClick={() => addToast(`toast ${Date.now()}`)}
      style={{ fontSize: "5rem" }}
    >
      add toast
    </button>
  );
}

function Rye() {
  const msg = useToastMessage();
  const close = useToastClose();
  return <h1 onClick={close}>{msg}</h1>;
}

function App() {
  return (
    <ToasterProvider>
      <AddToastButton />
      <Toaster duration={"6s"}>
        <Rye />
      </Toaster>
    </ToasterProvider>
  );
}

export default App;
