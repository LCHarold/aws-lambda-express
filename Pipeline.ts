import {reduce} from "lodash";
import * as pipeworks from "pipeworks";

export function Pipeline(middleware) {
    const pipe = pipeworks();

    reduce(middleware, (pipe, executor) => {
        return pipe.fit(
            // Pipeworks compatible definition
            (context, next) => {
                // We extract request and response from context
                executor(context.req, context.res, (err) => {
                    // If error passed to next, throw it to trigger fault
                    if (err) { throw err; }
                    // otherwise run next compatible to pipeworks
                    else { return next(context); }
                })
            }
        )
    }, pipe);

    return pipe
}
