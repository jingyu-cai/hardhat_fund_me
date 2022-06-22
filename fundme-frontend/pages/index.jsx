import abi from '../utils/FundMe.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x65df0e51C42BB23F6d6c857a03FA6C8Bf1bD5048";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const fundMe = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const fundMe = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("funding..")
        const fundTxn = await fundMe.fundMe(
          name ? name : "anon",
          message ? message : "Enjoy your funding!",
          {value: ethers.utils.parseEther("0.001")}
        );

        await fundTxn.wait();

        console.log("mined ", fundTxn.hash);

        console.log("funded!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundMe = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await fundMe.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    let fundMe;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      fundMe = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      fundMe.on("NewMemo", onNewMemo);
    }

    return () => {
      if (fundMe) {
        fundMe.off("NewMemo", onNewMemo);
      }
    }
  }, []);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Fund Me!</title>
        <meta name="description" content="Funding site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Fund Me!
        </h1>
        
        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>
                  Name
                </label>
                <br/>
                
                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                  />
              </div>
              <br/>
              <div>
                <label>
                  Send a message with your fund!
                </label>
                <br/>

                <textarea
                  rows={3}
                  placeholder="Enjoy your funding!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={fundMe}
                >
                  Send 0.001 Goerli ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}
      </main>

      {currentAccount && (<h1>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{border:"2px solid", "borderRadius":"5px", padding: "5px", margin: "5px"}}>
            <p style={{"fontWeight":"bold"}}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}
      
    </div>
  )
}
