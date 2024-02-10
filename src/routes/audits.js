import _ from "lodash";
import elastic from "../utils/elastic.js";
import moment from "moment";
import { isUserAuthenticated } from "@benoitquette/audeets-api-commons/middlewares/auth.js";

const DATE_FORMAT = "YYYYMMDD";

const addRoutes = (router, baseRoute) => {
  router.route(baseRoute).get(isUserAuthenticated, (req, res, next) => {
    elastic("audits", { id: req.params.id }, (err, results) => {
      if (err) return next(err);
      const categories = results.aggregations.categories.buckets;
      res.status(200).json(
        _.reduce(
          categories,
          (result, cat) => {
            return _.concat(
              result,
              _.map(cat.day.buckets, (day) => {
                return {
                  timestamp: new Date(day.key_as_string),
                  category: cat.key,
                };
              })
            );
          },
          []
        )
      );
    });
  });
  router
    .route(`${baseRoute}/last`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic("lastaudits", { id: req.params.id }, (err, results) => {
        if (err) return next(err);
        const categories = results.aggregations.categories.buckets;
        res.status(200).json(
          _.reduce(
            categories,
            (result, cat) => {
              return _.chain(result)
                .concat(
                  result,
                  _.map(cat.day.buckets, (day) => {
                    return new Date(day.key_as_string);
                  })
                )
                .uniqBy((date) => {
                  return moment(date).format(DATE_FORMAT);
                })
                .take(5)
                .value();
            },
            []
          )
        );
      });
    });
  router
    .route(`${baseRoute}/:date`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic(
        "audit",
        {
          id: req.params.id,
          floor: req.params.date,
          ceiling: moment(req.params.date, DATE_FORMAT)
            .add(1, "days")
            .format(DATE_FORMAT),
          format: "yyyyMMdd", // the ES format is different from the JS format
        },
        (err, results) => {
          if (err) return next(err);
          res.status(200).json(_.map(results.hits.hits, (hit) => hit._source));
        }
      );
    });
};

export default { addRoutes };
