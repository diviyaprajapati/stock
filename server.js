// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

let currentIndex = 0; // Track which news to send

app.get("/news", async (req, res) => {
  try {
    const rssUrl =
      "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
      rssUrl
    )}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "No news found" });
    }

    // Wrap-around logic → agar last news ho gayi to firse 0 se start
    if (currentIndex >= data.items.length) {
      currentIndex = 0;
    }

    const item = data.items[currentIndex];
    currentIndex++; // Next call ke liye index badhao

    // Clean JSON → Only Title, Description, Image, Link
    const cleaned = {
      title: item.title,
      description:
        item.description.replace(/<[^>]*>?/gm, "").slice(0, 200) + "...",
      image:
        item.enclosure && item.enclosure.link
          ? item.enclosure.link
          : "https://via.placeholder.com/300x200?text=Stock+News",
      link: item.link,
    };

    res.json({ news: cleaned });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch news",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
