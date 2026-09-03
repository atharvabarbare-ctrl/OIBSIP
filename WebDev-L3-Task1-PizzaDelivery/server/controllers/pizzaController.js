const Pizza = require("../models/Pizza");


// GET ALL PIZZAS
const getPizzas = async (req, res) => {
    try {
        const {
            search,
            category,
            veg,
            sort
        } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (veg === "true") {
            filter.isVeg = true;
        }

        if (veg === "false") {
            filter.isVeg = false;
        }

        let query = Pizza.find(filter);

        if (sort === "price-low") {
            query = query.sort({
                basePrice: 1
            });
        }

        if (sort === "price-high") {
            query = query.sort({
                basePrice: -1
            });
        }

        if (sort === "rating") {
            query = query.sort({
                rating: -1
            });
        }

        const pizzas = await query;

        res.json({
            success: true,
            count: pizzas.length,
            pizzas
        });

    } catch (error) {
        console.error(
            "Get pizzas error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch pizzas."
        });
    }
};


// GET SINGLE PIZZA
const getPizza = async (req, res) => {
    try {
        const pizza = await Pizza.findById(
            req.params.id
        );

        if (!pizza) {
            return res.status(404).json({
                success: false,
                message: "Pizza not found."
            });
        }

        res.json({
            success: true,
            pizza
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid pizza ID."
        });
    }
};


// CREATE PIZZA
const createPizza = async (req, res) => {
    try {
        const pizza = await Pizza.create(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Pizza created successfully.",
            pizza
        });

    } catch (error) {
        console.error(
            "Create pizza error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE PIZZA
const updatePizza = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            image,
            basePrice,
            isVeg,
            isAvailable,
            stock,
            toppings,
            sizes
        } = req.body;

        const pizza = await Pizza.findById(
            req.params.id
        );

        if (!pizza) {
            return res.status(404).json({
                success: false,
                message: "Pizza not found."
            });
        }


        if (name !== undefined) {
            pizza.name = name;
        }


        if (description !== undefined) {
            pizza.description = description;
        }


        if (category !== undefined) {
            pizza.category = category;
        }


        if (image !== undefined) {
            pizza.image = image;
        }


        if (basePrice !== undefined) {
            const parsedBasePrice =
                Number(basePrice);

            if (
                !Number.isFinite(
                    parsedBasePrice
                ) ||
                parsedBasePrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid base price."
                });
            }

            pizza.basePrice =
                parsedBasePrice;
        }


        if (isVeg !== undefined) {
            pizza.isVeg =
                Boolean(isVeg);
        }


        if (isAvailable !== undefined) {
            pizza.isAvailable =
                Boolean(isAvailable);
        }


        if (stock !== undefined) {
            const parsedStock =
                Number(stock);

            if (
                !Number.isFinite(
                    parsedStock
                ) ||
                parsedStock < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid stock."
                });
            }

            pizza.stock =
                parsedStock;
        }


        if (Array.isArray(toppings)) {
            pizza.toppings =
                toppings;
        }


        if (Array.isArray(sizes)) {

            const formattedSizes =
                sizes.map(size => {

                    const price =
                        Number(size.price);

                    if (
                        !Number.isFinite(
                            price
                        ) ||
                        price < 0
                    ) {
                        throw new Error(
                            "Invalid size price."
                        );
                    }

                    return {
                        name: size.name,
                        price
                    };

                });

            pizza.sizes =
                formattedSizes;
        }


        const updatedPizza =
            await pizza.save();


        res.json({
            success: true,
            message: "Pizza updated successfully.",
            pizza: updatedPizza
        });

    } catch (error) {

        console.error(
            "Update pizza error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE PIZZA
const deletePizza = async (req, res) => {
    try {
        const pizza =
            await Pizza.findByIdAndDelete(
                req.params.id
            );

        if (!pizza) {
            return res.status(404).json({
                success: false,
                message: "Pizza not found."
            });
        }

        res.json({
            success: true,
            message: "Pizza deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete pizza error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: "Invalid pizza ID."
        });
    }
};


module.exports = {
    getPizzas,
    getPizza,
    createPizza,
    updatePizza,
    deletePizza
};