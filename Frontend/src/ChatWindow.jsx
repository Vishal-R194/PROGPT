
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";

const API_URL = import.meta.env.VITE_API_URL;

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat,
        setSidebarOpen,
        token,
        handleLogout,
        setCurrentPage
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getReply = async () => {
        const message = prompt.trim();

        if (!message || loading) return;

        setLoading(true);
        setNewChat(false);
        setPrompt("");

        setPrevChats((prevChats) => [
            ...prevChats,
            { role: "user", content: message }
        ]);

        try {
            const response = await fetch(
                `${API_URL}/api/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: prompt,
                        threadId: currThreadId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get AI response");
            }

            if (typeof data.reply !== "string") {
                throw new Error("The server did not return an AI reply");
            }

            setReply(data.reply);

            setPrevChats((prevChats) => [
                ...prevChats,
                { role: "assistant", content: data.reply }
            ]);
        } catch (err) {
            console.error("Chat error:", err);

            setPrevChats((prevChats) => [
                ...prevChats,
                {
                    role: "assistant",
                    content: err.message || "Sorry, something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileClick = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <button
                    type="button"
                    className="menuButton"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    aria-label="Toggle sidebar"
                    title="Open chat history"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                <span className="brandName">
                    PROGPT <i className="fa-solid fa-chevron-down"></i>
                </span>

                <div
                    className="userIconDiv"
                    onClick={handleProfileClick}
                    role="button"
                    tabIndex={0}
                    aria-label="User menu"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            handleProfileClick();
                        }
                    }}
                >
                    <span className="userIcon">
                        <i className="fa-solid fa-user"></i>
                    </span>
                </div>
            </div>

            {isOpen && (
               <div className="dropDown">
                 <div
                   className="dropDownItem"
                   role="button"
                   tabIndex={0}
                   onClick={() => {
                     setIsOpen(false);
                      // Open Settings
                      setCurrentPage("settings");
                    }}
                   onKeyDown={(e) => {
                     if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsOpen(false);
                      setCurrentPage("settings");
                     }
                    }}
                   >
                     <i className="fa-solid fa-gear"></i> Settings
                </div>


                 <div
                    className="dropDownItem"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                       setIsOpen(false);
                       setCurrentPage("upgrade");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setIsOpen(false);
                            setCurrentPage("upgrade");
                         }
                        }}
                     >
                    <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                  </div>

                 <div
                   className="dropDownItem"
                   onClick={handleLogout}
                   role="button"
                   tabIndex={0}
                   onKeyDown={(e) => {
                   if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLogout();
                     }
                   }}
                   >
                   <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                  </div>
                </div>
)}

            <Chat />

            {loading && (
               <div className="thinkingIndicator">
                  <ScaleLoader color="#b4b4b4" height={18} />
                  <span>PROGPT is thinking...</span>
               </div>
            )}

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        disabled={loading}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                getReply();
                            }
                        }}
                    />

                    <div
                        id="submit"
                        onClick={getReply}
                        title="Send message"
                        role="button"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>

                <p className="info">
                    PROGPT can make mistakes. Check important info.
                    See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
