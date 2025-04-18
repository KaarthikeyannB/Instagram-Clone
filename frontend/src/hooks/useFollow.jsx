import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../constant/url";

const useFollow = () => {
    const queryClient = useQueryClient();

    const {mutate:follow,isPending}= useMutation({
        mutationFn:async(userId)=>{
            try {
                const res = await fetch(`${baseUrl}/api/users/follow/${userId}`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });
                const responseData = await res.json();
                if (!res.ok) {
                    throw new Error(responseData.message || "Something went wrong");
                }
                return responseData;
                
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess:()=>{
            queryClient.invalidateQueries(["authUser"]);
        },
        onError:(error)=>{
            toast.error(error.message);
        }
    });

    return { follow, isPending };
};

export default useFollow;