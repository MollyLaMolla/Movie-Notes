import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Movie Notes",
    password: "Sasha,02,09,2004",
    port: 5432,
});
    
     