import _ from "lodash";
import elastic from "../utils/elastic.js";
import { isUserAuthenticated } from "@benoitquette/audeets-api-commons/middlewares/auth.js";

const addRoutes = (router, baseRoute) => {
  router
    .route(`${baseRoute}/latest`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic("latestscore", { id: req.params.id }, (err, results) => {
        if (err) return next(err);
        res.status(200).json(
          _.map(results.aggregations.categories.buckets, (bucket) => {
            const lastAudit = bucket.day.buckets[0];
            const checkedRulesNodes = _(lastAudit.scores.buckets).find({
              key: 1,
            });
            let checkedRules = 0;
            if (!_.isNil(checkedRulesNodes)) {
              checkedRules = checkedRulesNodes.doc_count;
            }
            return {
              category: bucket.key,
              date: new Date(lastAudit.key_as_string),
              score: Math.floor((checkedRules * 100) / lastAudit.doc_count),
            };
          })
        );
      });
    });
  router
    .route(`${baseRoute}/week`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic("rollingweek", { id: req.params.id }, (err, results) => {
        if (err) return next(err);
        res.status(200).json(
          _.map(results.aggregations.categories.buckets, (bucket) => {
            return {
              category: bucket.key,
              data: _.map(bucket.day.buckets, (day) => {
                const checkedRulesNodes = _(day.scores.buckets).find({
                  key: 1,
                });
                let checkedRules = 0;
                if (!_.isNil(checkedRulesNodes)) {
                  checkedRules = checkedRulesNodes.doc_count;
                }
                return {
                  date: new Date(day.key_as_string),
                  score: Math.floor((checkedRules * 100) / day.doc_count),
                };
              }),
            };
          })
        );
      });
    });
  router
    .route(`${baseRoute}/month`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic("rollingmonth", { id: req.params.id }, (err, results) => {
        if (err) return next(err);
        res.status(200).json(
          _.map(results.aggregations.categories.buckets, (bucket) => {
            return {
              category: bucket.key,
              data: _.map(bucket.month.buckets, (month) => {
                const checkedRulesNodes = _(month.scores.buckets).find({
                  key: 1,
                });
                let checkedRules = 0;
                if (!_.isNil(checkedRulesNodes)) {
                  checkedRules = checkedRulesNodes.doc_count;
                }
                return {
                  date: new Date(month.key_as_string),
                  score: Math.floor((checkedRules * 100) / month.doc_count),
                };
              }),
            };
          })
        );
      });
    });
};

export default { addRoutes };
