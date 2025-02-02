import { FC } from 'react'
import './AppBar.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const AppBar: FC = () => {
    return (
        <div className="app-bar">
            <img src="img.png" alt="solana logo"/>
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
                />
            </div>
        </div>
    )
}