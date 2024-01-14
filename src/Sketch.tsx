import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import { useContext } from 'react'
import { LoaderFunction, useLoaderData } from "react-router-dom";
import bubbles from "./sketches/bubbles";
import AppContext from "./AppContext";

export const SketchLoader: LoaderFunction = ({params}): Sketch => {
  return bubbles(`/cfg/${params.sketchId}.json`);
}

export default function SketchRoute() {
  const appContext = useContext(AppContext);
  const sketch = useLoaderData() as Sketch;
  return (
    <div>
      {appContext.hasUserProvidedInput
        ? <ReactP5Wrapper sketch={sketch}/>
        : <div className="wall-to-wall">
            <button
              onClick={() => appContext.userHasProvidedInput()}
              autoFocus={true}
            >
                Play
            </button>
          </div>}
    </div>
  );
}