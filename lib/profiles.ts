const SONGS_BASE = 'https://hxdjonkahanjqtuwvusn.supabase.co/storage/v1/object/public/defaults/songs'

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
    logoPath: '/profiles/HanumanJi/HanumanJiLogo.jpeg',
    images: [
      { url: '/profiles/HanumanJi/HanumanJi1.jpg',   alt: 'Hanuman Ji 1'  },
      { url: '/profiles/HanumanJi/HanumanJi2.jpg',   alt: 'Hanuman Ji 2'  },
      { url: '/profiles/HanumanJi/HanumanJi3.png',   alt: 'Hanuman Ji 3'  },
      { url: '/profiles/HanumanJi/HanumanJi4.jpg',   alt: 'Hanuman Ji 4'  },
      { url: '/profiles/HanumanJi/HanumnaJi5.jpg',   alt: 'Hanuman Ji 5'  },
      { url: '/profiles/HanumanJi/HanumanJi6.jpg',   alt: 'Hanuman Ji 6'  },
      { url: '/profiles/HanumanJi/HanumanJi7.png',   alt: 'Hanuman Ji 7'  },
      { url: '/profiles/HanumanJi/HanumanJi8.jpg',   alt: 'Hanuman Ji 8'  },
      { url: '/profiles/HanumanJi/HanumanJi9.jpg',   alt: 'Hanuman Ji 9'  },
      { url: '/profiles/HanumanJi/HanumanJi10.png',  alt: 'Hanuman Ji 10' },
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
    logoPath: '/profiles/GaneshaJi/GaneshaLogo.jpg',
    images: [
      { url: '/profiles/GaneshaJi/Ganesha1.jpeg', alt: 'Ganesha Ji 1' },
      { url: '/profiles/GaneshaJi/Ganesha2.jpeg', alt: 'Ganesha Ji 2' },
      { url: '/profiles/GaneshaJi/Ganesha3.jpeg', alt: 'Ganesha Ji 3' },
      { url: '/profiles/GaneshaJi/Ganesha4.jpeg', alt: 'Ganesha Ji 4' },
      { url: '/profiles/GaneshaJi/Ganesha5.jpeg', alt: 'Ganesha Ji 5' },
      { url: '/profiles/GaneshaJi/Ganesha6.jpeg', alt: 'Ganesha Ji 6' },
      { url: '/profiles/GaneshaJi/Ganesha7.jpeg', alt: 'Ganesha Ji 7' },
      { url: '/profiles/GaneshaJi/Ganesha8.jpeg', alt: 'Ganesha Ji 8' },
      { url: '/profiles/GaneshaJi/Ganesha9.jpeg', alt: 'Ganesha Ji 9' },
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
    logoPath: '/profiles/KrishanJi/KrishnaJiLogo.jpg',
    images: [
      { url: '/profiles/KrishanJi/Krishna.jpeg',   alt: 'Krishan Ji 1'  },
      { url: '/profiles/KrishanJi/Krishna2.jpeg',  alt: 'Krishan Ji 2'  },
      { url: '/profiles/KrishanJi/Krishna3.jpeg',  alt: 'Krishan Ji 3'  },
      { url: '/profiles/KrishanJi/Krishna4.jpeg',  alt: 'Krishan Ji 4'  },
      { url: '/profiles/KrishanJi/Krishna5.jpeg',  alt: 'Krishan Ji 5'  },
      { url: '/profiles/KrishanJi/Krishna6.jpeg',  alt: 'Krishan Ji 6'  },
      { url: '/profiles/KrishanJi/Krishna7.jpeg',  alt: 'Krishan Ji 7'  },
      { url: '/profiles/KrishanJi/Krishna8.jpeg',  alt: 'Krishan Ji 8'  },
      { url: '/profiles/KrishanJi/Krishna9.jpeg',  alt: 'Krishan Ji 9'  },
      { url: '/profiles/KrishanJi/Krishna10.jpeg', alt: 'Krishan Ji 10' },
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
    logoPath: '/profiles/NavaratriSpecial/DeviMaaLogo.jpg',
    images: [
      { url: '/profiles/NavaratriSpecial/DurgaMata.jpeg',         alt: 'Durga Mata'          },
      { url: '/profiles/NavaratriSpecial/MaaShailaputri.jpeg',    alt: 'Maa Shailaputri'     },
      { url: '/profiles/NavaratriSpecial/MaaBramhacharini.jpeg',  alt: 'Maa Bramhacharini'   },
      { url: '/profiles/NavaratriSpecial/MaaChandraghanta.jpeg',  alt: 'Maa Chandraghanta'   },
      { url: '/profiles/NavaratriSpecial/MaaKushamanda.jpeg',     alt: 'Maa Kushamanda'      },
      { url: '/profiles/NavaratriSpecial/MaaSkandmata.jpeg',      alt: 'Maa Skandmata'       },
      { url: '/profiles/NavaratriSpecial/MaaKatyani.jpeg',        alt: 'Maa Katyani'         },
      { url: '/profiles/NavaratriSpecial/MaaKaalratri.jpeg',      alt: 'Maa Kaalratri'       },
      { url: '/profiles/NavaratriSpecial/MaaMahagauri.jpeg',      alt: 'Maa Mahagauri'       },
      { url: '/profiles/NavaratriSpecial/MaaSiddhidatri.jpeg',    alt: 'Maa Siddhidatri'     },
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
    logoPath: '/profiles/PremanandJi/PremanandJiLogo.jpg',
    images: [
      { url: '/profiles/PremanandJi/PremanandJi.jpeg',   alt: 'Premanand Ji 1'  },
      { url: '/profiles/PremanandJi/PremanandJi2.jpeg',  alt: 'Premanand Ji 2'  },
      { url: '/profiles/PremanandJi/PremanandJi3.jpeg',  alt: 'Premanand Ji 3'  },
      { url: '/profiles/PremanandJi/PremanandJi4.jpeg',  alt: 'Premanand Ji 4'  },
      { url: '/profiles/PremanandJi/PremanandJi5.jpeg',  alt: 'Premanand Ji 5'  },
      { url: '/profiles/PremanandJi/PremanandJi6.jpeg',  alt: 'Premanand Ji 6'  },
      { url: '/profiles/PremanandJi/PremanandJi7.jpeg',  alt: 'Premanand Ji 7'  },
      { url: '/profiles/PremanandJi/PremanandJi8.jpeg',  alt: 'Premanand Ji 8'  },
      { url: '/profiles/PremanandJi/PremanandJi9.jpeg',  alt: 'Premanand Ji 9'  },
      { url: '/profiles/PremanandJi/PremanandJi10.jpeg', alt: 'Premanand Ji 10' },
    ],
    songs: [
      { name: 'Shri Radha Naam Jaap',      url: `${SONGS_BASE}/Shri%20Radha%20Naam%20Jaap.mp3` },
    ],
  },

  RamJi: {
    id: 'RamJi',
    name: 'Ram Ji',
    logoPath: '/profiles/RamJi/RamLogo.jpeg',
    images: [
      { url: '/profiles/RamJi/Ram.jpeg',   alt: 'Ram Ji 1'  },
      { url: '/profiles/RamJi/Ram2.jpeg',  alt: 'Ram Ji 2'  },
      { url: '/profiles/RamJi/Ram3.jpeg',  alt: 'Ram Ji 3'  },
      { url: '/profiles/RamJi/Ram4.jpeg',  alt: 'Ram Ji 4'  },
      { url: '/profiles/RamJi/Ram5.jpeg',  alt: 'Ram Ji 5'  },
      { url: '/profiles/RamJi/Ram6.jpeg',  alt: 'Ram Ji 6'  },
      { url: '/profiles/RamJi/Ram7.jpeg',  alt: 'Ram Ji 7'  },
      { url: '/profiles/RamJi/Ram8.jpeg',  alt: 'Ram Ji 8'  },
      { url: '/profiles/RamJi/Ram9.jpeg',  alt: 'Ram Ji 9'  },
      { url: '/profiles/RamJi/Ram10.jpeg', alt: 'Ram Ji 10' },
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
    logoPath: '/profiles/ShivaJi/ShivaLogo.jpg',
    images: [
      { url: '/profiles/ShivaJi/Shiva1.jpeg',  alt: 'Shiva Ji 1'  },
      { url: '/profiles/ShivaJi/Shiva2.jpeg',  alt: 'Shiva Ji 2'  },
      { url: '/profiles/ShivaJi/Shiva3.jpeg',  alt: 'Shiva Ji 3'  },
      { url: '/profiles/ShivaJi/Shiva4.jpeg',  alt: 'Shiva Ji 4'  },
      { url: '/profiles/ShivaJi/Shiva5.jpeg',  alt: 'Shiva Ji 5'  },
      { url: '/profiles/ShivaJi/Shiva6.jpeg',  alt: 'Shiva Ji 6'  },
      { url: '/profiles/ShivaJi/Shiva7.jpeg',  alt: 'Shiva Ji 7'  },
      { url: '/profiles/ShivaJi/Shiva8.jpeg',  alt: 'Shiva Ji 8'  },
      { url: '/profiles/ShivaJi/Shiva9.jpeg',  alt: 'Shiva Ji 9'  },
      { url: '/profiles/ShivaJi/Shiva10.jpeg', alt: 'Shiva Ji 10' },
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
    logoPath: '/profiles/Vrindavan/VrindavanLogo.jpg',
    images: [
      { url: '/profiles/Vrindavan/Vrindavan.jpeg',   alt: 'Vrindavan 1'  },
      { url: '/profiles/Vrindavan/Vrindavan2.jpeg',  alt: 'Vrindavan 2'  },
      { url: '/profiles/Vrindavan/Vrindavan3.jpeg',  alt: 'Vrindavan 3'  },
      { url: '/profiles/Vrindavan/Vrindavan4.jpeg',  alt: 'Vrindavan 4'  },
      { url: '/profiles/Vrindavan/Vrindavan5.jpeg',  alt: 'Vrindavan 5'  },
      { url: '/profiles/Vrindavan/Vrindavan6.jpeg',  alt: 'Vrindavan 6'  },
      { url: '/profiles/Vrindavan/Vrindavan7.jpeg',  alt: 'Vrindavan 7'  },
      { url: '/profiles/Vrindavan/Vrindavan8.jpeg',  alt: 'Vrindavan 8'  },
      { url: '/profiles/Vrindavan/Vrindavan9.jpeg',  alt: 'Vrindavan 9'  },
      { url: '/profiles/Vrindavan/Vrindavan10.jpeg', alt: 'Vrindavan 10' },
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
