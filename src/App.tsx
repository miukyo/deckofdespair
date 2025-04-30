import GameBoard from "./components/game-board";
import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import LobbyScreen from "./components/lobby-screen";
import WelcomeScreen from "./components/welcome-screen";

function App() {
  const [_, navigate] = useLocation();

  useEffect(() => {
    navigate("/");
  }, []);

  return (
    <main className="p-5 w-full flex min-h-screen">
      <Route path="/">
        <WelcomeScreen />
      </Route>
      <Route path="/lobby">
        <LobbyScreen
        />
      </Route>
      <Route path="/game">
        <GameBoard />
      </Route>
    </main>
  );
}

export default App;
