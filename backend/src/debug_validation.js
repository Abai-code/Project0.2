const axios = require('axios');

const testValidation = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/movies', {
      title: "GOAT: Мечтай по-крупному с пакетом (2026)",
      description: "Маленький козёл Уилл мечтает играть в профессиональной лиге зверобола. Несмотря на скепсис из-за его размера, он верит в себя и доказывает, что успех зависит не от силы, а от упорства и смелости.",
      image: "https://kinogo-6.online/uploads/mini/fullstory/e19/f605df14abf/47b08a6846d3e1b7305963.jpg",
      movie_url: "/uploads/videos/video-1775417621497-87665758.mp4",
      year: 2026,
      rating: "7,4",
      country: "Brazil",
      genre: "Мультфильмы",
      is_series: false,
      featured: true
    }, {
      headers: {
        'Authorization': 'Bearer ' + 'YOUR_TOKEN_HERE' // I need a token, but let's see if it even gets to validation
      }
    });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
};

testValidation();
