const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestionsList");

const movieData = document.getElementById("movie-data");

const smallBox = document.getElementById("movie-selected");

const title = document.getElementsByClassName("selected-title");
const image = document.getElementsByClassName("selected-img");
const type = document.getElementById("selected-movie-type");
const genre = document.getElementById("selected-movie-genre");
const releaseDate = document.getElementById("selected-movie-release-date");
const language = document.getElementById("selected-movie-original-language");
const voteAvgNum = document.getElementById("vote-avg-num");
const voteCount = document.getElementById("vote-count");
const overview = document.getElementById("selected-movie-overview");


const watchType = document.getElementsByClassName("watch");

const formId = document.getElementById("movie-id");
const formTitle = document.getElementById("movie-title");
const formType = document.getElementById("movie-type");
const formImage = document.getElementById("movie-backdrop");
const formGenre = document.getElementById("movie-genre");
const formReleaseDate = document.getElementById("movie-release-date");
const formLanguage = document.getElementById("movie-original-language");
const formVoteAvg = document.getElementById("movie-vote-avg");
const formVoteCount = document.getElementById("movie-vote-count");
const formOverview = document.getElementById("movie-overview");




let timeoutId;
let genrs = {
    movies: [],
    tv: []
};


async function getGenres() {
    const response1 = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbKey}&language=it-IT`, options);
    const data1 = await response1.json();
    const response2 = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${tmdbKey}&language=it-IT`, options);
    const data2 = await response2.json();
    if (data1 && data1.genres) {
        data1.genres.forEach((item) => {
            genrs.movies.push(item);
        });
    }
    if (data2 && data2.genres) {
        data2.genres.forEach((item) => {
            genrs.tv.push(item);
        });
    }
    console.log(genrs);
}

document.getElementById("searchInput").addEventListener("input", (event) => {
    clearTimeout(timeoutId); // Cancella il timer precedente
    timeoutId = setTimeout(() => {
    checkInput();
    }, 200); // Aspetta 300ms prima di chiamare la funzione
});

document.getElementById("searchInput").addEventListener("focusin", (event) => {
    checkInput();
});

document.getElementById("searchInput").addEventListener("focusout", (event) => {
    setTimeout(() => {
        document.getElementById("suggestionsList").innerHTML = ""; // Pulisce la lista dei suggerimenti
    }, 200); // Aspetta 200ms prima di pulire la lista
});

function checkInput(){
        const query = document.getElementById("searchInput").value;
        const serchFocus = document.getElementById("searchInput");
        console.log(query);
        console.log(encodeURIComponent(query));
        if (query.length > 2) {  // Evita richieste per stringhe troppo corte
            // testarray().then((data) => {
            getMovieDataTheMovieDb(query).then((data) => {
                document.getElementById("suggestionsList").innerHTML = ""; // Pulisce la lista dei suggerimenti
                if (data && serchFocus === document.activeElement) { // Controlla se ci sono risultati e se l'input è ancora attivo
                    data.forEach((movie) => {
                        const listItem = document.createElement("li");
                        const liText = document.createElement("span");
                        const img = document.createElement("img");
                        if(movie.image !== null)img.src = `https://image.tmdb.org/t/p/w500${movie.image}`;
                        if(movie.image === null) img.src = "/images/movie.png"; // Placeholder per le immagini non disponibili
                        img.alt = movie.title;
                        img.style.height = "48px";
                        liText.textContent = movie.title;
                        listItem.appendChild(img);
                        listItem.appendChild(liText);
                        listItem.id = movie.id;
                        listItem.className = "suggestion-item";
                        listItem.addEventListener("click", () => {
                            updatePageContent(movie);
                        });
                        document.getElementById("suggestionsList").appendChild(listItem);
                    });
                }
             });
        } 

        else {
            document.getElementById("suggestionsList").innerHTML = ""; // Pulisce la lista dei suggerimenti
        }
}

const tmdbKey = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZjA0NTgyZDc5ZTA5YmZjOTI2NTFmZWRlNzE1YzBiYyIsIm5iZiI6MTc0NzIyMjEzNy41MDgsInN1YiI6IjY4MjQ3ZTc5OTgxZjYyNThjMjZlZjIwMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.urGvO1NvcguGQJ0lkrCtr-3sqVuWRws9yZZW6PC6FB0"; // API Key per TMDb
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZjA0NTgyZDc5ZTA5YmZjOTI2NTFmZWRlNzE1YzBiYyIsIm5iZiI6MTc0NzIyMjEzNy41MDgsInN1YiI6IjY4MjQ3ZTc5OTgxZjYyNThjMjZlZjIwMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.urGvO1NvcguGQJ0lkrCtr-3sqVuWRws9yZZW6PC6FB0'
  }
};

function updatePageContent(movie) {
    console.log(movie);
    searchInput.blur();
    suggestionsList.innerHTML = ""; // Pulisce la lista dei suggerimenti
    movieData.classList.remove("no-display");
    smallBox.classList.remove("no-display");
    watchType[0].classList.remove("no-display");
    title[0].textContent = movie.title;
    title[1].textContent = movie.title;
    image[0].src = `https://image.tmdb.org/t/p/w500${movie.image}`;
    image[1].src = `https://image.tmdb.org/t/p/w500${movie.image}`;
    type.textContent = movie.type;
    genre.textContent = movie.genre_names.join(", ");
    releaseDate.textContent = movie.release_date;
    language.textContent = movie.originnal_language;
    voteCount.textContent = `(${movie.vote_count})`;
    overview.textContent = movie.overview;
    voteAvgNum.textContent = `${movie.vote_average.toFixed(1)}`;
    createStars(movie.vote_average);
    formId.value = movie.id;
    formTitle.value = movie.title;
    formType.value = movie.type;
    formImage.value = `https://image.tmdb.org/t/p/w500${movie.image}`;
    formGenre.value = movie.genre_names.join(", ");
    formReleaseDate.value = movie.release_date;
    formLanguage.value = movie.originnal_language;
    formVoteAvg.value = movie.vote_average;
    formVoteCount.value = movie.vote_count;
    formOverview.value = movie.overview;
}




async function getMovieDataTheMovieDb(title) {
    const responseTv = await fetchAllResultsTv(title);
    const responseMovie = await fetchAllResultsMovie(title);
    // console.log(encodeURIComponent(title));
    console.log(responseTv);
    console.log(responseMovie);
    let data = [];
    if (responseTv && responseTv.length > 0) {
        responseTv.forEach((item) => {
            data.push(item);
        });
    }

    if (responseMovie && responseMovie.length > 0) {
        responseMovie.forEach((item) => {
            data.push(item);
        });
    }

    console.log(data);
    if (data.length > 0) {
        data.sort((a, b) => b.popularity - a.popularity); // Ordina i risultati in base alla popolarità
        console.log(data);
        // Ordina i risultati in base alla popolarità
        let movieData = [];
        if (genrs.movies.length === 0 && genrs.tv.length === 0) {
            await getGenres();
        }
        for (let i = 0; i < data.length; i++) {
            if (i < 20){
            const genreNames = [];
            if (data[i].genre_ids) {
                data[i].genre_ids.forEach((genreId) => {
                    const genre = genrs.movies.find((g) => g.id === genreId) || genrs.tv.find((g) => g.id === genreId);
                    if (genre) {
                        genreNames.push(genre.name);
                    }
                });
                data[i].genre_names = genreNames;
            }
            movieData.push({
                popularity: data[i].popularity,
                title: data[i].title || data[i].name,
                id: data[i].id,
                vote: data[i].vote_average,
                image: data[i].poster_path || data[i].backdrop_path,
                originnal_language: data[i].original_language,
                release_date: data[i].release_date || data[i].first_air_date,
                vote_count: data[i].vote_count,
                vote_average: data[i].vote_average,
                overview: data[i].overview,
                genre_ids: data[i].genre_ids,
                genre_names: data[i].genre_names,
                type: data[i].type,
            });
        }}
        console.log(movieData);
        return movieData; // Prende i primi 10 risultati
    } else {
        console.log("No results found");
        return null;
    }
}

async function fetchAllResultsTv(title) {
    const apiKey = tmdbKey; // Sostituiscilo con il tuo vero TMDb API Key
    let page = 1;
    let allResults = [];
    let totalPages;

    do {
        const response = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${(title)}&page=${page}`, options);
        const data = await response.json();
        console.log(data.results);

        if (data.results) {
            data.results.forEach((item) => {
                // if (item.popularity > 1.0) 
                    item.type = "tv";
                    allResults.push(item);
            });
        }

        totalPages = data.total_pages;
        page++;
    } while (page <= totalPages && page <= 8); // Limita a 5 pagine per evitare richieste eccessive

    // Ordina per popolarità (dal più popolare al meno popolare)
    allResults.sort((a, b) => b.popularity - a.popularity);

    return allResults;
}

async function fetchAllResultsMovie(title) {
    const apiKey = tmdbKey; // Sostituiscilo con il tuo vero TMDb API Key
    let page = 1;
    let allResults = [];
    let totalPages;

    do {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${(title)}&page=${page}&min_popularity=1.0`, options);
        const data = await response.json();
        console.log(data.results);

        if (data.results) {
            data.results.forEach((item) => {
                // if (item.popularity > 1.0) 
                    item.type = "movie";
                    allResults.push(item);
            });
        }

        totalPages = data.total_pages;
        page++;
    } while (page <= totalPages && page <= 10); // Limita a 5 pagine per evitare richieste eccessive
    // Ordina per popolarità (dal più popolare al meno popolare)
    allResults.sort((a, b) => b.popularity - a.popularity);
    return allResults;
}

async function testarray(){
    return testArray;
}




const testArray = [
    {
        "popularity": 71.8143,
        "title": "The 100",
        "id": 48866,
        "vote": 7.5,
        "image": "/wcaDIAG1QdXQLRaj4vC1EFdBT2.jpg",
        "originnal_language": "en",
        "release_date": "2014-03-19",
        "vote_count": 8260,
        "vote_average": 7.5,
        "overview": "100 years in the future, when the Earth has been abandoned due to radioactivity, the last surviving humans live on an ark orbiting the planet — but the ark won't last forever. So the repressive regime picks 100 expendable juvenile delinquents to send down to Earth to see if the planet is still habitable.",
        "genre_ids": [
            10765,
            18,
            10759
        ],
        "genre_names": [
            "Sci-Fi & Fantasy",
            "Dramma",
            "Action & Adventure"
        ],
        "type": "tv"
    },
    {
        "popularity": 39.1296,
        "title": "A Masterpiece in 100 Minutes",
        "id": 124864,
        "vote": 0,
        "image": "/kCr33cN3DaiyEibOakgVcghxst0.jpg",
        "originnal_language": "ja",
        "release_date": "2010-09-27",
        "vote_count": 0,
        "vote_average": 0,
        "overview": "This program aims to decipher a challenging classic literary work over the course of four episodes lasting for a total of 100 minutes. Alongside clear explanations from skillful presenters, it utilizes animation, visual imagery, and readings to delve into the profound world of these renowned pieces.",
        "genre_ids": [
            10767,
            99
        ],
        "genre_names": [
            "Talk",
            "Documentario"
        ],
        "type": "tv"
    },
    {
        "popularity": 28.6854,
        "title": "Mob Psycho 100",
        "id": 67075,
        "vote": 8.5,
        "image": "/vR7hwaGQ0ySRoq1WobiNRaPs4WO.jpg",
        "originnal_language": "ja",
        "release_date": "2016-07-12",
        "vote_count": 1158,
        "vote_average": 8.5,
        "overview": "Shigeo Kageyama, a.k.a. \"Mob,\" is a boy who has trouble expressing himself, but who happens to be a powerful esper. Mob is determined to live a normal life and keeps his ESP suppressed, but when his emotions surge to a level of 100%, something terrible happens to him! As he's surrounded by false espers, evil spirits, and mysterious organizations, what will Mob think? What choices will he make?",
        "genre_ids": [
            16,
            10759,
            35,
            10765
        ],
        "genre_names": [
            "Animazione",
            "Action & Adventure",
            "Commedia",
            "Sci-Fi & Fantasy"
        ],
        "type": "tv"
    },
    {
        "popularity": 22.0735,
        "title": "The $100,000 Pyramid",
        "id": 67141,
        "vote": 7.4,
        "image": "/q4M2OYBvyDgmmSCKgj5PgbFBY1y.jpg",
        "originnal_language": "en",
        "release_date": "2016-06-27",
        "vote_count": 8,
        "vote_average": 7.4,
        "overview": "In $100,000 Pyramid, contestants are in teams of two. The goal of the game is to help your partner guess an answer, by listing items that would be included in said answer, or synonymous. For instance, if the answer is “Things That Bounce”, clues would be “Po-Go Sticks”, “Kangaroos”, “Basketballs”, etc. To add to the challenge, the contestant who is giving the clues has their hands strapped to their chair, so they’re unable to gesture in order to help the guessing process.",
        "genre_ids": [
            10764,
            10767
        ],
        "genre_names": [
            "Reality",
            "Talk"
        ],
        "type": "tv"
    },
    {
        "popularity": 16.4573,
        "title": "The 100 Girlfriends Who Really, Really, Really, Really, REALLY Love You",
        "id": 223564,
        "vote": 8.059,
        "image": "/ms7uowQ6gBjfaB2zzwugfr30IKZ.jpg",
        "originnal_language": "ja",
        "release_date": "2023-10-08",
        "vote_count": 144,
        "vote_average": 8.059,
        "overview": "Rentaro Aijo was rejected 100 times in middle school. He visits a shrine and prays for better luck in high school. The God of Love appears and promises that he'll soon meet 100 people he's destined to date. But there's a catch—once destiny introduces someone to him, the two must happily love each other. If they don't, they'll die. What will befall Rentaro and his 100 girlfriends in high school?",
        "genre_ids": [
            16,
            35
        ],
        "genre_names": [
            "Animazione",
            "Commedia"
        ],
        "type": "tv"
    },
    {
        "popularity": 12.6308,
        "title": "100% Wolf: The Legend of the Moonstone",
        "id": 120161,
        "vote": 8,
        "image": "/mysnnnNc6AN8GIyAF7O4ySCSvPp.jpg",
        "originnal_language": "en",
        "release_date": "2020-12-27",
        "vote_count": 6,
        "vote_average": 8,
        "overview": "Freddy may be a poodle, but he has the heart of a wolf, and he's going to prove it by graduating from the werewolf-only Howlington Academy!",
        "genre_ids": [
            10762,
            10751,
            10759,
            35,
            16
        ],
        "genre_names": [
            "Kids",
            "Famiglia",
            "Action & Adventure",
            "Commedia",
            "Animazione"
        ],
        "type": "tv"
    },
    {
        "popularity": 11.1344,
        "title": "FAIRY TAIL 100 YEARS QUEST",
        "id": 248947,
        "vote": 8.2,
        "image": "/95lYuqEYofq6bjQb6sgOzLBA6ja.jpg",
        "originnal_language": "ja",
        "release_date": "2024-07-07",
        "vote_count": 19,
        "vote_average": 8.2,
        "overview": "The rowdiest guild in Fiore Kingdom is back! Natsu, Lucy, Gray, Erza, and the whole Fairy Tail guild tackle the legendary \"100 Years Quest,\" tougher than any S-Class quest. Their goal: find the first wizard guild ever, located in the far north of Guiltina. Facing new gods, mysterious towns, and ominous foes, they’ll have their work cut out for them. Will they succeed where no wizard has before?",
        "genre_ids": [
            16,
            10759,
            10765
        ],
        "genre_names": [
            "Animazione",
            "Action & Adventure",
            "Sci-Fi & Fantasy"
        ],
        "type": "tv"
    },
    {
        "popularity": 9.8551,
        "title": "100% Senorita",
        "id": 88180,
        "vote": 6,
        "image": "/uEjCMwg8KXxCOGPpUKk6aiFBgO3.jpg",
        "originnal_language": "zh",
        "release_date": "2003-11-13",
        "vote_count": 2,
        "vote_average": 6,
        "overview": "When a surrogate mother gives birth to twins, she keeps Liang Xiaofeng by her side and gives Zhuang Feiyang away, who ends up in a wealthy family. Years later, Zhuang Feiyang becomes the heiress of Formosa Inc., a company created by her father and his partner, Peter. When Feiyang’s father passes away, Peter tries to kill Feiyang and take the company for his own. Despite Peter’s attempts, Feiyang escapes and undergoes cosmetic surgery in a bid to change her looks. From then on, the twins’ fates entwine once more.",
        "genre_ids": [
            18
        ],
        "genre_names": [
            "Dramma"
        ],
        "type": "tv"
    },
    {
        "popularity": 9.6435,
        "title": "Zom 100: Bucket List of the Dead",
        "id": 217766,
        "vote": 7.53,
        "image": "/bTYMgERNC9rVdmxTSzKuex4GWbF.jpg",
        "originnal_language": "ja",
        "release_date": "2023-07-09",
        "vote_count": 149,
        "vote_average": 7.53,
        "overview": "An overworked 24-year-old finally decides to live a little and create a bucket list, when a zombie outbreak hits the country.",
        "genre_ids": [
            16,
            10759,
            35,
            10765
        ],
        "genre_names": [
            "Animazione",
            "Action & Adventure",
            "Commedia",
            "Sci-Fi & Fantasy"
        ],
        "type": "tv"
    },
    {
        "popularity": 6.9556,
        "title": "Mob Psycho 100",
        "id": 75867,
        "vote": 6.3,
        "image": "/bKsuVX1jnxJDEIg7x0gEeIT0diA.jpg",
        "originnal_language": "ja",
        "release_date": "2018-01-12",
        "vote_count": 18,
        "vote_average": 6.3,
        "overview": "An inconspicuous middle school psychic confronts an organization plotting to use other psychics to rule the world. Based on the hit manga.",
        "genre_ids": [
            10759,
            35,
            9648
        ],
        "genre_names": [
            "Action & Adventure",
            "Commedia",
            "Mistero"
        ],
        "type": "tv"
    },
    {
        "popularity": 6.5485,
        "title": "100% Wolf: The Book of Hath",
        "id": 225829,
        "vote": 7,
        "image": "/Ac8RBBvN2sZbADha04EsfdjsWil.jpg",
        "originnal_language": "en",
        "release_date": "2023-05-01",
        "vote_count": 1,
        "vote_average": 7,
        "overview": "Freddy and the Howlington pack go paw to paw with ancient dark magic in an epic battle through time and space to save Milford, Werewolves, and the world as we know it.",
        "genre_ids": [
            16,
            10759,
            10765
        ],
        "genre_names": [
            "Animazione",
            "Action & Adventure",
            "Sci-Fi & Fantasy"
        ],
        "type": "tv"
    },
    {
        "popularity": 5.8457,
        "title": "The 100 Lives of Black Jack Savage",
        "id": 11047,
        "vote": 4.8,
        "image": "/qEEY0Ue6yOZcFFNORSpMTAraOKx.jpg",
        "originnal_language": "en",
        "release_date": "1991-03-31",
        "vote_count": 4,
        "vote_average": 4.8,
        "overview": "The 100 Lives of Black Jack Savage is a television series broadcast in the United States by NBC and produced by Stephen J. Cannell Productions in association with Walt Disney Television. This show originated as a TV-movie. The program originally aired in 1991, but lasted less than one season. The series was officially titled Disney Presents The 100 Lives of Black Jack Savage.",
        "genre_ids": [
            10765,
            35
        ],
        "genre_names": [
            "Sci-Fi & Fantasy",
            "Commedia"
        ],
        "type": "tv"
    },
    {
        "popularity": 4.8374,
        "title": "The Price is Right $1,000,000 Spectacular",
        "id": 135220,
        "vote": 10,
        "image": "/5dUfV4dCglaRZ58sB6Se50QE6uY.jpg",
        "originnal_language": "en",
        "release_date": "2003-02-05",
        "vote_count": 2,
        "vote_average": 10,
        "overview": "The Price is Right $1,000,000 Spectacular is a special primetime version of The Price is Right where in addition to the usual (contestants try to know their prices to win big prizes), they also try to win $1,000,000. Like the other primetime shows from 1986 and 2002, the prizes were higher in value than that of the daytime show. The winning graphics from this primetime special were very different than the ones used on the daytime show. Under Bob Barker's tenure, no contestant was able to win both showcases.",
        "genre_ids": [],
        "genre_names": [],
        "type": "tv"
    },
    {
        "popularity": 4.5323,
        "title": "100 in Bible",
        "id": 210907,
        "vote": 0,
        "image": "/52LH3fdqXMTqbGL7azDhzLsVWGX.jpg",
        "originnal_language": "he",
        "release_date": "2007-06-13",
        "vote_count": 0,
        "vote_average": 0,
        "overview": "",
        "genre_ids": [
            18,
            10762
        ],
        "genre_names": [
            "Dramma",
            "Kids"
        ],
        "type": "tv"
    },
    {
        "popularity": 4.1728,
        "title": "The Forbidden City 100",
        "id": 89736,
        "vote": 8,
        "image": "/6rO2IRcxpiC4vjCkh8PSU0j1z2f.jpg",
        "originnal_language": "zh",
        "release_date": "2012-01-01",
        "vote_count": 1,
        "vote_average": 8,
        "overview": "100 timeless images of the Forbidden City",
        "genre_ids": [
            99
        ],
        "genre_names": [
            "Documentario"
        ],
        "type": "tv"
    },
    {
        "popularity": 4.1272,
        "title": "Live to 100: Secrets of the Blue Zones",
        "id": 231483,
        "vote": 7.855,
        "image": "/aI22aHKtFHQ5r6AVu0uf7q9UUAn.jpg",
        "originnal_language": "en",
        "release_date": "2023-08-30",
        "vote_count": 31,
        "vote_average": 7.855,
        "overview": "Travel around the world with author Dan Buettner to discover five unique communities where people live extraordinarily long and vibrant lives.",
        "genre_ids": [
            99,
            9648
        ],
        "genre_names": [
            "Documentario",
            "Mistero"
        ],
        "type": "tv"
    },
    {
        "popularity": 3.8567,
        "title": "I.Q. 100",
        "id": 108055,
        "vote": 0,
        "image": "/ehQNm7SWXa5YHhbV0pBUwv0plmu.jpg",
        "originnal_language": "cn",
        "release_date": "1981-06-08",
        "vote_count": 0,
        "vote_average": 0,
        "overview": "St. Lawrence College, an all-girls school, breaks tradition by admitting three male students, including Wen Shu-sen. They become classmates with Wong Yuk-chu and Tong Ka-tai, initially experiencing teasing but eventually fitting in. The young people enjoy spending time together, playing pranks on their teachers and principal for fun, but a small incident tests their friendships and romances.",
        "genre_ids": [
            18
        ],
        "genre_names": [
            "Dramma"
        ],
        "type": "tv"
    },
    {
        "popularity": 3.6225,
        "title": "Zom 100: Bucket List of the Dead",
        "id": 1070514,
        "vote": 6.634,
        "image": "/hV5S6D56BPZ27FSaVEojkvViS3N.jpg",
        "originnal_language": "ja",
        "release_date": "2023-08-03",
        "vote_count": 575,
        "vote_average": 6.634,
        "overview": "Bullied by his boss, worked around the clock, he's nothing more than a corporate drone. All it takes is a zombie outbreak for him to finally feel alive!",
        "genre_ids": [
            35,
            27
        ],
        "genre_names": [
            "Commedia",
            "Horror"
        ],
        "type": "movie"
    },
    {
        "popularity": 3.6155,
        "title": "100 Greatest One Hit Wonders of the 80s",
        "id": 34140,
        "vote": 10,
        "image": null,
        "originnal_language": "en",
        "release_date": "2009-03-31",
        "vote_count": 1,
        "vote_average": 10,
        "overview": "",
        "genre_ids": [],
        "genre_names": [],
        "type": "tv"
    },
    {
        "popularity": 2.8006,
        "title": "Byplayers: 100 Days in the Forest of Supporting Actors",
        "id": 116665,
        "vote": 10,
        "image": "/dKLRrVo39HLIfntW7hcB87uWgMP.jpg",
        "originnal_language": "ja",
        "release_date": "2021-01-08",
        "vote_count": 3,
        "vote_average": 10,
        "overview": "Set in \"Byplaywood\" a large film studio surrounded by forest, far from the city. The story depicts 100 days of turmoil caused by the gathering of serial dramas and movies from various TV stations at once in this remote studio. It is a drama full of battles for ratings between studios, clashes between young, mid-career, and big names, and a heartwarming story of friendship and bonding. Also, the self-deprecation and parodies are enhanced by the fact that the actors play a role of themselves.",
        "genre_ids": [
            35
        ],
        "genre_names": [
            "Commedia"
        ],
        "type": "tv"
    }
]








    
