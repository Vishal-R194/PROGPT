import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Auth from "./Auth.jsx";
import Settings from "./Settings.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import UpgradePlan from "./UpgradePlan.jsx";

function App() {
    const [token, setToken] = useState(
        () => localStorage.getItem("progpt_token")
    );

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("progpt_user"));
        } catch {
            return null;
        }
    });

    // Remember the selected theme
    const [theme, setTheme] = useState(
        () => localStorage.getItem("progpt_theme") || "dark"
    );

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);
    const [currThreadId, setCurrThreadId] = useState(uuidv4());
    const [prevChats, setPrevChats] = useState([]);
    const [newChat, setNewChat] = useState(true);
    const [allThreads, setAllThreads] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState("chat");

    const handleLogin = (newToken, newUser) => {
        localStorage.setItem("progpt_token", newToken);
        localStorage.setItem("progpt_user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
        setCurrThreadId(uuidv4());
        setPrompt("");
        setReply(null);
        setPrevChats([]);
        setAllThreads([]);
        setNewChat(true);
        setCurrentPage("chat");
    };

    const handleLogout = () => {
        localStorage.removeItem("progpt_token");
        localStorage.removeItem("progpt_user");

        setToken(null);
        setUser(null);
        setPrompt("");
        setReply(null);
        setPrevChats([]);
        setAllThreads([]);
        setCurrThreadId(uuidv4());
        setNewChat(true);
        setSidebarOpen(false);
        setCurrentPage("chat");
    };

    if (!token || !user) {
        return <Auth onLogin={handleLogin} />;
    }

    const providerValues = {
        token,
        user,
        handleLogout,
        theme,
        setTheme,
        currentPage,
        setCurrentPage,
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setCurrThreadId,
        newChat,
        setNewChat,
        prevChats,
        setPrevChats,
        allThreads,
        setAllThreads,
        sidebarOpen,
        setSidebarOpen
    };

    return (
        <div className={`app ${sidebarOpen ? "sidebar-open" : ""} theme-${theme}`}>
            <MyContext.Provider value={providerValues}>
                {currentPage === "settings" ? (
                    <Settings
                        user={user}
                        theme={theme}
                        setTheme={setTheme}
                        onBack={() => setCurrentPage("chat")}
                    />
                ) : currentPage === "upgrade" ? (
                    <UpgradePlan
                       user={user}
                       theme={theme}
                       onBack={() => setCurrentPage("chat")}
                    />
                ) : (
                    <>
                        <Sidebar />
                        <ChatWindow />
                    </>
                )}
            </MyContext.Provider>
        </div>
    );
}

export default App;