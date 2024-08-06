import React, { useState } from 'react';

function OrderManager({ tshirtDesign }) {
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState('');

    const placeOrder = () => {
        const userId = 1; // This should be dynamically determined in a real app
        const order = { userId, tshirtDesign };
        fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        })
        .then(response => response.json())
        .then(data => {
            setOrders([...orders, data]);
            checkOrderStatus(data.order_id);
        });
    };

    const checkOrderStatus = (orderId) => {
        fetch(`/api/orders/${orderId}`)
        .then(response => response.json())
        .then(data => setStatus(data.status));
    };

    return (
        <div>
            <h2>Order Your T-Shirt</h2>
            <button onClick={placeOrder}>Place Order</button>
            <h3>Order Status: {status}</h3>
            <div>
                <h3>Your Orders</h3>
                <ul>
                    {orders.map(order => (
                        <li key={order.order_id}>
                            Order #{order.order_id} - Status: {order.status}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default OrderManager;
