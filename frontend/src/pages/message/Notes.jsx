import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { IoMdCloseCircleOutline } from "react-icons/io";

const Notes = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["authUser"]);
  const inputRef = useRef();

  const [notes, setNotes] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [noteMenu, setNoteMenu] = useState(false);
  const [currentNotes, setCurrentNotes] = useState([]);
  const { mutate: createNote, isPending: isNoteUploading } = useMutation({
    mutationFn: async ({ notes }) => {
      try {
        const formData = new FormData();
        if (Array.isArray(notes)) {
          notes.forEach((file) => formData.append("notes", file));
        } else {
          formData.append("notes", notes);
        }
        const res = await fetch(`${baseUrl}/api/users/updatenote`, {
          method: "POST",
          credentials: "include",
          body: formData,
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
    onSuccess: () => {
      toast.success("Notes added successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const checkNote = () => {
    uploadPhoto();
    setNoteMenu(true);
  };

  const uploadPhoto = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNotes(file);
  };

  const handleProfileClick = (notesArray) => {
    if (Array.isArray(notesArray) && notesArray.length > 0) {
      setCurrentNotes(notesArray);
      setShowNote(true);
    } else {
      toast.error("No notes uploaded yet!");
    }
  };

  
  
  return (
    <div className="flex gap-2 mt-7 p-2">
      {noteMenu && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 mx-2">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full border-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Note</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setNotes("");
                  setNoteMenu(false);
                }}
              >
                <IoMdCloseCircleOutline className="text-2xl" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!notes) {
                  toast.error("Please select a note file first");
                  return;
                }
                createNote({ notes });
                setNoteMenu(false);
                setNotes("");
              }}
            >
              {notes ? (
                <div className="mb-4">
                  <p className="mb-2 text-sm">Selected file: {notes.name}</p>
                  <audio
                    controls
                    className="w-full"
                    src={URL.createObjectURL(notes)}
                  />
                </div>
              ) : (
                <div className="mb-4 p-8 border-2 border-dashed border-gray-300 text-center rounded-lg">
                  <p className="text-gray-500 mb-2">No file selected</p>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    onClick={uploadPhoto}
                  >
                    Choose File
                  </button>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded"
                  onClick={() => {
                    setNotes("");
                    setNoteMenu(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
                  disabled={isNoteUploading || !notes}
                >
                  {isNoteUploading ? "Uploading..." : "Upload Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center relative">
        <img
          src={user?.profileImg || "/avatar-placeholder.png"}
          alt="profile"
          className="w-18 h-18 rounded-full "
          onClick={() => handleProfileClick(user?.notes)}
        />
        <p
          className="text-sm absolute -top-4 -left-1 bg-white border rounded-lg p-1"
          onClick={checkNote}
        >
          Notes
        </p>
        <p>Your notes</p>
        <input
          type="file"
          accept=".mp3"
          hidden
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex gap-3">
        {user?.followers?.length > 0 ? (
          user.followers.map((follower) =>
            follower?.notes?.length > 0
              ? (
                  <div key={follower._id} className="mb-4 flex flex-col items-center">
                    <img
                      src={follower?.profileImg || "/avatar-placeholder.png"}
                      alt="follower"
                      className="w-18 h-18 rounded-full cursor-pointer"
                      onClick={() => handleProfileClick(follower.notes)}
                    />
                    <p>{follower.username}</p>
                  </div>
                )
              : null
          )
        ) : (
          <p className="text-gray-500">No followers found.</p>
        )}
      </div>

      <div className="fixed bottom-1 p-1 ml-4">
        {showNote && (
          <div className="fixed bottom-2 left-2 right-2 bg-white border p-2 rounded-lg flex gap-2 items-center z-50">
            <audio controls autoPlay className="flex-1">
              {currentNotes.map((noteUrl, index) => (
                <source key={index} src={noteUrl} type="audio/mpeg" />
              ))}
            </audio>
            <IoMdCloseCircleOutline
              className="text-2xl cursor-pointer"
              onClick={() => {
                setShowNote(false);
                setCurrentNotes([]);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;

{
  /* <input
          type="file"
          accept=".flac"
          onChange={(e) => setNotes(e.target.files[0])}
        />
        <button
          onClick={() => createNote({ notes })}
          disabled={isNoteUploading}
          className="text-white bg-blue-500 p-2 rounded"
        >
          {isNoteUploading ? "Uploading..." : "Upload Note"}
        </button> */
}
