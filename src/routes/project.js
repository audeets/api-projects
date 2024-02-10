import mongoose from "@benoitquette/audeets-api-commons/models/index.js";
import _ from "lodash";
import { isUserAuthenticated } from "@benoitquette/audeets-api-commons/middlewares/auth.js";

const Project = mongoose.model("Project");

const addRoutes = (router, baseRoute) => {
  router
    .route(baseRoute)
    .delete(isUserAuthenticated, (req, res, next) => {
      Project.deleteOne({ _id: req.params.id, user: req.user.id })
        .then(() => {
          return res.send({ id: req.params.id });
        })
        .catch((error) => {
          return next(error);
        });
    })
    .get(isUserAuthenticated, (req, res, next) => {
      Project.findOne({ _id: req.params.id, user: req.user.id })
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
            return res.status(404).send("Project not found");
          } else {
            result.url = req.body.url;
            result.title = req.body.title;
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
