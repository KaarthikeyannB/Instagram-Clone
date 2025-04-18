import React from 'react'
import { useNavigate } from 'react-router-dom'

const PostCell = ({post}) => {
  const navigate = useNavigate();
  return (
    <div className='col-span-1 h-40'>
        {post?.image && (
            <img src={post?.image} alt="post" className='w-full h-full object-cover' onClick={()=>navigate(`/postpage/${post?._id}`)}/>
        )}
        {post?.video && (
            <video src={post?.video} controls className='w-full h-full object-cover' onClick={()=>navigate(`/postpage/${post?._id}`)} />
        )}
    </div>
  )
}

export default PostCell