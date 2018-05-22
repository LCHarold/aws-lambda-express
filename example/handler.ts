import {Use} from "aws-lambda-express";

module.exports.hello = Use(
    (req, res, next) => {
        req.middlewareOneExecuted = true;
        next();
    },
    (req, res) => {
        res.send({
            message: "hello world",
            middlewareOneExecuted: req.middlewareOneExecuted
        })
    }
);