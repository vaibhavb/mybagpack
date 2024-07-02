import React, { useState, useEffect } from 'react';
import './MyBackpack.css';

const categories = [
  { name: 'Sleeping', icon: 'fa-bed' },
  { name: 'Clothing', icon: 'fa-shirt' },
  { name: 'Food', icon: 'fa-utensils' },
  { name: 'Equipment', icon: 'fa-toolbox' },
  { name: 'Other', icon: 'fa-ellipsis' }
];

const tripTypes = [
  'Through Hiking PCT Trail',
  'Climbing Mt Shasta',
  'Weekend Camping',
  'Day Hike',
  'Winter Mountaineering',
  'Beach Vacation'
];

const ItemIcon = ({ item, onDragStart, onClick }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, item)}
    onClick={() => onClick(item)}
    className="item-icon"
    style={{ left: item.x, top: item.y }}
  >
    <i className={`fas ${categories.find(c => c.name === item.category).icon}`}></i>
  </div>
);

const ItemForm = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState(item ? item.name : '');
  const [category, setCategory] = useState(item ? item.category : categories[0].name);
  const [weight, setWeight] = useState(item ? item.weight : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, name, category, weight: parseFloat(weight) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        required
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((cat) => (
          <option key={cat.name} value={cat.name}>{cat.name}</option>
        ))}
      </select>
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Weight (kg)"
        step="0.1"
        required
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

const MyBackpack = () => {
  console.log('MyBackpack component rendered');

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showList, setShowList] = useState(false);
  const [tripType, setTripType] = useState(tripTypes[0]);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(`mybackpack-items-${tripType}`);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load items from localStorage:', error);
      setItems([]);
    }
  }, [tripType]);

  useEffect(() => {
    try {
      localStorage.setItem(`mybackpack-items-${tripType}`, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items to localStorage:', error);
    }
  }, [items, tripType]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('text'), 10);
    const item = items.find((i) => i.id === id);
    if (item) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 25;
      const y = e.clientY - rect.top - 25;
      setItems(items.map((i) => (i.id === id ? { ...i, x, y } : i)));
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsAddingItem(false);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsAddingItem(true);
  };

  const handleSaveItem = (item) => {
    if (item.id) {
      setItems(items.map((i) => (i.id === item.id ? item : i)));
    } else {
      const newItem = {
        ...item,
        id: Date.now(),
        x: Math.random() * 300,
        y: Math.random() * 300,
      };
      setItems([...items, newItem]);
    }
    setSelectedItem(null);
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
    setSelectedItem(null);
  };

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0).toFixed(2);

  return (
    <div className="container">
      <h1>MyBackpack</h1>
      <div className="controls">
        <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
          {tripTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button onClick={handleAddItem}>Add Item</button>
        <button onClick={() => setShowList(!showList)}>
          {showList ? 'Hide' : 'Show'} List
        </button>
      </div>
      <div className="main-content">
        <div className="backpack-visual" onDragOver={handleDragOver} onDrop={handleDrop}>
          <svg viewBox="0 0 100 100" className="backpack-svg">
            <path d="M20,80 Q50,100 80,80 L80,30 Q50,10 20,30 Z" fill="#4A5568" />
            <path d="M30,30 Q50,10 70,30 L70,70 Q50,90 30,70 Z" fill="#2D3748" />
            <rect x="45" y="20" width="10" height="5" fill="#718096" />
            <path d="M35,25 Q50,35 65,25" fill="none" stroke="#718096" strokeWidth="2" />
          </svg>
          {items.map((item) => (
            <ItemIcon key={item.id} item={item} onDragStart={handleDragStart} onClick={handleItemClick} />
          ))}
        </div>
        <div className="sidebar">
          <div className="total-weight">
            <h3>Total Weight</h3>
            <p>{totalWeight} kg</p>
          </div>
          {showList && (
            <div className="item-list">
              <h3>Item List</h3>
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <span><i className={`fas ${categories.find(c => c.name === item.category).icon}`}></i> {item.name}</span>
                    <span>{item.weight} kg</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(selectedItem || isAddingItem) && (
            <div className="item-form">
              <h3>{selectedItem ? 'Edit Item' : 'Add Item'}</h3>
              <ItemForm
                item={selectedItem}
                onSave={handleSaveItem}
                onCancel={() => {
                  setSelectedItem(null);
                  setIsAddingItem(false);
                }}
              />
              {selectedItem && (
                <button onClick={() => handleDeleteItem(selectedItem.id)}>
                  Delete Item
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBackpack;
