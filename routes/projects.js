const express = require("express");
const mongoose = require("@benoitquette/audeets-api-commons/models");
const _ = require("lodash");
const elastic = require("../utils/elastic");
const moment = require("moment");
const {
  isUserAuthenticated,
  isAuthenticated,
} = require("@benoitquette/audeets-api-commons/middlewares/auth");

const DATE_FORMAT = "YYYYMMDD";

const Project = mongoose.model("Project");
const router = express.Router();

router
  .route("/")
  .get(isAuthenticated, (req, res, next) => {
    if (req.user) {
      // authenticated mode: we return the user's projects
      Project.find({ userId: req.user.id })
        .then((result) => {
          return res.json(result);
        })
        .catch((error) => {
          return next(error);
        });
    } else {
      // generic mode: we return all projects
      Project.find()
        .then((result) => {
          return res.json(result);
        })
        .catch((error) => {
          return next(error);
        });
    }
  })
  .post(isUserAuthenticated, (req, res, next) => {
    let project = new Project();
    project.url = req.body.url;
    project.title = req.body.title;
    project
      .save()
      .then(() => {
        res.json(project);
      })
      .catch((error) => {
        return next(error);
      });
  });
router.route("/:id/latestscore").get(isUserAuthenticated, (req, res, next) => {
  elastic.query("latestscore", { id: req.params.id }, (err, results) => {
    if (err) return next(err);
    res.json(
      _.map(results.aggregations.categories.buckets, (bucket) => {
        const lastAudit = bucket.day.buckets[0];
        const checkedRulesNodes = _(lastAudit.scores.buckets).find({ key: 1 });
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
router.route("/:id/rollingweek").get(isUserAuthenticated, (req, res, next) => {
  elastic.query("rollingweek", { id: req.params.id }, (err, results) => {
    if (err) return next(err);
    res.json(
      _.map(results.aggregations.categories.buckets, (bucket) => {
        return {
          category: bucket.key,
          data: _.map(bucket.day.buckets, (day) => {
            const checkedRulesNodes = _(day.scores.buckets).find({ key: 1 });
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
router.route("/:id/rollingmonth").get(isUserAuthenticated, (req, res, next) => {
  elastic.query("rollingmonth", { id: req.params.id }, (err, results) => {
    if (err) return next(err);
    res.json(
      _.map(results.aggregations.categories.buckets, (bucket) => {
        return {
          category: bucket.key,
          data: _.map(bucket.month.buckets, (month) => {
            const checkedRulesNodes = _(month.scores.buckets).find({ key: 1 });
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
router.route("/:id/lastaudits").get(isUserAuthenticated, (req, res, next) => {
  elastic.query("lastaudits", { id: req.params.id }, (err, results) => {
    if (err) return next(err);
    const categories = results.aggregations.categories.buckets;
    res.json(
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
router.route("/:id/audit/:date").get(isUserAuthenticated, (req, res, next) => {
  elastic.query(
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
      res.json(_.map(results.hits.hits, (hit) => hit._source));
    }
  );
});
router.route("/:id/audits").get(isUserAuthenticated, (req, res, next) => {
  elastic.query("audits", { id: req.params.id }, (err, results) => {
    if (err) return next(err);
    const categories = results.aggregations.categories.buckets;
    res.json(
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

router.route("/:id").delete(isUserAuthenticated, (req, res, next) => {
  Project.deleteOne({ _id: req.params.id })
    .then(() => {
      return res.send({ id: req.params.id });
    })
    .catch((error) => {
      return next(error);
    });
});

router.route("/:id").get(isUserAuthenticated, (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((result) => {
      return res.send(result);
    })
    .catch((error) => {
      return next(error);
    });
});

module.exports = router;
