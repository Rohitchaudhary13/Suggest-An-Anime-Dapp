import React from 'react'
import '../App.css';

const Footer = () => {
  return (
    <div style={{textAlign: "center", position: "fixed", left: 0, bottom: 0, right: 0, backgroundColor: "black", color: "white"}}>
        <hr className='sep-3' />
        <div >
            <h3 className='Text'>Made with &#x2764; By <strong>Styx</strong></h3>
        </div>
    </div>
  )
}

export default Footer