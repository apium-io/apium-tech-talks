import { FC, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_TESTNET_URL } from "../../const";
import './SendSol.css';

const connection = new Connection(SOLANA_TESTNET_URL, "confirmed");

export const SendSol: FC = () => {
    const { publicKey, sendTransaction, connected } = useWallet();
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSendTransaction = useCallback(async () => {
        if (!publicKey || !recipientAddress || !amount) return;

        const recipientPublicKey = new PublicKey(recipientAddress);
        const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);

        if (isNaN(lamports) || lamports <= 0) {
            alert('Invalid amount');
            return;
        }

        setLoading(true);

        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: Math.round(parseFloat(amount) * LAMPORTS_PER_SOL),
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            alert(`Transaction successful! Signature: ${signature}`);
        } catch (error) {
            console.error('Error sending transaction:', error);
            alert('Transaction failed!');
        } finally {
            setLoading(false);
        }
    }, [publicKey, recipientAddress, amount, sendTransaction]);

    return (
        <div className="send-sol">
            <div className="title">
                <h2>Quick Transfer</h2>
            </div>
            <div className="send-form">
                <label htmlFor="recipient" className="label">Wallet Address</label>
                <input
                    id="recipient"
                    type="text"
                    placeholder="Recipient Address"
                    className="wallet-input"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <label htmlFor="amount" className="label">Amount</label>
                <input
                    id="amount"
                    type="number"
                    placeholder="Amount"
                    className="amt-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button className="send-button" onClick={handleSendTransaction} disabled={loading || !connected}>
                    {loading ? 'Transferring...' : 'Transfer'}
                </button>
            </div>
        </div>
    );
};