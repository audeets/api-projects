import url from 'url';

const elasticUrl = process.env.URL_ELASTIC_SEARCH;
const templateUrl = url.resolve(elasticUrl, '_search/template');

/**
 * Executes a templated query on ElasticSearch
 *
 * @param {string} name the name of the template
 * @param {object} params the parameters to pass onto the query
 * @param {function} callback called with the query results or error
 */
export default function query(name, params, callback) {
  console.log(`executing template '${name}' with params ${JSON.stringify(params)} on ${templateUrl}`);
  fetch(templateUrl, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      id: name,
      params
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
    .then((response) => {
      return response.json();
    })
    .then((results) => {
      callback(null, results);
    })
    .catch((err) => callback(err));
}
