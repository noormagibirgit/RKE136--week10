const express = require("express");
const axios = require("axios");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));

app.get("/", (req, res)=> {
    let url  = "https://api.themoviedb.org/3/movie/872585?api_key=622047d9ad800435ffb214b06e6e99bf";
    axios.get(url)
    .then(response => {
        
        let data = response.data;
        let releaseDate = new Date(data.release_date).getFullYear();
       
       let genresToDisplay = " ";
        data.genres.forEach(genre => {
            genresToDisplay = genresToDisplay + `${genre.name}, `;
        });
        let genresUpdated = genresToDisplay.slice(0, -2) + '.';
        let posterUrl = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`;

        
        let currentYear = new Date().getFullYear();

        res.render("index", {dataToRender: data, year: currentYear, releaseYear: releaseDate, genres: genresUpdated, poster: posterUrl});
    });

   
});

app.get("/search", (req, res) => {
    res.render("search", {movieDetails:""});
  });

  app.post("/search", (req, res) => {
    let userMovieTitle = req.body.movieTitle;

    

    let movieURL = `https://api.themoviedb.org/3/search/movie?api_key=622047d9ad800435ffb214b06e6e99bf&query=${userMovieTitle}`;
    let genresUrl ="https://api.themoviedb.org/3/genre/movie/list?api_key=622047d9ad800435ffb214b06e6e99bf&language=en";

    let endpoints = [movieURL, genresUrl];
    
    axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    .then(axios.spread((movie, genres)=> {
        const [movieRaw] = movie.data.results;
        let movieGenreIds = movieRaw.genre_ids;
        let movieGenres = genres.data.genres;
        
        let movieGenresArray = [];

        for(let i = 0; i < movieGenreIds.length; i++) {
            for (let j =0; j < movieGenres.length; j++) {
                if(movieGenreIds[i] == movieGenres[j].id) {
                    movieGenresArray.push(movieGenres[j].name);
                }
            }
        }

        let genresToDisplay = "";
        movieGenresArray.forEach(genre => {
            genresToDisplay = genresToDisplay+ `${genre},`;
        });

        

        

        let movieData = {
            title: movieRaw.title,
            year: new Date(movieRaw.release_date).getFullYear(),
            genres: genresToDisplay,
            overview: movieRaw.overview,
            posterUrl: `https://image.tmdb.org/t/p/w500/${movieRaw.poster_path}`
         };

         res.render("search", {movieDetails: movieData});
    
    }));
  
  
});


app.listen(process.env. PORT || 3000, ()=> {
    console.log("server ist running on port 3000");
});