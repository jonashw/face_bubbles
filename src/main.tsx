import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {RouterProvider, createBrowserRouter} from "react-router-dom";
import Sketch, {SketchLoader} from './Sketch.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div className="wall-to-wall"><h1>Not found</h1></div>
  },
  {
    path:"/sketch/:sketchId",
    element: <Sketch/>,
    loader: SketchLoader
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
