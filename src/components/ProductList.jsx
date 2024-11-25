 import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { useItemContext } from '../context/ItemContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const { items } = useItemContext();
    const [sortedProducts, setSortedProducts] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(3000);
    const [selectedArrival, setSelectedArrival] = useState('all');
    const [selectedDeparture, setSelectedDeparture] = useState('all');
    const [selectedRoute, setSelectedRoute] = useState('all'); // State for selected route filter
    const [arrivals, setArrivals] = useState([]);
    const [departures, setDepartures] = useState([]);
    const [routes, setRoutes] = useState([]); // State for routes
    const navigate = useNavigate();

    // Fetch products and filter options (Arrival, Departure, and Routes)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://nameless-waters-82317-75da4f904716.herokuapp.com/api/products');
                const products = response.data; // Assuming the API returns an array of products
                const arrivalStations = [...new Set(products.map(product => product.Arrival))];
                const departureStations = [...new Set(products.map(product => product.Departure))];
                const availableRoutes = [...new Set(products.map(product => product.Route))];

                setSortedProducts(products);
                setArrivals(arrivalStations);
                setDepartures(departureStations);
                setRoutes(availableRoutes); // Set available routes
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    // Update sortedProducts whenever filters change
    useEffect(() => {
        let filteredProducts = [...items];

        // Filter by price range
        if (minPrice !== 0 || maxPrice !== 3000) {
            filteredProducts = filteredProducts.filter(
                (product) => product.price >= minPrice && product.price <= maxPrice
            );
        }

        // Filter by selected Arrival
        if (selectedArrival !== 'all') {
            filteredProducts = filteredProducts.filter(
                (product) => product.Arrival === selectedArrival
            );
        }

        // Filter by selected Departure
        if (selectedDeparture !== 'all') {
            filteredProducts = filteredProducts.filter(
                (product) => product.Departure === selectedDeparture
            );
        }

        // Filter by selected Route
        if (selectedRoute !== 'all') {
            filteredProducts = filteredProducts.filter(
                (product) => product.Route === selectedRoute
            );
        }

        setSortedProducts(filteredProducts);
    }, [items, minPrice, maxPrice, selectedArrival, selectedDeparture, selectedRoute]);

    return (
        <div className='prdt-list'>
            <div className='filter-btn'>
                {/* Filter by Route */}
                <label>
                    Filter by Route:
                    <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                        <option value="all">All Routes</option>
                        {routes.length > 0 ? (
                            routes.map((route, index) => (
                                <option key={index} value={route}>
                                    {route}
                                </option>
                            ))
                        ) : (
                            <option value="all">No routes available</option>
                        )}
                    </select>
                </label>

                {/* Arrival filter */}
                <label>
                    Filter by Arrival:
                    <select
                        value={selectedArrival}
                        onChange={(e) => setSelectedArrival(e.target.value)}
                    >
                        <option value="all">All</option>
                        {arrivals.length > 0 ? (
                            arrivals.map((arrival, index) => (
                                <option key={index} value={arrival}>
                                    {arrival}
                                </option>
                            ))
                        ) : (
                            <option value="all">No arrivals available</option>
                        )}
                    </select>
                </label>

                {/* Departure filter */}
                <label>
                    Filter by Departure:
                    <select
                        value={selectedDeparture}
                        onChange={(e) => setSelectedDeparture(e.target.value)}
                    >
                        <option value="all">All</option>
                        {departures.length > 0 ? (
                            departures.map((departure, index) => (
                                <option key={index} value={departure}>
                                    {departure}
                                </option>
                            ))
                        ) : (
                            <option value="all">No departures available</option>
                        )}
                    </select>
                </label>

                {/* Price range filters */}
                <label>
                    Min Price:
                    <input
                        type='number'
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                    />
                </label>

                <label>
                    Max Price:
                    <input
                        type='number'
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />
                </label>
            </div>

            <ul className='item-card'>
                {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                        <ProductItem
                            key={product._id.$oid} // Ensure `key` is unique for each product
                            product={product}
                        />
                    ))
                ) : (
                    <p>No products available</p>
                )}
            </ul>
        </div>
    );
};

export default ProductList;

