import React from "react";
import { useEffect, useState } from "react";
import {useRef} from 'react';
import { ethers } from "ethers";
import './App.css';
import abi from '../src/utils/WebPortal.json';
import LoadingSpinner from "./components/Loader";
import Footer from "./components/Footer";


export default function App() {
  const msgRef = useRef(null);
  const nameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [ currentAccount, setCurrentAccount ] = useState("");
  const contractAddress = "0xe44659b455C7096b927cfBddba6b831A4279bB9D";
  const contractABI = abi.abi;


  const getAllWaves = async () => {
    const { ethereum } = window;
  
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
  
        const wavesCleaned = waves.map(wave => {
          return {
            waveName: wave.name,
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
  
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (waveName, from, timestamp, message) => {
      console.log("NewWave", waveName, from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          name: waveName,
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);



  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum) {
        alert("Install MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  }
  

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const wave = async (props) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        const waveTxn = await wavePortalContract.wave(nameRef.current.value, msgRef.current.value, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);
        setIsLoading(true);
        await waveTxn.wait();
        setIsLoading(false);
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        nameRef.current.value = "";
        msgRef.current.value = "";
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }


  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header Heading">
        👋 Hey there!
        </div>

        <div className="bio Text">
        I'm styx and I worked on this blockchain based project, here you can post the name of your favourite anime. Actually i wanted to watch an anime but not able to find any, so i thought why don't i ask you guys! hehehe... Please Connect your Ethereum wallet and just post the name, Thanks!! <br /> Also, the person posting best anime will recieve some free etherrrrrrrr!!!!!!!!!! Hurry Up!!
        </div>
          <input 
            placeholder="Enter Your Name!" 
            ref={nameRef}
            type="text"
            className="Text"
            style={{padding: "1rem", borderRadius: 5, border: "solid", marginBottom: "0.9rem", marginTop: "0.9rem"}} 
          />
          <input 
            placeholder="Enter Anime Name..." 
            type="text"
            ref={msgRef}
            name="message"
            className="Text"
            style={{padding: "1rem", borderRadius: 5, border: "solid"}} 
          />

          <button className="waveButton Text" onClick={wave} style={{alignSelf: "center"}} >
            {isLoading ? <LoadingSpinner /> : "Post!"}
          </button>

          {!currentAccount && (
            <button className="waveButton Text" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          <div style={{marginBottom: "3rem"}}>
          {
            allWaves.map((wave, index) => {
            return (
              <div key={index} className="block Text">
                <div>Name: {wave.name}</div>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Anime: {wave.message}</div>
              </div>)
        })}
          </div>
          <Footer />
      </div>
    </div>
  );
}
