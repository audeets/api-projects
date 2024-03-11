import { isUserAuthenticated } from '@benoitquette/audeets-api-commons/middlewares/auth.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import elastic from '../utils/elastic.js';
dayjs.extend(utc);

const addRoutes = (router, baseRoute) => {
  router.route(`${baseRoute}/week`).get(isUserAuthenticated, (req, res, next) => {
    elastic('rollingweek', { id: req.params.id }, (err, results) => {
      if (err) return next(err);
      res.status(200).json(mapScores(results, 'days', 7));
    });
  });
  router.route(`${baseRoute}/month`).get(isUserAuthenticated, (req, res, next) => {
    elastic('rollingmonth', { id: req.params.id }, (err, results) => {
      if (err) return next(err);
      res.status(200).json(mapScores(results, 'days', 30));
    });
  });
  router.route(`${baseRoute}/year`).get(isUserAuthenticated, (req, res, next) => {
    elastic('rollingyear', { id: req.params.id }, (err, results) => {
      if (err) return next(err);
      res.status(200).json(mapScores(results, 'months', 12));
    });
  });
};

function createDataStructure(data, length, unit) {
  let res = [];
  const now = dayjs();
  for (let i = 1; i <= length; i++) {
    let date = now.subtract(length - i, unit);
    date = date.utc().millisecond(0);
    date = date.utc().second(0);
    date = date.utc().minute(0);
    date = date.utc().hour(0);
    if (unit === 'months') date = date.utc().date(1);
    res.push({
      date,
      score: findByDate(date.toDate(), data)
    });
  }
  return res;
}

function findByDate(date, data) {
  for (const item of data) {
    if (item[0].getTime() === date.getTime() && !isNaN(item[1])) return item[1];
  }
  return null;
}

function mapScores(results, bucketName, length) {
  return results.aggregations.categories.buckets.map((bucket) => {
    const categoryName = bucket.key;
    const datafromElastic = bucket[bucketName].buckets.map((data) => {
      const date = new Date(data.key_as_string);
      const checkedRules = data.scores.buckets.reduce((count, value) => (value.key === 1 ? value.doc_count : count), 0);
      const score = Math.floor((checkedRules * 100) / data.doc_count);
      return [date, score];
    });
    const data = createDataStructure(datafromElastic, length, bucketName);
    return {
      category: categoryName,
      data
    };
  });
}

export default { addRoutes };
