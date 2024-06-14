const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ID = 1
const NAME = "shoes"
const CATEGORY = "Clothing"
const IMG = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5

describe("Dappazon", () => {
  let dappazon
  let deployer, buyer
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners()
  
    const Dappazon = await ethers.getContractFactory("Dappazon")
    dappazon = await Dappazon.deploy()

  })
  describe("deployement", () => {
    it('set the owner', async () => {
      const owner = await dappazon.owner()
      expect(owner).to.be.equal(deployer.address)

    })
  })
  describe("Listing", () => {
    let transaction
   
    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMG, COST, RATING, STOCK)//list function was called and inserted the value args
      await transaction.wait()
    })
    it('set the items', async () => {
      const item = await dappazon.items(1)// here we call the mapping function not the normal function
      expect(item.id).to.be.equal(ID)
      expect(item.name).to.be.equal(NAME)//it cheks does the items are saved inside blockchain with the helping of mappin function of key 1.
      expect(item.category).to.be.equal(CATEGORY)
      expect(item.image).to.be.equal(IMG)
      expect(item.cost).to.be.equal(COST)
      expect(item.rating).to.be.equal(RATING)
      expect(item.stock).to.be.equal(STOCK)
    })
    it('emit an event', async()=>{
      expect(transaction).to.emit(dappazon,"List")// it checks whether the event "list" is emiting inside contract or not
    })
  })
  describe("Buying", () => {
    let transaction
   
    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMG, COST, RATING, STOCK)//list function was called and inserted the value args
      await transaction.wait()

      transaction = await dappazon.connect(buyer).buy(ID,{value:COST})
    })
    it('update balance', async()=>{
      const bal = await ethers.provider.getBalance(dappazon.address)
      expect(bal).to.equal(COST)
    })
    it('update orders count', async()=>{
      const result = await dappazon.orderCount(buyer.address)
      expect(result).to.equal(1)
    })
    it('Add orders',async()=>{
      const order = await dappazon.orders(buyer.address,1) 
      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
      
    })
    it('emit an buy event', async()=>{
      expect(transaction).to.emit(dappazon,"Buy")// it checks whether the event "Buy" is emiting inside contract or not
    })
  })
  describe("withdraw", () => {
    let BalBefore
   
    beforeEach(async () => {
      let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMG, COST, RATING, STOCK)//list function was called and inserted the value args
      await transaction.wait()

      transaction = await dappazon.connect(buyer).buy(ID,{value:COST})
      await transaction.wait()

      BalBefore = await ethers.provider.getBalance(deployer.address)
      

      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait()
    })
    it('deployer balance',async()=>{
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(BalBefore)
    })
    it('Contract balance',async()=>{
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(0)
    })
  })
})