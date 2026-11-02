import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v4 as uuidv4 } from "uuid";

function Sidebar() {
    const {
        token,
        allThreads,
        setAllThreads,
        currThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setCurrThreadId,
        setPrevChats,
        setSidebarOpen
    } = useContext(MyContext);

    const [editingThreadId, setEditingThreadId] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    const getAllThreads = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                "http://localhost:8080/api/thread",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch threads");
            }

            const res = await response.json();

            setAllThreads(
                res.map((thread) => ({
                    threadId: thread.threadId,
                    title: thread.title
                }))
            );
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [token, currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv4());
        setPrevChats([]);
        setSidebarOpen(false);
        setEditingThreadId(null);
    };

    const changeThread = async (newThreadId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/thread/${newThreadId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load chat");
            }

            const messages = await response.json();

            setCurrThreadId(newThreadId);
            setPrevChats(messages);
            setNewChat(false);
            setPrompt("");
            setReply(null);
            setSidebarOpen(false);
            setEditingThreadId(null);
        } catch (err) {
            console.error("Error loading thread:", err);
        }
    };

    const startRename = (e, thread) => {
        e.stopPropagation();
        setEditingThreadId(thread.threadId);
        setEditTitle(thread.title);
    };

    const saveRename = async (e, threadId) => {
        e.preventDefault();
        e.stopPropagation();

        const title = editTitle.trim();

        if (!title) {
            alert("Chat title cannot be empty.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/thread/${threadId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ title })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to rename chat");
            }

            setAllThreads((prev) =>
                prev.map((thread) =>
                    thread.threadId === threadId
                        ? { ...thread, title: data.title }
                        : thread
                )
            );

            setEditingThreadId(null);
            setEditTitle("");
        } catch (err) {
            console.error("Error renaming thread:", err);
            alert(err.message || "Could not rename chat.");
        }
    };

    const deleteThread = async (e, threadId) => {
        e.stopPropagation();

        const confirmed = window.confirm(
            "Are you sure you want to delete this chat?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/thread/${threadId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete thread");
            }

            setAllThreads((prev) =>
                prev.filter((thread) => thread.threadId !== threadId)
            );

            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.error("Error deleting thread:", err);
            alert("Could not delete this chat. Please try again.");
        }
    };

    return (
        <section className="sidebar">
            <button
                type="button"
                className="newChatButton"
                onClick={createNewChat}
                title="Create new chat"
            >
                <img
                    src="/src/assets/blacklogo.png"
                    alt="PROGPT logo"
                    className="logo"
                />
                <span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </span>
            </button>

            <ul className="history">
                {allThreads?.map((thread) => (
                    <li
                        key={thread.threadId}
                        onClick={() => {
                            if (editingThreadId !== thread.threadId) {
                                changeThread(thread.threadId);
                            }
                        }}
                        className={
                            thread.threadId === currThreadId
                                ? "highlighted"
                                : ""
                        }
                        title={thread.title}
                    >
                        {editingThreadId === thread.threadId ? (
                            <form
                                className="renameForm"
                                onSubmit={(e) =>
                                    saveRename(e, thread.threadId)
                                }
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    className="renameInput"
                                    value={editTitle}
                                    maxLength={60}
                                    autoFocus
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            setEditingThreadId(null);
                                        }
                                    }}
                                    aria-label="Chat title"
                                />

                                <button
                                    type="submit"
                                    className="threadAction saveAction"
                                    title="Save title"
                                    aria-label="Save title"
                                >
                                    <i className="fa-solid fa-check"></i>
                                </button>

                                <button
                                    type="button"
                                    className="threadAction"
                                    title="Cancel rename"
                                    aria-label="Cancel rename"
                                    onClick={() =>
                                        setEditingThreadId(null)
                                    }
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </form>
                        ) : (
                            <>
                                <span className="threadTitle">
                                    {thread.title}
                                </span>

                                <div className="threadActions">
                                    <button
                                        type="button"
                                        className="threadAction"
                                        title="Rename chat"
                                        aria-label={`Rename ${thread.title}`}
                                        onClick={(e) =>
                                            startRename(e, thread)
                                        }
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </button>

                                    <button
                                        type="button"
                                        className="threadAction"
                                        title="Delete chat"
                                        aria-label={`Delete ${thread.title}`}
                                        onClick={(e) =>
                                            deleteThread(
                                                e,
                                                thread.threadId
                                            )
                                        }
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <div className="sign">
                <p>By VishalKumar &hearts;</p>
            </div>
        </section>
    );
}

export default Sidebar;