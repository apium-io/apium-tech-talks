import { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import './BalanceCard.css';

const connection = new Connection("https://api.testnet.solana.com", "confirmed");

export const BalanceCard: FC = () => {
    const { publicKey, connect, connected } = useWallet();
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBalance = useCallback(async () => {
        if (!publicKey) {
            console.log("No public key")
            return;
        }
        setLoading(true);
        try {
            const balanceInLamports = await connection.getBalance(publicKey);
            const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
            console.log("Public Key:", publicKey.toBase58());
            console.log("Balance in SOL:", balanceInSOL);
            setBalance(balanceInSOL);
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
        setLoading(false);
    }, [publicKey]);

    useEffect(() => {
        if (connected) {
            fetchBalance();
        }
    }, [connected, fetchBalance]);

    return (
        <div className="BalanceCard">
            <div className="title">
                <h2>Wallet Balance</h2>
            </div>
            <div className="balance">
                {connected ? (
                    <h2>{loading ? "Loading..." : `${balance} SOL`}</h2>
                ) : (
                    <p>Please Connect Wallet</p>

                )}
                {connected && (
                    <button className="refresh-button" onClick={fetchBalance}>
                        <img src="refresh.png" alt="refresh" />
                    </button>
                )}
            </div>
        </div>
    );
}