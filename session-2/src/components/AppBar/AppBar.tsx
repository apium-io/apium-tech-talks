import { FC } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import './AppBar.css'
import React from 'react';

export const AppBar: FC = () => {
    return (
        <div className="app-bar">
            <img src="solana.png" alt="solana logo" />
            <div className="wallet-button">
                <WalletMultiButton
                    style={{
                        backgroundColor: '#2a51df',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        width: '178px',
                        height: '58px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'background-color 0.3s ease',
                    }}
                    // hoverStyle={{
                    //     backgroundColor: '#3f44c2',
                    // }}
                />
            </div>
        </div>
    );
};