import { Link } from "react-router-dom";

const configIds: string[] = 
  [
    "original",
    "2024"
  ];

function App() {
  return (
    <div className="wall-to-wall">
      {configIds.map(id => 
        <Link
          to={`/sketch/${id}`}
          key={id}
        >Play '{id}'</Link>
      )}
    </div>
  );
}

export default App