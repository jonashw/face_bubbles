import { ReactP5Wrapper } from "@p5-wrapper/react";
//import React from 'react'
import sketch from './sketches/bubbles';

function App() {
  return <ReactP5Wrapper sketch={sketch} />;
}

export default App