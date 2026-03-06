export interface PlaylistSeed {
  id: string;
  name: string;
  description: string;
  seeds: { title: string; artist: string }[];
}

export const PLAYLISTS: PlaylistSeed[] = [
  {
    id: "90s-hits",
    name: "90s Hits",
    description: "Iconic tracks from the greatest decade",
    seeds: [
      { title: "Smells Like Teen Spirit", artist: "Nirvana" },
      { title: "Waterfalls", artist: "TLC" },
      { title: "I Want It That Way", artist: "Backstreet Boys" },
      { title: "No Scrubs", artist: "TLC" },
      { title: "Losing My Religion", artist: "R.E.M." },
      { title: "Creep", artist: "Radiohead" },
      { title: "Baby Got Back", artist: "Sir Mix-a-Lot" },
      { title: "Under the Bridge", artist: "Red Hot Chili Peppers" },
      { title: "Wannabe", artist: "Spice Girls" },
      { title: "Ironic", artist: "Alanis Morissette" },
    ],
  },
  {
    id: "2000s-pop",
    name: "2000s Pop",
    description: "The bops that defined a generation",
    seeds: [
      { title: "Crazy in Love", artist: "Beyonce" },
      { title: "Lose Yourself", artist: "Eminem" },
      { title: "Hot in Herre", artist: "Nelly" },
      { title: "Yeah!", artist: "Usher" },
      { title: "Since U Been Gone", artist: "Kelly Clarkson" },
      { title: "Ms. Jackson", artist: "OutKast" },
      { title: "Toxic", artist: "Britney Spears" },
      { title: "In Da Club", artist: "50 Cent" },
      { title: "Hey Ya!", artist: "OutKast" },
      { title: "Beautiful", artist: "Christina Aguilera" },
    ],
  },
  {
    id: "classic-rock",
    name: "Classic Rock",
    description: "Legends of rock and roll",
    seeds: [
      { title: "Bohemian Rhapsody", artist: "Queen" },
      { title: "Hotel California", artist: "Eagles" },
      { title: "Go Your Own Way", artist: "Fleetwood Mac" },
      { title: "Black Dog", artist: "Led Zeppelin" },
      { title: "Back in Black", artist: "AC/DC" },
      { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd" },
      { title: "More Than a Feeling", artist: "Boston" },
      { title: "Dream On", artist: "Aerosmith" },
      { title: "Don't Stop Believin", artist: "Journey" },
      { title: "Roxanne", artist: "The Police" },
    ],
  },
  {
    id: "taylor-swift",
    name: "Taylor Swift",
    description: "From country darling to pop icon",
    seeds: [
      { title: "Love Story", artist: "Taylor Swift" },
      { title: "Shake It Off", artist: "Taylor Swift" },
      { title: "Blank Space", artist: "Taylor Swift" },
      { title: "Anti-Hero", artist: "Taylor Swift" },
      { title: "Bad Blood", artist: "Taylor Swift" },
      { title: "You Belong With Me", artist: "Taylor Swift" },
      { title: "22", artist: "Taylor Swift" },
      { title: "Cruel Summer", artist: "Taylor Swift" },
      { title: "cardigan", artist: "Taylor Swift" },
      { title: "Style", artist: "Taylor Swift" },
    ],
  },
  {
    id: "todays-hits",
    name: "Today's Hits",
    description: "Chart-toppers from the 2020s",
    seeds: [
      { title: "Blinding Lights", artist: "The Weeknd" },
      { title: "As It Was", artist: "Harry Styles" },
      { title: "Levitating", artist: "Dua Lipa" },
      { title: "Flowers", artist: "Miley Cyrus" },
      { title: "Stay", artist: "The Kid LAROI" },
      { title: "Peaches", artist: "Justin Bieber" },
      { title: "drivers license", artist: "Olivia Rodrigo" },
      { title: "good 4 u", artist: "Olivia Rodrigo" },
      { title: "Unholy", artist: "Sam Smith" },
      { title: "Calm Down", artist: "Rema" },
    ],
  },
];
