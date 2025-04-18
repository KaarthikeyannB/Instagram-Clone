import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useMutationHook = ({name,dataArguments,url,method,body}) => {
    const{mutate:name,isPending,isError,error} = useMutation({
        mutationFn:async(dataArguments)=>{
            try {
                const res = await fetch(`${url}`,{
                    method:`${method}`,
                    credentials:"include",
                    headers:{"Content-Type":"application/json"},
                    body:body,
                });
                const responseData = await res.json();
                if(!res.ok){
                    throw new Error(responseData.message || "Something went wrong");
                }
                return responseData;
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess:()=>{
            toast.success(`${name} successfull`);
        },
    });
    return [name,isPending,isError,error];
}

export default useMutationHook;