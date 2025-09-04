import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useProducts } from "../Context/ProductsContext";

interface SpinnerProps {
  size?: number;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 50, color = "#4f46e5" }) => {
  const { loading } = useProducts();

  if (!loading) return null; // hide if not loading

  return (
    <div className="flex justify-center items-center h-[50vh]">
      <ClipLoader size={size} color={color} loading={loading} />
    </div>
  );
};

export default Spinner;
