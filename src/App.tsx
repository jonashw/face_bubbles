import { useContext } from "react";
import { Link } from "react-router-dom";
import AppContext from "./AppContext";

const configIds: string[] = 
  [
    "original",
    "2024"
  ];

function App() {
  const appContext = useContext(AppContext);
  return (
    <div className="wall-to-wall">
      {configIds.map(id => 
        <Link
          to={`/sketch/${id}`}
          key={id}
          onClick={() => appContext.userHasProvidedInput()}
        >Play '{id}'</Link>
      )}
    </div>
  );
}

export default App