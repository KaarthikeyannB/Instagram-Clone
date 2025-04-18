import React, { useState, useRef, useEffect } from "react";
import { RiAddBoxLine } from "react-icons/ri";
import { CiHeart } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { MdAddCircleOutline } from "react-icons/md";
import { MdPostAdd } from "react-icons/md";
import StorySection from "./StorySection";
import PostsHome from "./PostsHome";
import MenuSection from "../../components/MenuSection";
import { toast } from "react-hot-toast";

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef();
  const navigate = useNavigate();

  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
      setVideo(null); // Clear video if an image is selected
      reader.onload = () => {
        setImg(reader.result);
        navigate("/createstory", { state: { media: reader.result, type: "image" } });
      };
      
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setImg(null); // Clear image if a video is selected
      reader.onload = () => {
        setVideo(reader.result);
        navigate("/createstory", { state: { media: reader.result, type: "video" } });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Unsupported file type. Please select an image or video.");
    }
  };

  const uploadPhoto = ()=>{
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="min-h-screen">
      <div className="flex fixed justify-between w-full mx-auto p-3 bg-white border-b top-0">
        <div>
          <h1
            className="text-2xl font-semibold text-center tracking-wider"
            style={{
              fontFamily: '"Grand Hotel", cursive',
              letterSpacing: "1px",
            }}
          >
            Insta_Clone
          </h1>
        </div>
        <div className="flex gap-3 relative">
          <button ref={buttonRef} onClick={toggleMenu}>
            <RiAddBoxLine size={30} />
          </button>
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute top-10 right-0 bg-white p-4 shadow-lg z-10 rounded border"
            >
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="/createpost"
                    className="hover:bg-gray-300 px-2 py-1 rounded flex gap-4 items-center"
                  >
                    Post
                    <span>
                      <MdPostAdd size={20} />
                    </span>
                  </Link>
                </li>
                <li className="flex gap-2 justify-evenly hover:bg-gray-300 rounded px-2 py-1" onClick={uploadPhoto}>
                  Story
                  <span>
                    <MdAddCircleOutline size={20} />
                  </span>
                </li>
              </ul>
            </div>
          )}
          <Link to="/notifications">
            <CiHeart size={30} />
          </Link>
        </div>
      </div>

      <div className="mt-15 border-b-1">
        <StorySection />
      </div>

      <div className="min-h-screen">
        <PostsHome />
      </div>

      <div className="fixed bottom-0 border-t-1 w-full">
        <MenuSection />
        <input
          type="file"
          accept="image/*,video/*"
          hidden
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Home;
