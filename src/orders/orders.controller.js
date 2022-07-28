
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//retrieve a list of all orders
function list(req, res) {
    res.json({ data: orders });
};

//middleware function to validate that other properties are in req
function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            res.locals.propertyName = propertyName;
            return next();
        }
        next({ status: 400, message: `Order must include a ${propertyName}`});
    };
};

/*middleware functions-additional validations*/
function deliverToPropertyIsValid(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo === "") {
        return next({ status: 400, message: `Order must include a deliverTo`});
    };
    next();
};
//mobileNumber property validation
function mobileNumberPropertyIsValid(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber === "") {
        return next({ status: 400, message: `Order must include a mobileNumber`});
    };
};
//dishes property is an array validation
function dishesPropertyArray(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (Array.isArray(dishes)) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
};
//dishes property is empty validation
function dishesPropertyEmpty(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes.length > 0) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
};
//dish quantity missing validations
function dishQuantityPropertyMissing(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    const quantityMissing = dishes.find((dish) => !dish.quantity);
    if (quantityMissing) {
      quantityMissing.index = dishes.indexOf(quantityMissing);
      next({
        status: 400,
        message: `Dish ${quantityMissing.index} must have a quantity that is an integer greater than 0.`,
      });
    }
    return next();
};
//validation to check if dish quantity is zero
function dishQuantityisZero(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    const quantityLessThanOne = dishes.find((dish) => dish.quantity < 1);
    if (quantityLessThanOne) {
      quantityLessThanOne.index = dishes.indexOf(quantityLessThanOne);
      next({
        status: 400,
        message: `Dish ${quantityLessThanOne.index} must have a quantity that is an integer greater than 0.`,
      });
    }
  
    return next();
};
//validation to check if dish quantity is an integer
function dishQuantityPropertyNotInteger(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    const quantityNotInteger = dishes.find(
      (dish) => !Number.isInteger(dish.quantity)
    );
    if (quantityNotInteger) {
      quantityNotInteger.index = dishes.indexOf(quantityNotInteger);
      next({
        status: 400,
        message: `Dish ${quantityNotInteger.index} must have a quantity that is an integer greater than 0.`,
      });
    }
    return next();
};

//create a new order
function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newId = new nextId;
    const newOrder = {
        id: newId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

//middleware for orders by ID

//check if order exists
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
};

function read(req, res) {
    res.json({ data: res.locals.order });
};


module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        dishQuantityPropertyMissing,
        dishQuantityPropertyNotInteger,
        dishQuantityisZero,
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        dishesPropertyArray,
        dishesPropertyEmpty,
        create,
    ],
    list,
    read: [orderExists, read],
    
};
