import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './main.scss'
import {RouterProvider, createBrowserRouter} from "react-router-dom";
import Sketch, {SketchLoader} from './Sketch.tsx';
import { AppContextProvider} from './AppContext';


const router = createBrowserRouter([
  {
    path: "/",
    element: 
      <AppContextProvider>
        <App />
      </AppContextProvider>,
    errorElement: <div className="wall-to-wall"><h1>Not found</h1></div>
  },
  {
    path:"/sketch/:sketchId",
    element: 
      <AppContextProvider>
        <Sketch/>
      </AppContextProvider>,
    loader: SketchLoader
  }
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
