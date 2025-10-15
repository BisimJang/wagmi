import React, { useEffect, useState } from "react";
import { verifyJWT } from "../auth/verifyJWT"; // your existing working auth util
import { ethers } from "ethers";

const API_BASE_URL = "http://localhost:8000/api";
const CONTRACT_ADDRESS = "0x6E796a133DaaCB20267B60f4639177c6a95C731C";

export default function EnrolledCourses() {
  const [wallet, setWallet] = useState(null);
  const [token, setToken] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Connect wallet (no changes)
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask first!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet({ provider, signer, address });
  };

  // ✅ Fetch enrolled courses (only for logged in + connected user)
  const loadEnrolledCourses = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEnrolledCourses(data);
      } else {
        console.error("Error fetching enrollments:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify JWT and fetch enrolled courses
  useEffect(() => {
    const verifyAndLoad = async () => {
      const verifiedToken = await verifyJWT(); // uses your existing logic
      if (verifiedToken) {
        setToken(verifiedToken);
        await loadEnrolledCourses(verifiedToken);
      } else {
        setLoading(false);
      }
    };
    verifyAndLoad();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🎓 Enrolled Courses</h2>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Connect Wallet
        </button>
      ) : null}

      {loading ? (
        <p>Loading your enrolled courses...</p>
      ) : enrolledCourses.length === 0 ? (
        <p className="text-gray-500 mt-4">You have not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {course.description?.slice(0, 80)}...
              </p>
              <p className="text-green-600 font-medium mt-3">✅ Enrolled</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
