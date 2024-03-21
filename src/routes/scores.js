import { isUserAuthenticated } from '@audeets/api-commons/middlewares/auth.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import elastic from '../utils/elastic.js';
dayjs.extend(customParseFormat);

const DATE_FORMAT = 'YYYYMMDD';

const addRoutes = (router, baseRoute) => {
  router.route(`${baseRoute}/latest`).get(isUserAuthenticated, (req, res, next) => {
    elastic('latestscore', { id: req.params.id, url: decodeURI(req.query.url) }, (err, results) => {
      if (err) return next(err);
      res.status(200).json(
        results.aggregations.categories.buckets.map((bucket) => {
          const lastAudit = bucket.day.buckets[0];
          const checkedRules = lastAudit.scores.buckets.reduce(
            (count, value) => (value.key === 1 ? value.doc_count : count),
            0
          );
          return {
            project: req.params.id,
            category: bucket.key,
            date: new Date(lastAudit.key_as_string),
            score: Math.floor((checkedRules * 100) / lastAudit.doc_count)
          };
        })
      );
    });
  });
  router.route(`${baseRoute}/:date`).get(isUserAuthenticated, (req, res, next) => {
    elastic(
      'score',
      {
        id: req.params.id,
        url: decodeURI(req.query.url),
        floor: req.params.date,
        ceiling: dayjs(req.params.date, DATE_FORMAT).add(1, 'day').format(DATE_FORMAT)
      },
      (err, results) => {
        if (err) return next(err);
        res.status(200).json(
          results.aggregations.categories.buckets.map((bucket) => {
            const lastAudit = bucket.day.buckets[0];
            const checkedRules = lastAudit.scores.buckets.reduce(
              (count, value) => (value.key === 1 ? value.doc_count : count),
              0
            );
            return {
              project: req.params.id,
              category: bucket.key,
              date: new Date(lastAudit.key_as_string),
              score: Math.floor((checkedRules * 100) / lastAudit.doc_count)
            };
          })
        );
      }
    );
  });
  router.route(`${baseRoute}/latest/global`).get(isUserAuthenticated, (req, res, next) => {
    elastic('latestglobalscore', { id: req.params.id }, (err, results) => {
      if (err) return next(err);
      res.status(200).json(
        results.aggregations.categories.buckets.map((bucket) => {
          const lastAudit = bucket.day.buckets[0];
          const checkedRules = lastAudit.scores.buckets.reduce(
            (count, value) => (value.key === 1 ? value.doc_count : count),
            0
          );
          return {
            project: req.params.id,
            category: bucket.key,
            date: new Date(lastAudit.key_as_string),
            score: Math.floor((checkedRules * 100) / lastAudit.doc_count)
          };
        })
      );
    });
  });
};

export default { addRoutes };
