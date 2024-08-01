import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./index.module.css";
import { SolanaLogo } from "../../components";
import Link from "next/link";
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export const MintTokenView: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [mint, setMint] = useState("");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const mintTokens = async () => {
    if (!wallet.publicKey) {
      setMessage("Please connect your wallet first!");
      return;
    }

    try {
      setIsMinting(true);
      setMessage("");
      setSignature("");

      const mintPublicKey = new PublicKey(mint);
      const destinationPublicKey = new PublicKey(destination);
      const mintAmount = Number(amount);

      const associatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPublicKey,
        destinationPublicKey
      );

      const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
      let createATAInstruction;
      if (!accountInfo) {
        createATAInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mintPublicKey,
          associatedTokenAccount,
          destinationPublicKey,
          wallet.publicKey
        );
      }
      const mintInstruction = await Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintPublicKey,
        associatedTokenAccount,
        wallet.publicKey,
        [],
        mintAmount * 10 ** 9
      );

      const transaction = new Transaction().add(
        ...(createATAInstruction ? [createATAInstruction] : []),
        mintInstruction

      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setSignature(signature)
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
                <h1 className="mb-5 text-5xl">Mint SPL Tokens</h1>

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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Destination Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter destination address"
                    className="input input-bordered"
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Amount</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount to mint"
                    className="input input-bordered"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary mt-4"
                  onClick={mintTokens}
                  disabled={isMinting}
                >
                  {isMinting ? "Minting..." : "Mint Tokens"}
                </button>

                {message && (
                  <div className="mt-4 text-center">{message}</div>
                )}
                {signature && (
                  <div className="mt-5">✅ Successfuly! Check it <a target="_blank"
                                                                           href={'https://explorer.solana.com/tx/' + signature + '?cluster=devnet'}><strong
                    className="underline">here</strong></a></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};