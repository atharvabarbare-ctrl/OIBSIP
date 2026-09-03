require("dotenv").config();

const mongoose = require("mongoose");
const Pizza = require("./models/Pizza");

const pizzas = [
    {
        name: "Margherita Classic",
        description: "Classic tomato sauce, mozzarella and fresh basil.",
        category: "Classic",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        sizes: [
            { name: "Small", price: 149 },
            { name: "Medium", price: 249 },
            { name: "Large", price: 349 }
        ],
        toppings: ["Mozzarella", "Basil", "Tomato Sauce"],
        basePrice: 149,
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stock: 50
    },
    {
        name: "Paneer Tikka Fire",
        description: "Indian-style paneer tikka with onions and spicy sauce.",
        category: "Premium",
        image: "https://images.unsplash.com/photo-1593560708920-61dd98c8e0c8",
        sizes: [
            { name: "Small", price: 199 },
            { name: "Medium", price: 299 },
            { name: "Large", price: 399 }
        ],
        toppings: ["Paneer", "Onion", "Capsicum", "Spicy Sauce"],
        basePrice: 199,
        rating: 4.8,
        isVeg: true,
        isAvailable: true,
        stock: 35
    },
    {
        name: "Farmhouse Garden",
        description: "Loaded with fresh vegetables, mushrooms and mozzarella.",
        category: "Veg",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498",
        sizes: [
            { name: "Small", price: 179 },
            { name: "Medium", price: 279 },
            { name: "Large", price: 379 }
        ],
        toppings: ["Mushroom", "Onion", "Capsicum", "Corn"],
        basePrice: 179,
        rating: 4.4,
        isVeg: true,
        isAvailable: true,
        stock: 40
    },
    {
        name: "Chicken Pepper Blast",
        description: "Juicy chicken, black pepper and mozzarella.",
        category: "Non-Veg",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
        sizes: [
            { name: "Small", price: 229 },
            { name: "Medium", price: 329 },
            { name: "Large", price: 429 }
        ],
        toppings: ["Chicken", "Black Pepper", "Mozzarella"],
        basePrice: 229,
        rating: 4.7,
        isVeg: false,
        isAvailable: true,
        stock: 30
    },
    {
        name: "BBQ Chicken Supreme",
        description: "Smoky BBQ chicken with caramelized onions and cheese.",
        category: "Special",
        image: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a",
        sizes: [
            { name: "Small", price: 249 },
            { name: "Medium", price: 349 },
            { name: "Large", price: 449 }
        ],
        toppings: ["BBQ Chicken", "Onion", "Mozzarella", "BBQ Sauce"],
        basePrice: 249,
        rating: 4.9,
        isVeg: false,
        isAvailable: true,
        stock: 25
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Pizza.deleteMany({});

        await Pizza.insertMany(pizzas);

        console.log("🍕 Pizza menu seeded successfully.");
        console.log(`📦 ${pizzas.length} pizzas inserted.`);

        await mongoose.connection.close();

    } catch (error) {
        console.error("❌ Seed error:", error.message);
        process.exit(1);
    }
};

seedDatabase();
