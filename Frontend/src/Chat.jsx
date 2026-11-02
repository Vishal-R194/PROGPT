
import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function CodeBlock({ children }) {
    const [copied, setCopied] = useState(false);

    const codeText = React.Children.toArray(
        children?.props?.children
    ).join("");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeText);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    return (
        <div className="codeBlock">
            <div className="codeHeader">
                <span>Code</span>

                <button
                    type="button"
                    className="copyCodeButton"
                    onClick={handleCopy}
                    aria-label={copied ? "Code copied" : "Copy code"}
                    title={copied ? "Copied!" : "Copy code"}
                >
                    <i
                        className={`fa-solid ${
                            copied ? "fa-check" : "fa-copy"
                        }`}
                    ></i>
                </button>
            </div>

            <pre>{children}</pre>
        </div>
    );
}

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    const chatsEndRef = useRef(null);

    useEffect(() => {
        chatsEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [prevChats, latestReply]);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        const words = reply.split(/(\s+)/);
        let idx = 0;

        setLatestReply("");

        const interval = setInterval(() => {
            idx++;
            setLatestReply(words.slice(0, idx).join(""));

            if (idx >= words.length) {
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [reply]);

    return (
        <>
            {newChat && <h1>Start a New Chat!</h1>}

            <div className="chats">
                {prevChats?.map((chat, idx) => {
                    const isLatestAssistant =
                        chat.role === "assistant" &&
                        idx === prevChats.length - 1 &&
                        reply !== null &&
                        chat.content === reply;

                    return (
                        <div
                            className={
                                chat.role === "user" ? "userDiv" : "gptDiv"
                            }
                            key={`${idx}-${chat.role}`}
                        >
                            {chat.role === "user" ? (
                                <p className="userMessage">
                                    {chat.content}
                                </p>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                        pre: CodeBlock
                                    }}
                                >
                                    {isLatestAssistant &&
                                    latestReply !== null
                                        ? latestReply
                                        : chat.content}
                                </ReactMarkdown>
                            )}
                        </div>
                    );
                })}
                    <div ref={chatsEndRef} />
            </div>
        </>
    );
}

export default Chat;
