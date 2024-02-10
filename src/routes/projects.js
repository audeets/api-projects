import mongoose from "@benoitquette/audeets-api-commons/models/index.js";
import _ from "lodash";
import {
  isUserAuthenticated,
  isAuthenticated,
} from "@benoitquette/audeets-api-commons/middlewares/auth.js";

const Project = mongoose.model("Project");

const addRoutes = (router, baseRoute) => {
  router
    .route(baseRoute)
    .get(isAuthenticated, (req, res, next) => {
      if (req.user) {
        // authenticated mode: we return the user's projects
        Project.find({ user: req.user.id })
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
      // let's check how many projects are created
      Project.countDocuments({ user: req.user.id })
        .then((count) => {
          if (count >= req.user.projectsMax)
            res.status(409).json("Maximum number of projects reached.");
          else {
            let project = new Project();
            project.url = req.body.url;
            project.title = req.body.title;
            project.user = req.user.id;
            project.save().then(() => {
              res.status(200).json(project);
            });
          }
        })
        .catch((error) => {
          return next(error);
        });
    });
};

export default { addRoutes };
