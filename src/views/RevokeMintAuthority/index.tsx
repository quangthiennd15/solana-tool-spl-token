import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, AuthorityType } from "@solana/spl-token";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./index.module.css";
import { SolanaLogo } from "../../components";
import Link from "next/link";
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export const RevokeMintAuthority: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [mint, setMint] = useState("");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const revokeMintAuthority = async () => {
    if (!wallet.publicKey) {
      setMessage("Please connect your wallet first!");
      return;
    }

    try {
      setIsMinting(true);
      setMessage("");

      const mintPublicKey = new PublicKey(mint);

      const transaction = new Transaction().add(
        Token.createSetAuthorityInstruction(
          TOKEN_PROGRAM_ID,
          mintPublicKey,
          null,
          "MintTokens",
          wallet.publicKey,
          []
        )

      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setSignature(`Signature: ${signature}`)
      setMessage(`Successfully minted ${amount} tokens to ${destination}`);
      setIsMinting(false);
    } catch (error) {
      console.error("Error minting tokens:", error);
      setMessage(`Error minting tokens: ${(error as Error).message}`);
      setIsMinting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
          <div className="flex-1 px-2 mx-2">
            <div className="text-sm breadcrumbs">
              <ul className="text-xs sm:text-xl">
                <li>
                  <SolanaLogo />
                  <Link href="/">
                    <a>
                      <h1 className="text-3xl font-bold mx-2">
                        SOL TOOLS
                      </h1>
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex-none">
            <WalletMultiButton className="btn btn-ghost" />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">Revoke Mint Authority</h1>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Token Mint Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter token mint address"
                    className="input input-bordered"
                    onChange={(e) => setMint(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-warning mt-4"
                  onClick={revokeMintAuthority}
                >
                  Revoke
                </button>

                {message && (
                  <div className="mt-4 text-center">{message}</div>
                )}
                {signature && (
                  <div className="mt-4 text-center">{signature}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};