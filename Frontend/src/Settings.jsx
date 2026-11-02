import React, { useState } from "react";
import "./Settings.css";

export default function Settings({ user, onBack, theme, setTheme }) {
    const [activeTab, setActiveTab] = useState("General");

    const tabs = [
        { name: "General", icon: "fa-sliders" },
        { name: "Personalization", icon: "fa-palette" },
        { name: "Data controls", icon: "fa-database" },
        { name: "Security", icon: "fa-shield-halved" },
        { name: "Account", icon: "fa-user" }
    ];

    return (
        <div className="settingsPage">
            <header className="settingsTopbar">
                <button
                    className="settingsBackBtn"
                    onClick={onBack}
                    aria-label="Back to chat"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <span className="settingsBrand">PROGPT</span>
                <span className="settingsDivider">/</span>
                <span className="settingsTopTitle">Settings</span>
            </header>

            <div className="settingsLayout">
                <aside className="settingsNavigation">
                    <h2>Settings</h2>

                    <nav>
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                className={`settingsNavItem ${
                                    activeTab === tab.name ? "active" : ""
                                }`}
                                onClick={() => setActiveTab(tab.name)}
                            >
                                <i className={`fa-solid ${tab.icon}`}></i>
                                <span>{tab.name}</span>
                                {activeTab === tab.name && (
                                    <i className="fa-solid fa-chevron-right navArrow"></i>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="settingsNavFooter">
                        <div className="settingsAvatar">
                            {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="settingsUserInfo">
                            <strong>{user?.name || "User"}</strong>
                            <span>{user?.email || ""}</span>
                        </div>
                    </div>
                </aside>

                <main className="settingsContent">
                    <div className="settingsContentInner">
                        <h1>{activeTab}</h1>

                        {activeTab === "General" && (
                            <>
                                <section className="settingsSection">
                                    <h3>Appearance</h3>
                                    <p className="settingsDescription">
                                        Choose how PROGPT looks on your device.
                                    </p>

                                    <div className="settingsOptionRow">
                                        <div>
                                            <strong>Theme</strong>
                                            <p>Customize your visual experience.</p>
                                        </div>

                                       
                                        <div className="themeChoices">
                                           <button
                                              type="button"
                                              className={`themeChoice ${theme === "dark" ? "selected" : ""}`}
                                              onClick={() => {
                                                 setTheme("dark");
                                                 localStorage.setItem("progpt_theme", "dark");
                                                }}
                                             >
                                             <i className="fa-solid fa-moon"></i>
                                              <span>Dark</span>
                                             {theme === "dark" && (
                                               <i className="fa-solid fa-check themeCheck"></i>
                                             )}
                                           </button>

                                           <button
                                             type="button"
                                             className={`themeChoice ${theme === "light" ? "selected" : ""}`}
                                             onClick={() => {
                                                 setTheme("light");
                                                localStorage.setItem("progpt_theme", "light");
                                              }}
                                             >
                                             <i className="fa-solid fa-sun"></i>
                                             <span>Light</span>
                                             {theme === "light" && (
                                             <i className="fa-solid fa-check themeCheck"></i>
                                             )}
                                            </button>
                                          </div>

                                    </div>
                                </section>

                                <section className="settingsSection">
                                    <h3>Language</h3>
                                    <div className="settingsOptionRow">
                                        <div>
                                            <strong>App language</strong>
                                            <p>Language used for the interface.</p>
                                        </div>
                                        <span className="settingsStaticValue">
                                            English
                                        </span>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === "Personalization" && (
                            <section className="settingsSection">
                                <h3>Personalization</h3>
                                <p className="settingsDescription">
                                    Personalization options for your PROGPT
                                    experience will appear here.
                                </p>
                            </section>
                        )}

                        {activeTab === "Data controls" && (
                            <section className="settingsSection">
                                <h3>Data controls</h3>
                                <p className="settingsDescription">
                                    Manage how your conversations and account
                                    data are handled.
                                </p>
                                <div className="settingsOptionRow">
                                    <div>
                                        <strong>Chat history</strong>
                                        <p>
                                            Your conversations are saved to
                                            your account.
                                        </p>
                                    </div>
                                    <span className="settingsStatus">
                                        Enabled
                                    </span>
                                </div>
                            </section>
                        )}

                        {activeTab === "Security" && (
                            <section className="settingsSection">
                                <h3>Security</h3>
                                <p className="settingsDescription">
                                    Your account security information.
                                </p>
                                <div className="settingsOptionRow">
                                    <div>
                                        <strong>Signed in as</strong>
                                        <p>{user?.email || "No email available"}</p>
                                    </div>
                                    <i className="fa-solid fa-shield-halved settingsSecureIcon"></i>
                                </div>
                            </section>
                        )}

                        {activeTab === "Account" && (
                            <>
                                <section className="settingsSection">
                                    <h3>Profile</h3>

                                    <div className="settingsProfile">
                                        <div className="settingsLargeAvatar">
                                            {(user?.name || "U")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <strong>{user?.name || "User"}</strong>
                                            <p>{user?.email || ""}</p>
                                        </div>
                                    </div>

                                    <div className="settingsField">
                                        <label>Name</label>
                                        <div className="settingsReadOnly">
                                            {user?.name || "User"}
                                        </div>
                                    </div>

                                    <div className="settingsField">
                                        <label>Email address</label>
                                        <div className="settingsReadOnly">
                                            {user?.email || "No email available"}
                                        </div>
                                    </div>

                                    <p className="settingsDescription">
                                        Profile details are currently
                                        read-only.
                                    </p>
                                </section>
                            </>
                        )}

                        <div className="settingsBottomNote">
                            <i className="fa-solid fa-circle-info"></i>
                            <span>
                                Some settings may not be available yet.
                            </span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}