const express = require('express');
const sqlite3 = require('sqlite3');

const issuesRouter = express.Router({mergeParams: true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req,res,next,issueId) => {
  const sql = `select * from Issue where Issue.id = ${issueId}`;
  db.get(sql, (error, issue) => {
    if (error) {
      next(error)
    } else if (issue) {
      next();
    } else {
      res.sendStatus(404);
    }
  })
})

issuesRouter.get('/', (req,res,next) => {
  const sql = `select * from Issue where Issue.series_id = $seriesId`;
  const values = {
    $seriesId: req.params.seriesId
  };
  db.all(sql,values, (error, issues) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({issues: issues});
    }
  });
});

issuesRouter.post('/', (req,res,next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  const artistSql = 'Select * from Artist where Artist.id = $artistId';
  const artistValues = { $artistId: artistId };

  db.get(artistSql, artistValues, (error, artist) => {
    if (error) {
      next(error);
    } else {
      if (name && issueNumber && publicationDate && artist) {
        const sql = 'insert into Issue (name, issue_number, publication_date, artist_id, series_id) values ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $artistId: artistId,
          $seriesId: req.params.seriesId
        }

        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`select * from Issue where Issue.id = ${this.lastID}`, (error, issue) => {
              res.status(201).json({issue:issue});
            });
          }
        })
      } else {
        res.sendStatus(400);
      }
    }
  })

});

issuesRouter.put('/:issueId', (req,res,next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const artistSql = 'select * from Artist where Artist.id = $artistId';
  const artistValues = {$artistId: artistId};
  db.get(artistSql,artistValues, (error, artist) => {
    if (error) {
      next(error);
    } else {
      if (name && issueNumber && publicationDate && artist) {
        const sql = 'update Issue set name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId where Issue.id = $issueId';
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $issueId: req.params.issueId,
          $artistId: artistId
        };
        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`select * from Issue where Issue.id = ${req.params.issueId}`, (error, issue) => {
              res.status(200).json({issue: issue});
            })
          }
        })
      } else {
        res.sendStatus(400);
      }
    }
  });

});

issuesRouter.delete('/:issueId', (req,res,next) => {
  const sql = `delete from Issue where Issue.id = $issueId`;
  const values = {$issueId: req.params.issueId};
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  })
});



module.exports = issuesRouter;
