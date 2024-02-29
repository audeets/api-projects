import elastic from "../utils/elastic.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { isUserAuthenticated } from "@benoitquette/audeets-api-commons/middlewares/auth.js";

const DATE_FORMAT = "YYYYMMDD";
dayjs.extend(customParseFormat);

const addRoutes = (router, baseRoute) => {
  router
    .route(`${baseRoute}/:date`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic(
        "audit",
        {
          id: req.params.id,
          floor: req.params.date,
          ceiling: dayjs(req.params.date, DATE_FORMAT)
            .add(1, "day")
            .format(DATE_FORMAT),
          url: decodeURI(req.query.url),
        },
        (err, results) => {
          if (err) return next(err);
          res
            .status(200)
            .json(
              results.aggregations.rules.buckets.map(
                (bucket) => bucket.rules_hits.hits.hits[0]._source
              )
            );
        }
      );
    });
};

export default { addRoutes };
