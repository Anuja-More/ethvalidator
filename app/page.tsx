"use client";
import InputBox from "@/components/InputBox"

export default function Home() {
  const handleInputSubmit = (inputData: { address: string; amount: string }[]) => { 
    console.log('Input Data:', inputData);
  };
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <InputBox onInputSubmit={handleInputSubmit} />
    </div>
  )
}
