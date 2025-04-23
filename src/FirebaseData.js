// src/components/FirebaseData.js
import React, { useEffect, useState } from "react";
import { database, ref, onValue } from "../firebase";

const FirebaseData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const dataRef = ref(database, "YOUR_DATABASE_NODE"); // Change this to match your database path

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const fetchedData = snapshot.val();
      if (fetchedData) {
        setData(Object.values(fetchedData)); // Convert object to array if needed
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div>
      <h2>Firebase Data</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export default FirebaseData;
