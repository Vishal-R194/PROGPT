
import { useState } from "react";
import "./UpgradePlan.css";

export default function UpgradePlan({ user, theme, onBack }) {
    const [message, setMessage] = useState("");

    const plans = [
        {
            name: "Free",
            price: "₹0",
            period: "forever",
            description: "For everyday AI conversations.",
            features: [
                "Basic AI conversations",
                "Chat history",
                "Standard response speed"
            ],
            button: "Current plan",
            current: true
        },
        {
            name: "Pro",
            price: "₹499",
            period: "per month",
            description: "For people who want more from AI.",
            features: [
                "Everything in Free",
                "Higher usage limits",
                "Faster responses",
                "Priority access to new features"
            ],
            button: "Choose Pro",
            popular: true
        },
        {
            name: "Premium",
            price: "₹999",
            period: "per month",
            description: "For demanding everyday workflows.",
            features: [
                "Everything in Pro",
                "Higher usage limits",
                "Advanced features",
                "Priority support"
            ],
            button: "Choose Premium"
        }
    ];

    const handleChoosePlan = (planName) => {
        setMessage(
            `${planName} plan selected. Payment is not connected yet.`
        );
    };

    return (
        <div className="upgradePage">
            <header className="upgradeTopbar">
                <button
                    className="upgradeBackBtn"
                    onClick={onBack}
                    aria-label="Back to chat"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <span className="upgradeBrand">PROGPT</span>
                <span className="upgradeDivider">/</span>
                <span className="upgradeHeading">Upgrade Plan</span>

                <div className="upgradeUser">
                    <div className="upgradeAvatar">
                        {(user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <main className="upgradeContent">
                <div className="upgradeIntro">
                    <span className="upgradeEyebrow">
                        <i className="fa-solid fa-sparkles"></i>
                        PROGPT PLANS
                    </span>

                    <h1>Choose the plan that works for you</h1>

                    <p>
                        Get more out of your AI conversations with a plan
                        that fits your needs.
                    </p>
                </div>

                <div className="upgradeCards">
                    {plans.map((plan) => (
                        <section
                            className={`upgradeCard ${
                                plan.popular ? "popularPlan" : ""
                            }`}
                            key={plan.name}
                        >
                            {plan.popular && (
                                <div className="popularBadge">
                                    Most popular
                                </div>
                            )}

                            <h2>{plan.name}</h2>

                            <p className="planDescription">
                                {plan.description}
                            </p>

                            <div className="planPrice">
                                <strong>{plan.price}</strong>
                                <span>{plan.period}</span>
                            </div>

                            <button
                                className={`planButton ${
                                    plan.popular ? "primaryPlanButton" : ""
                                }`}
                                disabled={plan.current}
                                onClick={() => handleChoosePlan(plan.name)}
                            >
                                {plan.current ? (
                                    <>
                                        <i className="fa-solid fa-check"></i>
                                        {plan.button}
                                    </>
                                ) : (
                                    plan.button
                                )}
                            </button>

                            <div className="planDivider"></div>

                            <p className="featuresTitle">
                                What's included
                            </p>

                            <ul className="planFeatures">
                                {plan.features.map((feature) => (
                                    <li key={feature}>
                                        <i className="fa-solid fa-check"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                {message && (
                    <div className="upgradeMessage" role="status">
                        <i className="fa-solid fa-circle-info"></i>
                        <span>{message}</span>
                        <button
                            onClick={() => setMessage("")}
                            aria-label="Dismiss message"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                <p className="upgradeDisclaimer">
                    Plan prices and features are demo values. Payments and
                    subscriptions are not enabled yet.
                </p>
            </main>
        </div>
    );
}
