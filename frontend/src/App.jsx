import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import SearchAndFeeed from "./pages/search/SearchAndFeed";
import ReelsTab from "./pages/reels/ReelsTab";
import Message from "./pages/message/Message";
import ProfilePage from "./pages/account/ProfilePage";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import LoadSpinner from "./common/LoadSpinner";
import NotificationPaage from "./pages/notification/NotificationPaage";
import CreatePost from "./pages/post/CreatePost";
import CreateStory from "./pages/post/CreateStory";
import Settings from "./pages/settings/Settings";
import AccountCenter from "./pages/settings/AccountCenter";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "./constant/url";
import ViewStory from "./pages/post/ViewStory";
import CommentPage from "./pages/home/CommentPage";
import SharePage from "./components/SharePage";
import ViewPost from "./pages/post/ViewPost";
import Chat from "./pages/message/Chat";
import FollowersList from "./pages/message/FollowersList";
import FollowDetails from "./pages/account/FollowDetails";

function App() {

  const {data:authUser,isLoading} = useQuery({
    queryKey:["authUser"],
    queryFn:async()=>{
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const responseData = await res.json();
        if(responseData.error){
          return null;
        }
        if (!res.ok) {
          throw new Error(responseData.message || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadSpinner />
        </div>
      ) : (
        <div>
          <Routes>
            <Route path="/" element={authUser?<Home />:<Navigate to="/login"/>} />
            <Route path="/search" element={authUser?<SearchAndFeeed />:<Navigate to="/login" />} />
            <Route path="/reels" element={authUser?<ReelsTab />:<Navigate to="/login" />} />
            <Route path="/message" element={authUser?<Message />:<Navigate to="/login" />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/login" element={!authUser?<LoginPage />:<Navigate to="/"/>} />
            <Route path="/signup" element={!authUser?<SignupPage />:<Navigate to="/" />} />
            <Route path="/notifications" element={authUser?<NotificationPaage />:<Navigate to="/login" />} />
            <Route path="/createpost" element={authUser?<CreatePost />:<Navigate to="/login" />} />
            <Route path="/createstory" element={authUser?<CreateStory />:<Navigate to="/login" />} />
            <Route path="/viewstory" element={authUser?<ViewStory />:<Navigate to="/login" />} />
            <Route path="/settings" element={authUser?<Settings />:<Navigate to="/login" />} />
            <Route path="/accountcenter" element={authUser?<AccountCenter/>:<Navigate to = "/login"/>}/>
            <Route path="/comments/:id" element={authUser?<CommentPage/>:<Navigate to="/login" />}/>
            <Route path="/share" element={authUser?<SharePage/>:<Navigate to="/login" />}/>
            <Route path="/postpage/:postId" element={authUser?<ViewPost/>:<Navigate to="/login" />}/>
            <Route path="/chats/:id" element={authUser?<Chat/>:<Navigate to="/login" />}/>
            <Route path="/followers" element={authUser?<FollowersList/>:<Navigate to="/login" />}/>
            <Route path="/followdetails" element={authUser?<FollowDetails/>:<Navigate to="/login" />}/>
          </Routes>
          <Toaster />
        </div>
      )}
    </div>
  );
}

export default App;
