import React from "react";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import Post from "./Post";
import HomeSkeleton from "../../common/skeleton/HomeSkeleton";

const PostsHome = () => {


  const {data:posts,isLoading} = useQuery({
    queryKey:["posts"],
    queryFn:async()=>{
      try {
        const res = await fetch(`${baseUrl}/api/posts/all`,{
          method:"GET",
          credentials:"include",
          headers:{
            "Content-Type":"application/json",
          },
        });
        const data = await res.json();
        if(!res.ok){
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });



  return (
    <div className="flex flex-col mt-1 mx-2 pb-2 gap-2">
      {isLoading && (
        <div>
          <HomeSkeleton/>
          <HomeSkeleton/>
          <HomeSkeleton/>
        </div>
      )}
      {!isLoading  && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
      {!isLoading && posts && (
				<div className="p-4 flex flex-col gap-4 mb-10">
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
    </div>
  );
};

export default PostsHome;