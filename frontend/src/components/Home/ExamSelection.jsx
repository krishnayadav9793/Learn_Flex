import React from "react";

const Middle = () => {
  return (
    <div className="relative min-h-screen">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-blue-300"></div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] pt-5">

        <h1 className="text-2xl font-bold mb-8 text-gray-700">
          Your Exam
        </h1>

        <div className="flex flex-wrap justify-center gap-6">

          <div className="bg-blue-100 px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:text-white hover:scale-105 transition cursor-pointer font-bold">
            JEE MAINS
          </div>

          <div className="bg-blue-100 px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:text-white hover:scale-105 transition cursor-pointer font-bold">
            JEE ADV
          </div>

          <div className="bg-blue-100 px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:text-white hover:scale-105 transition cursor-pointer font-bold">
            NEET-UG
          </div>

          <div className="bg-blue-100 px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:text-white hover:scale-105 transition cursor-pointer font-bold">
            UPSC
          </div>

          <div className="bg-blue-100 px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:text-white hover:scale-105 transition cursor-pointer font-bold">
            GATE
          </div>

          <div className="bg-blue-100 px-6 py-3 rounded-xl shadow-md  hover:bg-blue-600 hover:text-white hover:scale-105 transition cursor-pointer font-bold">
            HSC-Science
          </div>

        </div>

        {/* Challenges Section */}
<div className="pt-14 flex flex-col items-center">

  <h2 className="text-2xl font-bold text-gray-700">
    Challenges and Practice
  </h2>

  <div className="pt-8 pb-8 flex gap-8">

    <div className="w-60 h-40  rounded-xl shadow-md  hover:scale-105 transition cursor-pointer font-bold items-stretch pt-4 justify-center text-center bg-green-800 text-white">
          <lord-icon
            src="/Icon/Practice.json"
            trigger="hover"
            style={{ width: "50px", height: "50px" }}
          ></lord-icon>

      <div className="">Daily Challenge</div>
      <div className="text-gray-400">6 question: Earn Xp </div>
    </div>

    <div className="w-60 h-40 bg-violet-900 rounded-xl shadow-md pt text-white  hover:scale-105 transition cursor-pointer font-bold pt-4 justify-center text-center">
    <lord-icon
            src="/Icon/Weekly.json"
            trigger="hover"
            style={{ width: "50px", height: "50px" }}
          ></lord-icon>

      <div className="pt-2">Weekly Test </div>
      <div className="text-gray-400">Complete with others </div>
    </div>

    <div className="w-60 h-40 bg-amber-700 rounded-xl shadow-md text-white  hover:scale-105 transition cursor-pointer pt-4 font-bold  justify-center text-center">
            <lord-icon
            src="/Icon/Practice.json"
            trigger="hover"
            style={{ width: "50px", height: "50px" }}
          ></lord-icon>

      <div>Practice</div>
      <div className="text-gray-400">Topic Wise Learning</div>
    </div>


  </div>

      <div className="flex items-center justify-between w-full max-w-3xl p-6 rounded-2xl 
    bg-gradient-to-r from-red-900/80 to-red-800/70 
    shadow-xl border border-red-700">

      {/* Left Side */}
      <div className="flex items-center gap-4">

        <div className="text-3xl">⚔️</div>

        <div>
          <h2 className="text-white text-lg font-bold">
            1v1 Battle
          </h2>

          <p className="text-gray-300 text-sm">
            Challenge a friend or get matched instantly
          </p>

          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-red-500 text-white">
            2 Pending
          </span>
        </div>

      </div>

      {/* VS Center */}
      <div className="text-red-400 text-3xl font-bold opacity-80">
        VS
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-center gap-2">

        <div className="text-2xl">🧍</div>

        <button className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-white font-semibold transition">
          FIGHT NOW
        </button>

      </div>

    </div>

</div>

      </div>
    </div>
  );
};

export default Middle;