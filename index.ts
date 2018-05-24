import {Request, Response} from "./HttpInternals";
import {Pipeline} from "./Pipeline";

export function Use(...middleware) {
    return (event, context, callback) => {
        const req = Request(event);
        req.headers["apigateway.event"] = JSON.stringify(event);
        const res = Response(req);
        req.context = context;
        req.res = res;

        // This is required to avoid multiple callback executions.
        let finished = false;

        res.on('finish', () => {
            if (finished) { return; }
            finished = true;
            callback(null, res.toJSON());
        })

        Pipeline(middleware).fault((context, error) => {
            callback(error)
        }).flow({ req, res })
    }
}