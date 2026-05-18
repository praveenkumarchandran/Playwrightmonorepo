import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./Login";

function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Home Page</h1>
      <Link to="/login">Go to Login</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
