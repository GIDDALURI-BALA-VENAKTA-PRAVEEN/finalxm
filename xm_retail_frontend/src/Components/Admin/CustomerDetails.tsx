import React, { useEffect, useState } from "react";

// Define the type for the customer
interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const CustomerData: React.FC = () => {
  // State for holding customer data and error message
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string>("");

  // Fetch customer data when the component mounts
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch("http://localhost:4000/cust/data/"); // Your backend endpoint

        // Parse the response to JSON
        const data = await response.json();

        if (data.success) {
          setCustomers(data.data); // Set the fetched customer data
        } else {
          setError("No customers found"); // Set error if no data
        }
      } catch (err) {
        setError("Error fetching data"); // Set error message if fetch fails
        console.error("Error:", err);
      }
    };

    fetchCustomerData(); // Call the function to fetch data
  }, []); // Empty array to ensure it runs only once when component mounts

  return (
    <div>
      <h1>Customer Data</h1>

      {/* If there's an error, display the error message */}
      {error && <p>{error}</p>}

      {/* If there are customers, display them */}
      {customers.length > 0 ? (
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>
              <strong>{customer.name}</strong> - {customer.email} - {customer.phone}
            </li>
          ))}
        </ul>
      ) : (
        <p>No customer data available</p>
      )}
    </div>
  );
};

export default CustomerData;
