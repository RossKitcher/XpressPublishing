const express = require('express');
const sqlite3 = require('sqlite3');
const issuesRouter = require('./issues.js');

const seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req,res,next) => {
  const sql = `select * from Series`;
  db.all(sql, (error, series) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({series: series});
    }
  })
});

seriesRouter.param('seriesId', (req,res,next,seriesId) => {
  const sql = `select * from Series where Series.id = ${seriesId}`;
  db.get(sql, (error, series) => {
    if (error) {
      next(error);
    } else if (series) {
      req.series = series;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/:seriesId', (req,res,next) => {
  res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req,res,next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;

  if (name && description) {
    const sql = `insert into Series (name, description) values($name, $description)`;
    const values = {
      $name: name,
      $description: description
    };
    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        const sql = `select * from Series where Series.id = ${this.lastID}`;
        db.get(sql, (error, series) => {
          res.status(201).json({series: series});
        })
      }
    })
  } else {
    res.sendStatus(400);
  }
});

seriesRouter.put('/:seriesId', (req,res,next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;

  if (name && description) {
    const sql = `update Series set name = $name, description = $description where Series.id = $seriesId`;
    const values = {
      $name: name,
      $description: description,
      $seriesId: req.params.seriesId
    }
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        const sql = `select * from Series where Series.id = ${req.params.seriesId}`;
        db.get(sql, (error, series) => {
          res.status(200).json({series: series});
        })
      }
    })
  } else {
    res.sendStatus(400);
  }
})

seriesRouter.delete('/:seriesId', (req,res,next) => {
  const issueSql = 'select * from Issue where Issue.series_id = $seriesId';
  const issueValues = {$seriesId: req.params.seriesId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'delete from Series where Series.id = $seriesId';
      const deleteValues = {$seriesId: req.params.seriesId};
      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      })
    }
  })
})



module.exports = seriesRouter;
