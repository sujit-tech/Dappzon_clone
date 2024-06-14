import React from 'react'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'

import close from '../assets/close.svg'

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setOrder] = useState(null)
  const [hasBought, setHasbought] = useState(false)
  const fetchDetails = async () => {
    const events = await dappazon.queryFilter("Buy")
    const orders = events.filter(
      (event) => event.args.buyer === account && event.args.itemId.toString() === item.id.toString()
    )
    if (orders.length === 0) return
    const order = await dappazon.orders(account, orders[0].args.orderId)
    setOrder(order)
  }
  const buyHandler = async () => {
    const signer = await provider.getSigner()

    // Buy item...
    let transaction = await dappazon.connect(signer).buy(item.id, { value: item.cost })
    await transaction.wait()

    setHasbought(true)
  }
  useEffect(() => {
    fetchDetails()
  }, [hasBought])
  return (
    <div className="product">
      <div className='product__details'>
        <div className='product__image'>
          <img src={item.image} alt='Product' />
        </div>
        <div className='product__overview'>
          <h1>{item.name}</h1>
          <Rating value={item.rating} />
          <hr />
          <h2>{ethers.utils.formatUnits(item.cost.toString(), 'ether')}Berries</h2>
          <hr />
          <h2>Overview</h2>
          <p>{item.description}
            optional
          </p>
        </div>
        <div className='product__order'>
          <h2>{ethers.utils.formatUnits(item.cost.toString(), 'ether')}Berries</h2>
          <p>FREE Delivery <br />
            <strong>
              {new Date(Date.now() + 345600000).toLocaleDateString(
                undefined,
                {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
            </strong>
          </p>
          <p>{item.stock > 0 ? ('In stock') : ('out of Stock')}</p>
          <button className='product__buy' onClick={buyHandler}>
            Buy Now
          </button>
          <p><small>seller by</small>Dappazon</p>
          <p><small>sold by</small>Dappazon</p>
          {order && (
            <div className='product__bought'>
              Item bought on <br />
              <strong>
                {new Date(Number(order.time.toString() + '000')).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                  })}
              </strong>
            </div>
          )}
        </div>
        <button className='product__close' onClick={togglePop}>
          <img src={close} alt="CLOSE" />
        </button>
      </div>
    </div >
  );
}

export default Product;