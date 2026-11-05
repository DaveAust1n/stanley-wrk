"use client";
import React, { useState } from 'react';

// Define the steps for the giveaway flow
const GIVEAWAY_STEPS = [
  {
    id: 0,
    question: "Do you currently own a Tesla?",
    options: ["Yes", "No"],
    buttonText: "Next Step",
  },
  {
    id: 1,
    question: "Which Tesla model is your favorite?",
    options: ["Model S", "Model 3", "Model X", "Model Y"],
    buttonText: "Continue",
  },
  {
    id: 2,
    question: "Would you like to receive the Tesla Global Giveaway package?",
    options: ["Yes, please!", "Not right now"],
    buttonText: "Claim Now",
  },
];

export default function TeslaClone() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (selectedOption === null) {
      alert("Please select an option first!");
      return;
    }
    
    if (currentStep < GIVEAWAY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null); 
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto border-b border-zinc-800">
        <div className="text-2xl font-bold tracking-tighter">
          TESLA <span className="text-red-600">GLOBAL</span>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition">How it Works</a>
          <a href="#" className="hover:text-white transition">Winner Proof</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-[-1] opacity-50">
          <img 
            src="https://images.unsplash.com/photo-1560612867-f373be3737cf?q=80&w=2070" 
            alt="Tesla Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>

        <div className="max-w-2xl w-full z-10">
          {!isCompleted ? (
            <>
              {/* Main Heading - Only shows on first step */}
              {currentStep === 0 && (
                <div className="mb-12 animate-fadeIn">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    Drive the Future. <br/><span className="text-red-600">For Free.</span>
                  </h1>
                  <p className="text-gray-300 text-lg md:text-xl mb-8 font-light">
                    Join thousands of winners globally. Enter our official Tesla giveaway today.
                  </p>
                </div>
              )}

              {/* Interactive Questionnaire */}
              <div className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-3xl border border-zinc-800 shadow-2
