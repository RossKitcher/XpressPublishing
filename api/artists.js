const express = require('express');
const artistRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.param('artistId', (req,res,next, artistId) => {
  const sql = `select * from Artist where Artist.id = $artistId`;
  const values = {$artistId: artistId};
  db.get(sql, values, (error, artist) => {
    if (error) {
      next(error);
    } else if (artist){
        req.artist = artist;
        next();
    } else {
        res.sendStatus(404);
    }

  });
});

artistRouter.get('/', (req,res,next) => {

  db.all('select * from Artist where is_currently_employed = 1', (err, artists) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({artists: artists});
    }
  });
});

artistRouter.get('/:artistId', (req,res,next) => {
  res.status(200).json({artist: req.artist});
})

artistRouter.post('/', (req,res,next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  if (name && dateOfBirth && biography) {
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    const sql = "insert into Artist (name, date_of_birth, biography, is_currently_employed) values($name, $dateOfBirth, $biography, $isCurrentlyEmployed)";
    const values = {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed
    };

    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        const sql = `select * from Artist where Artist.id = ${this.lastID}`;
        db.get(sql, (err, artist) => {
          res.status(201).json({artist: artist});
        })
      }
    });

  } else {
    return res.sendStatus(400);
  }
});

artistRouter.put('/:artistId', (req,res,next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;

  if (name && dateOfBirth && biography) {
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    const sql = `update Artist set name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed where Artist.id = $artistId`;
    const values = {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
      $artistId: req.params.artistId
    };
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        const sql = `select * from Artist where Artist.id = ${req.params.artistId}`;
        db.get(sql, (err, artist) => {
          res.status(200).json({artist: artist});
        });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

artistRouter.delete('/:artistId', (req,res,next) => {
  const sql = `update Artist set is_currently_employed = 0 where Artist.id = ${req.params.artistId}`;

  db.run(sql, (error) => {
    if (error) {
      next(error);
    } else {
      const sql = `select * from Artist where Artist.id = ${req.params.artistId}`;
      db.get(sql, (error, artist) => {
        res.status(200).json({artist: artist});
      })

    }
  })
});


module.exports = artistRouter;
