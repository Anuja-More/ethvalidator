"use client";
import React, { useState, useRef } from 'react';

interface InputBoxProps {
  onInputSubmit: (inputData: { address: string; amount: string }[]) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ onInputSubmit }) => {
  const [inputText, setInputText] = useState('1 | ');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<string | null>(null);

  const handleInputChange = () => {
    if (textAreaRef.current) {
      const text = textAreaRef.current.value;
      setInputText(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentText = textAreaRef.current?.value || '';
      const updatedText = currentText + `\n${inputText.split('\n').length + 1} | `;
      setInputText(updatedText);
    }
  };

  const extractAddressAndAmount = (inputString: string) => {
    const regex = /(0x[a-fA-F0-9]{40})\s*[=,]\s*([^=, ]+)\b/g;
    const matches: { address: string; amount: string }[] = [];

    let match;
    while ((match = regex.exec(inputString)) !== null) {
      const [, address, amount] = match;
      matches.push({ address, amount });
    }

    return matches;
  };


const handleRemoveDuplicates = () => {
  const lines = inputText.split('\n');
  const inputData: { address: string; amount: string }[] = [];
  const addressMap = new Map<string, number>();
  const updatedValidationErrors: string[] = []; // Updated validation errors

  lines.forEach((line, index) => {
    const lineWithoutNumber = line.replace(/^\d+ \| /, '');
    const extractedData = extractAddressAndAmount(lineWithoutNumber);

    if (extractedData.length === 1) {
      const { address, amount } = extractedData[0];

      if (addressMap.has(address)) {
        // Duplicate address found, skip this line and clear the error
        updatedValidationErrors.splice(addressMap.get(address)!, 1); // Clear the error
      } else {
        // New address
        addressMap.set(address, inputData.length);
        inputData.push({ address, amount });
      }
    }
  });

  setInputText(inputData.map((data, index) => `${index + 1} | ${data.address} = ${data.amount}`).join('\n'));
  setShowOptions(false);
  setValidationErrors(updatedValidationErrors); // Update validation errors
};

const handleCombineBalances = () => {
  const lines = inputText.split('\n');
  const inputData: { address: string; amount: string }[] = [];
  const addressMap = new Map<string, number>();
  const updatedValidationErrors: string[] = []; // Updated validation errors

  lines.forEach((line, index) => {
    const lineWithoutNumber = line.replace(/^\d+ \| /, '');
    const extractedData = extractAddressAndAmount(lineWithoutNumber);

    if (extractedData.length === 1) {
      const { address, amount } = extractedData[0];

      if (addressMap.has(address)) {
        // Duplicate address found, combine balances and clear the error
        const duplicateIndex = addressMap.get(address)!;
        const existingAmount = inputData[duplicateIndex].amount;
        const combinedAmount = (parseFloat(existingAmount) + parseFloat(amount)).toString();
        inputData[duplicateIndex].amount = combinedAmount;
        updatedValidationErrors.splice(index, 1); // Clear the error
      } else {
        // New address
        addressMap.set(address, inputData.length);
        inputData.push({ address, amount });
      }
    }
  });

  setInputText(inputData.map((data, index) => `${index + 1} | ${data.address} = ${data.amount}`).join('\n'));
  setShowOptions(false);
  setValidationErrors(updatedValidationErrors); // Update validation errors
};
  const handleSubmit = () => {
    const lines = inputText.split('\n');
    const inputData: { address: string; amount: string }[] = [];
    const errors: string[] = [];
    const addressMap = new Map<string, number>();

    lines.forEach((line, index) => {
      const lineWithoutNumber = line.replace(/^\d+ \| /, '');
      const extractedData = extractAddressAndAmount(lineWithoutNumber);
  
      if (extractedData.length === 1) {
        const { address, amount } = extractedData[0];

        if (addressMap.has(address)) {
          errors.push(`Line ${index + 1}: Duplicate address found`);
        } else {
          // New address
          addressMap.set(address, inputData.length);
          inputData.push({ address, amount });
        }
      } else {
        errors.push(`Line ${index + 1}: Invalid format`);
      }
    });

    setValidationErrors(errors);
    setShowOptions(addressMap.size > 1);

    if (errors.length === 0) {
      onInputSubmit(inputData);
        setSuccessData("Data saved successfully!");
        setInputText('1 | ');
      
    }
  };


return (
  <div className="flex flex-col bg-gray-900 text-white p-4 rounded">
     <div className="flex justify-between mb-4">
      <div className="text-white text-sm mr-4">Addresses with Amount</div>
      <div className="text-white text-sm mr-4">uploade File</div>
     
    </div>
    <div className="mb-4 p-2">
      <textarea
        rows={5}
        cols={70}
        placeholder="Enter text here..."
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        ref={textAreaRef}
        className="w-full bg-gray-800 text-white p-2 rounded focus:outline-none"
      />
    </div>
    <div className='flex justify-between mt-5 mb-11'>
      <div className='text-white text-sm'>separated by '=' or ','  or a space</div>
      <div className='text-gray-300 text-sm'>show example</div>
    </div>
    {(validationErrors.length > 0 || showOptions) && (
      <div className="mb-2 flex justify-between m-3">
        {validationErrors.length > 0 && <div className='text-white'>Duplicate</div>}
        <div className='flex justify-between'>
          {validationErrors.length > 0 && (
            <><button onClick={handleRemoveDuplicates} className=" text-red-500 p-2 mr-2">
              Remove Duplicates
            </button><span className='text-red-500 m-2'>|</span></>
          )}
          {validationErrors.length > 0 && (
            <button onClick={handleCombineBalances} className=" text-red-500 p-2">
              Combine Balances
            </button>
          )}
        </div>
      </div>
    )}
    {validationErrors.length > 0 && (
      <div className="border border-red-500 text-red-500 mb-2 p-2 rounded w-full">
        {validationErrors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    )}
     {successData && (
        <div className="border border-green-500 text-green-500 mb-2 p-2 rounded w-full">
          {successData}
        </div>
      )}
    <button onClick={handleSubmit} className="bg-gradient-to-r from-fuchsia-400 to-purple-800 text-white p-2 rounded-full w-full">
  Next
</button>
  </div>
);

};

export default InputBox;

