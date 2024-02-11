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
        res.status(200).json(mapScores(results, "day"));
      });
    });
  router
    .route(`${baseRoute}/month`)
    .get(isUserAuthenticated, (req, res, next) => {
      elastic("rollingmonth", { id: req.params.id }, (err, results) => {
        if (err) return next(err);
        res.status(200).json(mapScores(results, "month"));
      });
    });
};

function createWeekDataStructure(data) {
  const length = 7;
  let res = [];
  const today = new Date();
  for (let i = 1; i <= length; i++) {
    let date = new Date();
    date.setDate(today.getDate() - length + i);
    const offset = Math.abs(date.getTimezoneOffset() / 60);
    date.setHours(offset, 0, 0, 0);
    const score = findByDate(date, data);
    res.push({ date, score });
  }
  return res;
}

function findByDate(date, data) {
  for (const item of data) {
    if (item[0].getTime() === date.getTime() && !isNaN(item[1])) return item[1];
  }
  return null;
}

function mapScores(results, bucketName) {
  return _.map(results.aggregations.categories.buckets, (bucket) => {
    const categoryName = bucket.key;
    const datafromElastic = _.map(bucket[bucketName].buckets, (data) => {
      const date = new Date(data.key_as_string);
      const checkedRulesNodes = _(data.scores.buckets).find({ key: 1 });
      let checkedRules = _.isNil(checkedRulesNodes)
        ? 0
        : checkedRulesNodes.doc_count;
      const score = Math.floor((checkedRules * 100) / data.doc_count);
      return [date, score];
    });
    const data =
      bucketName == "month"
        ? datafromElastic.map((item) => ({
            date: item[0],
            score: item[1],
          }))
        : createWeekDataStructure(datafromElastic);
    return {
      category: categoryName,
      data,
    };
  });
}

export default { addRoutes };
