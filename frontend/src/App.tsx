import DuelsPage from "./pages/DuelsPage.tsx";
import LogDuelPage from "./pages/LogDuelPage/LogDuelPage.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import ViewLogsPage from "./pages/ViewLogsPage/ViewLogsPage.tsx";


function App() {
    // @ts-ignore
    console.log(window.WebApp);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <DuelsPage /> }/>
                <Route path="/logDuel/:duelID" element={ <LogDuelPage /> } />
                <Route path="/duelLogs/:duelID" element={ <ViewLogsPage /> } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;