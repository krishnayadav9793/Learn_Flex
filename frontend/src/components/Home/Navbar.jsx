import React from 'react'

const Navbar = () => {
  return (
    <div>
      <div className="container w-full flex flex-row justify-between bg-blue-600">

        <div className="logo font-bold text-5xl p-4 flex items-center gap-3 
bg-gradient-to-r from-blue-200 to-purple-300 
bg-clip-text text-transparent">

          FLEX LEARN
                    <lord-icon
            src="/Icon/book.json"
            trigger="hover"
            style={{ width: "50px", height: "50px" }}
          ></lord-icon>


        </div>

        <div className="nav">
          <ul className="flex flex-row gap-7 p-5 text-3xl font-bold ">
            <li className="hover:text-white cursor-pointer border-2 rounded-2xl"><lord-icon
            src="/Icon/bell.json"
            trigger="hover"
            style={{ width: "50px", height: "50px" }}
          ></lord-icon></li>
            <li className="hover:text-white cursor-pointer border-2 rounded-2xl"><lord-icon
            src="/Icon/profile.json"
            trigger="hover"
            style={{ width: "50px", height: "50px" }}
          ></lord-icon></li>
          
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Navbar
