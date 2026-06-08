import rubleIcon from '../assets/bel_ruble.png'

function CurrencySymbol() {
  return (
    <img 
      src={rubleIcon} 
      alt="BYN" 
      className="currency-symbol"
      title="Белорусский рубль"
    />
  )
}

export default CurrencySymbol