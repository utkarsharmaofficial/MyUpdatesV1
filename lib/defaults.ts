const BASE = 'https://hxdjonkahanjqtuwvusn.supabase.co/storage/v1/object/public/defaults'

export const DEFAULT_IMAGES: { url: string; alt: string }[] = [
  { url: `${BASE}/images/HanumanJi1.jpg`,  alt: 'HanumanJi 1'  },
  { url: `${BASE}/images/HanumanJi2.jpg`,  alt: 'HanumanJi 2'  },
  { url: `${BASE}/images/HanumanJi3.png`,  alt: 'HanumanJi 3'  },
  { url: `${BASE}/images/HanumanJi4.jpg`,  alt: 'HanumanJi 4'  },
  { url: `${BASE}/images/HanumanJi5.jpg`,  alt: 'HanumanJi 5'  },
  { url: `${BASE}/images/HanumanJi6.jpg`,  alt: 'HanumanJi 6'  },
  { url: `${BASE}/images/HanumanJi7.png`,  alt: 'HanumanJi 7'  },
  { url: `${BASE}/images/HanumanJi8.jpg`,  alt: 'HanumanJi 8'  },
  { url: `${BASE}/images/HanumanJi9.jpg`,  alt: 'HanumanJi 9'  },
  { url: `${BASE}/images/HanumanJi10.png`, alt: 'HanumanJi 10' },
]

export const DEFAULT_SONGS: { name: string; url: string }[] = [
  {
    name: 'Ram Naam Jap',
    url:  `${BASE}/songs/Ram-Naam-Jap-Shri-Ram-Jai-Ram-Jai.mp3`,
  },
  {
    name: 'Jai Shree Ram',
    url:  `${BASE}/songs/Jai%20Shree%20Ram%20-%20Thaman%20S%20-%20Topic%20(128k).mp3`,
  },
  {
    name: 'Sri Ramadootha Stotram',
    url:  `${BASE}/songs/Sri-Ramadootha-Stotram.mp3`,
  },
]
