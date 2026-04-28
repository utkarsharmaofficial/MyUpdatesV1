const BASE       = 'https://hxdjonkahanjqtuwvusn.supabase.co/storage/v1/object/public/defaults'
const IMAGES_BASE = `${BASE}/images`
const SONGS_BASE  = `${BASE}/songs`

export interface ProfileSong {
  name: string
  url: string
}

export interface ProfileDefinition {
  id: string
  name: string
  logoPath: string
  images: { url: string; alt: string }[]
  songs: ProfileSong[]
}

export const PROFILE_DEFINITIONS: Record<string, ProfileDefinition> = {
  HanumanJi: {
    id: 'HanumanJi',
    name: 'Hanuman Ji',
    logoPath: `${IMAGES_BASE}/HanumanJiLogo.jpeg`,
    images: [
      { url: `${IMAGES_BASE}/HanumanJi1.jpg`,   alt: 'Hanuman Ji 1'  },
      { url: `${IMAGES_BASE}/HanumanJi2.jpg`,   alt: 'Hanuman Ji 2'  },
      { url: `${IMAGES_BASE}/HanumanJi3.png`,   alt: 'Hanuman Ji 3'  },
      { url: `${IMAGES_BASE}/HanumanJi4.jpg`,   alt: 'Hanuman Ji 4'  },
      { url: `${IMAGES_BASE}/HanumnaJi5.jpg`,   alt: 'Hanuman Ji 5'  },
      { url: `${IMAGES_BASE}/HanumanJi6.jpg`,   alt: 'Hanuman Ji 6'  },
      { url: `${IMAGES_BASE}/HanumanJi7.png`,   alt: 'Hanuman Ji 7'  },
      { url: `${IMAGES_BASE}/HanumanJi8.jpg`,   alt: 'Hanuman Ji 8'  },
      { url: `${IMAGES_BASE}/HanumanJi9.jpg`,   alt: 'Hanuman Ji 9'  },
      { url: `${IMAGES_BASE}/HanumanJi10.png`,  alt: 'Hanuman Ji 10' },
    ],
    songs: [
      {
        name: 'Jai Shree Ram',
        url: `${SONGS_BASE}/Jai%20Shree%20Ram%20-%20Thaman%20S%20-%20Topic%20(128k).mp3`,
      },
      {
        name: 'Ram Naam Jap',
        url: `${SONGS_BASE}/Ram-Naam-Jap-Shri-Ram-Jai-Ram-Jai.mp3`,
      },
      {
        name: 'Sri Ramadootha Stotram',
        url: `${SONGS_BASE}/Sri-Ramadootha-Stotram.mp3`,
      },
      {
        name: 'Bajrang Baan',
        url: `${SONGS_BASE}/Bajrang%20Baan%20-%20Rasraj%20Ji%20Maharaj.mp3`,
      },
      {
        name: 'Hanuman Chalisa',
        url: `${SONGS_BASE}/Hanuman%20Chalisa%20-%20Rasraj%20ji%20Maharaj.mp3`,
      },
    ],
  },

  GaneshaJi: {
    id: 'GaneshaJi',
    name: 'Ganesha Ji',
    logoPath: `${IMAGES_BASE}/GaneshaLogo.jpg`,
    images: [
      { url: `${IMAGES_BASE}/Ganesha1.jpeg`, alt: 'Ganesha Ji 1' },
      { url: `${IMAGES_BASE}/Ganesha2.jpeg`, alt: 'Ganesha Ji 2' },
      { url: `${IMAGES_BASE}/Ganesha3.jpeg`, alt: 'Ganesha Ji 3' },
      { url: `${IMAGES_BASE}/Ganesha4.jpeg`, alt: 'Ganesha Ji 4' },
      { url: `${IMAGES_BASE}/Ganesha5.jpeg`, alt: 'Ganesha Ji 5' },
      { url: `${IMAGES_BASE}/Ganesha6.jpeg`, alt: 'Ganesha Ji 6' },
      { url: `${IMAGES_BASE}/Ganesha7.jpeg`, alt: 'Ganesha Ji 7' },
      { url: `${IMAGES_BASE}/Ganesha8.jpeg`, alt: 'Ganesha Ji 8' },
      { url: `${IMAGES_BASE}/Ganesha9.jpeg`, alt: 'Ganesha Ji 9' },
    ],
    songs: [
      { name: 'Deva Shree Ganesha',        url: `${SONGS_BASE}/Deva%20Shree%20Ganesha.mp3` },
      { name: 'Ekadantaya Vakratundaya',    url: `${SONGS_BASE}/Ekadantaya%20Vakratundaya%20Gauri%20Tanaya%20Dhimi.mp3` },
      { name: 'Gajanana',                  url: `${SONGS_BASE}/Gajanana.mp3` },
      { name: 'Ganesh Aarti',              url: `${SONGS_BASE}/Ganesh%20Aarti.mp3` },
    ],
  },

  KrishanJi: {
    id: 'KrishanJi',
    name: 'Krishan Ji',
    logoPath: `${IMAGES_BASE}/KrishnaJiLogo.jpg`,
    images: [
      { url: `${IMAGES_BASE}/Krishna.jpeg`,   alt: 'Krishan Ji 1'  },
      { url: `${IMAGES_BASE}/Krishna2.jpeg`,  alt: 'Krishan Ji 2'  },
      { url: `${IMAGES_BASE}/Krishna3.jpeg`,  alt: 'Krishan Ji 3'  },
      { url: `${IMAGES_BASE}/Krishna4.jpeg`,  alt: 'Krishan Ji 4'  },
      { url: `${IMAGES_BASE}/Krishna5.jpeg`,  alt: 'Krishan Ji 5'  },
      { url: `${IMAGES_BASE}/Krishna6.jpeg`,  alt: 'Krishan Ji 6'  },
      { url: `${IMAGES_BASE}/Krishna7.jpeg`,  alt: 'Krishan Ji 7'  },
      { url: `${IMAGES_BASE}/Krishna8.jpeg`,  alt: 'Krishan Ji 8'  },
      { url: `${IMAGES_BASE}/Krishna9.jpeg`,  alt: 'Krishan Ji 9'  },
      { url: `${IMAGES_BASE}/Krishna10.jpeg`, alt: 'Krishan Ji 10' },
    ],
    songs: [
      { name: 'Jai Sri Krishna',                    url: `${SONGS_BASE}/Jai%20Sri%20Krsna%20-%20Mayapuris%20(128k).mp3` },
      { name: 'Om Namo Bhagavate Vasudevaya',       url: `${SONGS_BASE}/Om%20Namo%20Bhagavate%20Vasudevaya.mp3` },
      { name: 'Shri Krishna Govind Hare Murari',    url: `${SONGS_BASE}/SHRI%20KRISHNA%20GOVIND%20HARE%20MURARI.mp3` },
    ],
  },

  NavaratriSpecial: {
    id: 'NavaratriSpecial',
    name: 'Navratri Special',
    logoPath: `${IMAGES_BASE}/DeviMaaLogo.jpg`,
    images: [
      { url: `${IMAGES_BASE}/DurgaMata.jpeg`,         alt: 'Durga Mata'          },
      { url: `${IMAGES_BASE}/MaaShailaputri.jpeg`,    alt: 'Maa Shailaputri'     },
      { url: `${IMAGES_BASE}/MaaBramhacharini.jpeg`,  alt: 'Maa Bramhacharini'   },
      { url: `${IMAGES_BASE}/MaaChandraghanta.jpeg`,  alt: 'Maa Chandraghanta'   },
      { url: `${IMAGES_BASE}/MaaKushamanda.jpeg`,     alt: 'Maa Kushamanda'      },
      { url: `${IMAGES_BASE}/MaaSkandmata.jpeg`,      alt: 'Maa Skandmata'       },
      { url: `${IMAGES_BASE}/MaaKatyani.jpeg`,        alt: 'Maa Katyani'         },
      { url: `${IMAGES_BASE}/MaaKaalratri.jpeg`,      alt: 'Maa Kaalratri'       },
      { url: `${IMAGES_BASE}/MaaMahagauri.jpeg`,      alt: 'Maa Mahagauri'       },
      { url: `${IMAGES_BASE}/MaaSiddhidatri.jpeg`,    alt: 'Maa Siddhidatri'     },
    ],
    songs: [
      { name: 'Jagdamba Ghar Me',          url: `${SONGS_BASE}/Jagdamba%20Ghar%20Me%20Swati%20Mishra%20Mohit%20Musik%20Bhojpuri%20Navratri%20Song%202025%20Devi%20Geet.mp3` },
      { name: 'Jode Jode Falwa',           url: `${SONGS_BASE}/Jode%20Jode%20Falwa%20Suruj%20dev%20Swati%20Mishra%20Chath%20Geet.mp3` },
      { name: 'Meri Maa Ke Barabar',       url: `${SONGS_BASE}/Meri%20Maa%20Ke%20Barabar%20Koi%20Nahi%20Swati%20Mishra%20Navratri%20special%20song.mp3` },
      { name: 'Nimiya Ke Dadh Maiya',      url: `${SONGS_BASE}/Nimiya%20ke%20Dadh%20Maiya%20Swati%20Mishra.mp3` },
    ],
  },

  PremanandJi: {
    id: 'PremanandJi',
    name: 'Premanand Ji',
    logoPath: `${IMAGES_BASE}/PremanandJiLogo.jpg`,
    images: [
      { url: `${IMAGES_BASE}/PremanandJi.jpeg`,   alt: 'Premanand Ji 1'  },
      { url: `${IMAGES_BASE}/PremanandJi2.jpeg`,  alt: 'Premanand Ji 2'  },
      { url: `${IMAGES_BASE}/PremanandJi3.jpeg`,  alt: 'Premanand Ji 3'  },
      { url: `${IMAGES_BASE}/PremanandJi4.jpeg`,  alt: 'Premanand Ji 4'  },
      { url: `${IMAGES_BASE}/PremanandJi5.jpeg`,  alt: 'Premanand Ji 5'  },
      { url: `${IMAGES_BASE}/PremanandJi6.jpeg`,  alt: 'Premanand Ji 6'  },
      { url: `${IMAGES_BASE}/PremanandJi7.jpeg`,  alt: 'Premanand Ji 7'  },
      { url: `${IMAGES_BASE}/PremanandJi8.jpeg`,  alt: 'Premanand Ji 8'  },
      { url: `${IMAGES_BASE}/PremanandJi9.jpeg`,  alt: 'Premanand Ji 9'  },
      { url: `${IMAGES_BASE}/PremanandJi10.jpeg`, alt: 'Premanand Ji 10' },
    ],
    songs: [
      { name: 'Shri Radha Naam Jaap',      url: `${SONGS_BASE}/Shri%20Radha%20Naam%20Jaap.mp3` },
    ],
  },

  RamJi: {
    id: 'RamJi',
    name: 'Ram Ji',
    logoPath: `${IMAGES_BASE}/RamLogo.jpeg`,
    images: [
      { url: `${IMAGES_BASE}/Ram.jpeg`,   alt: 'Ram Ji 1'  },
      { url: `${IMAGES_BASE}/Ram2.jpeg`,  alt: 'Ram Ji 2'  },
      { url: `${IMAGES_BASE}/Ram3.jpeg`,  alt: 'Ram Ji 3'  },
      { url: `${IMAGES_BASE}/Ram4.jpeg`,  alt: 'Ram Ji 4'  },
      { url: `${IMAGES_BASE}/Ram5.jpeg`,  alt: 'Ram Ji 5'  },
      { url: `${IMAGES_BASE}/Ram6.jpeg`,  alt: 'Ram Ji 6'  },
      { url: `${IMAGES_BASE}/Ram7.jpeg`,  alt: 'Ram Ji 7'  },
      { url: `${IMAGES_BASE}/Ram8.jpeg`,  alt: 'Ram Ji 8'  },
      { url: `${IMAGES_BASE}/Ram9.jpeg`,  alt: 'Ram Ji 9'  },
      { url: `${IMAGES_BASE}/Ram10.jpeg`, alt: 'Ram Ji 10' },
    ],
    songs: [
      { name: 'Jai Shri Ram',                      url: `${SONGS_BASE}/JAI-SHRI-RAM.mp3` },
      { name: 'Ram Jo Karenge Achha Karenge',       url: `${SONGS_BASE}/Ram%20Jo%20Karenge%20Achha%20Karenge.mp3` },
      { name: 'Ram Siya Ram',                       url: `${SONGS_BASE}/Ram-Siya-Ram.mp3` },
      { name: 'Tum Utho Siya Singaar Karo',         url: `${SONGS_BASE}/Tum%20Utho%20Siya%20Singaar%20Karo.mp3` },
    ],
  },

  ShivaJi: {
    id: 'ShivaJi',
    name: 'Shiva Ji',
    logoPath: `${IMAGES_BASE}/ShivaLogo.jpg`,
    images: [
      { url: `${IMAGES_BASE}/Shiva1.jpeg`,  alt: 'Shiva Ji 1'  },
      { url: `${IMAGES_BASE}/Shiva2.jpeg`,  alt: 'Shiva Ji 2'  },
      { url: `${IMAGES_BASE}/Shiva3.jpeg`,  alt: 'Shiva Ji 3'  },
      { url: `${IMAGES_BASE}/Shiva4.jpeg`,  alt: 'Shiva Ji 4'  },
      { url: `${IMAGES_BASE}/Shiva5.jpeg`,  alt: 'Shiva Ji 5'  },
      { url: `${IMAGES_BASE}/Shiva6.jpeg`,  alt: 'Shiva Ji 6'  },
      { url: `${IMAGES_BASE}/Shiva7.jpeg`,  alt: 'Shiva Ji 7'  },
      { url: `${IMAGES_BASE}/Shiva8.jpeg`,  alt: 'Shiva Ji 8'  },
      { url: `${IMAGES_BASE}/Shiva9.jpeg`,  alt: 'Shiva Ji 9'  },
      { url: `${IMAGES_BASE}/Shiva10.jpeg`, alt: 'Shiva Ji 10' },
    ],
    songs: [
      { name: 'Gangadhara Shankara',               url: `${SONGS_BASE}/Gangadhara-Shankara-Song.mp3` },
      { name: 'Kaal Bhairav Ashtakam',              url: `${SONGS_BASE}/Kaal-Bhairav-Ashtakam.mp3` },
      { name: 'Rudrashtakam',                       url: `${SONGS_BASE}/Rudrashtakam-Agam-Aggarwal.mp3` },
      { name: 'Shambho Shankar Namah Shivay',       url: `${SONGS_BASE}/Shambho-Shankar-Namah-Shivay.mp3` },
    ],
  },

  Vrindavan: {
    id: 'Vrindavan',
    name: 'Vrindavan',
    logoPath: `${IMAGES_BASE}/VrindavanLogo.jpg`,
    images: [
      { url: `${IMAGES_BASE}/Vrindavan.jpeg`,   alt: 'Vrindavan 1'  },
      { url: `${IMAGES_BASE}/Vrindavan2.jpeg`,  alt: 'Vrindavan 2'  },
      { url: `${IMAGES_BASE}/Vrindavan3.jpeg`,  alt: 'Vrindavan 3'  },
      { url: `${IMAGES_BASE}/Vrindavan4.jpeg`,  alt: 'Vrindavan 4'  },
      { url: `${IMAGES_BASE}/Vrindavan5.jpeg`,  alt: 'Vrindavan 5'  },
      { url: `${IMAGES_BASE}/Vrindavan6.jpeg`,  alt: 'Vrindavan 6'  },
      { url: `${IMAGES_BASE}/Vrindavan7.jpeg`,  alt: 'Vrindavan 7'  },
      { url: `${IMAGES_BASE}/Vrindavan8.jpeg`,  alt: 'Vrindavan 8'  },
      { url: `${IMAGES_BASE}/Vrindavan9.jpeg`,  alt: 'Vrindavan 9'  },
      { url: `${IMAGES_BASE}/Vrindavan10.jpeg`, alt: 'Vrindavan 10' },
    ],
    songs: [
      { name: 'Braj Me Ratan Radhika Gori',         url: `${SONGS_BASE}/Braj%20me%20Ratan%20Radhika%20Gori%20Indresh%20ji%20Maharaj.mp3` },
      { name: 'Pyaro Vrindavan',                    url: `${SONGS_BASE}/Pyaro%20Vrindavan%20Indresh%20Upadhyay%20Ji%20.mp3` },
      { name: 'Radhe Radhe Radhe Barsane Wali Radhe', url: `${SONGS_BASE}/Radhe%20Radhe%20Radhe%20Barsane%20wali%20Radhe%20Swati%20Mishra.mp3` },
      { name: 'Tujhse Preet Lagi Hai Radhe',        url: `${SONGS_BASE}/Tujhse%20Preet%20Lagi%20Hai%20Radhe%20Bhajman%20Radhe.mp3` },
    ],
  },
}

// Order in which profiles appear in the selection UI
export const PROFILE_ORDER = [
  'HanumanJi',
  'GaneshaJi',
  'KrishanJi',
  'NavaratriSpecial',
  'PremanandJi',
  'RamJi',
  'ShivaJi',
  'Vrindavan',
  'custom',
]
