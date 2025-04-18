import React from 'react';
import { GoHome, GoHomeFill } from "react-icons/go";
import { FaSearch } from "react-icons/fa";
import { BiMoviePlay } from "react-icons/bi";
import { RiMessengerLine } from "react-icons/ri";

import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const MenuSection = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["authUser"]);
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className='flex items-center justify-between w-full px-4 py-3 fixed bottom-0 bg-white border-t'>
      <Link to='/'>
        {path === '/' ? 
          <GoHomeFill size={30} className='text-black' /> : 
          <GoHome size={30} className='text-gray-700' />
        }
      </Link>
      <Link to='/search'>
        <FaSearch 
          size={25} 
          className={path === '/search' ? 'text-black' : 'text-gray-700'} 
        />
      </Link>
      <Link to='/reels'>
        <BiMoviePlay
          size={30} 
          className={path === '/reels' ? 'text-black' : 'text-gray-700'} 
        />
      </Link>
      <Link to='/message'>
        <RiMessengerLine 
          size={30} 
          className={path === '/message' ? 'text-black' : 'text-gray-700'} 
        />
      </Link>
      <Link to={`/profile/${user?.username}`}>
        <img 
          src={user?.profileImg || "/avatar-placeholder.png"} 
          alt="profile" 
          className={`w-10 h-10 rounded-full object-cover ${path.includes(`/profile/${user?.username}`) ? 'border-2 border-black' : ''}`} 
        />
      </Link>
    </div>
  )
}

export default MenuSection