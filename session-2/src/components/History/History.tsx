import { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {ConfirmedSignatureInfo, Connection, PublicKey} from '@solana/web3.js';
import { SOLANA_TESTNET_URL, SOLANA_DEVNET_URL }  from "../../const";
import * as timeago from 'timeago.js';
import './History.css';

const connection = new Connection(SOLANA_TESTNET_URL, "confirmed");

const shortenSignature = (signature: string) => {
    return `${signature.slice(0, 7)}.........${signature.slice(-7)}`;
};

interface Transaction {
    signature: string;
    slot: number;
    blockTime: number;
    success: boolean;
}

export const History: FC = () => {
    const { publicKey, connected } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactionHistory = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const confirmedSignatures = await connection.getConfirmedSignaturesForAddress2(publicKey, { limit: 10 });
            const confirmedTransactions = await Promise.all(
                confirmedSignatures.map(async (signatureInfo: ConfirmedSignatureInfo) => {
                    const transaction = await connection.getConfirmedTransaction(signatureInfo.signature);
                    return {
                        signature: signatureInfo.signature,
                        slot: transaction!.slot,
                        blockTime: transaction!.blockTime!,
                        success: transaction!.meta!.err === null,
                    };
                })
            );
            setTransactions(confirmedTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
        setLoading(false);
    }, [publicKey]);

    useEffect(() => {
        if (connected) {
            fetchTransactionHistory();
        } else {
            setTransactions([]);
            setLoading(false);
        }
    }, [connected, fetchTransactionHistory]);

    const copyToClipboard = (signature: string) => {
        navigator.clipboard.writeText(signature)
            .then(() => {
                // alert("Signature copied to clipboard!");
            })
            .catch(err => {
                console.error('Failed to copy signature: ', err);
            });
    };

    return (
        <div className="history-card">
            <div className="title">
                <h2>Transaction History</h2>
                {connected && (
                    <button className="refresh-button" onClick={fetchTransactionHistory}>
                        <img src="refresh.png" alt="Refresh" />
                    </button>
                )}
            </div>
            <div className="table-container">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="transaction-table">
                        <thead>
                        <tr>
                            <th>Transaction Signature</th>
                            <th>Block</th>
                            <th>Timestamp</th>
                            <th>Ago</th>
                            <th>Result</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="no-history-text">No transactions found</td>
                            </tr>
                        ) : (
                            transactions.map((transaction, index) => (
                                <tr key={index}>
                                    <td onClick={() => copyToClipboard(transaction.signature)} className="pointer-cursor">
                                        <img src="copy.png" alt="" className="copy-icon" />
                                        {shortenSignature(transaction.signature)}
                                    </td>
                                    <td>{transaction.slot}</td>
                                    <td>{new Date(transaction.blockTime * 1000).toString().replace('GMT+0530 (India Standard Time)', '')}</td>
                                    <td>{timeago.format(new Date(transaction.blockTime * 1000))}</td>
                                    <td>
                                            <span className={transaction.success ? 'success' : 'error'}>
                                                {transaction.success ? 'Success' : 'Failed'}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
