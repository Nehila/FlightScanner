import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createGlobalState } from "react-hooks-global-state";
import Home from "./views/Home";
import Loading from "./components/Loading";

const root = ReactDOM.createRoot(document.getElementById('root'));

const { setGlobalState, useGlobalState } = createGlobalState({
  loading: false  
});

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Loading />
        <Routes>
          <Route element={<Home />} exact path="/" />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

root.render(<App />);

export { setGlobalState, useGlobalState };
