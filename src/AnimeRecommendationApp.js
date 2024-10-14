import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#9c27b0", // purple
    },
    secondary: {
      main: "#2196f3", // blue
    },
    background: {
      default: "#303030",
      paper: "#424242",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
  },
});

const AnimeRecommendationApp = () => {
  const [genres, setGenres] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendation = async () => {
    setLoading(true);
    setError(null);
    const genreList = genres.split(",").map((genre) => genre.trim());

    const query = `
      query ($page: Int, $perPage: Int, $genres: [String]) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, genre_in: $genres) {
            id
            title {
              romaji
              english
            }
            genres
            description
          }
        }
      }
    `;

    const variables = {
      page: 1,
      perPage: 50,
      genres: genreList.length > 0 ? genreList : null,
    };

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      const data = await response.json();
      if (data.data.Page.media.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * data.data.Page.media.length
        );
        setRecommendation(data.data.Page.media[randomIndex]);
      } else {
        setError("No anime found with the specified genres.");
      }
    } catch (err) {
      setError("An error occurred while fetching the recommendation.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
            color="primary"
          >
            Anime Recommendation App
          </Typography>
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Enter genres (e.g., Horror, Romance)"
              sx={{ mb: 2, input: { color: "text.primary" } }}
            />
            <Button
              onClick={getRecommendation}
              variant="contained"
              color="secondary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Get Recommendation"}
            </Button>
          </Box>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          {recommendation && (
            <Card raised>
              <CardContent>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  color="secondary"
                >
                  {recommendation.title.english || recommendation.title.romaji}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  <strong>Genres:</strong> {recommendation.genres.join(", ")}
                </Typography>
                <Typography variant="body2" component="p">
                  {recommendation.description?.replace(/<[^>]+>/g, "") ||
                    "No description available."}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            Powered by{" "}
            <a
              href="https://anilist.co"
              style={{ color: theme.palette.secondary.main }}
            >
              AniList
            </a>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AnimeRecommendationApp;
