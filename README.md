# aws-lambda-express
Express for AWS Lambda. Based on Roman Kinyakin's blog post: https://viblo.asia/p/expressjs-style-flow-for-aws-lambda-vyDZOXa9lwj. Because aws-serverless-express wasn't working for my purposes.

## Installation
```
npm install aws-lambda-express --save
```

## Usage
Usage is similar to the app.use() pattern you may be used to with express, just a little bit more verbose:
```
import { Use } from "aws-lambda-express"

module.exports.testHttp = Use(
  (req, res, next) => {
    req.middlewareOneExecuted = true
    next()
  },
  (req, res) => {
    res.send({
      m1: req.middlewareOneExecuted,
      m2: true,
    })
  }
)
```

## Example
The example uses ts-node and serverless-offline. Clone this repo. Then from \example folder, run the example from the command line with:
```
npm run start
```

Then interact with the endpoint at http://localhost:3000.

For example, hit http://localhost:3000/hello