import './App.css';
import WalletContextProvider from './components/WalletContextProvider.jsx';
import { AppBar } from "./components/appbar/AppBar.jsx";
import { BalanceCard } from "./components/BalanceCard/BalanceCard";
import { SendSol } from "./components/SendSol/SendSol";
import { History } from "./components/History/history";

function App() {
    return (
        <div className="App">
            <WalletContextProvider>
                <AppBar />
                <div className="main-container">
                    <div className="left-panel">
                        <History />
                    </div>
                    <div className="right-panel">
                        <BalanceCard />
                        <SendSol />
                    </div>
                </div>
            </WalletContextProvider>
        </div>
    );
}

export default App;
