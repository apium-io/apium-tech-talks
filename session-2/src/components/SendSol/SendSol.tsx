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
    const [errors, setErrors] = useState<{ address?: string; amount?: string }>({});

    const validateAddress = (address: string): boolean => {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    };

    const handleSendTransaction = useCallback(async () => {
        const newErrors: { address?: string; amount?: string } = {};

        if (!recipientAddress || !validateAddress(recipientAddress)) {
            newErrors.address = 'Invalid wallet address';
        }

        const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);

        if (!amount || isNaN(lamports) || lamports <= 0) {
            newErrors.amount = 'Invalid amount';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        if (!publicKey) return;

        const recipientPublicKey = new PublicKey(recipientAddress);

        setLoading(true);

        try {
            const balance = await connection.getBalance(publicKey);
            if (balance < lamports) {
                setErrors({ amount: 'Insufficient balance' });
                return;
            }

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: lamports,
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            alert(`Transaction successful! Signature: ${signature}`);
            setRecipientAddress('');
            setAmount('');
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
                    className={`wallet-input ${errors.address ? 'error' : ''}`}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
                <label htmlFor="amount" className="label">Amount</label>
                <input
                    id="amount"
                    type="number"
                    placeholder="Amount"
                    className={`amt-input ${errors.amount ? 'error' : ''}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
                <button className="send-button" onClick={handleSendTransaction} disabled={loading || !connected}>
                    {loading ? 'Transferring...' : 'Transfer'}
                </button>
            </div>
        </div>
    );
};
