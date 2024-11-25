import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BuyPage.css';
const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const BuyPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
  
  // Extract the 'username' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username');
  console.log(username)

    // Initialize productsToBuy from location state or default to an empty array
    const [productsToBuy, setProductsToBuy] = useState(location.state?.productsToBuy || []);
    
    // Calculate total price
    const totalPrice = productsToBuy.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    // Handle item deletion
    const handleDelete = (productId) => {
        setProductsToBuy((prevProducts) => 
            prevProducts.filter(item => item._id !== productId)
        );
    };
    const handlePayment = async () => {
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }
    
        // Step 3: Call your PHP backend to create an order
        const orderData = await fetch('https://nameless-waters-82317-75da4f904716.herokuapp.com/api/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalPrice })
        }).then(res => res.json());
    
        const options = {
            key: 'rzp_test_SGmdC8LUxtlgND', // Replace with your Razorpay key
            amount: orderData.amount, 
            currency: 'INR',
            name: 'Your Company',
            description: 'Test Transaction',
            order_id: orderData.id,
            handler: async function (response) {
                alert('Payment successful');
    
                // Step 5: Verify payment on the server
                await fetch('http://localhost:3001/api/razorpay/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                });
                const stockUpdateResponse = await fetch('https://nameless-waters-82317-75da4f904716.herokuapp.com/update_stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: productsToBuy })
            }).then(res => res.json());

            if (!stockUpdateResponse.success) {
                alert('Failed to update stock');
                return;
            }

    
                // Step 6: Send an email confirmation
                const emailPayload = {
                    email: 'maitreyaguptaa@gmail.com', // Change this to the recipient's email address
                    orderDetails: productsToBuy.map(product => 
                        `${product.name} - Type: ${product.type} x ${product.quantity}`
                    ).join('\n') + `\n\nTotal Price: Rs${totalPrice}`,
                };
    
                // Encode the emailPayload as a JSON string and then URL encode it
                const encodedEmailPayload = encodeURIComponent(JSON.stringify(emailPayload));
    
                // Construct the URL with query parameters for GET request
                const emailUrl = `https://nameless-waters-82317-75da4f904716.herokuapp.com/send_email?username=${username}&emailPayload=${encodedEmailPayload}`;
    
                // Send the GET request
                await fetch(emailUrl)
                    .then(emailResponse => emailResponse.json())
                    .then(emailResult => {
                        if (emailResult.success) {
                            alert('Order confirmation email sent!');
                        } else {
                            console.error('Error sending email:', emailResult.message);
                        }
                    });
            },
            prefill: { name: 'Maitreya Gupta', email: 'maitreyaguptaa@gmail.com', contact: '8697539102' },
            theme: { color: '#F37254' },
        };
    
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };
    
    


    console.log("Location state:", location.state);
    console.log("Products to Buy:", productsToBuy);

    return (
        <div className="buy-page">
            <h2>Confirm Your Purchase</h2>
            {productsToBuy.length > 0 ? (
                <ul>
                    {productsToBuy.map((item) => (
                        <li key={item._id}>
                            <span>{item.name} - Quantity: {item.quantity} - Price: Rs{item.price}</span>
                            <button 
                                onClick={() => handleDelete(item._id)} 
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                    <h3>Total Price: Rs{totalPrice}</h3>
                </ul>
            ) : (
                <p>No items to buy</p>
            )}
            <button onClick={handlePayment}>
                Proceed to Payment
            </button>
        </div>
    );
};

export default BuyPage;
