import { useEffect, useState } from "react";
import { getPizzas } from "../services/api";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";

function Menu() {
    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { addToCart } = useCart();

    useEffect(() => {
        const loadPizzas = async () => {
            try {
                const data = await getPizzas();

                if (data.success) {
                    setPizzas(data.pizzas);
                } else {
                    setError("Unable to load menu.");
                }
            } catch (err) {
                setError("Backend connection failed.");
            } finally {
                setLoading(false);
            }
        };

        loadPizzas();
    }, []);

    if (loading) {
        return (
            <main className="menu-page">
                <h1>Loading delicious pizzas...</h1>
            </main>
        );
    }

    if (error) {
        return (
            <main className="menu-page">
                <h1>{error}</h1>
                <p>
                    Make sure PizzaHub backend is running on port 5000.
                </p>
            </main>
        );
    }

    return (
        <main className="menu-page">

            <section className="menu-header">
                <p className="eyebrow">OUR MENU</p>

                <h1>
                    Choose your
                    <br />
                    <span>perfect pizza.</span>
                </h1>

                <p>
                    Handcrafted pizzas made with premium ingredients.
                </p>
            </section>

            <section className="pizza-grid">

                {pizzas.map((pizza) => (

                    <article
                        className="pizza-card"
                        key={pizza._id}
                    >

                        <img
                            src={pizza.image}
                            alt={pizza.name}
                        />

                        <div className="pizza-content">

                            <div className="pizza-top">

                                <span className="pizza-category">
                                    {pizza.category}
                                </span>

                                <span className="pizza-rating">
                                    ★ {pizza.rating}
                                </span>

                            </div>

                            <h2>{pizza.name}</h2>

                            <p>
                                {pizza.description}
                            </p>

                            <div className="pizza-bottom">

                                <strong>
                                    From ₹{pizza.basePrice}
                                </strong>

                                <button
                                    onClick={() => addToCart(pizza)}
                                >
                                    <ShoppingBag size={17} />
                                    Add
                                </button>

                            </div>

                        </div>

                    </article>

                ))}

            </section>

        </main>
    );
}

export default Menu;
