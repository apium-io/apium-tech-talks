import { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { SOLANA_TESTNET_URL } from "../../const";
import './BalanceCard.css';

const connection = new Connection(SOLANA_TESTNET_URL, "confirmed");

export const BalanceCard: FC = () => {
    const { publicKey, connected } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!publicKey) {
            console.log("No public key");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const balanceInLamports = await connection.getBalance(publicKey);
            const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
            console.log("Public Key:", publicKey.toBase58());
            console.log("Balance in SOL:", balanceInSOL);
            setBalance(balanceInSOL);
        } catch (err) {
            console.error("Error fetching balance:", err);
            setError("Failed to fetch balance");
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
                    <h2>{loading ? "Loading..." : `${balance ?? 0} SOL`}</h2>
                ) : (
                    <p>Please Connect Wallet</p>
                )}
                {connected && (
                    <button className="refresh-button" onClick={fetchBalance}>
                        <img src="refresh.png" alt="refresh"/>
                    </button>
                )}
            </div>
        </div>
    );
};