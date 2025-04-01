import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import store from "./redux/store";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
