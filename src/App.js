import React from 'react'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [Toys, setToys] = useState(null)
  const [provider, setProviders] = useState(null)
  const [dappazon, setDappazon] = useState(null)

  const [item, setItem] = useState({})//empty object
  const [toggle, setToggle] = useState(false)
  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }
  const [account, setAccount] = useState(null)
  const loadBlockchainData = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProviders(provider)

    const network = await provider.getNetwork()
    console.log(network)
    const dappazon = new ethers.Contract(config[network.chainId].dappazon.address, Dappazon, provider)
    setDappazon(dappazon)
    // load products
    const items = []
    for (let i = 0; i < 9; i++) {
      const item = await dappazon.items(i + 1)
      items.push(item)
    }
    const electronics = items.filter((items) => items.category === 'electronics')
    setElectronics(electronics)
    const clothing = items.filter((items) => items.category === 'clothing')
    setClothing(clothing)
    const Toys = items.filter((items) => items.category === 'toys')
    setToys(Toys)
  }
  useEffect(() => {
    loadBlockchainData()
  }, [])
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>Dappazon's Products</h2>
      {electronics && clothing && Toys && (
        <>
          <Section title='ClothesAccesories' items={clothing} togglePop={togglePop} />
          <Section title='Electronics & Gadgets' items={electronics} togglePop={togglePop} />
          <Section title='Toys' items={Toys} togglePop={togglePop} />
        </>
      )}
      {toggle && (
        <Product item={item} provider={provider} account={account} dappazon={dappazon} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
