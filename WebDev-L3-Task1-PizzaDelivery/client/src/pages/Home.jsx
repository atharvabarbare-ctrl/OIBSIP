import { Link } from "react-router-dom";
import {
    ArrowRight,
    Flame,
    Clock,
    Star,
    Pizza
} from "lucide-react";

function Home() {
    return (
        <main className="home">

            {/* =========================
                HERO SECTION
            ========================= */}

            <section className="hero">

                <div className="hero-content">

                    <div className="badge">
                        <Flame size={16} />
                        Freshly baked. Always delicious.
                    </div>


                    <h1>
                        Your pizza.
                        <br />
                        <span>Your way.</span>
                    </h1>


                    <p>
                        Handcrafted pizzas, bold flavours and
                        premium ingredients delivered straight
                        to your door.
                    </p>


                    {/* =========================
                        HERO ACTIONS
                    ========================= */}

                    <div className="hero-actions">

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                                alignItems: "center"
                            }}
                        >

                            {/* EXPLORE MENU */}

                            <Link
                                to="/menu"
                                className="primary-btn"
                            >
                                Explore Menu
                                <ArrowRight size={19} />
                            </Link>


                            {/* BUILD YOUR PIZZA */}

                            <Link
                                to="/pizza-builder"
                                className="secondary-btn"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                <Pizza size={18} />
                                Build Your Pizza
                            </Link>

                        </div>


                        {/* DELIVERY INFO */}

                        <div className="delivery-info">

                            <Clock size={18} />

                            <div>

                                <strong>
                                    30 min
                                </strong>

                                <small>
                                    Average delivery
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* =========================
                        RATING
                    ========================= */}

                    <div className="rating">

                        <div className="stars">
                            ★★★★★
                        </div>

                        <span>
                            4.9/5 from pizza lovers
                        </span>

                    </div>

                </div>


                {/* =========================
                    HERO PIZZA
                ========================= */}

                <div className="hero-pizza">

                    <div className="pizza-glow"></div>


                    <img
                        src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85"
                        alt="Fresh Pizza"
                    />


                    <div className="floating-card">

                        <Star
                            size={18}
                            fill="currentColor"
                        />

                        <div>

                            <strong>
                                4.9
                            </strong>

                            <small>
                                Top rated
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                FEATURES
            ========================= */}

            <section className="features">

                <div>

                    <span>
                        01
                    </span>

                    <h3>
                        Premium Ingredients
                    </h3>

                    <p>
                        Fresh ingredients in every bite.
                    </p>

                </div>


                <div>

                    <span>
                        02
                    </span>

                    <h3>
                        Made To Order
                    </h3>

                    <p>
                        Your pizza, prepared just for you.
                    </p>

                </div>


                <div>

                    <span>
                        03
                    </span>

                    <h3>
                        Fast Delivery
                    </h3>

                    <p>
                        Hot pizza at your doorstep.
                    </p>

                </div>

            </section>

        </main>
    );
}

export default Home;