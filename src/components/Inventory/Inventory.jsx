import { useEffect, useState } from 'react'
import './Inventory.css'

export default function Inventory({ items, onUseItem }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [inventoryItems, setInventoryItems] = useState([])

  // Atualiza o inventário quando os itens mudam
  useEffect(() => {
    setInventoryItems(items || [])
  }, [items])

  const handleUseItem = () => {
    if (selectedItem) {
      onUseItem(selectedItem)
      setSelectedItem(null)
    }
  }

  return (
    <div className="inventory-container">
      <h3>Inventário</h3>
      
      {inventoryItems.length === 0 ? (
        <p className="empty-inventory">Seu inventário está vazio</p>
      ) : (
        <>
          <div className="items-grid">
            {inventoryItems.map((item, index) => (
              <div 
                key={index}
                className={`item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <span className="item-icon">{item.icon || '📦'}</span>
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity || 1}</span>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="item-actions">
              <button onClick={handleUseItem}>Usar Item</button>
              <div className="item-description">
                {selectedItem.description || 'Item sem descrição.'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}