var Travis = require('travis-ci');

// change this
var repo = "openworm/geppetto-application";

var travis = new Travis({
    version: '2.0.0'
});

travis.authenticate({

    github_token: process.env.TRATOKEN

}, function (err, res) {
    if (err) {
        return console.error(err);
    }

    travis.repos(repo.split('/')[0], repo.split('/')[1]).builds.get(function (err, res) {
        if (err) {
            return console.error(err);
        }

        travis.requests.post({
            build_id: res.builds[0].id
        }, function (err, res) {
            if (err) {
                return console.error(err);
            }
            console.log(res.flash[0].notice);
        });
    });
});
