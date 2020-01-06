const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database.sqlite');


db.run(`create table if not exists Artist (
  id integer primary key not null,
  name text not null,
  date_of_birth text not null,
  biography text not null,
  is_currently_employed integer default(1)
)`);

db.run(`create table if not exists Series (
  id integer primary key not null,
  name text not null,
  description text not null
)`);

db.run(`create table if not exists Issue (
  id integer primary key not null,
  name text not null,
  issue_number integer not null,
  publication_date text not null,
  artist_id integer not null,
  series_id integer not null,
  foreign key(artist_id) references Artist(id),
  foreign key(series_id) references Series(id)
)`);
