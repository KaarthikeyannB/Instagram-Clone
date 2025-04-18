import React from 'react'
import { useNavigate } from 'react-router-dom'

const Chats = ({chat}) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/chats/${chat._id}`)} 
      className='flex items-center gap-3 p-3 border-b hover:bg-gray-50 cursor-pointer'
    >
      <img 
        src={chat?.user?.profileImg || "/avatar-placeholder.png"} 
        alt={chat?.user?.username} 
        className='w-12 h-12 rounded-full object-cover' 
      />
      <div className='flex flex-col gap-1 flex-1'>
        <h1 className='font-semibold'>{chat?.user?.username}</h1>
        <div className='flex justify-between items-center'>
          <p className='text-sm text-gray-500 truncate'>
            {chat?.lastMessage || 'No messages yet'}
          </p>
          {chat?.timestamp && (
            <span className='text-xs text-gray-400'>{chat.timestamp}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chats