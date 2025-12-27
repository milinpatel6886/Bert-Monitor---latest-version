import { RouterProvider } from "react-router-dom";
import { router } from "./Routes/Router";
import SocketProvider from "./SocketManager/SocketManager";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <SocketProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </SocketProvider>
    </>
  );
}

export default App; 
