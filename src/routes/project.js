import mongoose from '@audeets/api-commons/models/index.js';
import { isUserAuthenticated } from '@audeets/api-commons/middlewares/auth.js';

const Project = mongoose.model('Project');

const addRoutes = (router, baseRoute) => {
  router
    .route(baseRoute)
    .delete(isUserAuthenticated, (req, res, next) => {
      Project.findOne({ _id: req.params.id, user: req.user.id })
        .then((result) => {
          if (!result) {
            return res.status(404).send('Project not found');
          } else {
            result.deleted = true;
            result.save().then(() => {
              return res.send({ id: req.params.id });
            });
          }
        })
        .catch((error) => {
          return next(error);
        });
    })
    .get(isUserAuthenticated, (req, res, next) => {
      Project.findOne({ _id: req.params.id, user: req.user.id, deleted: false })
        .then((result) => {
          return res.send(result);
        })
        .catch((error) => {
          return next(error);
        });
    })
    .put(isUserAuthenticated, (req, res, next) => {
      Project.findOne({ _id: req.params.id, user: req.user.id })
        .then((result) => {
          if (!result) {
            return res.status(404).send('Project not found');
          } else {
            result.urls = req.body.urls;
            result.title = req.body.title;
            result.domain = req.body.domain;
            result.save().then(() => {
              return res.status(200).json(result);
            });
          }
        })
        .catch((error) => {
          return next(error);
        });
    });
};

export default { addRoutes };
