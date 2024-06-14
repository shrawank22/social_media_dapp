import { useState, useContext } from "react";
import "./PostContainer.css";
import EmojiPicker from 'emoji-picker-react';
import postContext from '../context/post/postContext';

function PostContainer() {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const context = useContext(postContext);
    const { postText, viewPrice, fileURLs, setFileURLs, setPostText, setSelectedFiles, setViewPrice, addPostHandler, isPosting } = context;

    const updatePostText = (event) => {
        setPostText(event.target.value);
    };

    const updateViewPrice = (event) => {
        const value = event.target.value;
        if (!isNaN(value) && value.match(/^(\d+)?([.]?\d+)?$/)) {
            setViewPrice(value);
        }
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const addEmojiToPostText = (emoji) => {
        setPostText(prevPostText => prevPostText + emoji.emoji);
    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        const filesArray = Array.from(files); // Convert FileList to an array

        // filesArray.forEach(file => {
        //     console.log(`File: ${file.name}, Size: ${file.size} bytes`);
        // });

        const urls = filesArray.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
        setFileURLs(urls);

        setSelectedFiles(filesArray);
    };

    return (

        <>
            <form onSubmit={(e) => addPostHandler(e)} className="mb-5">
                <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-gray-50 rounded-t-lg">
                        <label htmlFor="comment" className="sr-only">What's Happening</label>
                        <textarea id="comment" rows="4" className="w-full px-0 text-sm text-gray-900 bg-gray-50 border-0 focus:ring-0" placeholder="What's happening?" value={postText} onChange={updatePostText} required ></textarea>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-200">
                        <div className="flex ps-0 space-x-3 rtl:space-x-reverse sm:ps-2">
                            <button type="button" onClick={toggleEmojiPicker} className={`inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 ${showEmojiPicker && "bg-gray-100 hover:bg-gray-300"}`}>
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 23 23">
                                    <path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.011 9.011 0 0 1-9 9zm6-8a6 6 0 0 1-12 0 1 1 0 0 1 2 0 4 4 0 0 0 8 0 1 1 0 0 1 2 0zM8 10V9a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm6 0V9a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0z" />
                                </svg>
                                <span className="sr-only">Attach file</span>
                            </button>
                            {
                                showEmojiPicker && (
                                    <div className="absolute mt-5 z-10">
                                        <EmojiPicker className="emoji-picker" onEmojiClick={(emoji) => addEmojiToPostText(emoji)} height={400} width={250} />
                                    </div>
                                )
                            }
                            <label htmlFor="media" className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100">
                                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                </svg>
                            </label>
                            <input accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime" type="file" className="d-none" id="media" onChange={handleFileChange} multiple />
                            <ul>
                                {fileURLs.map((file, index) => (
                                    <li key={index}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-row items-center">
                                <input
                                    onChange={updateViewPrice}
                                    type="number"

                                    id="viewprice"
                                    min={0}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ml-2"
                                    placeholder="Enter View Price"
                                    value={viewPrice}
                                    required
                                />
                                <div className="ml-3 text-xs">Enter 0, if free</div>
                            </div>

                        </div>
                        <button disabled={isPosting} type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800">
                            Post
                        </button>
                    </div>
                </div>
            </form>
        </>


    );
}

export default PostContainer;