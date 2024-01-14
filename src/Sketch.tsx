import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import React from 'react'
import { LoaderFunction, useLoaderData } from "react-router-dom";
import bubbles from "./sketches/bubbles";

function useState<T>(initial: T){
  const [value,set] = React.useState(initial);
  return {value,set};
}

export const SketchLoader: LoaderFunction = ({params}): Sketch => {
  return bubbles(`/cfg/${params.sketchId}.json`);
}

export default function SketchRoute() {
  const sketch = useLoaderData() as Sketch;
  const userHasProvidedInput = useState(false);
  const userProvidedInput = () => {
    new Audio("1-second-of-silence.mp3").play();
    userHasProvidedInput.set(true);
  };
  return (
    <div>
      {userHasProvidedInput.value
        ? <ReactP5Wrapper sketch={sketch}/>
        : <div className="wall-to-wall">
            <button onClick={() => userProvidedInput()}>
                Play
            </button>
          </div>}
    </div>
  );
}