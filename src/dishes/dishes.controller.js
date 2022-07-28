const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//Retrieve a list of all dishes
function list(req, res) {
    res.json({ data: dishes });
};

//middleware funciton to validate that other properties are in request
function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({ status: 400, message: `Dish must include a ${propertyName}`});
    };
};

/*middleware functions-additional validations*/
function namePropertyIsValid(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name === "") {
        return next({ status: 400, message: `Dish must include a name`});
    };
    next();
};

function descriptionPropertyIsValid(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description === "") {
        return next({ status: 400, message: `Dish must include a description`});
    };
    next();
};

function pricePropertyIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price <= 0) {
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    } else if (Number.isInteger(price) && price > 0) {
        return next();
    }
    next({
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`
    });
};

function imageUrlPropertyEmpty(request, response, next) {
    const { data: { image_url } = {} } = request.body;
    if (image_url === "") {
      next({
        status: 400,
        message: "Dish must include an image_url."
      });
    }
    return next();
};

//Create a new dish
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newId = new nextId;
    const newDish = {
        id: newId,
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

//check if dish exists
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status:404,
        message: `Dish id is not found: ${dishId}`,
    });
};

//check if dish ID matches
function dishIdMatch(req, res, next) {
    const { data: { id } = {} } = req.body;
    const { dishId } = req.params;
  
    if (id === dishId || !id) {
        res.locals.dishId = dishId;
        return next();
    }
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId} `,
    });
};

//retrieve dish by ID
function read(req, res, next) {
    res.json({ data: res.locals.dish });
};

//update a dish by ID
function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;

    //update the dish
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
};

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        imageUrlPropertyEmpty,
        pricePropertyIsValid,
        descriptionPropertyIsValid,
        namePropertyIsValid,
        create,
    ],
    list,
    read: [dishExists, read],
    update: [
        dishExists,
        dishIdMatch,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        imageUrlPropertyEmpty,
        pricePropertyIsValid,
        descriptionPropertyIsValid,
        namePropertyIsValid,
        update,
    ],
    dishExists,
};