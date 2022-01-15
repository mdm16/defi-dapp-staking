import React, { Component } from 'react'
import Navbar from './Navbar'
import Main from './Main'
import Dialog from 'react-bootstrap-dialog'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import './App.css'

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  // Start loadBlockchainData
  async loadBlockchainData() {

    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();

    //console.log(accounts);
    this.setState({account: accounts[0]})

    const networkId = await web3.eth.net.getId();
    //console.log(networkId);   

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId];
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address);
      this.setState({daiToken});
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call();
      this.setState({daiTokenBalance: daiTokenBalance.toString()});      
      //console.log({balance: daiTokenBalance});
    } else {
      this.dialog.showAlert('DaiToken contract not deployed to detected network.'); //window.alert('DaiToken contract not deployed to detected network.');
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId];
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address);
      this.setState({dappToken});
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call();
      this.setState({dappTokenBalance: dappTokenBalance.toString()});      
      //console.log({balance: dappTokenBalance});
    } else {
      this.dialog.showAlert('DappToken contract not deployed to detected network.'); //window.alert('DappToken contract not deployed to detected network.');      
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId];
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address);
      this.setState({tokenFarm});
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call();
      this.setState({stakingBalance: stakingBalance.toString()});            
      //console.log({stakingbalance: stakingBalance});
    } else {      
      this.dialog.showAlert('TokenFarm contract not deployed to detected network.'); //window.alert('TokenFarm contract not deployed to detected network.');
    }

    // Loading...
    this.setState({loading:false});
  } 
  // end loadBlockchainData

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {   
      this.dialog.showAlert('Non-etereum browser detected. You should consider trying MetaMask!'); //window.alert('Non-etereum browser detected. You should consider trying MetaMask!');      
      return false;
    }
  }

  stakeTokens = (amount) => {
    this.setState({loading:true});
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading:false});
        });
      });
  }
  
  unstakeTokens = (amount) => {
    this.setState({loading:true});    
      this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading:false});
      });     
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0...',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true,
    } 
  }

  render() {
    let content;
    if(this.state.loading) {
      content = <p id="loader" className="text-center;">Welcome, please conect your wallet to continue...</p>;      
    } else {
      content = <Main 
      daiTokenBalance = {this.state.daiTokenBalance}
      dappTokenBalance = {this.state.dappTokenBalance}
      stakingBalance = {this.state.stakingBalance}
      stakeTokens = {this.stakeTokens}
      unstakeTokens = {this.unstakeTokens}
      />;
    }
  
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
               {content}     
               <Dialog ref={(el) => { this.dialog = el }} />          
              </div>
            </main>
          </div>
        </div>
      </div>
    );    
  } // end render
}

export default App;
